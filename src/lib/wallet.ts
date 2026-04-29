export type EthereumAccountMethod = "eth_accounts" | "eth_requestAccounts";

export type EthereumProvider = {
  request: (args: { method: EthereumAccountMethod; params?: unknown[] }) => Promise<unknown>;
  on?: (event: "accountsChanged", listener: (accounts: unknown) => void) => void;
  removeListener?: (
    event: "accountsChanged",
    listener: (accounts: unknown) => void,
  ) => void;
};

const ethereumAddressPattern = /^0x[a-fA-F0-9]{40}$/;

export function normalizeAccountList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(
    value
      .filter(isEthereumAddress)
      .map((item) => item.toLowerCase()),
  )];
}

export function isEthereumAddress(value: unknown): value is string {
  return typeof value === "string" && ethereumAddressPattern.test(value);
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
