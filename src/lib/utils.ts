import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function uniqueIntersection<T extends string | number>(
  left: readonly T[],
  right: readonly T[],
) {
  const rightSet = new Set(right);
  return [...new Set(left.filter((value) => rightSet.has(value)))];
}

export function uniqueUnion<T extends string | number>(
  left: readonly T[],
  right: readonly T[],
) {
  return [...new Set([...left, ...right])];
}

export function toggleInList<T extends string>(items: readonly T[], value: T) {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];
}

export function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function formatPercent(value: number) {
  return `${Math.round(clamp(value) * 100)}%`;
}

export function formatSignedPercent(value: number) {
  const rounded = Math.round(value * 100);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

function formatCount(value: number, singular: string, plural = `${singular}s`) {
  return `${value} ${value === 1 ? singular : plural}`;
}

export function formatActivitySnapshot(value: {
  activeDays7d: number;
  castsLast7d: number;
  repliesLast7d: number;
}) {
  return [
    `${value.activeDays7d}/7 active days`,
    formatCount(value.castsLast7d, "cast"),
    formatCount(value.repliesLast7d, "reply", "replies"),
  ].join(", ");
}

export function absoluteUrl(baseUrl: string, path: string) {
  return new URL(path, baseUrl).toString();
}

export function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}
