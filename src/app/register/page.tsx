import RegisterForm from "@/components/auth/RegisterForm";
import { PAGE_DESCRIPTION_CLASS, PAGE_TITLE_CLASS } from "@/lib/ui/appChrome";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <h1 className={`${PAGE_TITLE_CLASS} text-center`}>Inscription</h1>

        <p className={`${PAGE_DESCRIPTION_CLASS} mt-2 text-center`}>
          Créez votre compte pour participer aux défis et suivre vos signalements sur EcoTrack.
        </p>

        <div className="mt-6">
          <RegisterForm />
        </div>
      </section>
    </main>
  );
}
