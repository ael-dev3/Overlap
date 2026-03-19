"use client";

import { useDeferredValue, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  DatabaseZap,
  Radar,
  Waves,
} from "lucide-react";

import { ChipGroup } from "@/components/chip-group";
import { MatchCard } from "@/components/match-card";
import { MiniAppBootstrap } from "@/components/miniapp-bootstrap";
import { rankMatches } from "@/lib/scoring/overlap";
import {
  ecosystemLabels,
  ecosystemOptions,
  interestLabels,
  interestOptions,
  offeringLabels,
  offeringOptions,
  roleLabels,
  roleOptions,
  seekingLabels,
  seekingOptions,
} from "@/lib/taxonomy";
import type {
  CatalogSnapshot,
  DiscoveryProfile,
  EcosystemTag,
  InterestTag,
  OfferingIntent,
  Role,
  SeekingIntent,
} from "@/lib/types";
import { cn, formatPercent, toggleInList, truncate } from "@/lib/utils";

const storageKey = "overlap.prototype.discovery-profile";

const stepMeta = [
  {
    title: "Who should the graph think you are?",
    eyebrow: "Step 1 of 3",
    copy:
      "Choose the roles that should actually influence discovery. Overlap works when the app knows whether you build, create, research, or hire.",
  },
  {
    title: "What feels like home right now?",
    eyebrow: "Step 2 of 3",
    copy:
      "Pick ecosystems and topics that reflect your current operating context, not every chain or trend you have ever touched.",
  },
  {
    title: "What are you seeking and offering?",
    eyebrow: "Step 3 of 3",
    copy:
      "This is the differentiator. Directional intent lets Overlap surface people who are useful, not just similar.",
  },
] as const;

interface OverlapAppProps {
  snapshot: CatalogSnapshot;
}

