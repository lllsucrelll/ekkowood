"use client";

import { useActionState } from "react";
import { updateBusinessNameAction } from "@/lib/actions/merchant-settings";

export function BusinessNameForm({ currentName }: { currentName: string }) {
  const [state, formAction, isPending] = useActionState(
    updateBusinessNameAction,
    {}
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="businessName" className="text-sm font-medium">
          Nom du commerce
        </label>
        <input
          id="businessName"
          name="businessName"
          defaultValue={currentName}
          required
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
        {isPending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
