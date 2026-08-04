"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createAdminSession, destroyAdminSession } from "@/lib/auth/admin";
import {
  createTwoFactorChallenge,
  getTwoFactorChallenge,
  destroyTwoFactorChallenge,
  recordFailedTwoFactorAttempt,
} from "@/lib/auth/admin-2fa";
import { verifyTotpCode } from "@/lib/auth/totp";
import {
  isLockedOut,
  nextFailedLoginState,
  RESET_LOGIN_STATE,
} from "@/lib/auth/lockout";
import { verifyRecaptcha } from "@/lib/recaptcha";
import type { ActionState } from "./merchant-auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  recaptchaToken: z.string().optional(),
});

export async function adminLoginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    recaptchaToken: formData.get("recaptchaToken") || undefined,
  });
  if (!parsed.success) {
    return { error: "Merci de renseigner un email et un mot de passe valides." };
  }
  const { email, password } = parsed.data;

  const isHuman = await verifyRecaptcha(parsed.data.recaptchaToken ?? "");
  if (!isHuman) {
    return { error: "Échec de la vérification anti-spam. Merci de réessayer." };
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  const genericError = "Email ou mot de passe incorrect.";

  if (!admin) {
    return { error: genericError };
  }

  if (isLockedOut(admin)) {
    return {
      error:
        "Trop de tentatives échouées. Merci de réessayer dans quelques minutes.",
    };
  }

  const validPassword = await verifyPassword(password, admin.passwordHash);
  if (!validPassword) {
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: nextFailedLoginState(admin),
    });
    return { error: genericError };
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: RESET_LOGIN_STATE,
  });

  if (admin.totpSecret) {
    await createTwoFactorChallenge(admin.id);
    redirect("/ivy/verify-2fa");
  }

  await createAdminSession(admin.id);
  redirect("/ivy");
}

export async function adminLogoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect("/ivy/login");
}

const totpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Le code doit contenir 6 chiffres."),
});

export async function verifyTotpLoginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const challenge = await getTwoFactorChallenge();
  if (!challenge) {
    return {
      error: "Session de connexion expirée. Merci de vous reconnecter.",
    };
  }

  const parsed = totpSchema.safeParse({ code: formData.get("code") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Code invalide." };
  }

  const isValid =
    !!challenge.adminUser.totpSecret &&
    (await verifyTotpCode(challenge.adminUser.totpSecret, parsed.data.code));

  if (!isValid) {
    await recordFailedTwoFactorAttempt(challenge.id);
    return { error: "Code invalide." };
  }

  await destroyTwoFactorChallenge();
  await createAdminSession(challenge.adminUserId);
  redirect("/ivy");
}
