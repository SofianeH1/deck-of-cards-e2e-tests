import { APIResponse } from "@playwright/test";

export async function processJsonResponse(response: APIResponse) {
  if (!response.ok()) {
    const text = await response
      .text()
      .catch(() => "Unable to read response body");
    throw new Error(
      `HTTP Error ${response.status()} - ${response.statusText()}\nResponse Body: ${text}`
    );
  }
  return response.json();
}
