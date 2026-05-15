import Link from "next/link";
import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from "@/lib/ui/appChrome";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-200/60 sm:p-10">
        <h1 className={PAGE_TITLE_CLASS}>Bienvenue sur EcoTrack</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          Suivez le remplissage des conteneurs, les collectes et les alertes sur
          une seule plateforme.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Créer un compte
          </Link>
        </div>
      </section>
    </main>
  );
}
