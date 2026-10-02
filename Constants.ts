const AVAILABLE_MODELS = [
  // --- Integri ---
  {
    id: "integri",
    label: "Integri",
    provider: "openai",
    alt_provider: "integri",
    light_theme_logo: "/light-theme-logo.png",
    dark_theme_logo: "/dark-theme-logo.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },

  // --- OpenAI ---
  {
    id: "gpt-5.2",
    label: "GPT-5.2",
    provider: "openai",
    badge: "New",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "gpt-5.4",
    label: "GPT-5.4",
    provider: "openai",
    badge: "New",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "gpt-5.4-mini",
    label: "GPT-5.4 Mini",
    provider: "openai",
    badge: "New",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "gpt-5.4-nano",
    label: "GPT-5.4 Nano",
    provider: "openai",
    badge: "New",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "gpt-5.1",
    label: "GPT-5.1",
    provider: "openai",
    badge: "New",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  // {
  //   id: "gpt-5-mini",
  //   label: "GPT-5 Mini",
  //   provider: "openai",
  //   badge: "New",
  //   light_theme_logo: "/light-theme-openai.png",
  //   dark_theme_logo: "/dark-theme-openai.png",
  //   isPro: true,
  //   isPremium: false,
  //   isFree: false,
  // },
  {
    id: "gpt-5-nano",
    label: "GPT-5 Nano",
    provider: "openai",
    badge: "Fast",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "openai",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "gpt-4o-mini-search-preview",
    label: "GPT Search",
    provider: "openai",
    badge: "Search",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "gpt-4o-mini-deep-research",
    label: "GPT Deep Research",
    provider: "openai",
    badge: "Research",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "gpt-4.1-nano",
    label: "GPT-4.1 Nano",
    provider: "openai",
    badge: "Efficient",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },

  // --- Google ---
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "gemini",
    light_theme_logo: "/gemini.png",
    dark_theme_logo: "/gemini.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },

  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    provider: "gemini",
    light_theme_logo: "/gemini.png",
    dark_theme_logo: "/gemini.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "gemini-3-flash-preview",
    label: "Gemini 3 flash-preview",
    provider: "gemini",
    light_theme_logo: "/gemini.png",
    dark_theme_logo: "/gemini.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },

  // --- Grok ---
  {
    id: "grok-3-mini",
    label: "Grok 3 Mini",
    provider: "grok",
    badge: "Uncensored",
    light_theme_logo: "/light-theme-grok.png",
    dark_theme_logo: "/dark-theme-grok.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "grok-4-1-fast-reasoning",
    label: "Grok 4-1 fast reasoning",
    provider: "grok",
    badge: "Uncensored",
    light_theme_logo: "/light-theme-grok.png",
    dark_theme_logo: "/dark-theme-grok.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "grok-4-1-fast-non-reasoning",
    label: "Grok 4-1 fast non reasoning",
    provider: "grok",
    badge: "Uncensored",
    light_theme_logo: "/light-theme-grok.png",
    dark_theme_logo: "/dark-theme-grok.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "grok-4-fast-reasoning",
    label: "Grok 4 fast reasoning",
    provider: "grok",
    badge: "Uncensored",
    light_theme_logo: "/light-theme-grok.png",
    dark_theme_logo: "/dark-theme-grok.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "grok-4-fast-non-reasoning",
    label: "Grok 4 fast non reasoning",
    provider: "grok",
    badge: "Uncensored",
    light_theme_logo: "/light-theme-grok.png",
    dark_theme_logo: "/dark-theme-grok.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },

  // --- Claude ---

  {
    id: "claude-haiku-3",
    label: "Claude haiku 3",
    provider: "claude",
    light_theme_logo: "/claude.png",
    dark_theme_logo: "/claude.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    provider: "claude",
    badge: "New",
    light_theme_logo: "/claude.png",
    dark_theme_logo: "/claude.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  // --- DeepSeek ---
  {
    id: "deepseek-reasoner",
    label: "DeepSeek Reasoner",
    provider: "deepseek",
    badge: "Reasoning",
    light_theme_logo: "/deepseek.png",
    dark_theme_logo: "/deepseek.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "deepseek-chat",
    label: "DeepSeek Chat",
    provider: "deepseek",
    light_theme_logo: "/deepseek.png",
    dark_theme_logo: "/deepseek.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },

  // --- Perplexity ---
  {
    id: "perplexity-sonar",
    label: "Perplexity Sonar",
    provider: "perplexity",
    badge: "Search",
    light_theme_logo: "/perplexity.png",
    dark_theme_logo: "/perplexity.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "sonar-reasoning",
    label: "Sonar Reasoning",
    provider: "perplexity",
    badge: "Reasoning",
    light_theme_logo: "/perplexity.png",
    dark_theme_logo: "/perplexity.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },

  // --- Mistral ---
  {
    id: "mistral-medium-2505",
    label: "Mistral Medium",
    provider: "mistral",
    light_theme_logo: "/mistral.png",
    dark_theme_logo: "/mistral.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },

  // --- GLM ---
  {
    id: "glm-4.6",
    label: "GLM-4.6",
    provider: "glm",
    light_theme_logo: "/zai.png",
    dark_theme_logo: "/zai.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
  {
    id: "glm-4.7",
    label: "GLM-4.7",
    provider: "glm",
    light_theme_logo: "/zai.png",
    dark_theme_logo: "/zai.png",
    isPro: true,
    isPremium: true,
    isFree: true,
  },
];
// models available for voice mode ( NOTE : WE ARE STILL USING DYNAMIC MODELS BUT RIGHT NOW MODEL SELECTION IS DISABLED FOR VOICE MODE SO ONLY ONE MODEL IS HERE AND THE VOICE MODELS LIST IS HIDDEN IN THE UI BUT IT IS KEPT FOR FUTURE USE )
export const VOICE_MODELS = [
  {
    id: "gpt-4o-mini-realtime-preview",
    label: "GPT-4o mini realtime preview",
    provider: "openai",
  },
];

export type SubscriptionTier = "free" | "pro" | "premium";

/**
 * Allowed models per subscription tier
 * Based on backend API allowed_models configuration
 */
export const ALLOWED_MODELS_BY_TIER: Record<SubscriptionTier, string[]> = {
  free: ["integri",
    "gpt-4o-mini",
    "gpt-5-nano",
    "gpt-4o-mini-search-preview",
    "gpt-4o-mini-deep-research",
    "gpt-4.1-nano",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "grok-3-mini",
    "grok-4-1-fast-reasoning",
    "grok-4-1-fast-non-reasoning",
    "grok-4-fast-reasoning",
    "grok-4-fast-non-reasoning",
    "claude-haiku-3",
    "deepseek-reasoner",
    "deepseek-chat",
    "mistral-medium-2505",
    "glm-4.6",
    "glm-4.7",
    "gpt-3.5-turbo",
    "perplexity-sonar",
    "sonar-reasoning",
    "gpt-5.2",
    "gpt-5.1",
    "claude-haiku-4.5",
    "gemini-3-flash-preview"],
  premium: [
    "integri",
    "gpt-4o-mini",
    "gpt-5-nano",
    "gpt-4o-mini-search-preview",
    "gpt-4o-mini-deep-research",
    "gpt-4.1-nano",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "grok-3-mini",
    "grok-4-1-fast-reasoning",
    "grok-4-1-fast-non-reasoning",
    "grok-4-fast-reasoning",
    "grok-4-fast-non-reasoning",
    "claude-haiku-3",
    "deepseek-reasoner",
    "deepseek-chat",
    "mistral-medium-2505",
    "glm-4.6",
    "glm-4.7",
    "gpt-3.5-turbo",
    "perplexity-sonar",
    "sonar-reasoning",
    "gpt-5.2",
    "gpt-5.1",
    "claude-haiku-4.5",
    "gemini-3-flash-preview",
  ],
  pro: [
    "integri",
    "gpt-4o-mini",
    "gpt-5-nano",
    "gpt-4o-mini-search-preview",
    "gpt-4o-mini-deep-research",
    "gpt-4.1-nano",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "grok-3-mini",
    "grok-4-1-fast-reasoning",
    "grok-4-1-fast-non-reasoning",
    "grok-4-fast-reasoning",
    "grok-4-fast-non-reasoning",
    "claude-haiku-3",
    "deepseek-reasoner",
    "deepseek-chat",
    "mistral-medium-2505",
    "glm-4.6",
    "glm-4.7",
    "gpt-3.5-turbo",
    "perplexity-sonar",
    "sonar-reasoning",
    "gpt-5.2",
    "gpt-5.1",
    "claude-haiku-4.5",
    "gemini-3-flash-preview",
  ],
};

/**
 * Get allowed model IDs for a given subscription tier
 */
export const getAllowedModelIds = (tier: SubscriptionTier): string[] => {
  return ALLOWED_MODELS_BY_TIER[tier] || ALLOWED_MODELS_BY_TIER.free;
};

/**
 * Window/Lane limits for Multi-Chat (Playground)
 */
export const MULTI_CHAT_LIMITS: Record<SubscriptionTier, number> = {
  free: 2,
  premium: 4,
  pro: 6,
};

/**
 * Get available models filtered by subscription tier
 */
export const getAvailableModelsByTier = (tier: SubscriptionTier) => {
  return AVAILABLE_MODELS.filter((model) => {
    if (tier === "pro") return model.isPro;
    if (tier === "premium") return model.isPremium;
    return model.isFree;
  });
};

// ─── Dynamic model resolution ────────────────────────────────────────────────
// Mirrors the mobile app (AiAgentsScreenController): the server's
// `allowed_models` from /me/limits is the source of truth, and ids that the
// hardcoded catalog doesn't know yet get a derived label/provider/logo instead
// of being dropped.

export interface ModelConfig {
  id: string;
  label: string;
  provider: string;
  alt_provider?: string;
  badge?: string;
  light_theme_logo: string;
  dark_theme_logo: string;
  isPro: boolean;
  isPremium: boolean;
  isFree: boolean;
}

/** Models hidden from pickers (tool-style models / deprecated). */
export const HIDDEN_PICKER_MODEL_IDS = [
  "gpt-4o-mini-search-preview",
  "gpt-4o-mini-deep-research",
  "gpt-3.5-turbo",
];

const PROVIDER_LOGOS: Record<string, { light: string; dark: string }> = {
  openai: { light: "/light-theme-openai.png", dark: "/dark-theme-openai.png" },
  gemini: { light: "/gemini.png", dark: "/gemini.png" },
  grok: { light: "/light-theme-grok.png", dark: "/dark-theme-grok.png" },
  claude: { light: "/claude.png", dark: "/claude.png" },
  deepseek: { light: "/deepseek.png", dark: "/deepseek.png" },
  perplexity: { light: "/perplexity.png", dark: "/perplexity.png" },
  mistral: { light: "/mistral.png", dark: "/mistral.png" },
  glm: { light: "/zai.png", dark: "/zai.png" },
};

/** Curated labels for ids the app knows but the web catalog may not. */
const KNOWN_MODEL_LABELS: Record<string, string> = {
  "gpt-5-mini": "GPT-5 Mini",
  "gpt-4.1": "GPT-4.1",
  "gpt-4.1-mini": "GPT-4.1 Mini",
  o3: "O3",
  "o3-mini": "O3 Mini",
  "claude-opus-4-8": "Claude Opus 4.8",
  "claude-opus-4-6": "Claude Opus 4.6",
  "claude-opus-4-5": "Claude Opus 4.5",
  "claude-sonnet-4-6": "Claude Sonnet 4.6",
  "claude-sonnet-4-5": "Claude Sonnet 4.5",
  "claude-sonnet-4": "Claude Sonnet 4",
  "glm-5": "GLM-5",
  "glm-5.1": "GLM-5.1",
  "glm-5.2": "GLM-5.2",
};

const providerForModelId = (id: string): string => {
  const l = id.toLowerCase();
  if (l === "integri") return "openai";
  if (l.startsWith("gpt") || l.startsWith("chatgpt") || /^o\d/.test(l)) return "openai";
  if (l.startsWith("gemini")) return "gemini";
  if (l.startsWith("grok")) return "grok";
  if (l.startsWith("claude")) return "claude";
  if (l.startsWith("deepseek")) return "deepseek";
  if (l.includes("sonar") || l.includes("perplexity")) return "perplexity";
  if (l.startsWith("mistral")) return "mistral";
  if (l.startsWith("glm")) return "glm";
  if (l.startsWith("kimi")) return "kimi";
  if (l.startsWith("moonshot")) return "moonshot";
  return "openai";
};

const prettifyModelId = (id: string): string =>
  id
    .split(/[-_]/)
    .map((part) => {
      if (!part) return part;
      const lower = part.toLowerCase();
      if (lower === "gpt" || lower === "glm" || lower === "ocr") return part.toUpperCase();
      if (/^o\d+$/.test(lower)) return part.toUpperCase();
      if (/^[0-9]/.test(part)) return part;
      return part[0].toUpperCase() + part.slice(1);
    })
    .join(" ");

/**
 * Returns the catalog entry for `id`, or a derived config for ids the catalog
 * doesn't know (e.g. a model newly enabled on the backend).
 */
export const resolveModel = (id: string | null | undefined): ModelConfig => {
  // Records without a model (e.g. some agents) fall back to Integri.
  if (!id) id = "integri";
  const known = (AVAILABLE_MODELS as ModelConfig[]).find((m) => m.id === id);
  if (known) return known;
  const provider = providerForModelId(id);
  const logo = PROVIDER_LOGOS[provider] ?? {
    light: "/light-theme-logo.png",
    dark: "/dark-theme-logo.png",
  };
  return {
    id,
    label: KNOWN_MODEL_LABELS[id] ?? prettifyModelId(id),
    provider,
    light_theme_logo: logo.light,
    dark_theme_logo: logo.dark,
    isPro: true,
    isPremium: true,
    isFree: true,
  };
};

/**
 * Turns the server's `allowed_models` into display configs: de-duplicated,
 * deprecated ids removed, and `integri` always first.
 */
export const resolveAllowedModels = (allowed: string[]): ModelConfig[] => {
  const seen = new Set<string>();
  const out: ModelConfig[] = [];
  for (const raw of allowed) {
    const id = raw?.trim();
    if (!id || id === "gpt-3.5-turbo" || seen.has(id)) continue;
    seen.add(id);
    out.push(resolveModel(id));
  }
  if (!seen.has("integri")) out.unshift(resolveModel("integri"));
  return out;
};

export const SUBSCRIPTION_PLANS = [
  {
    id: "Monthly Pro Subscription",
    name: "Integri Pro Monthly",
    description: "Advanced AI for daily productivity.",
    priceMonthly: 11.99,
    priceYearly: 11.99,
    tier: "pro" as SubscriptionTier,
    features: [
      "GPT-4o & Claude 3.5 Sonnet",
      "Unlimited Chat History",
      "Standard Voice Mode",
      "Standard Image Generation",
      "Priority Email Support",
    ],
    isPopular: false,
    buttonText: "Go Pro",
  },
  {
    id: "Annual Pro Subscription",
    name: "Integri Pro Annual",
    description: "Best value for consistent power.",
    priceMonthly: 12.0,
    priceYearly: 144.0,
    tier: "pro" as SubscriptionTier,
    features: [
      "Everything in Pro Monthly",
      "Save 17% vs Monthly",
      "Priority Support",
    ],
    isPopular: true,
    buttonText: "Subscribe Yearly",
  },
  {
    id: "Monthly Premium Subscription",
    name: "Integri Premium Monthly",
    description: "Next-gen models and ultimate limits.",
    priceMonthly: 6.99,
    priceYearly: 6.99,
    tier: "premium" as SubscriptionTier,
    features: [
      "Everything in Pro",
      "GPT-5 / o1-preview Access",
      "Advanced Real-time Voice",
      "HD Image Generation",
      "10x Higher File Limits",
    ],
    isPopular: true,
    buttonText: "Go Premium",
  },
  {
    id: "Annual Premium Subscription",
    name: "Integri Premium Annual",
    description: "The ultimate AI experience.",
    priceMonthly: 23.25,
    priceYearly: 279.0,
    tier: "premium" as SubscriptionTier,
    features: [
      "Everything in Premium Monthly",
      "Early access to Beta features",
      "Best long-term value",
    ],
    isPopular: false,
    buttonText: "Get Premium Yearly",
  },
];
export const SUBSCRIPTION_FAQS = [
  {
    question: "Can I cancel my subscription at any time?",
    answer:
      "Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period.",
  },
  {
    question: "Is there a discount for yearly payment?",
    answer:
      "Yes! You save roughly 17% compared to monthly billing when you choose the annual plan.",
  },
];

export const COUNTRIES = [
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "Canada", code: "CA" },
  { name: "Australia", code: "AU" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "India", code: "IN" },
  { name: "Pakistan", code: "PK" },
  { name: "China", code: "CN" },
  { name: "Japan", code: "JP" },
  { name: "Brazil", code: "BR" },
  { name: "Mexico", code: "MX" },
  { name: "Russia", code: "RU" },
  { name: "South Africa", code: "ZA" },
  { name: "Italy", code: "IT" },
  { name: "Spain", code: "ES" },
  { name: "Netherlands", code: "NL" },
  { name: "Sweden", code: "SE" },
  { name: "Switzerland", code: "CH" },
  { name: "Argentina", code: "AR" },
  { name: "New Zealand", code: "NZ" },
  { name: "Singapore", code: "SG" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "Afghanistan", code: "AF" },
  { name: "Turkey", code: "TR" },
  { name: "Romania", code: "RO" },
  { name: "Serbia", code: "RS" },
  { name: "Somalia", code: "SO" },
  { name: "Portugal", code: "PT" },
  { name: "Iran", code: "IR" },
  { name: "Hungary", code: "HU" },
  { name: "Ukraine", code: "UA" },
  { name: "Bulgaria", code: "BG" },
  { name: "Albania", code: "AL" },
  { name: "Armenia", code: "AM" },
  { name: "Georgia", code: "GE" },
  { name: "Greece", code: "GR" },
];

// Structured Language List with Codes and Flags
export const LANGUAGES = [
  {
    name: "عربي",
    code: "ar",
    flag: "🇸🇦",
  }, // Arabic (Saudi Arabia)
  {
    name: "English",
    code: "en",
    flag: "🇺🇸",
  }, // English (United States)
  {
    name: "Deutsch",
    code: "de",
    flag: "🇩🇪",
  }, // German (Germany)
  {
    name: "Nederlands",
    code: "nl",
    flag: "🇳🇱",
  }, // Dutch (Netherlands)
  {
    name: "Français",
    code: "fr",
    flag: "🇫🇷",
  }, // French (France)
  {
    name: "Magyar",
    code: "hu",
    flag: "🇭🇺",
  }, // Hungarian (Hungary)
  {
    name: "فارسی",
    code: "fa",
    flag: "🇮🇷",
  }, // Persian (Iran)
  {
    name: "اردو",
    code: "ur",
    flag: "🇵🇰",
  }, // Urdu (Pakistan)
  {
    name: "Українська",
    code: "uk",
    flag: "🇺🇦",
  }, // Ukrainian (Ukraine)
  {
    name: "پښتو",
    code: "ps",
    flag: "🇦🇫",
  }, // Pashto (Afghanistan)
  {
    name: "دری",
    code: "fd", // Or 'prs' depending on backend requirement
    flag: "🇦🇫",
  }, // Dari (Afghanistan)
  {
    name: "Türkçe",
    code: "tr",
    flag: "🇹🇷",
  }, // Turkish (Turkey)
  {
    name: "Română",
    code: "ro",
    flag: "🇷🇴",
  }, // Romanian (Romania)
  {
    name: "Русский",
    code: "ru",
    flag: "🇷🇺",
  }, // Russian (Russia)
  {
    name: "Español",
    code: "es",
    flag: "🇪🇸",
  }, // Spanish (Spain)
  {
    name: "Српски",
    code: "sr",
    flag: "🇷🇸",
  }, // Serbian (Serbia)
  {
    name: "Soomaali",
    code: "so",
    flag: "🇸🇴",
  }, // Somali (Somalia)
  {
    name: "Svenska",
    code: "sv",
    flag: "🇸🇪",
  }, // Swedish (Sweden)
  {
    name: "Português",
    code: "pt",
    flag: "🇵🇹",
  }, // Portuguese (Portugal)
  {
    name: "Português (Brasil)",
    code: "pt-BR", // Usually same code, handled by region if needed, or 'pt-BR'
    flag: "🇧🇷",
  }, // Portuguese (Brazil)
  {
    name: "中文 (简体)",
    code: "zh",
    flag: "🇨🇳",
  }, // Chinese Simplified (China)
  {
    name: "中文 (繁體)",
    code: "zh-TW", // Often 'zh-TW'
    flag: "🇹🇼",
  }, // Chinese Traditional (Taiwan)
  {
    name: "한국어",
    code: "ko",
    flag: "🇰🇷",
  }, // Korean (South Korea)
  {
    name: "日本語",
    code: "ja",
    flag: "🇯🇵",
  }, // Japanese (Japan)
  {
    name: "Български",
    code: "bg",
    flag: "🇧🇬",
  }, // Bulgarian (Bulgaria)
  {
    name: "Shqip",
    code: "sq",
    flag: "🇦🇱",
  }, // Albanian (Albania)
  {
    name: "Հայերեն",
    code: "hy",
    flag: "🇦🇲",
  }, // Armenian (Armenia)
  {
    name: "ქართული",
    code: "ka",
    flag: "🇬🇪",
  }, // Georgian (Georgia)
  {
    name: "Italiano",
    code: "it",
    flag: "🇮🇹",
  }, // Italian (Italy)
  {
    name: "Ελληνικά",
    code: "el",
    flag: "🇬🇷",
  }, // Greek (Greece)
];

// --- PRO WHITELIST ---
// Users who automatically get Pro subscription without payment
// Email is required, uid is optional (can be omitted if not available)
export interface ProWhitelistUser {
  email: string; // Required - user's email address
  uid?: string; // Optional - Firebase UID (can be omitted)
}

export const PRO_WHITELIST: ProWhitelistUser[] = [
  // Add whitelisted users here
  { email: "ningagamerz456@gmail.com" }, // uid is optional
  { email: "javaidshahana@gmail.com" },
  { email: "rajausama8421@gmail.com" },
  { email: "ttaurus57@gmail.com" },
];

// --- PREMIUM WHITELIST ---
// Users who automatically get Premium subscription without payment
// Email is required, uid is optional (can be omitted if not available)
export interface PremiumWhitelistUser {
  email: string; // Required - user's email address
  uid?: string; // Optional - Firebase UID (can be omitted)
}

export const PREMIUM_WHITELIST: PremiumWhitelistUser[] = [
  // Add whitelisted users here
  // Example:
  // { email: "user@example.com", uid: "optional-uid-here" },
  // { email: "another@example.com" }, // uid is optional
];

// Helper function to check if a user is whitelisted for Pro
export const isUserWhitelistedForPro = (
  email: string | null | undefined,
  uid: string | null | undefined
): boolean => {
  if (!email) return false;

  return PRO_WHITELIST.some((whitelistedUser) => {
    const emailMatch = whitelistedUser.email.toLowerCase() === email.toLowerCase();

    // If whitelist entry has no uid, match by email only
    if (!whitelistedUser.uid) {
      return emailMatch;
    }

    // If whitelist entry has uid, both email and uid must match
    if (whitelistedUser.uid && uid) {
      return emailMatch && whitelistedUser.uid === uid;
    }

    // If whitelist entry has uid but user doesn't, don't match
    return false;
  });
};

// Helper function to check if a user is whitelisted for Premium
export const isUserWhitelistedForPremium = (
  email: string | null | undefined,
  uid: string | null | undefined
): boolean => {
  if (!email) return false;

  return PREMIUM_WHITELIST.some((whitelistedUser: PremiumWhitelistUser) => {
    const emailMatch = whitelistedUser.email.toLowerCase() === email.toLowerCase();

    // If whitelist entry has no uid, match by email only
    if (!whitelistedUser.uid) {
      return emailMatch;
    }

    // If whitelist entry has uid, both email and uid must match
    if (whitelistedUser.uid && uid) {
      return emailMatch && whitelistedUser.uid === uid;
    }

    // If whitelist entry has uid but user doesn't, don't match
    return false;
  });
};

export default AVAILABLE_MODELS;
