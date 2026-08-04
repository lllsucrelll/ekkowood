import { getMerchantSession } from "@/lib/auth/merchant";
import { prisma } from "@/lib/prisma";
import { deleteReportAction } from "@/lib/actions/reports";

export default async function ReportsPage() {
  const merchant = await getMerchantSession();
  if (!merchant) return null; // le layout garantit déjà la session

  const reports = await prisma.report.findMany({
    where: { merchantId: merchant.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Retours</h1>

      {reports.length === 0 ? (
        <p className="text-sm text-brand-text/60">
          Aucun signalement pour le moment.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="flex items-start justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm"
            >
              <div>
                <p className="whitespace-pre-wrap text-sm">{report.message}</p>
                <p className="mt-2 text-xs text-brand-text/50">
                  {report.createdAt.toLocaleString("fr-FR")}
                </p>
              </div>
              <form action={deleteReportAction.bind(null, report.id)}>
                <button
                  type="submit"
                  className="shrink-0 rounded-full border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  Supprimer
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
