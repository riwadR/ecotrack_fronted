import { REPORT_TYPE_VALUES, type ReportType } from "@/models/report";

export type ReportTypeTranslation = {
  label: string;
  description: string;
};

/**
 * French UI labels for each `ReportType` enum value (backend source of truth).
 */
export const REPORT_TYPE_TRANSLATIONS: Record<ReportType, ReportTypeTranslation> = {
  FULL_CONTAINER: {
    label: "Conteneur plein",
    description: "Le bac est plein ou déborde et nécessite une collecte urgente.",
  },
  DAMAGED_CONTAINER: {
    label: "Conteneur endommagé",
    description: "Couvercle, structure ou capteur visiblement abîmé.",
  },
  ACCESS_BLOCKED: {
    label: "Accès bloqué",
    description: "L'accès au conteneur est impossible (obstacle, véhicule, travaux…).",
  },
  VANDALISM: {
    label: "Vandalisme",
    description: "Dégradation du conteneur ou des abords (tags, casse, déversement).",
  },
  OTHER: {
    label: "Autre",
    description: "Problème non listé — précisez la situation dans le commentaire.",
  },
};

/** Form options derived from the backend enum order. */
export const REPORT_TYPE_FORM_OPTIONS = REPORT_TYPE_VALUES.map((value) => ({
  value,
  ...REPORT_TYPE_TRANSLATIONS[value],
}));

export function getReportTypeLabel(type: ReportType): string {
  return REPORT_TYPE_TRANSLATIONS[type].label;
}

export function getReportTypeDescription(type: ReportType): string {
  return REPORT_TYPE_TRANSLATIONS[type].description;
}

/** `OTHER` requires a comment per backend business rules. */
export function reportTypeRequiresComment(type: ReportType): boolean {
  return type === "OTHER";
}

export const MOCK_PHOTO_UPLOAD_URL =
  "https://dummyimage.com/600x400/16a34a/ffffff&text=EcoTrack+Preuve";

/** Fallback when POST /reports returns 409 (anti-spam window). */
export const DUPLICATE_REPORT_ERROR_MESSAGE =
  "Un signalement similaire a déjà été soumis il y a moins d'une heure. Merci pour votre vigilance !";
