"use client";

import { useActionState } from "react";
import { changeMerchantPasswordAction } from "@/lib/actions/merchant-settings";

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changeMerchantPasswordAction,
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="currentPassword" className="text-sm font-medium">
          Mot de passe actuel
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="newPassword" className="text-sm font-medium">
          Nouveau mot de passe
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmer le nouveau mot de passe
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-primary"
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-brand-accent">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-fit rounded-full bg-brand-primary px-5 py-2 text-sm font-medium text-white hover:bg-brand-primary-dark disabled:opacity-60"
      >
        {isPending ? "Enregistrement..." : "Changer le mot de passe"}
      </button>
    </form>
  );
}
