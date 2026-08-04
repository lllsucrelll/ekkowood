"use client";

import { useState } from "react";
import { useActionState } from "react";
import { addButtonAction } from "@/lib/actions/merchant-page";
import { PREDEFINED_BUTTON_TYPES, isInternalButtonType } from "@/lib/button-types";
import { GooglePlacePicker } from "@/components/GooglePlacePicker";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function AddButtonForm() {
  const [state, formAction, isPending] = useActionState(addButtonAction, {});
  const [type, setType] = useState("custom");
  const [googlePlaceUrl, setGooglePlaceUrl] = useState("");
  const internal = isInternalButtonType(type);
  const useGooglePicker = type === "google_reviews" && !!GOOGLE_MAPS_API_KEY;

  return (
    <form
      action={formAction}
      className="grid grid-cols-1 gap-3 rounded-lg border border-dashed border-black/15 p-4 sm:grid-cols-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="type" className="text-xs font-medium text-brand-text/70">
          Type
        </label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm"
        >
          {Object.entries(PREDEFINED_BUTTON_TYPES).map(([key, def]) => (
            <option key={key} value={key}>
              {def.label}
            </option>
          ))}
          <option value="custom">Personnalisé</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="label" className="text-xs font-medium text-brand-text/70">
          Libellé (optionnel pour les types prédéfinis)
        </label>
        <input
          id="label"
          name="label"
          className="rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1 sm:col-span-2">
        {useGooglePicker ? (
          <div key="google-picker" className="flex flex-col gap-1">
            <label className="text-xs font-medium text-brand-text/70">
              Rechercher votre établissement sur Google
            </label>
            <input type="hidden" name="url" value={googlePlaceUrl} />
            <GooglePlacePicker
              apiKey={GOOGLE_MAPS_API_KEY!}
              onSelect={(selection) => setGooglePlaceUrl(selection.url)}
            />
          </div>
        ) : (
          <div key="url-input" className="flex flex-col gap-1">
            <label htmlFor="url" className="text-xs font-medium text-brand-text/70">
              Lien (URL, mailto:, ou numéro pour Téléphone)
            </label>
            <input
              id="url"
              name="url"
              required={!internal}
              disabled={internal}
              placeholder={internal ? "Non nécessaire pour ce type" : undefined}
              className="rounded-lg border border-black/10 px-3 py-2 text-sm disabled:bg-black/5 disabled:text-brand-text/40"
            />
          </div>
        )}
      </div>

      {state.error && (
        <p className="col-span-full text-sm text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="col-span-full text-sm text-brand-accent">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending || (useGooglePicker && !googlePlaceUrl)}
        className="col-span-full w-fit rounded-full bg-brand-primary px-5 py-2 text-sm font-medium text-white hover:bg-brand-primary-dark disabled:opacity-60"
      >
        {isPending ? "Ajout..." : "Ajouter le bouton"}
      </button>
    </form>
  );
}
