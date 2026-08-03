import "server-only";

type Email = {
  to: string;
  subject: string;
  text: string;
};

/**
 * Sends a transactional email via Resend when RESEND_API_KEY is configured.
 * Otherwise (local dev, before the Resend account/domain is set up), the
 * email is just logged so the flow can be developed and tested end-to-end
 * without a real provider.
 */
export async function sendEmail(email: Email): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Ekko Wood <no-reply@ekkowood.com>";

  if (!apiKey) {
    console.log("--- Email (dev, non envoyé) ---");
    console.log(`À : ${email.to}`);
    console.log(`Sujet : ${email.subject}`);
    console.log(email.text);
    console.log("--------------------------------");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email.to,
      subject: email.subject,
      text: email.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Échec de l'envoi de l'email (${response.status}): ${body}`);
  }
}
