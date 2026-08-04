import Link from "next/link";
import { redirect } from "next/navigation";
import { getMerchantSession } from "@/lib/auth/merchant";
import { merchantLogoutAction } from "@/lib/actions/merchant-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const merchant = await getMerchantSession();
  if (!merchant) {
    redirect("/dashboard/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-4">
        <div>
          <p className="text-sm text-brand-text/60">{merchant.businessName}</p>
          <nav className="mt-1 flex gap-4 text-sm font-medium">
            <Link href="/dashboard" className="hover:text-brand-primary">
              Configuration
            </Link>
            <Link
              href="/dashboard/preview"
              target="_blank"
              className="hover:text-brand-primary"
            >
              Aperçu
            </Link>
            <Link href="/dashboard/stats" className="hover:text-brand-primary">
              Statistiques
            </Link>
            <Link href="/dashboard/reports" className="hover:text-brand-primary">
              Retours
            </Link>
            <Link href="/dashboard/settings" className="hover:text-brand-primary">
              Paramètres
            </Link>
          </nav>
        </div>
        <form action={merchantLogoutAction}>
          <button
            type="submit"
            className="text-sm text-brand-text/60 hover:text-brand-primary"
          >
            Se déconnecter
          </button>
        </form>
      </header>
      <main className="flex flex-1 flex-col p-6">{children}</main>
    </div>
  );
}
