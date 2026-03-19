"use client";

import { Check } from "lucide-react";

import type { TaxonomyOption } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

type Tone = "violet" | "cobalt" | "teal" | "amber";

const toneStyles: Record<Tone, string> = {
  violet:
    "border-fuchsia-400/20 bg-fuchsia-400/8 text-fuchsia-100 data-[selected=true]:border-fuchsia-300/40 data-[selected=true]:bg-linear-to-br data-[selected=true]:from-fuchsia-500 data-[selected=true]:to-violet-500",
  cobalt:
    "border-sky-400/20 bg-sky-400/8 text-sky-100 data-[selected=true]:border-sky-300/40 data-[selected=true]:bg-linear-to-br data-[selected=true]:from-blue-500 data-[selected=true]:to-cyan-400",
  teal:
    "border-teal-300/20 bg-teal-300/8 text-teal-100 data-[selected=true]:border-teal-200/40 data-[selected=true]:bg-linear-to-br data-[selected=true]:from-teal-400 data-[selected=true]:to-emerald-400",
  amber:
    "border-amber-300/20 bg-amber-300/8 text-amber-100 data-[selected=true]:border-amber-200/40 data-[selected=true]:bg-linear-to-br data-[selected=true]:from-amber-400 data-[selected=true]:to-orange-400",
};

interface ChipGroupProps<T extends string> {
  label: string;
  hint: string;
  options: readonly TaxonomyOption<T>[];
  selected: readonly T[];
  tone: Tone;
  onToggle: (option: T) => void;
}

export function ChipGroup<T extends string>({
  label,
  hint,
  options,
  selected,
  tone,
  onToggle,
}: ChipGroupProps<T>) {
  return (
    <section className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <span className="h-6 w-1.5 rounded-full bg-linear-to-b from-fuchsia-400 to-sky-300" />
          <h2 className="text-base font-bold tracking-tight text-white">{label}</h2>
        </div>
        <p className="text-sm leading-6 text-white/58">{hint}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = selected.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              data-selected={isSelected}
              onClick={() => onToggle(option.id)}
              className={cn(
                "group inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold tracking-tight transition duration-200 hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/12 data-[selected=true]:text-white data-[selected=true]:shadow-[0_18px_40px_rgba(25,18,55,0.55)]",
                toneStyles[tone],
              )}
            >
              <span>{option.label}</span>
              <Check
                className={cn(
                  "h-4 w-4 transition",
                  isSelected ? "opacity-100" : "opacity-0",
                )}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
