import { getMerchantSession } from "@/lib/auth/merchant";
import { BusinessNameForm } from "./BusinessNameForm";
import { ChangePasswordForm } from "./ChangePasswordForm";

export default async function SettingsPage() {
  const merchant = await getMerchantSession();
  if (!merchant) return null; // le layout garantit déjà la session

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Informations du commerce</h2>
        <BusinessNameForm currentName={merchant.businessName} />
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Mot de passe</h2>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
