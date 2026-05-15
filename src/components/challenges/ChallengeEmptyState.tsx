export default function ChallengeEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center shadow-sm">
      <span className="text-5xl" aria-hidden>
        🌱
      </span>
      <h2 className="mt-4 text-xl font-bold text-slate-900">Aucun défi en cours</h2>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        Revenez bientôt : de nouveaux défis communautaires seront publiés pour votre quartier.
      </p>
    </div>
  );
}
