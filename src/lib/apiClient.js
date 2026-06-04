/** Dispatched when any API call returns 401 (session expired). */
export const AUTH_SESSION_EXPIRED = "auth:session-expired";

export function notifySessionExpired() {
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED));
}

/**
 * Fetch wrapper: always sends cookies; triggers session-expired on 401.
 */
export async function apiFetch(url, options = {}, fetchOptions = {}) {
  const { silent401 = false } = fetchOptions;
  const headers = new Headers(options.headers || {});
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 401 && !silent401) {
    notifySessionExpired();
  }

  return response;
}
