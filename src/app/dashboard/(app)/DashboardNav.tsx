"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Configuration" },
  { href: "/dashboard/stats", label: "Statistiques" },
  { href: "/dashboard/reports", label: "Retours" },
  { href: "/dashboard/settings", label: "Paramètres" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-1 flex flex-wrap gap-2 text-sm font-medium">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              isActive
                ? "rounded-full bg-brand-primary px-3 py-1.5 text-white"
                : "rounded-full bg-black/5 px-3 py-1.5 text-brand-text/70 transition hover:bg-black/10"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
