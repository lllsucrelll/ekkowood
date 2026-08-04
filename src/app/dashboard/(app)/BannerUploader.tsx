"use client";

import { useActionState, useId, useState } from "react";
import { uploadBannerAction } from "@/lib/actions/merchant-page";

export function BannerUploader({ currentBanner }: { currentBanner: string | null }) {
  const [state, formAction, isPending] = useActionState(uploadBannerAction, {});
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      setFileName(null);
      return;
    }
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const displayImage = previewUrl ?? currentBanner;

  return (
    <div className="flex flex-col gap-3">
      <form
        action={formAction}
        className="flex flex-col items-start gap-4 sm:flex-row sm:items-center"
      >
        <label
          htmlFor={inputId}
          className="group relative flex h-32 w-32 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-brand-primary/40 bg-brand-primary/5 text-center text-xs font-medium text-brand-primary transition hover:border-brand-primary hover:bg-brand-primary/10"
        >
          {displayImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayImage}
              alt="Bannière"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-2">Cliquez pour choisir une image</span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
            {displayImage ? "Changer l'image" : "Choisir une image"}
          </span>
          <input
            id={inputId}
            type="file"
            name="banner"
            accept="image/*"
            required
            onChange={handleFileChange}
            className="sr-only"
          />
        </label>

        <div className="flex flex-col gap-2">
          {fileName && (
            <p className="text-xs text-brand-text/60">
              Image sélectionnée : {fileName}
            </p>
          )}
          <button
            type="submit"
            disabled={isPending || !fileName}
            className="w-fit rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-dark disabled:opacity-40"
          >
            {isPending ? "Envoi..." : "Enregistrer la bannière"}
          </button>
        </div>
      </form>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-brand-accent">{state.success}</p>
      )}
    </div>
  );
}
