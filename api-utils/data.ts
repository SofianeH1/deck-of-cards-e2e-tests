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

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

/**
 * RequestBody: We can send JSON objects but other types can be added if needed plain text, FormData, etc.
 */
export type RequestBody = Record<string, any>;

export interface Card {
  code: string;
  image: string;
  images: { svg: string; png: string };
  value: string;
  suit: string;
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
