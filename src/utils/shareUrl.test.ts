import { describe, it, expect } from "vitest";
import { buildShareUrl } from "@/utils/shareUrl";

describe("buildShareUrl", () => {
  it("現在のオリジンの /share/:token を返す", () => {
    expect(buildShareUrl("abc123")).toBe(
      `${window.location.origin}/share/abc123`,
    );
  });
});
