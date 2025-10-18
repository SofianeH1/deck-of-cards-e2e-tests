import { ApiClient } from "../api-utils/api-utils";
import type {
  CreateDeckResponse,
  DrawResponse,
  ShuffleResponse,
} from "../api-utils/data";

/**
 * Internal: Convert mixed param values to strings for request query params.
 */
function stringifyParams(
  params?: Record<string, string | number | boolean>
): Record<string, string> {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  );
}

/**
 * Create a new shuffled deck.
 * Example params: { deck_count: 1 } or { jokers_enabled: true }
 */
export async function createShuffledDeck(
  client: ApiClient,
  params: Record<string, string | number | boolean> = {}
): Promise<CreateDeckResponse> {
  const res = await client.get("/api/deck/new/shuffle/", {
    params: stringifyParams(params),
  });
  return res.json();
}

/**
 * Draw N cards from a deck.
 */
export async function drawCards(
  client: ApiClient,
  deckId: string,
  count: number
): Promise<DrawResponse> {
  const res = await client.get(`/api/deck/${deckId}/draw/`, {
    params: { count: String(count) },
  });
  return res.json();
}

/**
 * Shuffle the remaining cards in the deck (does not reset to full deck).
 */
export async function shuffleRemaining(
  client: ApiClient,
  deckId: string
): Promise<ShuffleResponse> {
  const res = await client.get(`/api/deck/${deckId}/shuffle/`, {
    params: { remaining: "true" },
  });
  return res.json();
}
