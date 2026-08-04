import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isMerchantPubliclyAvailable } from "@/lib/merchant-public";
import { ReportForm } from "./ReportForm";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const merchant = await prisma.merchant.findUnique({ where: { slug } });

  if (!merchant) {
    notFound();
  }

  if (!isMerchantPubliclyAvailable(merchant)) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <p className="text-brand-text/70">
          Cette page n&apos;est pas disponible pour le moment.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 justify-center p-4 sm:p-8">
      <div className="flex w-full max-w-md flex-col items-center gap-6 py-8">
        <h1 className="text-center text-2xl font-semibold text-brand-primary-dark">
          Signaler un problème
        </h1>
        <p className="text-center text-sm text-brand-text/70">
          {merchant.businessName}
        </p>
        <ReportForm merchantId={merchant.id} />
      </div>
    </main>
  );
}