export function OverlapApp({ snapshot }: OverlapAppProps) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<DiscoveryProfile>(
    snapshot.viewerSeed.discovery,
  );
  const deferredProfile = useDeferredValue(profile);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as DiscoveryProfile;
      const frameId = window.requestAnimationFrame(() => {
        setProfile({
          ...snapshot.viewerSeed.discovery,
          ...parsed,
        });
      });

      return () => {
        window.cancelAnimationFrame(frameId);
      };
    } catch {
      // Ignore malformed local storage and keep the seeded profile.
    }
  }, [snapshot.viewerSeed.discovery]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(profile));
  }, [profile]);

  const viewer = {
    ...snapshot.viewerSeed,
    discovery: deferredProfile,
  };

  const matches = rankMatches(viewer, snapshot.candidates);
  const topMatch = matches[0];

  const selectedRoleLabels = profile.roles.map((role) => roleLabels[role]);
  const selectedEcosystemLabels = profile.ecosystems.map(
    (ecosystem) => ecosystemLabels[ecosystem],
  );
  const selectedInterestLabels = profile.interests.map(
    (interest) => interestLabels[interest],
  );
  const selectedSeekingLabels = profile.seeking.map((item) => seekingLabels[item]);
  const selectedOfferingLabels = profile.offering.map((item) => offeringLabels[item]);

  const canContinue =
    step === 0
      ? profile.roles.length > 0
      : step === 1
        ? profile.ecosystems.length > 0 && profile.interests.length > 0
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

  function toggleInterest(interest: InterestTag) {
    setProfile((current) => ({
      ...current,
      interests: toggleInList(current.interests, interest),
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

  function updateField(field: "about" | "building", value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-obsidian text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(138,92,255,0.2),_transparent_30%),radial-gradient(circle_at_80%_18%,_rgba(34,211,238,0.16),_transparent_22%),radial-gradient(circle_at_20%_88%,_rgba(255,168,93,0.12),_transparent_24%),linear-gradient(180deg,_rgba(9,11,18,0.96),_rgba(8,8,13,1))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_center,_rgba(201,168,255,0.16),_transparent_70%)] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10 pt-5">
        <header className="sticky top-0 z-20 -mx-5 border-b border-white/6 bg-obsidian/82 px-5 pb-4 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-linear-to-br from-fuchsia-500 to-sky-400 shadow-[0_18px_50px_rgba(112,78,255,0.45)]">
                <Radar className="h-5 w-5 text-slate-950" />
              </div>
              <div>
                <p className="font-display text-xl font-black tracking-tight text-white">
                  Overlap
                </p>
                <p className="text-xs font-semibold tracking-[0.28em] text-white/36 uppercase">
                  Collaborator discovery
                </p>
              </div>
            </div>
            <MiniAppBootstrap />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 pt-6">
          <section className="space-y-4">
            <div className="inline-flex rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[10px] font-black tracking-[0.22em] text-white/56 uppercase">
              {stepMeta[step].eyebrow}
            </div>
            <div className="space-y-3">
              <h1 className="max-w-[14ch] font-display text-4xl leading-[1.02] font-black tracking-tight text-white">
                {stepMeta[step].title}
              </h1>
              <p className="max-w-[36ch] text-sm leading-7 text-white/62">
                {stepMeta[step].copy}
              </p>
            </div>
            <div className="flex gap-2">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition",
                    index <= step
                      ? "bg-linear-to-r from-fuchsia-500 to-sky-400"
                      : "bg-white/10",
                  )}
                />
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-[32px] p-5">
            {step === 0 ? (
              <ChipGroup
                label="Roles"
                hint="Pick the identities that should change who appears in your discovery feed."
                options={roleOptions}
                selected={profile.roles}
                tone="violet"
                onToggle={toggleRole}
              />
            ) : step === 1 ? (
              <div className="space-y-8">
                <ChipGroup
                  label="Blockchains"
                  hint="Select the ecosystems where you genuinely show up."
                  options={ecosystemOptions}
                  selected={profile.ecosystems}
                  tone="cobalt"
                  onToggle={toggleEcosystem}
                />
                <ChipGroup
                  label="Interest areas"
                  hint="Use the topics you actually care about enough to post, build, or reply around."
                  options={interestOptions}
                  selected={profile.interests}
                  tone="teal"
                  onToggle={toggleInterest}
                />
              </div>
            ) : (
              <div className="space-y-8">
                <ChipGroup
                  label="Seeking"
                  hint="What do you want from the right introduction right now?"
                  options={seekingOptions}
                  selected={profile.seeking}
                  tone="amber"
                  onToggle={toggleSeeking}
                />
                <ChipGroup
                  label="Offering"
                  hint="What can you credibly offer back to someone relevant?"
                  options={offeringOptions}
                  selected={profile.offering}
                  tone="violet"
                  onToggle={toggleOffering}
                />

                <div className="space-y-4">
                  <TextField
                    label="What are you building?"
                    value={profile.building}
                    onChange={(value) => updateField("building", value)}
                    placeholder="Short sentence about the product, project, or thesis you are pushing right now."
                  />
                  <TextField
                    label="What kind of help would be useful?"
                    value={profile.about}
                    onChange={(value) => updateField("about", value)}
                    placeholder="Optional note that gives the matching system more texture without turning it into open-ended prompt soup."
                  />
                </div>
              </div>
            )}
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <SummaryPanel
              title="Your signal mix"
              eyebrow="Structured profile"
              lines={[
                selectedRoleLabels.join(" · ") || "No roles selected yet",
                selectedEcosystemLabels.join(" · ") || "No ecosystems selected yet",
                selectedInterestLabels.join(" · ") || "No interests selected yet",
              ]}
            />
            <SummaryPanel
              title="Directional intent"
              eyebrow="Seeking + offering"
              lines={[
                selectedSeekingLabels.join(" · ") || "No seeking signal selected yet",
                selectedOfferingLabels.join(" · ") || "No offering signal selected yet",
                profile.building
                  ? truncate(profile.building, 92)
                  : "Add what you are building to make the explanation layer cleaner.",
              ]}
            />
          </section>

          {topMatch ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black tracking-[0.22em] text-white/42 uppercase">
                    Current best match
                  </p>
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    {topMatch.candidate.displayName}
                  </h2>
                </div>
                <div className="rounded-full border border-fuchsia-300/20 bg-fuchsia-300/10 px-3 py-1.5 text-sm font-semibold text-fuchsia-100">
                  {formatPercent(topMatch.score)}
                </div>
              </div>
              <MatchCard match={topMatch} featured />
            </section>
          ) : null}

          <section className="rounded-[30px] border border-white/10 bg-white/5 p-5 backdrop-blur-2xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <DatabaseZap className="h-4 w-4 text-sky-200" />
              Data rails
            </div>
            <div className="mt-4 grid gap-3">
              <Rail
                label="Self-selected profile"
                value="Roles, ecosystems, interests, seeking, offering, and short context live inside Overlap."
              />
              <Rail
                label="Activity + graph"
                value={
                  snapshot.providerStatus.snapchain.mode === "fixture"
                    ? "Prototype fixtures right now, but the live adapter is Snapchain-first and ready when you attach real FIDs."
                    : snapshot.providerStatus.snapchain.mode === "configured"
                      ? `Snapchain is configured at ${snapshot.providerStatus.snapchain.baseUrl} and waiting on real hydrated demo FIDs.`
                      : `Snapchain ${snapshot.providerStatus.snapchain.mode} mode is active for live activity and graph context.`
                }
              />
              <Rail
                label="Trust weighting"
                value={
                  snapshot.providerStatus.neynar.mode === "live"
                    ? "Neynar enrichment is live as a bounded quality multiplier only."
                    : "Neynar is optional in this build. It nudges ranking quality, but it never becomes the product."
                }
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black tracking-[0.22em] text-white/42 uppercase">
                  Ranked people
                </p>
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Feed preview
                </h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-semibold text-white/62">
                {matches.length} suggestions
              </div>
            </div>
            <div className="space-y-4">
              {matches.slice(0, 4).map((match) => (
                <MatchCard key={match.candidate.id} match={match} />
              ))}
            </div>
          </section>
        </main>

        <footer className="sticky bottom-0 mt-8 border-t border-white/8 bg-obsidian/88 pt-5 backdrop-blur-xl">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/66">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Waves className="h-4 w-4 text-fuchsia-200" />
              Ranking model
            </div>
            <p className="mt-2">
              Deterministic overlap first. Snapchain supplies the social pulse.
              Neynar stays as a mild quality modifier instead of deciding the
              product for you.
            </p>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(0, current - 1))}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-4 text-sm font-semibold text-white/70 transition hover:bg-white/10 disabled:opacity-40"
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <button
              type="button"
              onClick={() =>
                setStep((current) => (current === 2 ? 0 : Math.min(2, current + 1)))
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-fuchsia-500 to-sky-400 px-4 py-4 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
              disabled={step !== 2 && !canContinue}
            >
              {step === 2 ? "Re-rank matches" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-4 text-center text-[10px] font-semibold tracking-[0.28em] text-white/28 uppercase">
            Snapchain first. Neynar only when it adds signal.
          </p>
        </footer>
      </div>
    </div>
  );
}

function Rail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-black/18 px-4 py-4">
      <div className="text-[10px] font-black tracking-[0.2em] text-white/38 uppercase">
        {label}
      </div>
      <p className="mt-2 text-sm leading-6 text-white/68">{value}</p>
    </div>
  );
}

function SummaryPanel({
  eyebrow,
  lines,
  title,
}: {
  eyebrow: string;
  lines: string[];
  title: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl">
      <div className="text-[10px] font-black tracking-[0.22em] text-white/38 uppercase">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-base font-bold tracking-tight text-white">{title}</h2>
      <div className="mt-3 space-y-2 text-sm leading-6 text-white/62">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function TextField({
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-white">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value.slice(0, 160))}
        placeholder={placeholder}
        rows={3}
        className="min-h-[104px] w-full rounded-[22px] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/28 focus:border-fuchsia-300/40 focus:bg-black/28"
      />
    </label>
  );
}
