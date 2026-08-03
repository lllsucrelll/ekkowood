"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/merchant-auth";

export function LoginForm({
  action,
  submitLabel = "Se connecter",
  footer,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel?: string;
  footer?: React.ReactNode;
}) {
  const [state, formAction, isPending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-lg border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-primary"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-primary"
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
        {isPending ? "Connexion..." : submitLabel}
      </button>

      {footer}
    </form>
  );
}
