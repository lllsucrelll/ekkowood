"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createAdminSession, destroyAdminSession } from "@/lib/auth/admin";
import {
  isLockedOut,
  nextFailedLoginState,
  RESET_LOGIN_STATE,
} from "@/lib/auth/lockout";
import type { ActionState } from "./merchant-auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function adminLoginAction(
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
  await createAdminSession(admin.id);
  redirect("/ivy");
}

export async function adminLogoutAction(): Promise<void> {
  await destroyAdminSession();
  redirect("/ivy/login");
}
