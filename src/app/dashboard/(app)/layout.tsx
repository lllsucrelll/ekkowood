import { redirect } from "next/navigation";
import { getMerchantSession } from "@/lib/auth/merchant";
import { merchantLogoutAction } from "@/lib/actions/merchant-auth";
import { DashboardNav } from "./DashboardNav";

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
      <header className="flex flex-col gap-3 border-b border-black/10 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm text-brand-text/60">{merchant.businessName}</p>
          <DashboardNav />
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
      <main className="flex flex-1 flex-col p-4 sm:p-6">{children}</main>
    </div>
  );
}
