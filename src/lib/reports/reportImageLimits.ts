export const REPORT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const REPORT_IMAGE_MAX_SIZE_HELPER = "Taille maximale : 5 Mo";

export const REPORT_IMAGE_TOO_LARGE_TOAST =
  "Le fichier est trop volumineux. La taille maximale est de 5 Mo.";

export function isReportImageTooLarge(file: File | null | undefined): boolean {
  return file != null && file.size > REPORT_IMAGE_MAX_BYTES;
}
