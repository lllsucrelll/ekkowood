import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { adminLogoutAction } from "@/lib/actions/admin-auth";

export default async function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/ivy/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-black/10 bg-white px-6 py-4">
        <div>
          <p className="text-sm font-medium text-brand-primary-dark">
            Ekko Wood — Back-office
          </p>
          <p className="text-xs text-brand-text/60">{admin.email}</p>
        </div>
        <form action={adminLogoutAction}>
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
