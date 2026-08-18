import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Serekunda Turf Arena")).toBe("serekunda-turf-arena");
  });

  it("strips diacritics", () => {
    expect(slugify("Aïcha's Pitch")).toBe("aicha-s-pitch");
  });

  it("collapses runs of non-alphanumeric characters into a single hyphen", () => {
    expect(slugify("Kotu -- Astro!!  Turf")).toBe("kotu-astro-turf");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("--Bijilo Turf--")).toBe("bijilo-turf");
  });

  it("falls back to a default when nothing alphanumeric is left", () => {
    expect(slugify("!!!")).toBe("pitch");
  });

  it("caps length at 60 characters", () => {
    const long = "a".repeat(100);
    expect(slugify(long)).toHaveLength(60);
  });
});
