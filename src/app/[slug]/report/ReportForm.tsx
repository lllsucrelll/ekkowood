"use client";

import { useActionState } from "react";
import { submitReportAction } from "@/lib/actions/reports";

export function ReportForm({ merchantId }: { merchantId: string }) {
  const [state, formAction, isPending] = useActionState(submitReportAction, {});

  if (state.success) {
    return <p className="text-center text-brand-accent">{state.success}</p>;
  }

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <input type="hidden" name="merchantId" value={merchantId} />
      <textarea
        name="message"
        required
        rows={5}
        placeholder="Décrivez le problème rencontré..."
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-primary"
      />

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-brand-primary px-6 py-3 font-medium text-white transition hover:bg-brand-primary-dark disabled:opacity-60"
      >
        {isPending ? "Envoi..." : "Envoyer"}
      </button>
    </form>
  );
}
