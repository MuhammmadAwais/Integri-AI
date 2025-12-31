const AVAILABLE_MODELS = [
  // --- Integri ---
  { id: "integri",
    label: "Integri",
    provider: "openai",
    alt_provider : "integri"
   },

  // --- OpenAI ---
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

  // --- Google ---
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "gemini" },

  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    provider: "gemini",
  },

  // --- Grok ---
  {
    id: "grok-3-mini",
    label: "Grok 3 Mini",
    provider: "grok",
    badge: "Uncensored",
  },

  // --- Claude ---
  {
    id: "claude-3.5-haiku",
    label: "Claude Instant 100k",
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

  // --- Mistral ---
  {
    id: "mistral-medium-2505",
    label: "Mistral Medium",
    provider: "mistral",
  },
];



export const SUBSCRIPTION_PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "Essential tools for casual exploration.",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "Access to basic models",
      "Standard response speed",
      "50 queries per day",
      "Community support",
    ],
    isPopular: false,
    buttonText: "Current Plan",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Unlock full reasoning capabilities.",
    priceMonthly: 29,
    priceYearly: 290,
    features: [
      "Access to all Premium models",
      "Unlimited queries",
      "Fast reasoning speed",
      "Priority email support",
      "Early access to new features",
    ],
    isPopular: true,
    buttonText: "Upgrade to Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For teams requiring maximum scale.",
    priceMonthly: 99,
    priceYearly: 990,
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "SSO & Custom Security",
      "Custom model fine-tuning",
      "SLA Guarantees",
    ],
    isPopular: false,
    buttonText: "Contact Sales",
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
