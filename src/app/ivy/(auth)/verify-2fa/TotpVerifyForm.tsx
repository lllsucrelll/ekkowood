"use client";

import { useActionState } from "react";
import { verifyTotpLoginAction } from "@/lib/actions/admin-auth";

export function TotpVerifyForm() {
  const [state, formAction, isPending] = useActionState(
    verifyTotpLoginAction,
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="code" className="text-sm font-medium">
          Code à 6 chiffres
        </label>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-center text-lg tracking-[0.3em] outline-none focus:border-brand-primary"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 rounded-full bg-brand-primary px-4 py-2 font-medium text-white transition hover:bg-brand-primary-dark disabled:opacity-60"
      >
        {isPending ? "Vérification..." : "Vérifier"}
      </button>
    </form>
  );
}
