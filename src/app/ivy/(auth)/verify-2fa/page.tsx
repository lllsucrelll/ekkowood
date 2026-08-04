import { redirect } from "next/navigation";
import { getTwoFactorChallenge } from "@/lib/auth/admin-2fa";
import { TotpVerifyForm } from "./TotpVerifyForm";

export default async function VerifyTwoFactorPage() {
  const challenge = await getTwoFactorChallenge();
  if (!challenge) {
    redirect("/ivy/login");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-brand-primary-dark">
          Vérification en deux étapes
        </h1>
        <p className="mb-6 text-sm text-brand-text/70">
          Entrez le code à 6 chiffres généré par votre application
          d&apos;authentification.
        </p>
        <TotpVerifyForm />
      </div>
    </main>
  );
}
