import type { Merchant } from "@/generated/prisma/client";

/** Whether a merchant's page/report form should be reachable by visitors. */
export function isMerchantPubliclyAvailable(merchant: Merchant): boolean {
  return (
    merchant.status === "ACTIVE" &&
    merchant.accessExpiresAt > new Date() &&
    merchant.publishedConfig !== null
  );
}
