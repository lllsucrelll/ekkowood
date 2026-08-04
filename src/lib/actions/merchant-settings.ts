"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getMerchantSession, invalidateOtherMerchantSessions } from "@/lib/auth/merchant";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import type { ActionState } from "./merchant-auth";

const updateBusinessNameSchema = z.object({
  businessName: z.string().trim().min(1, "Le nom du commerce est requis."),
});

export async function updateBusinessNameAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const merchant = await getMerchantSession();
  if (!merchant) return { error: "Session expirée." };

  const parsed = updateBusinessNameSchema.safeParse({
    businessName: formData.get("businessName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { businessName: parsed.data.businessName },
  });
  revalidatePath("/dashboard", "layout");

  return { success: "Nom du commerce mis à jour." };
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Merci de renseigner votre mot de passe actuel."),
    newPassword: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères."),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les deux mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export async function changeMerchantPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const merchant = await getMerchantSession();
  if (!merchant) return { error: "Session expirée." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const validPassword = await verifyPassword(
    parsed.data.currentPassword,
    merchant.passwordHash
  );
  if (!validPassword) {
    return { error: "Mot de passe actuel incorrect." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { passwordHash },
  });
  await invalidateOtherMerchantSessions(merchant.id);

  return { success: "Mot de passe mis à jour." };
}
