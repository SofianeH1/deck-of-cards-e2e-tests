import { expect, test } from "@playwright/test";
import { ApiClient } from "../api-utils/api-utils";
import { Card } from "../api-utils/data";

test.describe("Deck of Cards API", () => {
  let client: ApiClient;

  test.beforeAll(async () => {
    client = new ApiClient({ baseUrl: "https://deckofcardsapi.com" });
    await client.init();
  });

  test.afterAll(async () => {
    await client.close();
  });

  test("Deck of Cards - Smoke flow", { tag: ["@smoke"] }, async () => {
    const TOTAL_CARDS = 52;
    const DRAW_FIVE_COUNT = 5;
    const AFTER_DRAW_5 = TOTAL_CARDS - DRAW_FIVE_COUNT; // 47
    const AFTER_SHUFFLE_REMAINING = AFTER_DRAW_5; // 47
    const DRAW_ONE_COUNT = 1;
    const AFTER_DRAW_1 = AFTER_DRAW_5 - DRAW_ONE_COUNT; // 46

    let deckId: string = "";
    let firstFiveCodes: Set<string>;
    let newCardCode: string = "";

    await test.step("Create a new shuffled deck", async () => {
      const createResp = await client.get("/api/deck/new/shuffle/", {
        params: { deck_count: "1" },
      });
      const create = await createResp.json();

      expect(create.success).toBe(true);
      expect(typeof create.deck_id).toBe("string");
      expect(create.remaining).toBe(TOTAL_CARDS);
      deckId = create.deck_id;
    });

    await test.step("Draw 5 cards", async () => {
      const draw5Resp = await client.get(`/api/deck/${deckId}/draw/`, {
        params: { count: "5" },
      });
      const draw5 = await draw5Resp.json();

      expect(draw5.success).toBe(true);
      expect(draw5.deck_id).toBe(deckId);
      expect(Array.isArray(draw5.cards)).toBe(true);
      expect(draw5.cards.length).toBe(DRAW_FIVE_COUNT);
      expect(draw5.remaining).toBe(AFTER_DRAW_5);

      firstFiveCodes = new Set<string>(draw5.cards.map((c: Card) => c.code));
      expect(firstFiveCodes.size).toBe(DRAW_FIVE_COUNT);
    });

    await test.step("Shuffle the remaining deck", async () => {
      const shuffleResp = await client.get(`/api/deck/${deckId}/shuffle/`, {
        params: { remaining: "true" },
      });
      const shuffle = await shuffleResp.json();

      expect(shuffle.success).toBe(true);
      expect(shuffle.deck_id).toBe(deckId);
      expect(shuffle.remaining).toBe(AFTER_SHUFFLE_REMAINING);
    });

    await test.step("Draw another card", async () => {
      const draw1Resp = await client.get(`/api/deck/${deckId}/draw/`, {
        params: { count: "1" },
      });
      const draw1 = await draw1Resp.json();

      expect(draw1.success).toBe(true);
      expect(draw1.deck_id).toBe(deckId);
      expect(Array.isArray(draw1.cards)).toBe(true);
      expect(draw1.cards.length).toBe(DRAW_ONE_COUNT);
      expect(draw1.remaining).toBe(AFTER_DRAW_1);

      if (draw1.cards[0] && typeof draw1.cards[0].code === "string") {
        newCardCode = draw1.cards[0].code;
      } else {
        throw new Error("Card code is missing or not a string");
      }
    });

    await test.step("Validate no duplicate across draws", async () => {
      expect(firstFiveCodes.has(newCardCode)).toBe(false);
    });
  });
});
