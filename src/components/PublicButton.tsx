"use client";

import { getButtonIcon } from "@/lib/button-types";

export function PublicButton({
  merchantId,
  buttonId,
  buttonType,
  label,
  href,
}: {
  merchantId: string;
  buttonId: string;
  buttonType: string;
  label: string;
  href: string;
}) {
  const Icon = getButtonIcon(buttonType);
  function trackClick() {
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
      href={href}
      onClick={trackClick}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="flex w-full items-center gap-3 rounded-full bg-white px-5 py-3.5 font-medium text-brand-text shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <Icon className="h-5 w-5 shrink-0 text-brand-primary" />
      <span className="flex-1 text-center">{label}</span>
    </a>
  );
}
