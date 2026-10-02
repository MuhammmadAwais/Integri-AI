import {
  Bot,
  Code2,
  Compass,
  GraduationCap,
  HeartPulse,
  Megaphone,
  Microscope,
  Palette,
  PenLine,
  Scale,
  Sparkles,
  Target,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export interface AgentCategory {
  label: string;
  icon: LucideIcon;
  /** Base accent. Pastel on purpose: it is used as-is on dark surfaces and
      darkened with color-mix() for light mode (see AgentCard). */
  accent: string;
}

/**
 * Ordered: the first category whose keywords match wins, so narrower domains
 * (Legal, Finance) come before broad ones (Writing, Research).
 * Accents sit around the app's teal (#5EEAD4) and gold (#E0A858).
 */
const CATEGORIES: (AgentCategory & { keywords: RegExp })[] = [
  { label: "Strategy", icon: Target, accent: "#E0A858", keywords: /\b(swot|strateg\w*|business|startup|pitch|okr|market analysis|competitor\w*|consult\w*)\b/i },
  { label: "Legal", icon: Scale, accent: "#CBD5E1", keywords: /\b(legal|law\w*|contract\w*|compliance|gdpr|attorney|lawyer)\b/i },
  { label: "Finance", icon: Wallet, accent: "#FCD34D", keywords: /\b(financ\w*|budget\w*|invest\w*|tax\w*|accounting|crypto|stock\w*|money|expense\w*|cost)\b/i },
  { label: "Travel", icon: Compass, accent: "#7DD3FC", keywords: /\b(travel\w*|trip\w*|itinerar\w*|vacation|holiday|tour\w*|flight\w*|hotel\w*)\b/i },
  { label: "Health", icon: HeartPulse, accent: "#FDA4AF", keywords: /\b(health\w*|fitness|workout\w*|diet\w*|nutrition\w*|medical|wellness|yoga|meditat\w*)\b/i },
  { label: "Code", icon: Code2, accent: "#3DD68C", keywords: /\b(code|coding|coder|developer|programm\w*|debug\w*|sql|python|javascript|react|api|software|devops)\b/i },
  { label: "Marketing", icon: Megaphone, accent: "#F9A8D4", keywords: /\b(marketing|seo|social media|ads?|advert\w*|brand\w*|campaign\w*|copywrit\w*|growth)\b/i },
  { label: "Design", icon: Palette, accent: "#F0ABFC", keywords: /\b(design\w*|ui|ux|logo\w*|figma|illustrat\w*|art|creative)\b/i },
  { label: "Learning", icon: GraduationCap, accent: "#C4B5FD", keywords: /\b(tutor\w*|teach\w*|learn\w*|study|student\w*|quiz\w*|exam\w*|language\w*|grammar|homework|course\w*)\b/i },
  { label: "Writing", icon: PenLine, accent: "#5EEAD4", keywords: /\b(writ\w*|essay\w*|blog\w*|story|stories|email\w*|content|editor|proofread\w*|poem\w*|script\w*|letter\w*)\b/i },
  { label: "Research", icon: Microscope, accent: "#93C5FD", keywords: /\b(research\w*|analy\w*|summar\w*|data|insight\w*|report\w*|paper\w*)\b/i },
  { label: "Lifestyle", icon: Sparkles, accent: "#FDBA74", keywords: /\b(recipe\w*|cook\w*|food|fashion|life|lifestyle|relationship\w*|parent\w*|home|garden\w*|pet\w*|horoscope)\b/i },
];

export const DEFAULT_CATEGORY: AgentCategory = {
  label: "General",
  icon: Bot,
  accent: "#A1A1AA",
};

/** Agents carry no category field yet, so infer one from name + description. */
export function inferAgentCategory(name: string, description?: string): AgentCategory {
  const text = `${name} ${description ?? ""}`;
  // Name is the stronger signal: try it alone first.
  const byName = CATEGORIES.find((c) => c.keywords.test(name));
  const match = byName ?? CATEGORIES.find((c) => c.keywords.test(text));
  if (!match) return DEFAULT_CATEGORY;
  return { label: match.label, icon: match.icon, accent: match.accent };
}
