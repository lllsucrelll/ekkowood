"use client";

let loadPromise: Promise<void> | null = null;

/** Injects the Google Maps JS script (Places library) once, reusing the same promise on later calls. */
export function loadGoogleMapsPlaces(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=fr`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Impossible de charger Google Maps."));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
