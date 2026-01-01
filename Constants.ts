const AVAILABLE_MODELS = [
  // --- Integri ---
  {
    id: "integri",
    label: "Integri",
    provider: "openai",
    alt_provider: "integri",
  },

  // --- OpenAI ---
  {
    id: "gpt-5.2",
    label: "GPT-5.2",
    provider: "openai",
    badge: "New",
  },
  {
    id: "gpt-5.1",
    label: "GPT-5.1",
    provider: "openai",
    badge: "New",
  },
  {
    id: "gpt-5-mini",
    label: "GPT-5 Mini",
    provider: "openai",
    badge: "New",
  },
  {
    id: "gpt-5-nano",
    label: "GPT-5 Nano",
    provider: "openai",
    badge: "Fast",
  },
  {
    id: "gpt-4o-mini",
    label: "GPT-4o Mini",
    provider: "openai",
  },
  {
    id: "gpt-4.1-nano",
    label: "GPT-4.1 Nano",
    provider: "openai",
    badge: "Efficient",
  },
  {
    id: "gpt-3.5-turbo",
    label: "GPT-3.5 turbo",
    provider: "openai",
    badge: "Efficient",
  },
  {
    id: "gpt-4o-mini-search-preview",
    label: "gpt-4o mini-search-preview",
    provider: "openai",
    badge: "Efficient",
  },
  {
    id: "gpt-4o-mini-deep-research",
    label: "GPT-4o mini-deep-research",
    provider: "openai",
    badge: "Efficient",
  },

  // --- Google ---
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "gemini" },

  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    provider: "gemini",
  },
  {
    id: "gemini-3-flash-preview",
    label: "Gemini 3 flash-preview",
    provider: "gemini",
  },

  // --- Grok ---
  {
    id: "grok-3-mini",
    label: "Grok 3 Mini",
    provider: "grok",
    badge: "Uncensored",
  },
  {
    id: "grok-4-1-fast-reasoning",
    label: "Grok 4-1 fast reasoning",
    provider: "grok",
    badge: "Uncensored",
  },
  {
    id: "grok-4-1-fast-non-reasoning",
    label: "Grok 4-1 non reasoning",
    provider: "grok",
    badge: "Uncensored",
  },
  {
    id: "grok-4-fast-reasoning",
    label: "Grok 4 fast reasoning",
    provider: "grok",
    badge: "Uncensored",
  },
  {
    id: "grok-4-fast-non-reasoning",
    label: "Grok 4 fast non reasoning",
    provider: "grok",
    badge: "Uncensored",
  },

  // --- Claude ---
  {
    id: "claude-3.5-haiku",
    label: "Claude Instant 100k",
    provider: "claude",
  },
  {
    id: "claude-haiku-3",
    label: "Claude haiku 3",
    provider: "claude",
  },
  // --- DeepSeek ---
  {
    id: "deepseek-reasoner",
    label: "DeepSeek Reasoner",
    provider: "deepseek",
    badge: "Reasoning",
  },
  {
    id: "deepseek-chat",
    label: "DeepSeek Chat",
    provider: "deepseek",
  },

  // --- Perplexity ---
  {
    id: "perplexity-sonar",
    label: "Perplexity Sonar",
    provider: "perplexity",
    badge: "Search",
  },
  {
    id: "sonar-reasoning",
    label: "Sonar Reasoning",
    provider: "perplexity",
    badge: "Search",
  },

  // --- Mistral ---
  {
    id: "mistral-medium-2505",
    label: "Mistral Medium",
    provider: "mistral",
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
    isPopular: true,
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
    isPopular: false,
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
    question: "What happens if I hit my query limit?",
    answer:
      "On the Starter plan, you will need to wait until the next day for your limit to reset. Pro users enjoy unlimited queries.",
  },
  {
    question: "Is there a discount for yearly payment?",
    answer:
      "Yes! You save roughly 20% compared to monthly billing when you choose the annual plan.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 7-day money-back guarantee if you are not satisfied with the Pro plan capabilities.",
  },
];


export default AVAILABLE_MODELS;
