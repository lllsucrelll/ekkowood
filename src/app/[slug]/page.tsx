import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parsePageConfig } from "@/lib/page-config";
import { isMerchantPubliclyAvailable } from "@/lib/merchant-public";
import { MerchantPageContent } from "@/components/MerchantPageContent";

export const dynamic = "force-dynamic";

export default async function PublicMerchantPage({
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

  await prisma.visit.create({ data: { merchantId: merchant.id } });

  const config = parsePageConfig(merchant.publishedConfig);

  return (
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
      />
    </main>
  );
}
