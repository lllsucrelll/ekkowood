import Link from "next/link";
import { getMerchantSession } from "@/lib/auth/merchant";
import { parsePageConfig } from "@/lib/page-config";
import { MerchantPageContent } from "@/components/MerchantPageContent";

export default async function PreviewPage() {
  const merchant = await getMerchantSession();
  if (!merchant) return null; // le layout garantit déjà la session

  const config = parsePageConfig(merchant.draftConfig);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between gap-4 border-b border-black/10 bg-brand-primary/5 px-4 py-3">
        <p className="text-sm text-brand-text/70">
          Aperçu du brouillon — cette page n&apos;est visible que par vous
          tant qu&apos;elle n&apos;est pas publiée.
        </p>
        <Link
          href="/dashboard"
          className="shrink-0 text-sm font-medium text-brand-primary hover:underline"
        >
          Retour à la configuration
        </Link>
      </div>
      <main
        className="flex flex-1 justify-center p-4 sm:p-8"
        style={
          config.backgroundColor
            ? { backgroundColor: config.backgroundColor }
            : undefined
        }
      >
        <MerchantPageContent
          merchantId={merchant.id}
          businessName={merchant.businessName}
          slug={merchant.slug}
          config={config}
          preview
        />
      </main>
    </div>
  );
}
