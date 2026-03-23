import { describe, expect, it } from "vitest";

import { resolveWalletGateState } from "../src/lib/wallet-gate";

describe("resolveWalletGateState", () => {
  it("enters preview mode outside the Mini App host", () => {
    expect(
      resolveWalletGateState({
        inMiniApp: false,
        hasProvider: false,
        accounts: [],
      }),
    ).toBe("preview");
  });

  it("requires a wallet provider inside the Mini App host", () => {
    expect(
      resolveWalletGateState({
        inMiniApp: true,
        hasProvider: false,
        accounts: [],
      }),
    ).toBe("unsupported");
  });

  it("marks hosted sessions without accounts as needing connection", () => {
    expect(
      resolveWalletGateState({
        inMiniApp: true,
        hasProvider: true,
        accounts: [],
      }),
    ).toBe("needs_connection");
  });

  it("marks hosted sessions with accounts as connected", () => {
    expect(
      resolveWalletGateState({
        inMiniApp: true,
        hasProvider: true,
        accounts: ["0xabc"],
      }),
    ).toBe("connected");
  });
});
