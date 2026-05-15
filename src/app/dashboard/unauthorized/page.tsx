import Link from "next/link";
import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from "@/lib/ui/appChrome";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <span className="text-[56px]" aria-hidden>
        🚫
      </span>
      <h1 className={PAGE_TITLE_CLASS}>Accès refusé</h1>
      <p className={`${PAGE_DESCRIPTION_CLASS} max-w-sm`}>
        Tu n&apos;as pas les droits nécessaires pour accéder à cette page. Contacte un administrateur si tu penses
        que c&apos;est une erreur.
      </p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        ← Retour au dashboard
      </Link>
    </div>
  );
}
