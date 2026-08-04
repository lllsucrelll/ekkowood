"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth/admin";
import { verifyPassword } from "@/lib/auth/password";
import { verifyTotpCode } from "@/lib/auth/totp";
import type { ActionState } from "./merchant-auth";

const confirmSetupSchema = z.object({
  secret: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, "Le code doit contenir 6 chiffres."),
});

export async function confirmTotpSetupAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Session admin expirée." };

  const parsed = confirmSetupSchema.safeParse({
    secret: formData.get("secret"),
    code: formData.get("code"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const isValid = await verifyTotpCode(parsed.data.secret, parsed.data.code);
  if (!isValid) {
    return {
      error:
        "Code invalide. Vérifiez l'heure de votre téléphone et réessayez.",
    };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { totpSecret: parsed.data.secret, totpEnabledAt: new Date() },
  });

  revalidatePath("/ivy/settings");
  return { success: "Double authentification activée." };
}

const disableTotpSchema = z.object({
  password: z.string().min(1),
});

export async function disableTotpAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await getAdminSession();
  if (!admin) return { error: "Session admin expirée." };

  const parsed = disableTotpSchema.safeParse({
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Merci de renseigner votre mot de passe." };
  }

  const validPassword = await verifyPassword(
    parsed.data.password,
    admin.passwordHash
  );
  if (!validPassword) {
    return { error: "Mot de passe incorrect." };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { totpSecret: null, totpEnabledAt: null },
  });

  revalidatePath("/ivy/settings");
  return { success: "Double authentification désactivée." };
}
