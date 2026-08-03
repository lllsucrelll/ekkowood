import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parsePageConfig, sortedButtons } from "@/lib/page-config";
import { getButtonHref } from "@/lib/button-types";
import { PublicButton } from "@/components/PublicButton";

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

  const isAvailable =
    merchant.status === "ACTIVE" &&
    merchant.accessExpiresAt > new Date() &&
    merchant.publishedConfig !== null;

  if (!isAvailable) {
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
  const buttons = sortedButtons(config);

  return (
    <main className="flex flex-1 justify-center p-4 sm:p-8">
      <div className="flex w-full max-w-md flex-col items-center gap-6 py-8">
        {config.banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.banner}
            alt={merchant.businessName}
            className="h-40 w-40 rounded-full object-cover shadow-md"
          />
        ) : (
          <div className="flex h-40 w-40 items-center justify-center rounded-full bg-brand-primary/10 text-3xl font-semibold text-brand-primary">
            {merchant.businessName.charAt(0).toUpperCase()}
          </div>
        )}

        <h1 className="text-center text-2xl font-semibold text-brand-primary-dark">
          {merchant.businessName}
        </h1>

        <div className="flex w-full flex-col gap-3">
          {buttons.map((button) => (
            <PublicButton
              key={button.id}
              merchantId={merchant.id}
              buttonId={button.id}
              buttonType={button.type}
              label={button.label}
              href={getButtonHref(button.type, button.url)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
