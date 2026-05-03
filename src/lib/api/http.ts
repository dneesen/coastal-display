function requestHeaders(accept?: string) {
  const headers: Record<string, string> = {};
  if (accept) headers.Accept = accept;
  if (typeof window === "undefined") {
    headers["User-Agent"] = "coastal-display/1.0";
  }
  return headers;
}

export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    signal,
    headers: requestHeaders("application/geo+json, application/json"),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchText(url: string, signal?: AbortSignal): Promise<string> {
  const response = await fetch(url, { signal, headers: requestHeaders() });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${url}`);
  }

  return response.text();
}
