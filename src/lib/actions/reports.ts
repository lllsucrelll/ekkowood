"use server";

import "server-only";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getMerchantSession } from "@/lib/auth/merchant";
import type { ActionState } from "./merchant-auth";

const submitReportSchema = z.object({
  merchantId: z.string().min(1),
  message: z.string().trim().min(1, "Merci de décrire le problème.").max(2000),
});

export async function submitReportAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = submitReportSchema.safeParse({
    merchantId: formData.get("merchantId"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  // Best-effort : un merchantId invalide (ex: compte supprimé) ne doit pas
  // faire planter la page pour le visiteur.
  await prisma.report
    .create({ data: parsed.data })
    .catch(() => undefined);

  return { success: "Merci, votre message a bien été envoyé." };
}

export async function deleteReportAction(reportId: string): Promise<void> {
  const merchant = await getMerchantSession();
  if (!merchant) return;

  await prisma.report.deleteMany({
    where: { id: reportId, merchantId: merchant.id },
  });
  revalidatePath("/dashboard/reports");
}
