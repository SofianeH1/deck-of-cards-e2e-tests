import { request, APIRequestContext, APIResponse } from "@playwright/test";
import { ApiClientOptions, ApiError, InternalRequestOptions, RequestBody, RequestOptions } from "./data";



export class ApiClient {
  private requestContext: APIRequestContext;
  private readonly options: ApiClientOptions;
  private readonly defaultHeaders: Record<string, string>;

  constructor(options: ApiClientOptions) {
    this.options = options;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...this.options.headers,
    };

    this.requestContext = {} as APIRequestContext;
  }

  async init() {
    this.requestContext = await request.newContext({
      baseURL: this.options.baseUrl,
      extraHTTPHeaders: this.defaultHeaders,
      ignoreHTTPSErrors: this.options.ignoreHTTPSErrors,
    });
  }

  async close() {
    await this.requestContext.dispose();
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
        `${this.options.baseUrl}${endpoint}`
      );
    }
    return response;
  }

  async get(endpoint: string, options?: RequestOptions): Promise<APIResponse> {
    const requestOptions: InternalRequestOptions = {
      params: options?.params,
      headers: { ...this.defaultHeaders, ...options?.headers },
    };

    const response = await this.requestContext.get(endpoint, requestOptions);
    return this.processResponse(response, endpoint);
  }

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

    const response = await this.requestContext.post(endpoint, requestOptions);
    return this.processResponse(response, endpoint);
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

    const response = await this.requestContext.put(endpoint, requestOptions);
    return this.processResponse(response, endpoint);
  }

  async delete(
    endpoint: string,
    options?: RequestOptions
  ): Promise<APIResponse> {
    const requestOptions: InternalRequestOptions = {
      headers: { ...this.defaultHeaders, ...options?.headers },
      params: options?.params,
    };

    const response = await this.requestContext.delete(endpoint, requestOptions);
    return this.processResponse(response, endpoint);
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

    const response = await this.requestContext.patch(endpoint, requestOptions);
    return this.processResponse(response, endpoint);
  }

  
}
