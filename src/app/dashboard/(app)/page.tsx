import { getMerchantSession } from "@/lib/auth/merchant";
import { parsePageConfig, sortedButtons } from "@/lib/page-config";
import { publishAction } from "@/lib/actions/merchant-page";
import { PreviewCard } from "./PreviewCard";
import { BackgroundColorPicker } from "./BackgroundColorPicker";

export default async function DashboardConfigPage() {
  const merchant = await getMerchantSession();
  if (!merchant) return null; // le layout garantit déjà la session

  const draft = parsePageConfig(merchant.draftConfig);
  const published = parsePageConfig(merchant.publishedConfig);
  const hasUnpublishedChanges =
    JSON.stringify(draft) !== JSON.stringify(published);
  const buttons = sortedButtons(draft);

  return (
    <div className="flex flex-col items-center gap-8">
      <PreviewCard
        businessName={merchant.businessName}
        config={draft}
        buttons={buttons}
      />

      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Couleur de fond</h2>
        <BackgroundColorPicker currentColor={draft.backgroundColor} />
      </section>

      <section className="flex w-full max-w-md flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">
            {hasUnpublishedChanges
              ? "Des modifications ne sont pas encore publiées."
              : "Tout est publié."}
          </p>
          <p className="text-sm text-brand-text/60">
            Page publique : /{merchant.slug}
          </p>
        </div>
        <form action={publishAction}>
          <button
            type="submit"
            disabled={!hasUnpublishedChanges}
            className="rounded-full bg-brand-primary px-6 py-2 font-medium text-white hover:bg-brand-primary-dark disabled:opacity-40"
          >
            Publier
          </button>
        </form>
      </section>
    </div>
  );
}
