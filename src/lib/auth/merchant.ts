import "server-only";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Merchant } from "@/generated/prisma/client";
import { MERCHANT_SESSION_COOKIE, SESSION_DURATION_MS } from "./constants";

export async function createMerchantSession(merchantId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.merchantSession.create({
    data: { token, merchantId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(MERCHANT_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Authoritative check: validates the session token against the database and
 * re-checks the merchant's status/expiry on every call, so a suspension
 * takes effect on the very next request even if the session row itself
 * hasn't been deleted yet.
 */
export async function getMerchantSession(): Promise<Merchant | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(MERCHANT_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.merchantSession.findUnique({
    where: { token },
    include: { merchant: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  const { merchant } = session;
  if (merchant.status !== "ACTIVE" || merchant.accessExpiresAt < new Date()) {
    return null;
  }

  return merchant;
}

export async function destroyMerchantSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(MERCHANT_SESSION_COOKIE)?.value;
  if (token) {
    await prisma.merchantSession.deleteMany({ where: { token } });
  }
  cookieStore.delete(MERCHANT_SESSION_COOKIE);
}

/** Used by the admin back-office to cut access immediately on suspension. */
export async function invalidateAllMerchantSessions(
  merchantId: string
): Promise<void> {
  await prisma.merchantSession.deleteMany({ where: { merchantId } });
}

/**
 * After a self-service password change, log out every other device/session
 * but keep the one making the change signed in.
 */
export async function invalidateOtherMerchantSessions(
  merchantId: string
): Promise<void> {
  const cookieStore = await cookies();
  const currentToken = cookieStore.get(MERCHANT_SESSION_COOKIE)?.value;
  if (!currentToken) return;

  await prisma.merchantSession.deleteMany({
    where: { merchantId, token: { not: currentToken } },
  });
}
