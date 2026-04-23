import { describe, expect, it } from "vitest";
import { isNoFoodResponse, parseAnalyzeResponse } from "@/model/analyze-response";

describe("parseAnalyzeResponse", () => {
  it("accepts a valid success payload", () => {
    const r = parseAnalyzeResponse({
      ok: true,
      prediction: { calories: 1, protein: 2, carbs: 3, fat: 4 },
      message: "ok",
    });
    expect(r).toEqual({
      success: true,
      data: {
        ok: true,
        prediction: { calories: 1, protein: 2, carbs: 3, fat: 4 },
        message: "ok",
        code: undefined,
      },
    });
  });

  it("rejects success without prediction", () => {
    expect(parseAnalyzeResponse({ ok: true, message: "x" }).success).toBe(false);
  });

  it("rejects success with non-finite numbers", () => {
    expect(
      parseAnalyzeResponse({
        ok: true,
        prediction: { calories: NaN, protein: 1, carbs: 1, fat: 1 },
      }).success
    ).toBe(false);
  });

  it("accepts error with null prediction", () => {
    const r = parseAnalyzeResponse({
      ok: false,
      prediction: null,
      message: "no",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data).toEqual({ ok: false, prediction: null, message: "no", code: undefined });
    }
  });

  it("rejects non-objects", () => {
    expect(parseAnalyzeResponse(null).success).toBe(false);
    expect(parseAnalyzeResponse("x").success).toBe(false);
  });
});

describe("isNoFoodResponse", () => {
  it("returns true for code NO_FOOD", () => {
    expect(
      isNoFoodResponse({
        ok: false,
        prediction: null,
        code: "NO_FOOD",
      })
    ).toBe(true);
  });

  it("uses message heuristics when code is absent", () => {
    expect(
      isNoFoodResponse({
        ok: false,
        prediction: null,
        message: "I could not detect food in this image. Please try again with a clearer meal photo.",
      })
    ).toBe(true);
  });

  it("is false for generic errors", () => {
    expect(
      isNoFoodResponse({
        ok: false,
        prediction: null,
        message: "Internal server error",
      })
    ).toBe(false);
  });
});
