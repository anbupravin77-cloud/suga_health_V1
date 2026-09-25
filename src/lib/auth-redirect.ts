const PRODUCTION_APP_ORIGIN = "https://sugahealthv1.vercel.app";

function isLocalOrigin(url: URL) {
  return url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "::1";
}

export function getTrustedAppOrigin(candidateOrigin?: string | null) {
  if (candidateOrigin) {
    try {
      const url = new URL(candidateOrigin);
      if (isLocalOrigin(url)) return url.origin;
      if (url.origin === PRODUCTION_APP_ORIGIN) return url.origin;
    } catch {
      // Fall through to the production origin.
    }
  }

  return PRODUCTION_APP_ORIGIN;
}

export function getAuthCallbackUrl(candidateOrigin?: string | null, next?: string | null) {
  const callback = new URL("/auth/callback", getTrustedAppOrigin(candidateOrigin));

  if (next && next.startsWith("/") && !next.startsWith("//")) {
    callback.searchParams.set("next", next);
  }

  return callback.toString();
}
