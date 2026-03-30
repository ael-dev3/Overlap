import { describe, expect, it } from "vitest";

import { formatActivitySnapshot } from "../src/lib/utils";

describe("formatActivitySnapshot", () => {
  it("renders stable weekly cadence copy", () => {
    expect(
      formatActivitySnapshot({
        activeDays7d: 6,
        castsLast7d: 12,
        repliesLast7d: 7,
      }),
    ).toBe("6/7 active days, 12 casts, 7 replies");
  });

  it("keeps singular grammar intact", () => {
    expect(
      formatActivitySnapshot({
        activeDays7d: 1,
        castsLast7d: 1,
        repliesLast7d: 1,
      }),
    ).toBe("1/7 active days, 1 cast, 1 reply");
  });
});
