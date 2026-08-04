import { getMerchantSession } from "@/lib/auth/merchant";
import { parsePageConfig, sortedButtons } from "@/lib/page-config";
import { getButtonIcon, isInternalButtonType } from "@/lib/button-types";
import {
  deleteButtonAction,
  moveButtonAction,
  publishAction,
  updateButtonAction,
} from "@/lib/actions/merchant-page";
import { BannerUploader } from "./BannerUploader";
import { AddButtonForm } from "./AddButtonForm";

export default async function DashboardConfigPage() {
  const merchant = await getMerchantSession();
  if (!merchant) return null; // le layout garantit déjà la session

  const draft = parsePageConfig(merchant.draftConfig);
  const published = parsePageConfig(merchant.publishedConfig);
  const hasUnpublishedChanges =
    JSON.stringify(draft) !== JSON.stringify(published);
  const buttons = sortedButtons(draft);

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Bannière</h2>
        <BannerUploader currentBanner={draft.banner} />
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Boutons</h2>

        <div className="flex flex-col gap-3">
          {buttons.map((button, index) => {
            const Icon = getButtonIcon(button.type);
            const internal = isInternalButtonType(button.type);
            return (
              <div
                key={button.id}
                className="flex flex-col gap-2 rounded-lg border border-black/10 p-3 sm:flex-row sm:items-center"
              >
                <Icon className="hidden h-5 w-5 shrink-0 text-brand-primary sm:block" />

                <form
                  action={updateButtonAction}
                  className="flex flex-1 flex-col gap-2 sm:flex-row"
                >
                  <input type="hidden" name="buttonId" value={button.id} />
                  <input
                    name="label"
                    defaultValue={button.label}
                    className="flex-1 rounded-lg border border-black/10 px-3 py-1.5 text-sm"
                  />
                  <input
                    name="url"
                    defaultValue={button.url}
                    disabled={internal}
                    placeholder={internal ? "Non nécessaire pour ce type" : undefined}
                    className="flex-1 rounded-lg border border-black/10 px-3 py-1.5 text-sm disabled:bg-black/5 disabled:text-brand-text/40"
                  />
                  <button
                    type="submit"
                    className="rounded-full border border-brand-primary px-3 py-1.5 text-xs font-medium text-brand-primary-dark hover:bg-brand-primary/10"
                  >
                    Enregistrer
                  </button>
                </form>

                <div className="flex shrink-0 items-center gap-1">
                  <form action={moveButtonAction.bind(null, button.id, "up")}>
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="rounded-full border border-black/10 px-2 py-1.5 text-xs disabled:opacity-30"
                      aria-label="Monter"
                    >
                      ↑
                    </button>
                  </form>
                  <form
                    action={moveButtonAction.bind(null, button.id, "down")}
                  >
                    <button
                      type="submit"
                      disabled={index === buttons.length - 1}
                      className="rounded-full border border-black/10 px-2 py-1.5 text-xs disabled:opacity-30"
                      aria-label="Descendre"
                    >
                      ↓
                    </button>
                  </form>
                  <form action={deleteButtonAction.bind(null, button.id)}>
                    <button
                      type="submit"
                      className="rounded-full border border-red-200 px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
                      aria-label="Supprimer"
                    >
                      Suppr.
                    </button>
                  </form>
                </div>
              </div>
            );
          })}

          {buttons.length === 0 && (
            <p className="text-sm text-brand-text/60">Aucun bouton pour le moment.</p>
          )}
        </div>

        <div className="mt-4">
          <AddButtonForm />
        </div>
      </section>

      <section className="flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm">
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
