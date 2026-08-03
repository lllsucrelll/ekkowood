"use server";

import { z } from "zod";
import { randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import {
  createMerchantSession,
  destroyMerchantSession,
} from "@/lib/auth/merchant";
import {
  isLockedOut,
  nextFailedLoginState,
  RESET_LOGIN_STATE,
} from "@/lib/auth/lockout";
import { sendEmail } from "@/lib/email";

export type ActionState = { error?: string; success?: string };

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function merchantLoginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Merci de renseigner un email et un mot de passe valides." };
  }
  const { email, password } = parsed.data;

  const merchant = await prisma.merchant.findUnique({ where: { email } });

  // Constant response for "unknown account" vs "wrong password" on purpose,
  // to avoid leaking which emails have an account.
  const genericError = "Email ou mot de passe incorrect.";

  if (!merchant) {
    return { error: genericError };
  }

  if (isLockedOut(merchant)) {
    return {
      error:
        "Trop de tentatives échouées. Merci de réessayer dans quelques minutes.",
    };
  }

  const validPassword = await verifyPassword(password, merchant.passwordHash);
  if (!validPassword) {
    await prisma.merchant.update({
      where: { id: merchant.id },
      data: nextFailedLoginState(merchant),
    });
    return { error: genericError };
  }

  if (merchant.status !== "ACTIVE" || merchant.accessExpiresAt < new Date()) {
    return {
      error:
        "Cet accès est suspendu ou expiré. Contactez Ekko Wood pour plus d'informations.",
    };
  }

  await prisma.merchant.update({
    where: { id: merchant.id },
    data: RESET_LOGIN_STATE,
  });
  await createMerchantSession(merchant.id);
  redirect("/dashboard");
}

export async function merchantLogoutAction(): Promise<void> {
  await destroyMerchantSession();
  redirect("/dashboard/login");
}

const forgotPasswordSchema = z.object({ email: z.string().email() });

export async function requestPasswordResetAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    return { error: "Merci de renseigner un email valide." };
  }

  const { email } = parsed.data;
  const merchant = await prisma.merchant.findUnique({ where: { email } });

  // Always return the same success message, whether or not the account
  // exists, so the form can't be used to check which emails are registered.
  const confirmation: ActionState = {
    success:
      "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.",
  };

  if (!merchant) {
    return confirmation;
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

  await prisma.passwordResetToken.create({
    data: { token, merchantId: merchant.id, expiresAt },
  });

  const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/dashboard/reset-password?token=${token}`;

  await sendEmail({
    to: merchant.email,
    subject: "Réinitialisation de votre mot de passe Ekko Wood",
    text: `Bonjour,\n\nVous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien suivant (valable 1 heure) :\n${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
  });

  return confirmation;
}

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

export async function resetPasswordAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const { token, password } = parsed.data;

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (
    !resetToken ||
    resetToken.used ||
    resetToken.expiresAt < new Date()
  ) {
    return {
      error:
        "Ce lien de réinitialisation est invalide ou expiré. Merci de refaire une demande.",
    };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.merchant.update({
      where: { id: resetToken.merchantId },
      data: { passwordHash, ...RESET_LOGIN_STATE },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),
    // Invalider les sessions existantes par sécurité après un changement de mot de passe.
    prisma.merchantSession.deleteMany({
      where: { merchantId: resetToken.merchantId },
    }),
  ]);

  return { success: "Mot de passe mis à jour. Vous pouvez vous connecter." };
}
