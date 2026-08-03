import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 p-8 text-center">
      <div>
        <h1 className="text-3xl font-semibold text-brand-primary-dark">
          Ekko Wood
        </h1>
        <p className="mt-2 text-brand-text/70">
          Plateforme de pages de renvoi pour les présentoirs Ekko Wood.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/dashboard/login"
          className="rounded-full bg-brand-primary px-6 py-3 text-white transition hover:bg-brand-primary-dark"
        >
          Espace commerçant
        </Link>
      </div>
    </main>
  );
}
