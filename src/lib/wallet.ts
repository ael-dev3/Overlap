export type EthereumAccountMethod = "eth_accounts" | "eth_requestAccounts";

export type EthereumProvider = {
  request: (args: { method: EthereumAccountMethod; params?: unknown[] }) => Promise<unknown>;
  on?: (event: "accountsChanged", listener: (accounts: unknown) => void) => void;
  removeListener?: (
    event: "accountsChanged",
    listener: (accounts: unknown) => void,
  ) => void;
};

export function normalizeAccountList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(
    value
      .filter((item): item is string => typeof item === "string" && item.startsWith("0x"))
      .map((item) => item.toLowerCase()),
  )];
}

export async function requestAccounts(
  provider: EthereumProvider,
  method: EthereumAccountMethod,
) {
  const response = await provider.request({ method });
  return normalizeAccountList(response);
}

export function formatAddress(value: string) {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function getWalletErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 4001
  ) {
    return "Wallet connection was cancelled.";
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return "Wallet connection is currently unavailable.";
}
