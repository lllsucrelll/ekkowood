"use client";

import { useId, useRef, useState } from "react";
import { useActionState } from "react";
import { getContrastTextColor } from "@/lib/contrast-color";
import { uploadBannerAction } from "@/lib/actions/merchant-page";
import type { PageButton, PageConfig } from "@/lib/page-config";
import { EditableButtonPill } from "./EditableButtonPill";
import { AddButtonPill } from "./AddButtonPill";
import { AddButtonModal } from "./AddButtonModal";
import { EditButtonModal } from "./EditButtonModal";

export function PreviewCard({
  businessName,
  config,
  buttons,
}: {
  businessName: string;
  config: PageConfig;
  buttons: PageButton[];
}) {
  const [bannerState, bannerAction, bannerPending] = useActionState(
    uploadBannerAction,
    {}
  );
  const fileInputId = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editingButton, setEditingButton] = useState<PageButton | null>(null);

  const textColor = config.backgroundColor
    ? getContrastTextColor(config.backgroundColor)
    : null;
  const isLightText = textColor === "#ffffff";
  const editingIndex = editingButton
    ? buttons.findIndex((b) => b.id === editingButton.id)
    : -1;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      formRef.current?.requestSubmit();
    }
  }

  return (
    <div
      className="w-full max-w-md overflow-hidden rounded-2xl bg-brand-bg shadow-sm"
      style={
        config.backgroundColor
          ? { backgroundColor: config.backgroundColor }
          : undefined
      }
    >
      <div className="flex flex-col items-center gap-6 px-4 py-8 sm:px-8">
        <form ref={formRef} action={bannerAction}>
          <label
            htmlFor={fileInputId}
            className="group relative flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-full shadow-md"
          >
            {config.banner ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={config.banner}
                alt={businessName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={
                  textColor
                    ? "flex h-full w-full items-center justify-center text-3xl font-semibold"
                    : "flex h-full w-full items-center justify-center bg-brand-primary/10 text-3xl font-semibold text-brand-primary"
                }
                style={
                  textColor
                    ? {
                        backgroundColor: isLightText
                          ? "rgba(255,255,255,0.15)"
                          : "rgba(0,0,0,0.08)",
                        color: textColor,
                      }
                    : undefined
                }
              >
                {businessName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-center text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
              {bannerPending ? "Envoi..." : "Modifier l'image"}
            </span>
            <input
              id={fileInputId}
              type="file"
              name="banner"
              accept="image/*"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
        </form>
        {bannerState.error && (
          <p className="text-sm text-red-600">{bannerState.error}</p>
        )}

        <h1
          className="text-center text-2xl font-semibold text-brand-primary-dark"
          style={textColor ? { color: textColor } : undefined}
        >
          {businessName}
        </h1>

        <div className="flex w-full flex-col gap-3">
          {buttons.map((button) => (
            <EditableButtonPill
              key={button.id}
              button={button}
              onClick={() => setEditingButton(button)}
            />
          ))}
          <AddButtonPill onClick={() => setAddOpen(true)} />
        </div>
      </div>

      {addOpen && <AddButtonModal onClose={() => setAddOpen(false)} />}
      {editingButton && (
        <EditButtonModal
          key={editingButton.id}
          button={editingButton}
          canMoveUp={editingIndex > 0}
          canMoveDown={editingIndex !== -1 && editingIndex < buttons.length - 1}
          onClose={() => setEditingButton(null)}
        />
      )}
    </div>
  );
}
