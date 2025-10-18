import { expect, test } from "@playwright/test";

import { ApiClient } from "../api-utils/api-utils";
import { Card } from "../api-utils/data";
import { htmlImgWrapper } from "../api-utils/helper";
import { createShuffledDeck, drawCards, shuffleRemaining } from "../deck-of-card/deck-of-card";

test.describe("Deck of Cards API", () => {
  let client: ApiClient;

  test.beforeAll(async () => {
    client = new ApiClient({
      baseUrl: process.env.DECK_BASE_URL || "",
    });
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
      const create = await createShuffledDeck(client, { deck_count: 1 });

      expect(create.success).toBe(true);
      expect(typeof create.deck_id).toBe("string");
      expect(create.remaining).toBe(TOTAL_CARDS);
      deckId = create.deck_id;
    });

    await test.step("Draw 5 cards", async () => {
      const draw5 = await drawCards(client, deckId, DRAW_FIVE_COUNT);

      expect(draw5.success).toBe(true);
      expect(draw5.deck_id).toBe(deckId);
      expect(Array.isArray(draw5.cards)).toBe(true);
      expect(draw5.cards.length).toBe(DRAW_FIVE_COUNT);
      expect(draw5.remaining).toBe(AFTER_DRAW_5);

      firstFiveCodes = new Set<string>(draw5.cards.map((c: Card) => c.code));
      expect(firstFiveCodes.size).toBe(DRAW_FIVE_COUNT);
    });

    await test.step("Shuffle the remaining deck", async () => {
      const shuffle = await shuffleRemaining(client, deckId);

      expect(shuffle.success).toBe(true);
      expect(shuffle.deck_id).toBe(deckId);
      expect(shuffle.remaining).toBe(AFTER_SHUFFLE_REMAINING);
    });

    await test.step("Draw another card", async () => {
      const draw1 = await drawCards(client, deckId, DRAW_ONE_COUNT);

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

  test("Deck of Cards - Multiple decks", { tag: ["@smoke"] }, async () => {
    const TOTAL_CARDS = 104;
    const DRAW_FIVE_COUNT = 5;
    const AFTER_DRAW_5 = TOTAL_CARDS - DRAW_FIVE_COUNT; // 99

    let deckId: string = "";
    let firstFiveCodes: Set<string>;

    await test.step("Create a new shuffled deck with 2 decks", async () => {
      const create = await createShuffledDeck(client, { deck_count: 2 });

      expect(create.success).toBe(true);
      expect(typeof create.deck_id).toBe("string");
      expect(create.remaining).toBe(TOTAL_CARDS);
      deckId = create.deck_id;
    });

    await test.step("Draw 5 cards", async () => {
      const draw5 = await drawCards(client, deckId, DRAW_FIVE_COUNT);

      expect(draw5.success).toBe(true);
      expect(draw5.deck_id).toBe(deckId);
      expect(Array.isArray(draw5.cards)).toBe(true);
      expect(draw5.cards.length).toBe(DRAW_FIVE_COUNT);
      expect(draw5.remaining).toBe(AFTER_DRAW_5);

      firstFiveCodes = new Set<string>(draw5.cards.map((c: Card) => c.code));
      expect(firstFiveCodes.size).toBe(DRAW_FIVE_COUNT);
    });
  });

  test("Deck of Cards - Jokers enabled", { tag: ["@smoke"] }, async () => {
    const TOTAL_CARDS_WITH_JOKERS = 54;
    const DRAW_FOUR_COUNT = 4;
    const AFTER_DRAW_4 = TOTAL_CARDS_WITH_JOKERS - DRAW_FOUR_COUNT; // 50

    let deckId: string = "";

    await test.step("Create a new shuffled deck with jokers enabled", async () => {
      const create = await createShuffledDeck(client, { jokers_enabled: true });

      expect(create.success).toBe(true);
      expect(typeof create.deck_id).toBe("string");
      expect(create.remaining).toBe(TOTAL_CARDS_WITH_JOKERS);
      deckId = create.deck_id;
    });

    await test.step("Draw 4 cards", async () => {
      const draw4 = await drawCards(client, deckId, DRAW_FOUR_COUNT);

      expect(draw4.success).toBe(true);
      expect(draw4.deck_id).toBe(deckId);
      expect(Array.isArray(draw4.cards)).toBe(true);
      expect(draw4.cards.length).toBe(DRAW_FOUR_COUNT);
      expect(draw4.remaining).toBe(AFTER_DRAW_4);
    });
  });

  /**
   * Create new deck with one specific card https://deckofcardsapi.com/api/deck/new/shuffle/?cards=AS
   * validate the card image URL is reachable and it is an image
   * make visual comparison of the image if possible (out of scope for now)
   */
  test(
    "Deck of Cards - Card image URL validation",

    { tag: ["@VisualComparison"] },
    async ({ page }) => {
      const SPECIFIC_CARD = "AS"; // Ace of Spades

      let deckId: string = "";
      let cardImageUrl: string = "";

      await test.step("Create a new shuffled deck with specific card", async () => {
        const create = await createShuffledDeck(client, {
          cards: SPECIFIC_CARD,
        });

        expect(create.success).toBe(true);
        expect(typeof create.deck_id).toBe("string");
        expect(create.remaining).toBe(1);
        deckId = create.deck_id;
      });

      await test.step("Draw the specific card", async () => {
        const draw1 = await drawCards(client, deckId, 1);
        expect(draw1.success).toBe(true);
        expect(draw1.deck_id).toBe(deckId);
        expect(Array.isArray(draw1.cards)).toBe(true);
        expect(draw1.cards.length).toBe(1);
        expect(draw1.remaining).toBe(0);
        expect(draw1.cards[0].code).toBe(SPECIFIC_CARD);

        cardImageUrl = draw1.cards[0].image;
        expect(typeof cardImageUrl).toBe("string");
        expect(cardImageUrl.length).toBeGreaterThan(0);
      });

      await test.step("Validate card image URL is reachable and is an image", async () => {
        const response = await client.get(cardImageUrl);

        expect(response.status()).toBe(200);
        const contentType = response.headers()["content-type"];
        expect(contentType).toMatch(/^image\//);
      });
      await test.step("Visual comparison of the card image", async () => {
        // Create a minimal HTML wrapper to load the image
        page = await htmlImgWrapper(page, cardImageUrl);
        const cardImageLocator = page.locator("img");
        await expect(cardImageLocator).toBeVisible();
        await expect(cardImageLocator).toHaveScreenshot("ace-of-spades.png");
      });
    }
  );
});
