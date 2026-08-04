"use client";

import { createElement } from "react";
import { getButtonIcon } from "@/lib/button-types";

export function PublicButton({
  merchantId,
  buttonId,
  buttonType,
  label,
  href,
  preview = false,
  disabled = false,
}: {
  merchantId: string;
  buttonId: string;
  buttonType: string;
  label: string;
  href: string;
  /** Skips click tracking — used when rendering the merchant's own draft preview. */
  preview?: boolean;
  /** Prevents navigation — used for the report button in preview, so merchants can't file a report against themselves. */
  disabled?: boolean;
}) {
  const Icon = getButtonIcon(buttonType);
  const isReportButton = buttonType === "report_issue";

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (preview) return;
    const payload = JSON.stringify({
      merchantId,
      buttonId,
      buttonLabel: label,
      buttonType,
    });
    navigator.sendBeacon?.(
      "/api/click",
      new Blob([payload], { type: "application/json" })
    );
  }

  return (
    <a
      href={disabled ? undefined : href}
      onClick={handleClick}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      aria-disabled={disabled}
      title={disabled ? "Non disponible en aperçu" : undefined}
      className={[
        "flex w-full items-center gap-3 rounded-full px-5 py-3.5 font-medium shadow-sm transition",
        isReportButton ? "bg-red-50 text-red-700" : "bg-white text-brand-text",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "hover:-translate-y-0.5 hover:shadow-md",
      ].join(" ")}
    >
      {createElement(Icon, {
        className: `h-5 w-5 shrink-0 ${isReportButton ? "text-red-600" : "text-brand-primary"}`,
      })}
      <span className="flex-1 text-center">{label}</span>
    </a>
  );
}
