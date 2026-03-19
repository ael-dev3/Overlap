"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Waypoints } from "lucide-react";

import { MiniAppBootstrap } from "@/components/miniapp-bootstrap";
import {
  ecosystemLabels,
  ecosystemOptions,
  offeringLabels,
  offeringOptions,
  roleLabels,
  roleOptions,
  seekingLabels,
  seekingOptions,
} from "@/lib/taxonomy";
import type {
  DiscoveryProfile,
  EcosystemTag,
  OfferingIntent,
  Role,
  SeekingIntent,
} from "@/lib/types";
import { cn, toggleInList } from "@/lib/utils";

const storageKey = "overlap.onboarding-profile.v1";

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
    step: "Step 1 of 3",
    lead: "What's your",
    accent: "role?",
    copy: "Select the roles that best describe how you show up on Farcaster.",
  },
  {
    step: "Step 2 of 3",
    lead: "What's your",
    accent: "home?",
    copy: "Select blockchains you call home.",
  },
  {
    step: "Step 3 of 3",
    lead: "What do you",
    accent: "want?",
    copy: "Choose the collaboration signals that should shape your intros.",
  },
] as const;

const roleColors: Record<Role, string> = {
  builder: "#7F32E3",
  creator: "#A855F7",
  trader: "#00F5FF",
  artist: "#F472B6",
  founder: "#855AD1",
  researcher: "#34D399",
  marketer: "#F59E0B",
  collector: "#EC4899",
  investor: "#60A5FA",
};

const ecosystemColors: Record<EcosystemTag, string> = {
  btc_maxi: "#F7931A",
  eth_mainnet: "#627EEA",
  base: "#0052FF",
  solana: "#9945FF",
  hyperliquid: "#00F5FF",
};

const seekingColors: Record<SeekingIntent, string> = {
  cofounder: "#7F32E3",
  dev: "#38BDF8",
  designer: "#F472B6",
  feedback: "#F59E0B",
  distribution: "#10B981",
  brainstorm: "#A855F7",
};

const offeringColors: Record<OfferingIntent, string> = {
  build: "#7F32E3",
  design: "#F472B6",
  feedback: "#F59E0B",
  distribution: "#10B981",
  brainstorm: "#A855F7",
  role_opening: "#38BDF8",
};

export function OverlapApp() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<DiscoveryProfile>(defaultProfile);
  const [showReview, setShowReview] = useState(false);

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
          ...parsed,
          roles: parsed.roles ?? defaultProfile.roles,
          ecosystems: parsed.ecosystems ?? defaultProfile.ecosystems,
          interests: parsed.interests ?? defaultProfile.interests,
          seeking: parsed.seeking ?? defaultProfile.seeking,
          offering: parsed.offering ?? defaultProfile.offering,
          about: parsed.about ?? defaultProfile.about,
          building: parsed.building ?? defaultProfile.building,
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
  const selectedSeekingLabels = useMemo(
    () => profile.seeking.map((item) => seekingLabels[item]),
    [profile.seeking],
  );
  const selectedOfferingLabels = useMemo(
    () => profile.offering.map((item) => offeringLabels[item]),
    [profile.offering],
  );

  const canContinue =
    step === 0
      ? profile.roles.length > 0
      : step === 1
        ? profile.ecosystems.length > 0
        : profile.seeking.length > 0 || profile.offering.length > 0;

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

  function toggleSeeking(intent: SeekingIntent) {
    setProfile((current) => ({
      ...current,
      seeking: toggleInList(current.seeking, intent),
    }));
  }

  function toggleOffering(intent: OfferingIntent) {
    setProfile((current) => ({
      ...current,
      offering: toggleInList(current.offering, intent),
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
    setShowReview(false);
    setStep((current) => Math.max(0, current - 1));
  }

  return (
    <div className="min-h-screen bg-background-page text-on-surface">
      <div className="hidden" aria-hidden="true">
        <MiniAppBootstrap />
      </div>

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
              {stepMeta[step].step}
            </span>
          </div>
        </div>
      </header>

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
        </section>

        <div className="flex-grow space-y-12">
          {step === 0 ? (
            <SelectionSection
              label="Roles"
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

          {step === 2 ? (
            <div className="space-y-12">
              <SelectionSection
                label="Seeking"
                options={seekingOptions}
                selected={profile.seeking}
                colors={seekingColors}
                onToggle={toggleSeeking}
              />
              <SelectionSection
                label="Offering"
                options={offeringOptions}
                selected={profile.offering}
                colors={offeringColors}
                onToggle={toggleOffering}
              />
            </div>
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
              <SummaryRow
                label="Seeking"
                values={selectedSeekingLabels}
                fallback="Add a collaboration ask."
              />
              <SummaryRow
                label="Offering"
                values={selectedOfferingLabels}
                fallback="Add what you can offer back."
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
