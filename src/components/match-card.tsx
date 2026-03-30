"use client";

import { useTransition, type ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  Network,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  ecosystemLabels,
  offeringLabels,
  roleLabels,
  seekingLabels,
} from "@/lib/taxonomy";
import type { RankedMatch } from "@/lib/types";
import {
  cn,
  formatActivitySnapshot,
  formatPercent,
  formatSignedPercent,
  truncate,
} from "@/lib/utils";

interface MatchCardProps {
  match: RankedMatch;
  featured?: boolean;
}

export function MatchCard({ match, featured = false }: MatchCardProps) {
  const { candidate, breakdown } = match;
  const [isPending, startTransition] = useTransition();

  function openProfile() {
    startTransition(async () => {
      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");

        if (candidate.fid !== null) {
          await sdk.actions.viewProfile({ fid: candidate.fid });
          return;
        }
      } catch {
        // Fall through to the public profile URL outside the Mini App host.
      }

      window.open(`https://warpcast.com/${candidate.username}`, "_blank", "noopener,noreferrer");
    });
  }

  function composeIntro() {
    startTransition(async () => {
      const text = `Strong Overlap match: ${candidate.displayName} (@${candidate.username})\n\n${match.reasons
        .slice(0, 3)
        .map((reason) => `• ${reason.label}`)
        .join("\n")}`;

      try {
        const { sdk } = await import("@farcaster/miniapp-sdk");
        await sdk.actions.composeCast({ text });
      } catch {
        await navigator.clipboard.writeText(text);
      }
    });
  }

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-[30px] border border-white/12 bg-white/6 p-5 backdrop-blur-2xl",
        featured && "ring-1 ring-fuchsia-300/24 shadow-[0_28px_80px_rgba(16,11,33,0.6)]",
      )}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-[20px] text-base font-black text-white shadow-[0_20px_35px_rgba(8,10,20,0.55)]"
            style={{
              backgroundImage: `linear-gradient(135deg, ${candidate.avatar.start}, ${candidate.avatar.end})`,
            }}
          >
            {candidate.avatar.initials}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-white">{candidate.displayName}</h3>
              <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[10px] font-bold tracking-[0.18em] text-white/55 uppercase">
                {match.overlapLabel}
              </span>
            </div>
            <p className="text-sm text-white/58">@{candidate.username}</p>
          </div>
        </div>
        <div className="rounded-full bg-white/8 px-3 py-2 text-right text-xs font-semibold text-white/72">
          <div>{formatPercent(match.score)}</div>
          <div className="text-[10px] tracking-[0.2em] uppercase text-white/45">match</div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/72">{candidate.bio}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
        {candidate.discovery.roles.slice(0, 2).map((role) => (
          <span
            key={role}
            className="rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-white/86"
          >
            {roleLabels[role]}
          </span>
        ))}
        {candidate.discovery.ecosystems.slice(0, 2).map((ecosystem) => (
          <span
            key={ecosystem}
            className="rounded-full border border-sky-300/18 bg-sky-300/10 px-3 py-1.5 text-sky-100"
          >
            {ecosystemLabels[ecosystem]}
          </span>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <Metric
          icon={<Activity className="h-4 w-4" />}
          label="Activity"
          value={formatPercent(breakdown.activity)}
        />
        <Metric
          icon={<Network className="h-4 w-4" />}
          label="Graph"
          value={formatPercent(breakdown.graph)}
        />
        <Metric
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Quality"
          value={formatSignedPercent(breakdown.qualityMultiplier - 1)}
        />
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <Panel label="Seeking" icon={<UserRound className="h-4 w-4 text-sky-200" />}>
          {candidate.discovery.seeking.length > 0
            ? candidate.discovery.seeking.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-semibold text-white/72"
                >
                  {seekingLabels[item]}
                </span>
              ))
            : "Not specified"}
        </Panel>
        <Panel label="Offering" icon={<Sparkles className="h-4 w-4 text-fuchsia-200" />}>
          {candidate.discovery.offering.length > 0
            ? candidate.discovery.offering.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-xs font-semibold text-white/72"
                >
                  {offeringLabels[item]}
                </span>
              ))
            : "Not specified"}
        </Panel>
      </div>

      <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles className="h-4 w-4 text-fuchsia-200" />
          Why you overlap
        </div>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-white/70">
          {match.reasons.map((reason) => (
            <li key={reason.code + reason.label} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-300" />
              <span>{reason.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 rounded-[24px] border border-white/8 bg-white/5 p-4 text-sm leading-6 text-white/62">
        <div className="text-[10px] font-bold tracking-[0.22em] text-white/38 uppercase">
          Signal pulse
        </div>
        <p className="mt-2 text-white/72">“{candidate.activity.sampleCasts[0]}”</p>
        <p className="mt-2 text-xs text-white/45">
          Snapshot cadence: {formatActivitySnapshot(candidate.activity)}
        </p>
        {candidate.discovery.building ? (
          <p className="mt-3 text-xs leading-5 text-white/52">
            Building: {truncate(candidate.discovery.building, 92)}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={composeIntro}
          disabled={isPending}
          className="flex-1 rounded-2xl bg-linear-to-r from-fuchsia-500 to-sky-400 px-4 py-3 text-sm font-bold text-slate-950 transition hover:brightness-110 disabled:opacity-60"
        >
          Queue intro
        </button>
        <button
          type="button"
          onClick={openProfile}
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white/72 transition hover:bg-white/10 disabled:opacity-60"
        >
          View profile
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/18 px-3 py-3">
      <div className="flex items-center gap-2 text-white/54">{icon}</div>
      <div className="mt-2 text-lg font-black tracking-tight text-white">{value}</div>
      <div className="text-[11px] font-semibold tracking-[0.18em] text-white/42 uppercase">
        {label}
      </div>
    </div>
  );
}

function Panel({
  children,
  icon,
  label,
}: {
  children: ReactNode;
  icon: ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/18 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        {icon}
        {label}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {typeof children === "string" ? (
          <p className="text-sm text-white/62">{children}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
