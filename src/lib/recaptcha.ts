import "server-only";

const SCORE_THRESHOLD = 0.5;

/**
 * Verifies a reCAPTCHA v3 token server-side. Returns true (and skips the
 * check) when RECAPTCHA_SECRET_KEY isn't configured yet, so the form keeps
 * working before the site's reCAPTCHA keys have been set up.
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) return true;
  if (!token) return false;

  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: token }),
    });
    const data = (await response.json()) as { success: boolean; score?: number };
    return data.success && (data.score ?? 0) >= SCORE_THRESHOLD;
  } catch {
    // Google's verification endpoint being unreachable shouldn't itself
    // block a genuine visitor from submitting a report.
    return true;
  }
}
