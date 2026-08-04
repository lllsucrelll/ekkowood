import { getButtonHref, isInternalButtonType } from "@/lib/button-types";
import { sortedButtons, type PageConfig } from "@/lib/page-config";
import { getContrastTextColor } from "@/lib/contrast-color";
import { PublicButton } from "@/components/PublicButton";

/**
 * The banner/name/buttons block shown on a merchant's public page.
 * Shared between the real public page (published config) and the
 * merchant's own draft preview, so what you preview is exactly what
 * visitors will see once published.
 */
export function MerchantPageContent({
  merchantId,
  businessName,
  slug,
  config,
  preview = false,
}: {
  merchantId: string;
  businessName: string;
  slug: string;
  config: PageConfig;
  preview?: boolean;
}) {
  const buttons = sortedButtons(config);
  const textColor = config.backgroundColor
    ? getContrastTextColor(config.backgroundColor)
    : null;
  const isLightText = textColor === "#ffffff";

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 py-8">
      {config.banner ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={config.banner}
          alt={businessName}
          className="h-40 w-40 rounded-full object-cover shadow-md"
        />
      ) : (
        <div
          className={
            textColor
              ? "flex h-40 w-40 items-center justify-center rounded-full text-3xl font-semibold"
              : "flex h-40 w-40 items-center justify-center rounded-full bg-brand-primary/10 text-3xl font-semibold text-brand-primary"
          }
          style={
            textColor
              ? {
                  backgroundColor: isLightText
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.08)",
                  color: textColor,
                }
              : undefined
          }
        >
          {businessName.charAt(0).toUpperCase()}
        </div>
      )}

      <h1
        className="text-center text-2xl font-semibold text-brand-primary-dark"
        style={textColor ? { color: textColor } : undefined}
      >
        {businessName}
      </h1>

      <div className="flex w-full flex-col gap-3">
        {buttons.map((button) => {
          const internal = isInternalButtonType(button.type);
          return (
            <PublicButton
              key={button.id}
              merchantId={merchantId}
              buttonId={button.id}
              buttonType={button.type}
              label={button.label}
              preview={preview}
              disabled={preview && internal}
              href={
                internal ? `/${slug}/report` : getButtonHref(button.type, button.url)
              }
            />
          );
        })}
      </div>
    </div>
  );
}
