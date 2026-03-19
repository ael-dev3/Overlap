export interface TaxonomyOption<T extends string> {
  id: T;
  label: string;
}

export const roleOptions = [
  { id: "builder", label: "Builder" },
  { id: "creator", label: "Creator" },
  { id: "trader", label: "Trader" },
  { id: "artist", label: "Artist" },
  { id: "founder", label: "Founder" },
  { id: "researcher", label: "Researcher" },
  { id: "marketer", label: "Marketer" },
  { id: "collector", label: "Collector" },
  { id: "investor", label: "Investor" },
] as const satisfies readonly TaxonomyOption<string>[];

export const ecosystemOptions = [
  { id: "btc_maxi", label: "BTC maxi" },
  { id: "eth_mainnet", label: "ETH mainnet" },
  { id: "base", label: "Base" },
  { id: "solana", label: "Solana" },
  { id: "hyperliquid", label: "Hyperliquid" },
] as const satisfies readonly TaxonomyOption<string>[];

export const interestOptions = [
  { id: "ai", label: "AI" },
  { id: "defi", label: "DeFi" },
  { id: "trading", label: "Trading" },
  { id: "memes", label: "Memes" },
  { id: "agents", label: "Agents" },
  { id: "content", label: "Content" },
  { id: "mini_apps", label: "Mini apps" },
  { id: "nfts", label: "NFTs" },
  { id: "gaming", label: "Gaming" },
  { id: "socialfi", label: "SocialFi" },
] as const satisfies readonly TaxonomyOption<string>[];

export const seekingOptions = [
  { id: "cofounder", label: "Looking for cofounder" },
  { id: "dev", label: "Need dev" },
  { id: "designer", label: "Need designer" },
  { id: "feedback", label: "Want feedback" },
  { id: "distribution", label: "Want distribution" },
  { id: "brainstorm", label: "Open to brainstorm" },
] as const satisfies readonly TaxonomyOption<string>[];

export const offeringOptions = [
  { id: "build", label: "Looking to build" },
  { id: "design", label: "Can design" },
  { id: "feedback", label: "Can give feedback" },
  { id: "distribution", label: "Can help with distribution" },
  { id: "brainstorm", label: "Open to brainstorm" },
  { id: "role_opening", label: "Hiring" },
] as const satisfies readonly TaxonomyOption<string>[];

export const roleIds = roleOptions.map((option) => option.id) as [
  (typeof roleOptions)[number]["id"],
  ...(typeof roleOptions)[number]["id"][],
];

export const ecosystemIds = ecosystemOptions.map((option) => option.id) as [
  (typeof ecosystemOptions)[number]["id"],
  ...(typeof ecosystemOptions)[number]["id"][],
];

export const interestIds = interestOptions.map((option) => option.id) as [
  (typeof interestOptions)[number]["id"],
  ...(typeof interestOptions)[number]["id"][],
];

export const seekingIds = seekingOptions.map((option) => option.id) as [
  (typeof seekingOptions)[number]["id"],
  ...(typeof seekingOptions)[number]["id"][],
];

export const offeringIds = offeringOptions.map((option) => option.id) as [
  (typeof offeringOptions)[number]["id"],
  ...(typeof offeringOptions)[number]["id"][],
];

export const taxonomyGroups = [
  { id: "roles", label: "Roles", options: roleOptions },
  { id: "ecosystems", label: "Blockchains", options: ecosystemOptions },
  { id: "interests", label: "Interest areas", options: interestOptions },
  { id: "seeking", label: "Seeking", options: seekingOptions },
  { id: "offering", label: "Offering", options: offeringOptions },
] as const;

function buildLabelMap<const T extends readonly TaxonomyOption<string>[]>(
  options: T,
) {
  return Object.fromEntries(options.map((option) => [option.id, option.label])) as Record<
    T[number]["id"],
    string
  >;
}

export const roleLabels = buildLabelMap(roleOptions);
export const ecosystemLabels = buildLabelMap(ecosystemOptions);
export const interestLabels = buildLabelMap(interestOptions);
export const seekingLabels = buildLabelMap(seekingOptions);
export const offeringLabels = buildLabelMap(offeringOptions);
