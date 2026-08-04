import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import type { AdminUser } from "@/generated/prisma/client";
import {
  ADMIN_2FA_CHALLENGE_COOKIE,
  TWO_FACTOR_CHALLENGE_DURATION_MS,
  MAX_TOTP_ATTEMPTS,
} from "./constants";

type TwoFactorChallenge = {
  id: string;
  adminUserId: string;
  adminUser: AdminUser;
};

/**
 * Bridges "password verified" and "session created" for admins with 2FA
 * enabled — the real AdminSession is only created once the TOTP code is
 * verified, so a stolen/guessed password alone can't reach /ivy.
 */
export async function createTwoFactorChallenge(
  adminUserId: string
): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TWO_FACTOR_CHALLENGE_DURATION_MS);

  await prisma.adminTwoFactorChallenge.create({
    data: { token, adminUserId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_2FA_CHALLENGE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getTwoFactorChallenge(): Promise<TwoFactorChallenge | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_2FA_CHALLENGE_COOKIE)?.value;
  if (!token) return null;

  const challenge = await prisma.adminTwoFactorChallenge.findUnique({
    where: { token },
    include: { adminUser: true },
  });

  if (!challenge || challenge.expiresAt < new Date()) return null;
  if (challenge.failedAttempts >= MAX_TOTP_ATTEMPTS) return null;

  return challenge;
}

export async function destroyTwoFactorChallenge(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_2FA_CHALLENGE_COOKIE)?.value;
  if (token) {
    await prisma.adminTwoFactorChallenge.deleteMany({ where: { token } });
  }
  cookieStore.delete(ADMIN_2FA_CHALLENGE_COOKIE);
}

export async function recordFailedTwoFactorAttempt(
  challengeId: string
): Promise<void> {
  await prisma.adminTwoFactorChallenge
    .update({
      where: { id: challengeId },
      data: { failedAttempts: { increment: 1 } },
    })
    .catch(() => undefined);
}
