"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMapsPlaces } from "@/lib/google-maps-loader";

type PlaceSelection = { url: string; name: string; address: string };

export function GooglePlacePicker({
  apiKey,
  onSelect,
}: {
  apiKey: string;
  onSelect: (selection: PlaceSelection) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onSelectRef = useRef(onSelect);
  const [selected, setSelected] = useState<PlaceSelection | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let listener: google.maps.MapsEventListener | undefined;

    loadGoogleMapsPlaces(apiKey)
      .then(() => {
        if (!inputRef.current) return;
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ["establishment"],
          fields: ["place_id", "name", "formatted_address"],
        });
        listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.place_id) return;
          const selection: PlaceSelection = {
            url: `https://search.google.com/local/writereview?placeid=${place.place_id}`,
            name: place.name ?? "Avis Google",
            address: place.formatted_address ?? "",
          };
          setSelected(selection);
          onSelectRef.current(selection);
        });
      })
      .catch(() =>
        setError("Impossible de charger la recherche Google. Réessayez plus tard.")
      );

    return () => listener?.remove();
  }, [apiKey]);

  return (
    <div className="flex flex-col gap-1">
      <input
        ref={inputRef}
        type="text"
        placeholder="Nom et ville de votre établissement..."
        className="rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-brand-primary"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {selected && (
        <p className="text-xs text-brand-accent">
          ✓ {selected.name} — {selected.address}
        </p>
      )}
    </div>
  );
}
