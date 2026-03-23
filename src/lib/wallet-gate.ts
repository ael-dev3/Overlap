export type WalletGateState =
  | "checking"
  | "needs_connection"
  | "connected"
  | "unsupported"
  | "preview";

export function resolveWalletGateState({
  accounts,
  hasProvider,
  inMiniApp,
}: {
  accounts: readonly string[];
  hasProvider: boolean;
  inMiniApp: boolean;
}): Exclude<WalletGateState, "checking"> {
  if (!inMiniApp) {
    return "preview";
  }

  if (!hasProvider) {
    return "unsupported";
  }

  return accounts.length > 0 ? "connected" : "needs_connection";
}
