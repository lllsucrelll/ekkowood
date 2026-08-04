"use client";

let loadPromise: Promise<void> | null = null;

/** Injects the reCAPTCHA v3 script once, reusing the same promise on later calls. */
function loadRecaptcha(siteKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.grecaptcha) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Impossible de charger reCAPTCHA."));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** Loads the script if needed and returns a fresh v3 token for the given action. */
export async function getRecaptchaToken(
  siteKey: string,
  action: string
): Promise<string> {
  await loadRecaptcha(siteKey);
  return new Promise((resolve, reject) => {
    window.grecaptcha!.ready(() => {
      window
        .grecaptcha!.execute(siteKey, { action })
        .then(resolve)
        .catch(reject);
    });
  });
}

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}
