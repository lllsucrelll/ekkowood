import "server-only";
import { generateSecret, generateURI, verify } from "otplib";

// Allow ±30s of clock drift between server and phone (symmetric tolerance).
const EPOCH_TOLERANCE_SECONDS = 30;

export function generateTotpSecret(): string {
  return generateSecret();
}

export function getTotpAuthUrl(secret: string, accountEmail: string): string {
  return generateURI({
    issuer: "Ekko Wood Admin",
    label: accountEmail,
    secret,
  });
}

export async function verifyTotpCode(
  secret: string,
  code: string
): Promise<boolean> {
  try {
    const result = await verify({
      secret,
      token: code,
      epochTolerance: EPOCH_TOLERANCE_SECONDS,
    });
    return result.valid;
  } catch {
    return false;
  }
}
