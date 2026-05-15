"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  APP_FORM_CONTROL_CLASS,
  APP_FORM_LABEL_CLASS,
  PAGE_DESCRIPTION_CLASS,
  PAGE_STACK_CLASS,
  PAGE_TITLE_CLASS,
} from "@/lib/ui/appChrome";
import { CreateContainerPayload, WasteType } from "@/models/container";
import { Zone } from "@/models/zone";
import { createContainer } from "@/services/api/containers";
import { getZones } from "@/services/api/zones";

const wasteTypes: WasteType[] = [
  "PLASTIC",
  "PAPER",
  "GLASS",
  "METAL",
  "ORGANIC",
  "MIXED",
];

export default function NewContainerPage() {
  const router = useRouter();

  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<CreateContainerPayload>({
    name: "",
    wasteType: "PLASTIC",
    zoneId: "",
    latitude: undefined,
    longitude: undefined,
    address: "",
  });

  useEffect(() => {
    const loadZones = async () => {
      try {
        setLoadingZones(true);
        const data = await getZones();
        setZones(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les zones."
        );
      } finally {
        setLoadingZones(false);
      }
    };

    loadZones();
  }, []);

  const handleChange = (
    key: keyof CreateContainerPayload,
    value: string | number | undefined
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.name.trim()) {
      setError("Le nom du container est obligatoire.");
      return;
    }

    if (!form.zoneId) {
      setError("La zone est obligatoire.");
      return;
    }

    try {
      setSubmitting(true);

      const payload: CreateContainerPayload = {
        name: form.name.trim(),
        wasteType: form.wasteType,
        zoneId: form.zoneId,
        address: form.address?.trim() || undefined,
        latitude:
          typeof form.latitude === "number" && !Number.isNaN(form.latitude)
            ? form.latitude
            : undefined,
        longitude:
          typeof form.longitude === "number" && !Number.isNaN(form.longitude)
            ? form.longitude
            : undefined,
      };

      const created = await createContainer(payload);
      setSuccess("Container créé avec succès.");

      setTimeout(() => {
        router.push(`/dashboard/capteurs/${created.id}`);
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible de créer le container."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={PAGE_STACK_CLASS}>
      <div>
        <h1 className={PAGE_TITLE_CLASS}>Nouveau container</h1>
        <p className={PAGE_DESCRIPTION_CLASS}>
          Ajoute un nouveau container à une zone existante.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 border-t-[3px] border-t-sky-500 bg-white p-6 shadow-md shadow-slate-200/40">
        <form className="grid gap-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={APP_FORM_LABEL_CLASS} htmlFor="new-c-name">
                Nom du container
              </label>
              <input
                id="new-c-name"
                type="text"
                className={APP_FORM_CONTROL_CLASS}
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ex. Container Centre 01"
              />
            </div>

            <div>
              <label className={APP_FORM_LABEL_CLASS} htmlFor="new-c-waste">
                Type de déchet
              </label>
              <select
                id="new-c-waste"
                className={APP_FORM_CONTROL_CLASS}
                value={form.wasteType}
                onChange={(e) =>
                  handleChange("wasteType", e.target.value as WasteType)
                }
              >
                {wasteTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={APP_FORM_LABEL_CLASS} htmlFor="new-c-zone">
                Zone
              </label>
              <select
                id="new-c-zone"
                className={APP_FORM_CONTROL_CLASS}
                value={form.zoneId}
                onChange={(e) => handleChange("zoneId", e.target.value)}
                disabled={loadingZones}
              >
                <option value="">
                  {loadingZones ? "Chargement..." : "Sélectionner une zone"}
                </option>
                {zones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={APP_FORM_LABEL_CLASS} htmlFor="new-c-addr">
                Adresse
              </label>
              <input
                id="new-c-addr"
                type="text"
                className={APP_FORM_CONTROL_CLASS}
                value={form.address || ""}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Ex. 12 rue des capteurs"
              />
            </div>

            <div>
              <label className={APP_FORM_LABEL_CLASS} htmlFor="new-c-lat">
                Latitude
              </label>
              <input
                id="new-c-lat"
                type="number"
                step="any"
                className={APP_FORM_CONTROL_CLASS}
                value={form.latitude ?? ""}
                onChange={(e) =>
                  handleChange(
                    "latitude",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="Ex. 48.6351"
              />
            </div>

            <div>
              <label className={APP_FORM_LABEL_CLASS} htmlFor="new-c-lon">
                Longitude
              </label>
              <input
                id="new-c-lon"
                type="number"
                step="any"
                className={APP_FORM_CONTROL_CLASS}
                value={form.longitude ?? ""}
                onChange={(e) =>
                  handleChange(
                    "longitude",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                placeholder="Ex. 2.5760"
              />
            </div>
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
              {submitting ? "Création..." : "Créer le container"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/capteurs")}
              className="rounded-lg border border-slate-200 bg-white px-[18px] py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
