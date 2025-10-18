/**************************************************************************************
 * This file contains data types and interfaces used across the API utility functions.*
 **************************************************************************************/

/**
 * ApiClientOptions: Configuration options for the ApiClient.
 * It could be improved with more options as needed.
 * see https://playwright.dev/docs/api/class-apirequest to learn more about API options that can be configured.
 */
export interface ApiClientOptions {
  baseUrl: string;
  headers?: Record<string, string>;
  ignoreHTTPSErrors?: boolean;
}

/**
 * RequestBody: We can send JSON objects but other types can be added if needed plain text, FormData, etc.
 */
// Use unknown to avoid any; callers can pass JSON-serializable values
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };
export type RequestBody = Record<string, JSONValue>;

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export interface Card {
  code: string;
  image: string;
  images: { svg: string; png: string };
  value: string;
  suit: string;
}

export interface CreateDeckResponse {
  success: boolean;
  deck_id: string;
  remaining: number;
  shuffled?: boolean;
}

export interface DrawResponse {
  success: boolean;
  deck_id: string;
  remaining: number;
  cards: Card[];
}

export interface ShuffleResponse {
  success: boolean;
  deck_id: string;
  remaining: number;
  shuffled?: boolean;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public responseBody: string,
    public url: string
  ) {
    super(`API Error ${status} (${statusText}): ${responseBody}`);
    this.name = "ApiError";
  }
}

export interface InternalRequestOptions {
  headers: Record<string, string>;
  params?: Record<string, string>;
  data?: RequestBody;
}
