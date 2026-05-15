import Link from "next/link";
import LoginForm from "@/components/auth/LoginForm";
import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from "@/lib/ui/appChrome";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <h1 className={`${PAGE_TITLE_CLASS} text-center`}>Connexion</h1>

        <p className={`${PAGE_DESCRIPTION_CLASS} mt-2 text-center`}>
          Connectez-vous pour accéder à votre espace EcoTrack.
        </p>

        <div className="mt-6">
          <LoginForm />
        </div>

        <div className="mt-6 border-t border-slate-100 pt-6 text-center">
          <p className="m-0 text-sm text-slate-600">Pas encore de compte ?</p>
          <Link
            href="/register"
            className="mt-3 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Inscription
          </Link>
        </div>
      </section>
    </main>
  );
}
