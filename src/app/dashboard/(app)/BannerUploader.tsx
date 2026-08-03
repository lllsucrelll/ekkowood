"use client";

import { useActionState } from "react";
import { uploadBannerAction } from "@/lib/actions/merchant-page";

export function BannerUploader({ currentBanner }: { currentBanner: string | null }) {
  const [state, formAction, isPending] = useActionState(uploadBannerAction, {});

  return (
    <div className="flex flex-col gap-3">
      {currentBanner && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={currentBanner}
          alt="Bannière actuelle"
          className="h-32 w-full rounded-lg object-cover"
        />
      )}
      <form action={formAction} className="flex items-center gap-3">
        <input
          type="file"
          name="banner"
          accept="image/*"
          required
          className="text-sm"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-dark disabled:opacity-60"
        >
          {isPending ? "Envoi..." : "Changer la bannière"}
        </button>
      </form>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-brand-accent">{state.success}</p>
      )}
    </div>
  );
}
