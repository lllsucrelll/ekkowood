"use server";

import "server-only";
import { z } from "zod";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getMerchantSession } from "@/lib/auth/merchant";
import {
  uploadImage,
  UnsupportedImageError,
  ImageTooLargeError,
} from "@/lib/storage";
import { parsePageConfig, sortedButtons, type PageConfig } from "@/lib/page-config";
import {
  isPredefinedButtonType,
  getButtonDefaultLabel,
  isInternalButtonType,
  isSafeButtonUrl,
} from "@/lib/button-types";
import type { ActionState } from "./merchant-auth";

async function requireMerchant() {
  const merchant = await getMerchantSession();
  if (!merchant) throw new Error("Session commerçant expirée.");
  return merchant;
}

async function saveDraft(merchantId: string, config: PageConfig) {
  await prisma.merchant.update({
    where: { id: merchantId },
    data: { draftConfig: config },
  });
  revalidatePath("/dashboard");
}

export async function uploadBannerAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const merchant = await requireMerchant();
  const file = formData.get("banner");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Merci de sélectionner une image." };
  }

  let url: string;
  try {
    url = await uploadImage(file);
  } catch (e) {
    if (e instanceof ImageTooLargeError) {
      return { error: "L'image ne doit pas dépasser 5 Mo." };
    }
    if (e instanceof UnsupportedImageError) {
      return { error: "Format non supporté. Utilisez une image JPG, PNG, GIF ou WEBP." };
    }
    throw e;
  }

  const config = parsePageConfig(merchant.draftConfig);
  config.banner = url;
  await saveDraft(merchant.id, config);

  return { success: "Bannière mise à jour (brouillon)." };
}

const addButtonSchema = z.object({
  type: z.string().min(1),
  label: z.string().optional(),
  url: z.string().optional(),
});

export async function addButtonAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const merchant = await requireMerchant();
  const parsed = addButtonSchema.safeParse({
    type: formData.get("type"),
    label: formData.get("label") || undefined,
    url: formData.get("url") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }
  const { type } = parsed.data;
  const internal = isInternalButtonType(type);

  if (!internal && !parsed.data.url?.trim()) {
    return { error: "Le lien est requis." };
  }
  const url = internal ? "" : parsed.data.url!.trim();

  if (!internal && !isSafeButtonUrl(type, url)) {
    return { error: "Lien invalide." };
  }

  const label =
    parsed.data.label?.trim() ||
    (isPredefinedButtonType(type) ? getButtonDefaultLabel(type) : "");
  if (!label) {
    return { error: "Merci de renseigner un libellé pour ce bouton." };
  }

  const config = parsePageConfig(merchant.draftConfig);
  config.buttons.push({
    id: randomUUID(),
    type,
    label,
    url,
    order: config.buttons.length,
  });
  await saveDraft(merchant.id, config);

  return { success: "Bouton ajouté (brouillon)." };
}

const updateButtonSchema = z.object({
  buttonId: z.string().min(1),
  label: z.string().min(1, "Le libellé est requis."),
  url: z.string().optional(),
});

export async function updateButtonAction(formData: FormData): Promise<void> {
  const merchant = await requireMerchant();
  const parsed = updateButtonSchema.safeParse({
    buttonId: formData.get("buttonId"),
    label: formData.get("label"),
    url: formData.get("url") || undefined,
  });
  if (!parsed.success) return;

  const config = parsePageConfig(merchant.draftConfig);
  const button = config.buttons.find((b) => b.id === parsed.data.buttonId);
  if (!button) return;

  const internal = isInternalButtonType(button.type);
  const newUrl = parsed.data.url?.trim();
  if (!internal && newUrl && !isSafeButtonUrl(button.type, newUrl)) return;

  button.label = parsed.data.label;
  button.url = internal ? "" : (newUrl ?? button.url);
  await saveDraft(merchant.id, config);
}

export async function deleteButtonAction(buttonId: string): Promise<void> {
  const merchant = await requireMerchant();
  const config = parsePageConfig(merchant.draftConfig);
  config.buttons = sortedButtons(config)
    .filter((b) => b.id !== buttonId)
    .map((b, index) => ({ ...b, order: index }));
  await saveDraft(merchant.id, config);
}

export async function moveButtonAction(
  buttonId: string,
  direction: "up" | "down"
): Promise<void> {
  const merchant = await requireMerchant();
  const config = parsePageConfig(merchant.draftConfig);
  const ordered = sortedButtons(config);
  const index = ordered.findIndex((b) => b.id === buttonId);
  const swapWith = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapWith < 0 || swapWith >= ordered.length) return;

  [ordered[index].order, ordered[swapWith].order] = [
    ordered[swapWith].order,
    ordered[index].order,
  ];

  config.buttons = ordered;
  await saveDraft(merchant.id, config);
}

export async function publishAction(): Promise<void> {
  const merchant = await requireMerchant();
  const draft = parsePageConfig(merchant.draftConfig);
  await prisma.merchant.update({
    where: { id: merchant.id },
    data: { publishedConfig: draft },
  });
  revalidatePath("/dashboard");
}
