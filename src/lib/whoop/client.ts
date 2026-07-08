import { WHOOP_API_BASE } from "./oauth";
import type { WhoopPaginated } from "@/types/whoop";

const MAX_RETRIES = 4;
const PAGE_LIMIT = 25; // WHOOP v2 collection endpoints cap at 25 records per page

export class WhoopUnauthorizedError extends Error {
  constructor() {
    super("WHOOP access token was rejected (401)");
    this.name = "WhoopUnauthorizedError";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches a single WHOOP endpoint, retrying 429/5xx with exponential backoff.
 * A 401 is NOT retried here — it's thrown so the caller (getValidAccessToken's
 * consumer) can refresh the token once and retry the whole request.
 */
export async function whoopFetch(path: string, accessToken: string, searchParams?: URLSearchParams): Promise<Response> {
  const url = new URL(`${WHOOP_API_BASE}${path}`);
  if (searchParams) {
    for (const [key, value] of searchParams) url.searchParams.set(key, value);
  }

  let attempt = 0;
  while (true) {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });

    if (response.status === 401) throw new WhoopUnauthorizedError();
    if (response.status !== 429 && response.status < 500) return response;

    attempt++;
    if (attempt >= MAX_RETRIES) return response;
    await sleep(2 ** attempt * 250);
  }
}

/** Follows next_token until the collection is exhausted, returning every record. */
export async function fetchAllPages<T>(
  path: string,
  accessToken: string,
  params: Record<string, string>
): Promise<T[]> {
  const records: T[] = [];
  let nextToken: string | null = null;

  do {
    const searchParams = new URLSearchParams({ ...params, limit: String(PAGE_LIMIT) });
    if (nextToken) searchParams.set("nextToken", nextToken);

    const response = await whoopFetch(path, accessToken, searchParams);
    if (!response.ok) {
      throw new Error(`WHOOP request to ${path} failed: ${response.status} ${await response.text()}`);
    }

    const page: WhoopPaginated<T> = await response.json();
    records.push(...page.records);
    nextToken = page.next_token;
  } while (nextToken);

  return records;
}

export async function fetchSingleRecord<T>(path: string, accessToken: string): Promise<T | null> {
  const response = await whoopFetch(path, accessToken);
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`WHOOP request to ${path} failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}
