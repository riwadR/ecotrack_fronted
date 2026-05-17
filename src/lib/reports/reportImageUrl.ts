/** BFF proxy prefix — maps to Spring `/api/images/**` via `app/api/backend/[...path]`. */
const BFF_IMAGE_BASE = "/api/backend/images/";

/**
 * Normalizes API paths and bare filenames to a single BFF image URL.
 * Never produces `/api/backend/api/images/` (legacy bug from concatenating prefixes).
 */
function extractStoredImageFilename(value: string): string {
  let path = value.trim();
  const queryIndex = path.indexOf("?");
  if (queryIndex >= 0) {
    path = path.slice(0, queryIndex);
  }

  const knownPrefixes = [
    "/api/backend/api/images/",
    "/api/backend/images/",
    "/api/images/",
  ] as const;

  for (const prefix of knownPrefixes) {
    if (path.startsWith(prefix)) {
      return decodeURIComponent(path.slice(prefix.length).replace(/^\/+/, ""));
    }
  }

  return path.replace(/^\/+/, "");
}

/**
 * Builds a browser-safe URL for report images stored as filenames or legacy API paths.
 */
export function resolveReportPhotoUrl(photoUrl: string | null | undefined): string | null {
  const trimmed = photoUrl?.trim();
  if (!trimmed) {
    return null;
  }
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const filename = extractStoredImageFilename(trimmed);
  if (!filename) {
    return null;
  }

  return `${BFF_IMAGE_BASE}${encodeURIComponent(filename)}`;
}
