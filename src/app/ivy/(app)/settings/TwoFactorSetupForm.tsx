"use client";

import { useActionState } from "react";
import { confirmTotpSetupAction } from "@/lib/actions/admin-settings";

export function TwoFactorSetupForm({
  secret,
  qrCodeDataUrl,
}: {
  secret: string;
  qrCodeDataUrl: string;
}) {
  const [state, formAction, isPending] = useActionState(
    confirmTotpSetupAction,
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm text-brand-text/70">
        Scannez ce code avec une application d&apos;authentification (Google
        Authenticator, Authy...), puis entrez le code à 6 chiffres généré
        pour confirmer.
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrCodeDataUrl}
        alt="QR code de configuration de la double authentification"
        className="h-40 w-40"
      />

      <p className="text-xs text-brand-text/60">
        Ou entrez cette clé manuellement :{" "}
        <span className="font-mono">{secret}</span>
      </p>

      <input type="hidden" name="secret" value={secret} />

      <div className="flex flex-col gap-1">
        <label htmlFor="code" className="text-sm font-medium">
          Code à 6 chiffres
        </label>
        <input
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          className="w-40 rounded-lg border border-black/10 px-3 py-2 text-center tracking-[0.3em] outline-none focus:border-brand-primary"
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
        {isPending ? "Vérification..." : "Activer"}
      </button>
    </form>
  );
}
