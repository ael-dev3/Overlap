import { describe, expect, it } from "vitest";

import {
  formatAddress,
  getWalletErrorMessage,
  normalizeAccountList,
  requestAccounts,
} from "../src/lib/wallet";

describe("wallet helpers", () => {
  it("normalizes account lists to lowercase unique addresses", () => {
    expect(
      normalizeAccountList([
        "0xABCD000000000000000000000000000000000001",
        "0xabcd000000000000000000000000000000000001",
        "0xABCD000000000000000000000000000000000002",
        123,
        null,
      ]),
    ).toEqual([
      "0xabcd000000000000000000000000000000000001",
      "0xabcd000000000000000000000000000000000002",
    ]);
  });

  it("shortens long addresses but leaves short values intact", () => {
    expect(formatAddress("0x1234567890abcdef")).toBe("0x1234…cdef");
    expect(formatAddress("0x1234")).toBe("0x1234");
  });

  it("maps user-rejected wallet errors to a stable message", () => {
    expect(getWalletErrorMessage({ code: 4001 })).toBe(
      "Wallet connection was cancelled.",
    );
    expect(getWalletErrorMessage(new Error("Provider offline"))).toBe(
      "Provider offline",
    );
  });

  it("normalizes account responses returned by the wallet provider", async () => {
    const provider = {
      request: async () => [
        "0xABCD000000000000000000000000000000000001",
        "0xabcd000000000000000000000000000000000001",
      ],
    };

    await expect(requestAccounts(provider, "eth_accounts")).resolves.toEqual([
      "0xabcd000000000000000000000000000000000001",
    ]);
  });
});
