import { APIResponse, Page } from "@playwright/test";

export async function processJsonResponse(response: APIResponse) {
  if (!response.ok()) {
    const text = await response.text().catch(() => "Unable to read response body");
    throw new Error(
      `HTTP Error ${response.status()} - ${response.statusText()}\nResponse Body: ${text}`
    );
  }
  return response.json();
}

export async function htmlImgWrapper(page: Page, imgUrl: string): Promise<Page> {
  const html = `
    <html>
      <body>
        <img src="${imgUrl}" alt="Card Image" style="max-width:100%;height:auto;" />
      </body>
    </html>
  `;
  await page.setContent(html);
  return page;
}
