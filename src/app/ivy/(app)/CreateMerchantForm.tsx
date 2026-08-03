"use client";

import { useActionState } from "react";
import { createMerchantAction } from "@/lib/actions/admin-merchants";

export function CreateMerchantForm() {
  const [state, formAction, isPending] = useActionState(
    createMerchantAction,
    {}
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2"
    >
      <h2 className="col-span-full text-lg font-semibold">
        Créer un compte commerçant
      </h2>

      <div className="flex flex-col gap-1">
        <label htmlFor="businessName" className="text-sm font-medium">
          Nom du commerce
        </label>
        <input
          id="businessName"
          name="businessName"
          required
          className="rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-brand-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="slug" className="text-sm font-medium">
          Slug (URL de la page publique)
        </label>
        <input
          id="slug"
          name="slug"
          required
          placeholder="le-bistrot-du-coin"
          className="rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-brand-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email du commerçant
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-brand-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="durationMonths" className="text-sm font-medium">
          Durée d&apos;accès
        </label>
        <select
          id="durationMonths"
          name="durationMonths"
          defaultValue="3"
          className="rounded-lg border border-black/10 bg-white px-3 py-2 outline-none focus:border-brand-primary"
        >
          <option value="1">1 mois</option>
          <option value="3">3 mois</option>
          <option value="6">6 mois</option>
          <option value="12">12 mois</option>
        </select>
      </div>

      {state.error && (
        <p className="col-span-full text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="col-span-full text-sm text-brand-accent">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="col-span-full mt-2 w-fit rounded-full bg-brand-primary px-6 py-2 font-medium text-white transition hover:bg-brand-primary-dark disabled:opacity-60"
      >
        {isPending ? "Création..." : "Créer le compte"}
      </button>
    </form>
  );
}
