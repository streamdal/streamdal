import { describe, expect, it } from "vitest";
import { hello } from "../index";

describe("hello()", () => {
  describe("hello() should return Hello World!", () => {
    it("returns correct string", () => {
      expect(hello()).toEqual("Hello World!");
    });
  });
});
