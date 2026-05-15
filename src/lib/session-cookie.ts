/** Encodage Base64 UTF-8 (compatible Edge et Node). */
export function encodeSessionPayload(session: {
  email: string;
  name: string;
  username?: string;
  role: string;
}): string {
  const json = JSON.stringify(session);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}
