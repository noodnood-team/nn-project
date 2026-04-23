import { describe, expect, it } from "vitest";
import { parseResponseJson } from "@/lib/parse-json-response";

describe("parseResponseJson", () => {
  it("returns null for empty body (e.g. some 204/500 responses)", async () => {
    const res = new Response("");
    expect(await parseResponseJson(res)).toBeNull();
  });

  it("returns null for non-JSON body (e.g. HTML error page)", async () => {
    const res = new Response("<!doctype html><html></html>", { status: 500 });
    expect(await parseResponseJson(res)).toBeNull();
  });

  it("returns parsed data for valid JSON", async () => {
    const res = new Response('{"a":1}', { status: 500 });
    expect(await parseResponseJson(res)).toEqual({ a: 1 });
  });
});
