import { describe, expect, it } from "vitest";
import { buildWaLink } from "./whatsapp";

describe("buildWaLink", () => {
  it("strips non-digit characters from the phone number", () => {
    expect(buildWaLink("+220 700 1234", "hi")).toBe("https://wa.me/2207001234?text=hi");
  });

  it("URL-encodes the message", () => {
    const link = buildWaLink("+2207001234", "Hi, is this pitch available at 6:00 PM?");
    expect(link).toBe(
      "https://wa.me/2207001234?text=Hi%2C%20is%20this%20pitch%20available%20at%206%3A00%20PM%3F",
    );
  });
});
