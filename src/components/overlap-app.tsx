"use client";

import { sdk } from "@farcaster/miniapp-sdk";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  CircleAlert,
  CheckCircle2,
  Hammer,
  LoaderCircle,
  Palette,
  Sparkles,
  TrendingUp,
  Wallet,
  Waypoints,
} from "lucide-react";

import {
  ecosystemIds,
  ecosystemLabels,
  ecosystemOptions,
  interestIds,
  offeringIds,
  roleIds,
  roleLabels,
  roleOptions,
  seekingIds,
} from "@/lib/taxonomy";
import type { DiscoveryProfile, EcosystemTag, Role } from "@/lib/types";
import {
  formatAddress,
  getWalletErrorMessage,
  normalizeAccountList,
  requestAccounts,
  type EthereumProvider,
} from "@/lib/wallet";
import { cn, toggleInList } from "@/lib/utils";

const storageKey = "overlap.onboarding-profile.v1";

type WalletGateState =
  | "checking"
  | "needs_connection"
  | "connected"
  | "unsupported";

const defaultProfile: DiscoveryProfile = {
  roles: [],
  ecosystems: ["eth_mainnet"],
  interests: [],
  seeking: [],
  offering: [],
  about: "",
  building: "",
};

const stepMeta = [
  {
    step: "Step 1 of 2",
    lead: "What's your",
    accent: "role?",
    copy: "Select one or more roles. This is the main signal Overlap uses to frame discovery.",
  },
  {
    step: "Step 2 of 2",
    lead: "What's your",
    accent: "home?",
    copy: "Select blockchains you call home.",
  },
] as const;

const roleColors: Record<Role, string> = {
  builder: "#3B82F6",
  trader: "#8B5CF6",
  creator: "#22C55E",
  artist: "#F59E0B",
};

const ecosystemColors: Record<EcosystemTag, string> = {
  btc_maxi: "#F7931A",
  eth_mainnet: "#627EEA",
  base: "#0052FF",
  solana: "#9945FF",
  hyperliquid: "#00F5FF",
};

const roleIcons = {
  builder: Hammer,
  trader: TrendingUp,
  creator: Sparkles,
  artist: Palette,
} as const;

