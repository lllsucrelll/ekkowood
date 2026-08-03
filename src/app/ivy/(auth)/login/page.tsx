import { LoginForm } from "@/components/LoginForm";
import { adminLoginAction } from "@/lib/actions/admin-auth";

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-brand-primary-dark">
          Ekko Wood — Back-office
        </h1>
        <LoginForm action={adminLoginAction} />
      </div>
    </main>
  );
}
