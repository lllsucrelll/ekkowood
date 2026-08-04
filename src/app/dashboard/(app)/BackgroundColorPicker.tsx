"use client";

import { useId, useState } from "react";
import { getContrastTextColor } from "@/lib/contrast-color";
import { updateBackgroundColorAction } from "@/lib/actions/merchant-page";

const DEFAULT_COLOR = "#faf6f0";

export function BackgroundColorPicker({
  currentColor,
}: {
  currentColor: string | null;
}) {
  const inputId = useId();
  const [color, setColor] = useState(currentColor ?? DEFAULT_COLOR);
  const textColor = getContrastTextColor(color);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <label htmlFor={inputId} className="sr-only">
          Couleur de fond
        </label>
        <input
          id={inputId}
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="h-10 w-14 cursor-pointer rounded border border-black/10"
        />
        <span className="font-mono text-sm text-brand-text/60">{color}</span>
      </div>

      <div
        className="flex h-16 w-full max-w-xs items-center justify-center rounded-lg text-sm font-medium"
        style={{ backgroundColor: color, color: textColor }}
      >
        Aperçu du texte sur ce fond
      </div>

      <div className="flex gap-3">
        <form action={updateBackgroundColorAction}>
          <input type="hidden" name="backgroundColor" value={color} />
          <button
            type="submit"
            className="rounded-full bg-brand-primary px-4 py-2 text-sm font-medium text-white hover:bg-brand-primary-dark"
          >
            Enregistrer
          </button>
        </form>
        <form
          action={updateBackgroundColorAction}
          onSubmit={() => setColor(DEFAULT_COLOR)}
        >
          <input type="hidden" name="backgroundColor" value="" />
          <button
            type="submit"
            className="rounded-full border border-black/10 px-4 py-2 text-sm text-brand-text/70 hover:bg-black/5"
          >
            Réinitialiser
          </button>
        </form>
      </div>
      <p className="text-xs text-brand-text/50">
        La couleur du texte s&apos;adapte automatiquement pour rester
        lisible. Les boutons restent blancs quel que soit le fond choisi.
      </p>
    </div>
  );
}
