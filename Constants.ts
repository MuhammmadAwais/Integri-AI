
const AVAILABLE_MODELS = [
  // OpenAI Models
  { id: "gpt-5.2", label: "GPT-5.2", provider: "openai", badge: "SOTA" },
  { id: "gpt-5.1", label: "GPT-5.1", provider: "openai", badge: "New" },
  { id: "gpt-5-mini", label: "GPT-5 Mini", provider: "openai", badge: "Fast" },
  { id: "gpt-4o", label: "GPT-4o", provider: "openai" },

  // Anthropic Models (CLAUDE)
  {
    id: "claude-opus-4.5",
    label: "Claude Opus 4.5",
    provider: "anthropic",
    badge: "Reasoning",
  },
  {
    id: "claude-sonnet-4.5",
    label: "Claude Sonnet 4.5",
    provider: "anthropic",
  },
  {
    id: "claude-haiku-4.5",
    label: "Claude Haiku 4.5",
    provider: "anthropic",
    badge: "Fast",
  },

  // Google Models
  {
    id: "gemini-3-pro",
    label: "Gemini 3 Pro",
    provider: "google",
    badge: "Multimodal",
  },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "google" },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "google",
    badge: "Fast",
  },

  // Meta / Open Source
  { id: "llama-4-scout", label: "Llama 4 Scout", provider: "meta" },
  { id: "llama-3.3-70b", label: "Llama 3.3 70B", provider: "meta" },
];

export default AVAILABLE_MODELS;