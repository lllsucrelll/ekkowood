import QRCode from "qrcode";
import { getAdminSession } from "@/lib/auth/admin";
import { generateTotpSecret, getTotpAuthUrl } from "@/lib/auth/totp";
import { TwoFactorSetupForm } from "./TwoFactorSetupForm";
import { DisableTwoFactorForm } from "./DisableTwoFactorForm";

export default async function AdminSettingsPage() {
  const admin = await getAdminSession();
  if (!admin) return null; // le layout garantit déjà la session

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          Double authentification (2FA)
        </h2>

        {admin.totpSecret ? (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-brand-accent">
              Activée
              {admin.totpEnabledAt
                ? ` le ${admin.totpEnabledAt.toLocaleDateString("fr-FR")}`
                : ""}
              .
            </p>
            <DisableTwoFactorForm />
          </div>
        ) : (
          <TwoFactorSetupPanel email={admin.email} />
        )}
      </section>
    </div>
  );
}

async function TwoFactorSetupPanel({ email }: { email: string }) {
  const secret = generateTotpSecret();
  const otpauthUrl = getTotpAuthUrl(secret, email);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  return <TwoFactorSetupForm secret={secret} qrCodeDataUrl={qrCodeDataUrl} />;
}
