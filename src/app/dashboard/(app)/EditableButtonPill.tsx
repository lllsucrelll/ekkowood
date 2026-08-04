"use client";

import { createElement } from "react";
import { getButtonIcon } from "@/lib/button-types";
import type { PageButton } from "@/lib/page-config";

export function EditableButtonPill({
  button,
  onClick,
}: {
  button: PageButton;
  onClick: () => void;
}) {
  const Icon = getButtonIcon(button.type);
  const isReportButton = button.type === "report_issue";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-3 rounded-full px-5 py-3.5 text-left font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
        isReportButton ? "bg-red-50 text-red-700" : "bg-white text-brand-text",
      ].join(" ")}
    >
      {createElement(Icon, {
        className: `h-5 w-5 shrink-0 ${isReportButton ? "text-red-600" : "text-brand-primary"}`,
      })}
      <span className="flex-1 text-center">{button.label}</span>
    </button>
  );
}
