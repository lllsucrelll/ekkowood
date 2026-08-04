import { prisma } from "@/lib/prisma";
import {
  toggleMerchantStatusAction,
  updateAccessExpiryAction,
  adminResetMerchantPasswordAction,
} from "@/lib/actions/admin-merchants";
import { CreateMerchantForm } from "./CreateMerchantForm";

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function BackofficeHomePage() {
  const merchants = await prisma.merchant.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <CreateMerchantForm />

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Comptes commerçants</h2>

        {merchants.length === 0 ? (
          <p className="text-brand-text/60">Aucun commerçant pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-black/10 text-brand-text/60">
                  <th className="py-2 pr-4">Commerce</th>
                  <th className="py-2 pr-4">Slug</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Statut</th>
                  <th className="py-2 pr-4">Expiration</th>
                  <th className="py-2 pr-4">Mot de passe</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((merchant) => {
                  const isExpired = merchant.accessExpiresAt < new Date();
                  return (
                    <tr key={merchant.id} className="border-b border-black/5">
                      <td className="py-3 pr-4 font-medium">
                        {merchant.businessName}
                      </td>
                      <td className="py-3 pr-4 text-brand-text/70">
                        /{merchant.slug}
                      </td>
                      <td className="py-3 pr-4 text-brand-text/70">
                        {merchant.email}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={
                            merchant.status === "ACTIVE" && !isExpired
                              ? "rounded-full bg-brand-accent/15 px-2 py-1 text-xs font-medium text-brand-accent"
                              : "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                          }
                        >
                          {merchant.status === "SUSPENDED"
                            ? "Suspendu"
                            : isExpired
                              ? "Expiré"
                              : "Actif"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <form
                          action={updateAccessExpiryAction}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="hidden"
                            name="merchantId"
                            value={merchant.id}
                          />
                          <input
                            type="date"
                            name="accessExpiresAt"
                            defaultValue={toDateInputValue(
                              merchant.accessExpiresAt
                            )}
                            className="rounded-lg border border-black/10 px-2 py-1 text-xs"
                          />
                          <button
                            type="submit"
                            className="text-xs text-brand-primary hover:underline"
                          >
                            Mettre à jour
                          </button>
                        </form>
                      </td>
                      <td className="py-3 pr-4">
                        <form
                          action={adminResetMerchantPasswordAction}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="hidden"
                            name="merchantId"
                            value={merchant.id}
                          />
                          <input
                            type="password"
                            name="newPassword"
                            placeholder="Nouveau mot de passe"
                            minLength={8}
                            required
                            className="w-36 rounded-lg border border-black/10 px-2 py-1 text-xs"
                          />
                          <button
                            type="submit"
                            className="text-xs text-brand-primary hover:underline"
                          >
                            Réinitialiser
                          </button>
                        </form>
                      </td>
                      <td className="py-3 pr-4">
                        <form
                          action={toggleMerchantStatusAction.bind(
                            null,
                            merchant.id
                          )}
                        >
                          <button
                            type="submit"
                            className="rounded-full border border-brand-primary px-3 py-1 text-xs font-medium text-brand-primary-dark hover:bg-brand-primary/10"
                          >
                            {merchant.status === "ACTIVE"
                              ? "Suspendre"
                              : "Réactiver"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
