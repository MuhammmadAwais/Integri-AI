const AVAILABLE_MODELS = [
  // --- OpenAI ---
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
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "google",
    badge: "Fast",
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash Lite",
    provider: "google",
  },

  // --- Anthropic ---
  {
    id: "claude-3.5-haiku",
    label: "Claude 3.5 Haiku",
    provider: "anthropic",
    badge: "Smart",
  },

  // --- xAI (Grok) ---
  {
    id: "grok-3-mini",
    label: "Grok 3 Mini",
    provider: "xai",
    badge: "Uncensored",
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

export default AVAILABLE_MODELS;
