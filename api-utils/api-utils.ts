import { request, APIRequestContext, APIResponse } from "@playwright/test";
import {
  ApiClientOptions,
  ApiError,
  InternalRequestOptions,
  RequestBody,
  RequestOptions,
} from "./data";

export class ApiClient {
  private requestContext: APIRequestContext | null;
  private readonly options: ApiClientOptions;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: ApiClientOptions) {
    this.options = options;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...this.options.headers,
    };

    this.requestContext = null;
  }

  async init() {
    await this.ensureContext();
  }

  async close() {
    if (this.requestContext) {
      await this.requestContext.dispose();
      this.requestContext = null;
    }
  }

  /**
   * Process the API response and handle errors.
   * @param response The API response object.
   * @param endpoint The API endpoint that was called.
   * @returns The processed API response.
   */
  private async processResponse(
    response: APIResponse,
    endpoint: string
  ): Promise<APIResponse> {
    if (!response.ok()) {
      const text = await response
        .text()
        .catch(() => "Unable to read response body");
      throw new ApiError(
        response.status(),
        response.statusText(),
        text,
        // Build a safe absolute URL for error reporting
        (() => {
          try {
            return new URL(endpoint, this.options.baseUrl).toString();
          } catch {
            return `${this.options.baseUrl}${endpoint}`;
          }
        })()
      );
    }
    return response;
  }

  private async ensureContext(): Promise<APIRequestContext> {
    if (!this.requestContext) {
      this.requestContext = await request.newContext({
        baseURL: this.options.baseUrl,
        extraHTTPHeaders: this.defaultHeaders,
        ignoreHTTPSErrors: this.options.ignoreHTTPSErrors,
      });
    }
    return this.requestContext;
  }

  /**
   * Unified request method used by all HTTP verbs.
   */
  private async request(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    endpoint: string,
    requestOptions: InternalRequestOptions
  ): Promise<APIResponse> {
    const ctx = await this.ensureContext();

    let response: APIResponse;
    switch (method) {
      case "GET":
        response = await ctx.get(endpoint, requestOptions);
        break;
      case "POST":
        response = await ctx.post(endpoint, requestOptions);
        break;
      case "PUT":
        response = await ctx.put(endpoint, requestOptions);
        break;
      case "DELETE":
        response = await ctx.delete(endpoint, requestOptions);
        break;
      case "PATCH":
        response = await ctx.patch(endpoint, requestOptions);
        break;
      default:
        // Exhaustiveness check
        throw new Error(`Unsupported method: ${method}`);
    }
    return this.processResponse(response, endpoint);
  }

  async get(endpoint: string, options?: RequestOptions): Promise<APIResponse> {
    const requestOptions: InternalRequestOptions = {
      params: options?.params,
      headers: { ...this.defaultHeaders, ...options?.headers },
    };
    return this.request("GET", endpoint, requestOptions);
  }

  // For the moment we only use GET in the tests it could be useful if api evolves
  // All methods below are not currently used but implemented for future use
  async post(
    endpoint: string,
    body?: RequestBody,
    options?: RequestOptions
  ): Promise<APIResponse> {
    const requestOptions: InternalRequestOptions = {
      data: body,
      headers: { ...this.defaultHeaders, ...options?.headers },
      params: options?.params,
    };
    return this.request("POST", endpoint, requestOptions);
  }

  async put(
    endpoint: string,
    body?: RequestBody,
    options?: RequestOptions
  ): Promise<APIResponse> {
    const requestOptions: InternalRequestOptions = {
      data: body,
      headers: { ...this.defaultHeaders, ...options?.headers },
      params: options?.params,
    };
    return this.request("PUT", endpoint, requestOptions);
  }

  async delete(
    endpoint: string,
    options?: RequestOptions
  ): Promise<APIResponse> {
    const requestOptions: InternalRequestOptions = {
      headers: { ...this.defaultHeaders, ...options?.headers },
      params: options?.params,
    };
    return this.request("DELETE", endpoint, requestOptions);
  }

  async patch(
    endpoint: string,
    body?: RequestBody,
    options?: RequestOptions
  ): Promise<APIResponse> {
    const requestOptions: InternalRequestOptions = {
      data: body,
      headers: { ...this.defaultHeaders, ...options?.headers },
      params: options?.params,
    };
    return this.request("PATCH", endpoint, requestOptions);
  }
}
