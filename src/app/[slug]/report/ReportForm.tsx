"use client";

import { useState } from "react";
import { submitReportAction } from "@/lib/actions/reports";
import type { ActionState } from "@/lib/actions/merchant-auth";
import { getRecaptchaToken } from "@/lib/recaptcha-loader";

const MAX_LENGTH = 250;
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export function ReportForm({ merchantId }: { merchantId: string }) {
  const [message, setMessage] = useState("");
  const [state, setState] = useState<ActionState>({});
  const [isPending, setIsPending] = useState(false);

  if (state.success) {
    return <p className="text-center text-brand-accent">{state.success}</p>;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsPending(true);
    setState({});

    const formData = new FormData(e.currentTarget);

    try {
      if (RECAPTCHA_SITE_KEY) {
        const token = await getRecaptchaToken(RECAPTCHA_SITE_KEY, "report");
        formData.set("recaptchaToken", token);
      }
      const result = await submitReportAction({}, formData);
      setState(result);
    } catch {
      setState({ error: "Une erreur est survenue. Merci de réessayer." });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      <input type="hidden" name="merchantId" value={merchantId} />
      <textarea
        name="message"
        required
        rows={5}
        maxLength={MAX_LENGTH}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Décrivez le problème rencontré..."
        className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-primary"
      />
      <p className="-mt-2 text-right text-xs text-brand-text/50">
        {message.length}/{MAX_LENGTH}
      </p>

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