export function OverlapApp() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<DiscoveryProfile>(defaultProfile);
  const [showReview, setShowReview] = useState(false);
  const [walletGateState, setWalletGateState] = useState<WalletGateState>("checking");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletError, setWalletError] = useState("");
  const [isMiniAppHost, setIsMiniAppHost] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const hasCalledReadyRef = useRef(false);
  const providerRef = useRef<EthereumProvider | null>(null);

  useEffect(() => {
    if (hasCalledReadyRef.current) {
      return;
    }

    hasCalledReadyRef.current = true;
    void sdk.actions.ready().catch(() => undefined);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsubscribeAccountsChanged: (() => void) | undefined;

    async function detectWalletConnection() {
      try {
        const inMiniApp = await sdk.isInMiniApp().catch(() => false);

        if (cancelled) {
          return;
        }

        setIsMiniAppHost(inMiniApp);

        const provider = (await sdk.wallet.getEthereumProvider()) as
          | EthereumProvider
          | undefined;

        if (cancelled) {
          return;
        }

        if (!provider) {
          providerRef.current = null;
          setWalletGateState("unsupported");
          return;
        }

        providerRef.current = provider;

        const applyAccounts = (value: unknown) => {
          const [nextAddress] = normalizeAccountList(value);
          setWalletAddress(nextAddress ?? null);
          setWalletGateState(nextAddress ? "connected" : "needs_connection");
          setWalletError("");
        };

        try {
          const accounts = await requestAccounts(provider, "eth_accounts");

          if (cancelled) {
            return;
          }

          applyAccounts(accounts);
        } catch {
          if (!cancelled) {
            setWalletGateState("needs_connection");
          }
        }

        const handleAccountsChanged = (accounts: unknown) => {
          if (!cancelled) {
            applyAccounts(accounts);
          }
        };

        provider.on?.("accountsChanged", handleAccountsChanged);
        unsubscribeAccountsChanged = () => {
          provider.removeListener?.("accountsChanged", handleAccountsChanged);
        };
      } catch (error) {
        if (!cancelled) {
          setWalletGateState("unsupported");
          setWalletError(getWalletErrorMessage(error));
        }
      }
    }

    void detectWalletConnection();

    return () => {
      cancelled = true;
      unsubscribeAccountsChanged?.();
    };
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<DiscoveryProfile>;
      const frameId = window.requestAnimationFrame(() => {
        setProfile({
          ...defaultProfile,
          roles: sanitizeSelections(parsed.roles ?? defaultProfile.roles, roleIds, 4),
          ecosystems: sanitizeSelections(
            parsed.ecosystems ?? defaultProfile.ecosystems,
            ecosystemIds,
            5,
          ),
          interests: sanitizeSelections(
            parsed.interests ?? defaultProfile.interests,
            interestIds,
            6,
          ),
          seeking: sanitizeSelections(parsed.seeking ?? defaultProfile.seeking, seekingIds, 6),
          offering: sanitizeSelections(
            parsed.offering ?? defaultProfile.offering,
            offeringIds,
            6,
          ),
          about: sanitizeText(parsed.about),
          building: sanitizeText(parsed.building),
        });
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    } catch {
      // Ignore malformed local storage and keep the default profile.
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(profile));
  }, [profile]);

  const selectedRoleLabels = useMemo(
    () => profile.roles.map((role) => roleLabels[role]),
    [profile.roles],
  );
  const selectedEcosystemLabels = useMemo(
    () => profile.ecosystems.map((ecosystem) => ecosystemLabels[ecosystem]),
    [profile.ecosystems],
  );

  const canContinue = step === 0 ? profile.roles.length > 0 : profile.ecosystems.length > 0;

  function toggleRole(role: Role) {
    setProfile((current) => ({
      ...current,
      roles: toggleInList(current.roles, role),
    }));
  }

  function toggleEcosystem(ecosystem: EcosystemTag) {
    setProfile((current) => ({
      ...current,
      ecosystems: toggleInList(current.ecosystems, ecosystem),
    }));
  }

  function handleContinue() {
    if (step < stepMeta.length - 1) {
      setShowReview(false);
      setStep((current) => current + 1);
      return;
    }

    setShowReview(true);
  }

  function handleBack() {
    if (showReview) {
      setShowReview(false);
      return;
    }

    setShowReview(false);
    setStep((current) => Math.max(0, current - 1));
  }

  async function handleConnectWallet() {
    setIsConnectingWallet(true);
    setWalletError("");

    try {
      const provider = providerRef.current;

      if (!provider) {
        throw new Error(
          isMiniAppHost
            ? "This Farcaster host does not expose wallet connection."
            : "Open Overlap inside Farcaster to connect your wallet.",
        );
      }

      const accounts = await requestAccounts(provider, "eth_requestAccounts");
      const [nextAddress] = normalizeAccountList(accounts);

      if (!nextAddress) {
        throw new Error("Wallet connection completed without returning an address.");
      }

      setWalletAddress(nextAddress);
      setWalletGateState("connected");
    } catch (error) {
      setWalletGateState(providerRef.current ? "needs_connection" : "unsupported");
      setWalletError(getWalletErrorMessage(error));
    } finally {
      setIsConnectingWallet(false);
    }
  }

  if (walletGateState === "checking") {
    return (
      <AppShell stepLabel="Wallet">
        <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 pt-24 pb-32">
          <section className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="glass-card inline-flex h-20 w-20 items-center justify-center rounded-[28px]">
              <LoaderCircle className="h-8 w-8 animate-spin text-[#bf9cff]" />
            </div>
            <h1 className="mt-8 text-4xl leading-tight font-extrabold tracking-tight text-on-surface">
              Checking your{" "}
              <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                wallet
              </span>
            </h1>
            <p className="mt-3 max-w-sm text-base leading-relaxed text-on-surface-variant">
              Looking for an already connected Farcaster wallet so returning users can
              skip the connect step.
            </p>
          </section>
        </main>
      </AppShell>
    );
  }

  if (walletGateState !== "connected") {
    return (
      <AppShell stepLabel="Connect">
        <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 pt-24 pb-32">
          <section className="mb-10">
            <h1 className="mb-3 text-4xl leading-tight font-extrabold tracking-tight text-on-surface">
              Connect your{" "}
              <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                wallet
              </span>
            </h1>
            <p className="text-base leading-relaxed text-on-surface-variant">
              Overlap uses your connected Farcaster wallet to anchor the profile flow to
              a real account before onboarding starts.
            </p>
          </section>

          <section className="glass-card rounded-[28px] p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-gradient-to-br from-primary to-secondary text-white shadow-[0_0_24px_rgba(127,50,227,0.34)]">
                <Wallet className="h-6 w-6" strokeWidth={2.2} />
              </div>
              <div>
                <h2 className="text-base font-bold text-on-surface">Wallet required</h2>
                <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                  Once your wallet is connected, this page disappears and Overlap drops
                  you straight into the role and blockchain setup.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm leading-6 text-on-surface-variant">
              <InfoRow copy="Resolve your Farcaster account without a fake placeholder profile." />
              <InfoRow copy="Prepare the app for wallet-based profile enrichment and Neynar scoring." />
              <InfoRow copy="Keep future discovery tied to the same connected identity." />
            </div>

            {walletError ? (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/8 px-4 py-3 text-sm text-amber-100">
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                <p>{walletError}</p>
              </div>
            ) : null}

            {!isMiniAppHost && walletGateState === "unsupported" ? (
              <div className="mt-5 rounded-2xl border border-white/8 bg-white/4 px-4 py-3 text-sm leading-6 text-on-surface-variant">
                Open the app inside Farcaster to access the embedded wallet provider.
              </div>
            ) : null}
          </section>

          <footer className="mt-auto pt-10">
            <button
              type="button"
              onClick={handleConnectWallet}
              disabled={isConnectingWallet || walletGateState === "unsupported"}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-secondary py-5 text-lg font-bold text-white shadow-2xl transition-all duration-200",
                !isConnectingWallet && walletGateState !== "unsupported"
                  ? "hover:brightness-110 active:scale-[0.98]"
                  : "cursor-not-allowed opacity-45",
              )}
            >
              {isConnectingWallet ? (
                <>
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                  Connecting wallet
                </>
              ) : walletGateState === "unsupported" ? (
                "Wallet unavailable"
              ) : (
                <>
                  Connect wallet
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
            <p className="mt-6 text-center text-[10px] font-medium tracking-tighter text-on-surface-variant/50 uppercase">
              Privacy encrypted by Farcaster Protocol
            </p>
          </footer>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell stepLabel={stepMeta[step].step}>
      <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 pt-24 pb-32">
        <section className="mb-10">
          <h1 className="mb-3 text-4xl leading-tight font-extrabold tracking-tight text-on-surface">
            {stepMeta[step].lead}{" "}
            <span className="bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
              {stepMeta[step].accent}
            </span>
          </h1>
          <p className="text-base leading-relaxed text-on-surface-variant">
            {stepMeta[step].copy}
          </p>
          {walletAddress ? (
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-[11px] font-semibold tracking-[0.22em] text-on-surface-variant uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              {formatAddress(walletAddress)}
            </div>
          ) : null}
        </section>

        <div className="flex-grow space-y-12">
          {step === 0 ? (
            <RoleSelectionSection
              options={roleOptions}
              selected={profile.roles}
              colors={roleColors}
              onToggle={toggleRole}
            />
          ) : null}

          {step === 1 ? (
            <SelectionSection
              label="Blockchains"
              options={ecosystemOptions}
              selected={profile.ecosystems}
              colors={ecosystemColors}
              onToggle={toggleEcosystem}
            />
          ) : null}

          {showReview ? (
            <section className="glass-card rounded-[28px] p-5">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-6 w-1.5 rounded-full bg-[#7F32E3]" />
                <h2 className="text-base font-bold text-on-surface">Current profile</h2>
              </div>

              <SummaryRow
                label="Roles"
                values={selectedRoleLabels}
                fallback="Select at least one role."
              />
              <SummaryRow
                label="Blockchains"
                values={selectedEcosystemLabels}
                fallback="Select at least one chain."
              />
            </section>
          ) : null}
        </div>

        <footer className="mt-auto pt-10">
          {step > 0 ? (
            <button
              type="button"
              onClick={handleBack}
              className="mb-4 text-sm font-semibold text-on-surface-variant transition hover:text-on-surface"
            >
              Back
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-primary to-secondary py-5 text-lg font-bold text-white shadow-2xl transition-all duration-200",
              canContinue
                ? "hover:brightness-110 active:scale-[0.98]"
                : "cursor-not-allowed opacity-45",
            )}
          >
            {step === stepMeta.length - 1 ? "Review" : "Continue"}
            <ArrowRight className="h-5 w-5" />
          </button>
          <p className="mt-6 text-center text-[10px] font-medium tracking-tighter text-on-surface-variant/50 uppercase">
            Privacy encrypted by Farcaster Protocol
          </p>
        </footer>
      </main>
    </AppShell>
  );
}

function AppShell({
  children,
  stepLabel,
}: {
  children: React.ReactNode;
  stepLabel: string;
}) {
  return (
    <div className="min-h-screen bg-background-page text-on-surface">
      <header className="fixed top-0 z-50 w-full bg-[#0f0d14]/96 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-md items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Waypoints className="h-6 w-6 text-[#855AD1]" strokeWidth={2.2} />
            <span className="text-xl font-black tracking-tight text-[#bf9cff]">
              Overlap
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="rounded bg-surface-container-highest px-2 py-1 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
              {stepLabel}
            </span>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}

function InfoRow({ copy }: { copy: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#bf9cff]" />
      <p>{copy}</p>
    </div>
  );
}

function SummaryRow({
  fallback,
  label,
  values,
}: {
  fallback: string;
  label: string;
  values: string[];
}) {
  return (
    <div className="border-t border-white/6 py-4 first:border-t-0 first:pt-0 last:pb-0">
      <div className="mb-2 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
        {label}
      </div>
      <p className="text-sm leading-relaxed text-on-surface">
        {values.length > 0 ? values.join(" · ") : fallback}
      </p>
    </div>
  );
}

function sanitizeSelections<T extends string>(
  value: unknown,
  allowed: readonly T[],
  max: number,
) {
  if (!Array.isArray(value)) {
    return [];
  }

  const allowedSet = new Set(allowed);

  return value.filter((item): item is T => {
    return typeof item === "string" && allowedSet.has(item as T);
  }).slice(0, max);
}

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 160) : "";
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((part) => part + part)
          .join("")
      : normalized;
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildTokenStyle(color: string, selected: boolean) {
  if (selected) {
    return {
      backgroundImage: `linear-gradient(135deg, ${color}, ${hexToRgba(color, 0.8)})`,
      borderColor: hexToRgba(color, 0.35),
      boxShadow: `0 0 15px ${hexToRgba(color, 0.3)}`,
      color: "#ffffff",
    };
  }

  return {
    backgroundColor: hexToRgba(color, 0.1),
    borderColor: hexToRgba(color, 0.2),
    color,
  };
}

function RoleSelectionSection({
  colors,
  onToggle,
  options,
  selected,
}: {
  colors: Record<Role, string>;
  onToggle: (value: Role) => void;
  options: readonly (typeof roleOptions)[number][];
  selected: readonly Role[];
}) {
  return (
    <section>
      <div className="mb-6 flex items-center gap-2">
        <span className="h-6 w-1.5 rounded-full bg-[#7F32E3]" />
        <h2 className="text-sm font-bold text-on-surface">Main roles</h2>
      </div>
      <p className="mb-6 text-sm leading-relaxed text-on-surface-variant">
        Choose multiple if needed. These four roles are the main lens Overlap uses.
      </p>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          const Icon = roleIcons[option.id];
          const color = colors[option.id];

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              className="glass-card rounded-[24px] border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
              style={{
                borderColor: isSelected
                  ? hexToRgba(color, 0.35)
                  : "rgba(195, 155, 255, 0.05)",
                boxShadow: isSelected ? `0 0 18px ${hexToRgba(color, 0.22)}` : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl"
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${color}, ${hexToRgba(color, 0.8)})`
                      : hexToRgba(color, 0.14),
                    color: isSelected ? "#ffffff" : color,
                  }}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.2} />
                </div>
                {isSelected ? (
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0"
                    style={{ color }}
                    strokeWidth={2.3}
                  />
                ) : null}
              </div>
              <div className="mt-4">
                <div className="text-base font-bold text-on-surface">{option.label}</div>
                <p className="mt-1 text-xs leading-5 text-on-surface-variant">
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SelectionSection<T extends string>({
  colors,
  label,
  onToggle,
  options,
  selected,
}: {
  colors: Record<T, string>;
  label: string;
  onToggle: (value: T) => void;
  options: readonly { id: T; label: string }[];
  selected: readonly T[];
}) {
  return (
    <section>
      <div className="mb-6 flex items-center gap-2">
        <span className="h-6 w-1.5 rounded-full bg-[#7F32E3]" />
        <h2 className="text-sm font-bold text-on-surface">{label}</h2>
      </div>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onToggle(option.id)}
              className="flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:brightness-110"
              style={buildTokenStyle(colors[option.id], isSelected)}
            >
              {option.label}
              {isSelected ? (
                <CheckCircle2 className="h-[18px] w-[18px]" strokeWidth={2.3} />
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
