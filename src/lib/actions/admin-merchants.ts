"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/admin";
import { invalidateAllMerchantSessions } from "@/lib/auth/merchant";
import { hashPassword, generateTemporaryPassword } from "@/lib/auth/password";
import { slugify } from "@/lib/slug";
import { sendEmail } from "@/lib/email";
import type { ActionState } from "./merchant-auth";

const DEFAULT_DRAFT_CONFIG = { banner: null, buttons: [] };

const createMerchantSchema = z.object({
  businessName: z.string().min(1, "Le nom du commerce est requis."),
  slug: z
    .string()
    .min(1, "Le slug est requis.")
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets."
    ),
  email: z.string().email("Email invalide."),
  durationMonths: z.coerce.number().int().min(1).max(36),
});

export async function createMerchantAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Session admin expirée." };

  const parsed = createMerchantSchema.safeParse({
    businessName: formData.get("businessName"),
    slug: slugify(String(formData.get("slug") ?? "")),
    email: formData.get("email"),
    durationMonths: formData.get("durationMonths"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const { businessName, slug, email, durationMonths } = parsed.data;

  const accessExpiresAt = new Date();
  accessExpiresAt.setMonth(accessExpiresAt.getMonth() + durationMonths);

  const temporaryPassword = generateTemporaryPassword();

  try {
    await prisma.merchant.create({
      data: {
        businessName,
        slug,
        email,
        accessExpiresAt,
        passwordHash: await hashPassword(temporaryPassword),
        draftConfig: DEFAULT_DRAFT_CONFIG,
      },
    });
  } catch (e) {
    if (isUniqueConstraintError(e, "slug")) {
      return { error: `Le slug "${slug}" est déjà utilisé.` };
    }
    if (isUniqueConstraintError(e, "email")) {
      return { error: `L'email "${email}" est déjà utilisé.` };
    }
    throw e;
  }

  const loginUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/dashboard/login`;
  await sendEmail({
    to: email,
    subject: "Vos identifiants Ekko Wood",
    text: `Bonjour,\n\nVotre espace commerçant Ekko Wood est prêt.\n\nURL de connexion : ${loginUrl}\nEmail : ${email}\nMot de passe temporaire : ${temporaryPassword}\n\nVotre page publique sera accessible à l'adresse : ${process.env.APP_URL ?? "http://localhost:3000"}/${slug}\n\nMerci de changer votre mot de passe dès la première connexion.`,
  });

  revalidatePath("/ivy");
  return {
    success: `Compte créé pour ${businessName}. Mot de passe temporaire : ${temporaryPassword}`,
  };
}

export async function toggleMerchantStatusAction(
  merchantId: string
): Promise<void> {
  const admin = await getAdminSession();
  if (!admin) return;

  const merchant = await prisma.merchant.findUnique({
    where: { id: merchantId },
  });
  if (!merchant) return;

  const nextStatus = merchant.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

  await prisma.merchant.update({
    where: { id: merchantId },
    data: { status: nextStatus },
  });

  if (nextStatus === "SUSPENDED") {
    await invalidateAllMerchantSessions(merchantId);
  }

  revalidatePath("/ivy");
}

const extendAccessSchema = z.object({
  merchantId: z.string().min(1),
  accessExpiresAt: z.string().min(1),
});

export async function updateAccessExpiryAction(
  formData: FormData
): Promise<void> {
  const admin = await getAdminSession();
  if (!admin) return;

  const parsed = extendAccessSchema.safeParse({
    merchantId: formData.get("merchantId"),
    accessExpiresAt: formData.get("accessExpiresAt"),
  });
  if (!parsed.success) return;

  await prisma.merchant.update({
    where: { id: parsed.data.merchantId },
    data: { accessExpiresAt: new Date(parsed.data.accessExpiresAt) },
  });

  revalidatePath("/ivy");
}

const resetPasswordSchema = z.object({
  merchantId: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function adminResetMerchantPasswordAction(
  formData: FormData
): Promise<void> {
  const admin = await getAdminSession();
  if (!admin) return;

  const parsed = resetPasswordSchema.safeParse({
    merchantId: formData.get("merchantId"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) return;

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.merchant.update({
    where: { id: parsed.data.merchantId },
    data: { passwordHash },
  });
  await invalidateAllMerchantSessions(parsed.data.merchantId);

  revalidatePath("/ivy");
}

function isUniqueConstraintError(error: unknown, field: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002" &&
    "meta" in error &&
    !!(error as { meta?: { target?: string[] } }).meta?.target?.includes(field)
  );
}
