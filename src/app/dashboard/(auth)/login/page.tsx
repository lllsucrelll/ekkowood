import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { merchantLoginAction } from "@/lib/actions/merchant-auth";
import { getMerchantSession } from "@/lib/auth/merchant";

export default async function MerchantLoginPage() {
  const merchant = await getMerchantSession();
  if (merchant) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-xl font-semibold text-brand-primary-dark">
          Espace commerçant
        </h1>
        <LoginForm
          action={merchantLoginAction}
          footer={
            <Link
              href="/dashboard/forgot-password"
              className="mt-2 text-center text-sm text-brand-primary hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          }
        />
      </div>
    </main>
  );
}
