"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreateZonePayload } from "@/models/zone";
import { createZone } from "@/services/api/zones";
import {
  APP_FORM_CONTROL_CLASS,
  APP_FORM_LABEL_CLASS,
  DATA_LABEL_CLASS,
  PAGE_DESCRIPTION_CLASS,
  PAGE_STACK_CLASS,
  PAGE_TITLE_CLASS,
  SECTION_DESCRIPTION_CLASS,
  SECTION_TITLE_CLASS,
} from "@/lib/ui/appChrome";

const textareaClass = `${APP_FORM_CONTROL_CLASS} resize-y font-mono text-[13px]`;

export default function NewZoneClientPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateZonePayload>({
    name: "",
    wktPolygon: "",
    description: "",
    city: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (key: keyof CreateZonePayload, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Le nom de la zone est obligatoire.");
      return;
    }

    if (!form.wktPolygon.trim()) {
      setError(
        "Le polygone WKT est obligatoire (voir la documentation API des zones)."
      );
      return;
    }

    try {
      setSubmitting(true);

      await createZone({
        name: form.name.trim(),
        wktPolygon: form.wktPolygon.trim(),
        description: form.description?.trim() ?? "",
        city: form.city?.trim() || undefined,
      });

      setSuccess("Zone créée avec succès.");

      setTimeout(() => {
        router.push("/dashboard/infrastructure");
      }, 700);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible de créer la zone."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={PAGE_STACK_CLASS}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="m-0 mb-1.5 text-xs font-medium text-slate-500">
            Zones &amp; Conteneurs / Nouvelle zone
          </p>
          <h1 className={PAGE_TITLE_CLASS}>Créer une zone</h1>
          <p className={PAGE_DESCRIPTION_CLASS}>
            Ajoute une nouvelle zone de collecte au dashboard EcoTrack.
          </p>
        </div>

        <Link
          href="/dashboard/infrastructure"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 no-underline shadow-sm transition hover:bg-slate-50"
        >
          Retour aux zones
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 border-t-[3px] border-t-emerald-600 bg-white p-6 shadow-md shadow-slate-200/40">
          <form className="grid gap-4 sm:gap-[18px]" onSubmit={handleSubmit}>
            <div>
              <label className={APP_FORM_LABEL_CLASS} htmlFor="zone-name">
                Nom de la zone
              </label>
              <input
                id="zone-name"
                type="text"
                className={APP_FORM_CONTROL_CLASS}
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ex. Zone Nord"
              />
            </div>

            <div>
              <label className={APP_FORM_LABEL_CLASS} htmlFor="zone-wkt">
                Polygone (WKT)
              </label>
              <textarea
                id="zone-wkt"
                className={textareaClass}
                value={form.wktPolygon}
                onChange={(e) => handleChange("wktPolygon", e.target.value)}
                placeholder="POLYGON ((2.34 48.85, 2.35 48.85, 2.35 48.86, 2.34 48.86, 2.34 48.85))"
                rows={4}
              />
              <p className="m-0 mt-1.5 text-xs text-slate-500">
                Ordre des coordonnées : longitude puis latitude pour chaque
                sommet ; premier et dernier point identiques.
              </p>
            </div>

            <div>
              <label className={APP_FORM_LABEL_CLASS} htmlFor="zone-city">
                Ville
              </label>
              <input
                id="zone-city"
                type="text"
                className={APP_FORM_CONTROL_CLASS}
                value={form.city || ""}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="Ex. Moissy-Cramayel"
              />
            </div>

            <div>
              <label className={APP_FORM_LABEL_CLASS} htmlFor="zone-desc">
                Description
              </label>
              <textarea
                id="zone-desc"
                className={`${APP_FORM_CONTROL_CLASS} resize-y`}
                value={form.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Décris la zone, son secteur ou son usage..."
                rows={5}
              />
            </div>

            {error ? (
              <div className="rounded-xl bg-red-50 px-3.5 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-xl bg-emerald-50 px-3.5 py-3 text-sm font-semibold text-emerald-800">
                {success}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-emerald-600 px-[18px] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Création..." : "Créer la zone"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard/infrastructure")}
                className="rounded-lg border border-slate-200 bg-white px-[18px] py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>

        <div className="grid gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40">
            <h2 className={SECTION_TITLE_CLASS}>Aperçu</h2>
            <p className={`${SECTION_DESCRIPTION_CLASS} mb-[18px]`}>
              Vérifie les informations avant validation.
            </p>

            <div className="grid gap-3.5 rounded-xl bg-slate-50 p-4">
              <div>
                <p className={DATA_LABEL_CLASS}>Nom</p>
                <p className="m-0 font-bold text-slate-900">
                  {form.name.trim() || "—"}
                </p>
              </div>

              <div>
                <p className={DATA_LABEL_CLASS}>Ville</p>
                <p className="m-0 font-semibold text-slate-900">
                  {form.city?.trim() || "—"}
                </p>
              </div>

              <div>
                <p className={DATA_LABEL_CLASS}>Description</p>
                <p className="m-0 leading-relaxed text-slate-600">
                  {form.description?.trim() ||
                    "Aucune description renseignée."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-200/40">
            <h2 className={SECTION_TITLE_CLASS}>Conseils</h2>
            <p className={`${SECTION_DESCRIPTION_CLASS} mb-3.5`}>
              Quelques bonnes pratiques pour nommer les zones.
            </p>

            <div className="grid gap-2.5">
              {[
                "Utilise un nom clair et stable, par exemple Zone Nord ou Centre-Ville.",
                "Ajoute la ville si plusieurs communes sont gérées.",
                "Décris la zone si elle couvre un quartier, un secteur ou un périmètre métier.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
