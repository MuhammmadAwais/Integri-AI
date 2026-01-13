const AVAILABLE_MODELS = [
  // --- Integri ---
  {
    id: "integri",
    label: "Integri",
    provider: "openai",
    alt_provider: "integri",
    light_theme_logo: "/light-theme-logo.png",
    dark_theme_logo: "/dark-theme-logo.png",
    isPremium: false,
  },

  // --- OpenAI ---
  {
    id: "gpt-5.2",
    label: "GPT-5.2",
    provider: "openai",
    badge: "New",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPremium: true,
  },
  {
    id: "gpt-5.1",
    label: "GPT-5.1",
    provider: "openai",
    badge: "New",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPremium: true,
  },
  {
    id: "gpt-5-mini",
    label: "GPT-5 Mini",
    provider: "openai",
    badge: "New",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPremium: true,
  },
  {
    id: "gpt-5-nano",
    label: "GPT-5 Nano",
    provider: "openai",
    badge: "Fast",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPremium: true,
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "openai",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPremium: true,
  },
  {
    id: "gpt-4.1-nano",
    label: "GPT-4.1 Nano",
    provider: "openai",
    badge: "Efficient",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPremium: true,
  },
  {
    id: "gpt-3.5-turbo",
    label: "GPT-3.5 turbo",
    provider: "openai",
    badge: "Efficient",
    light_theme_logo: "/light-theme-openai.png",
    dark_theme_logo: "/dark-theme-openai.png",
    isPremium: true,
  },
  
  // --- Google ---
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "gemini",
    light_theme_logo: "/gemini.png",
    dark_theme_logo: "/gemini.png",
    isPremium: true,
  },
  
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    provider: "gemini",
    light_theme_logo: "/gemini.png",
    dark_theme_logo: "/gemini.png",
    isPremium: true,
  },
  {
    id: "gemini-3-flash-preview",
    label: "Gemini 3 flash-preview",
    provider: "gemini",
    light_theme_logo: "/gemini.png",
    dark_theme_logo: "/gemini.png",
    isPremium: true,
  },
  
  // --- Grok ---
  {
    id: "grok-3-mini",
    label: "Grok 3 Mini",
    provider: "grok",
    badge: "Uncensored",
    light_theme_logo: "/light-theme-grok.png",
    dark_theme_logo: "/dark-theme-grok.png",
    isPremium: true,
  },
  {
    id: "grok-4-1-fast-reasoning",
    label: "Grok 4-1 fast reasoning",
    provider: "grok",
    badge: "Uncensored",
    light_theme_logo: "/light-theme-grok.png",
    dark_theme_logo: "/dark-theme-grok.png",
    isPremium: true,
  },
  {
    id: "grok-4-1-fast-non-reasoning",
    label: "Grok 4-1 fast non reasoning",
    provider: "grok",
    badge: "Uncensored",
    light_theme_logo: "/light-theme-grok.png",
    dark_theme_logo: "/dark-theme-grok.png",
    isPremium: true,
  },
  {
    id: "grok-4-fast-reasoning",
    label: "Grok 4 fast reasoning",
    provider: "grok",
    badge: "Uncensored",
    light_theme_logo: "/light-theme-grok.png",
    dark_theme_logo: "/dark-theme-grok.png",
    isPremium: true,
  },
  {
    id: "grok-4-fast-non-reasoning",
    label: "Grok 4 fast non reasoning",
    provider: "grok",
    badge: "Uncensored",
    light_theme_logo: "/light-theme-grok.png",
    dark_theme_logo: "/dark-theme-grok.png",
    isPremium: true,
  },
  
  // --- Claude ---
  {
    id: "claude-3.5-haiku",
    label: "Claude Instant 100k",
    provider: "claude",
    light_theme_logo: "/claude.png",
    dark_theme_logo: "/claude.png",
    isPremium: true,
  },
  {
    id: "claude-haiku-3",
    label: "Claude haiku 3",
    provider: "claude",
    light_theme_logo: "/claude.png",
    dark_theme_logo: "/claude.png",
    isPremium: true,
  },
  // --- DeepSeek ---
  {
    id: "deepseek-reasoner",
    label: "DeepSeek Reasoner",
    provider: "deepseek",
    badge: "Reasoning",
    light_theme_logo: "/deepseek.png",
    dark_theme_logo: "/deepseek.png",
    isPremium: true,
  },
  {
    id: "deepseek-chat",
    label: "DeepSeek Chat",
    provider: "deepseek",
    light_theme_logo: "/deepseek.png",
    dark_theme_logo: "/deepseek.png",
    isPremium: true,
  },
  
  // --- Perplexity ---
  {
    id: "perplexity-sonar",
    label: "Perplexity Sonar",
    provider: "perplexity",
    badge: "Search",
    light_theme_logo: "/perplexity.png",
    dark_theme_logo: "/perplexity.png",
    isPremium: true,
  },
  
  // --- Mistral ---
  {
    id: "mistral-medium-2505",
    label: "Mistral Medium",
    provider: "mistral",
    light_theme_logo: "/mistral.png",
    dark_theme_logo: "/mistral.png",
    isPremium: true,
  },
];

export const VOICE_MODELS = [
  {
    id: "gpt-realtime",
    label: "GPT-realtime",
    provider: "openai",
    badge: "Fast",
  },
  {
    id: "gpt-4o-realtime-preview",
    label: "GPT-4o realtime preview",
    provider: "openai",
  },
  {
    id: "gpt-realtime-mini",
    label: "GPT-realtime mini",
    provider: "openai",
    badge: "Smart",
  },
  {
    id: "gpt-4o-mini-realtime-preview",
    label: "GPT-4o mini realtime preview",
    provider: "openai",
  },
];


export const SUBSCRIPTION_PLANS = [
  {
    id: "$rc_monthly", 
    name: "Monthly",
    description: "Flexible access, cancel anytime.",
    priceMonthly: 6.99,
    priceYearly: 6.99,
    features: [
      "Access to all AI models",
      "Unlimited chat history",
      "Standard support",
    ],
    isPopular: false,
    buttonText: "Subscribe Monthly",
  },
  {
    id: "$rc_six_month",
    name: "Semi-Annual",
    description: "Great value for 6 months.",
    priceMonthly: 34.99, 
    priceYearly: 34.99,
    features: [
      "Everything in Monthly",
      "Priority Support",
      "Save 17% vs Monthly",
    ],
    isPopular: false,
    buttonText: "Get 6 Months",
  },
  {
    id: "$rc_annual",
    name: "Annual",
    description: "Best value for long-term power.",
    priceMonthly: 62.99,
    priceYearly:62.99,
    features: [
      "Everything in Pro",
      "Early access to new features",
      "2 Months Free",
    ],
    isPopular: true,
    buttonText: "Subscribe Yearly",
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
      "Yes! You save roughly 20% compared to monthly billing when you choose the annual plan.",
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
    code: "pt", // Usually same code, handled by region if needed, or 'pt-BR'
    flag: "🇧🇷",
  }, // Portuguese (Brazil)
  {
    name: "中文 (简体)",
    code: "zh",
    flag: "🇨🇳",
  }, // Chinese Simplified (China)
  {
    name: "中文 (繁體)",
    code: "zh", // Often 'zh-TW'
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

export default AVAILABLE_MODELS;


