"use client";

import { useActionState } from "react";
import { disableTotpAction } from "@/lib/actions/admin-settings";

export function DisableTwoFactorForm() {
  const [state, formAction, isPending] = useActionState(disableTotpAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Confirmer avec votre mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full max-w-xs rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-primary"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-brand-accent">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        {isPending ? "Désactivation..." : "Désactiver la double authentification"}
      </button>
    </form>
  );
}
