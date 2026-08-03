"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/lib/actions/merchant-auth";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(
    requestPasswordResetAction,
    {}
  );

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-brand-primary-dark">
          Mot de passe oublié
        </h1>
        <p className="mb-6 text-sm text-brand-text/70">
          Indiquez votre email, nous vous enverrons un lien de
          réinitialisation.
        </p>

        {state.success ? (
          <p className="text-sm text-brand-accent">{state.success}</p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
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
              {isPending ? "Envoi..." : "Envoyer le lien"}
            </button>
          </form>
        )}

        <Link
          href="/dashboard/login"
          className="mt-4 block text-center text-sm text-brand-primary hover:underline"
        >
          Retour à la connexion
        </Link>
      </div>
    </main>
  );
}
