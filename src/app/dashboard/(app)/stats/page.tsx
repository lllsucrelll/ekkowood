import { getMerchantSession } from "@/lib/auth/merchant";
import { getMerchantStats } from "@/lib/stats";
import { VisitsChart } from "./VisitsChart";

export default async function StatsPage() {
  const merchant = await getMerchantSession();
  if (!merchant) return null; // le layout garantit déjà la session

  const stats = await getMerchantStats(merchant.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-brand-text/60">Visites totales</p>
          <p className="mt-1 text-3xl font-semibold text-brand-primary-dark">
            {stats.totalVisits}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-brand-text/60">Clics totaux</p>
          <p className="mt-1 text-3xl font-semibold text-brand-primary-dark">
            {stats.totalClicks}
          </p>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          Visites — 30 derniers jours
        </h2>
        <VisitsChart data={stats.dailyVisits} />
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Clics par bouton</h2>
        {stats.clicksByButton.length === 0 ? (
          <p className="text-sm text-brand-text/60">Aucun clic pour le moment.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {stats.clicksByButton.map((button) => (
              <div
                key={button.buttonLabel}
                className="flex items-center justify-between border-b border-black/5 py-2 text-sm last:border-0"
              >
                <span>{button.buttonLabel}</span>
                <span className="font-medium text-brand-primary-dark">
                  {button.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
