/**
 * Per-route SEO metadata for the static marketing pages.
 *
 * Ported from the Vercel edge function api/home-preview.ts. On Vercel these
 * pages were rendered on demand for crawler User-Agents; Firebase Hosting
 * cannot match on User-Agent, and none of this content is dynamic, so it is
 * baked into real static HTML files at build time by prerender-seo.mjs.
 *
 * `route` is the Hosting path. "" is the site root (dist/index.html); every
 * other route is written to dist/<route>/index.html, which Hosting serves as
 * that path's directory index.
 */

export const CANONICAL_ORIGIN = "https://www.integri.app";

export const pages = [
  {
    route: "",
    title: "Integri AI - Custom AI Agents, Chatbots & All Models in One Place",
    description:
      "Chat with GPT-4o, Claude 3.5, Gemini 1.5, Grok, DeepSeek, Mistral and more. Build custom AI agents, analyze PDFs, generate images, use voice AI - all in one unified AI platform.",
    h1: "Integri AI - All AI Models in One Place",
    sections: [
      { heading: "Chat with Any AI Model", body: "Switch seamlessly between OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Google Gemini 1.5 Pro, xAI Grok, DeepSeek, and Mistral. Compare responses and manage all your AI conversations in one place." },
      { heading: "Custom AI Agents", body: "Build and deploy custom AI agents tailored to your workflow. Create specialized assistants for email crafting, document analysis, cost-of-living calculations, and more." },
      { heading: "Voice AI", body: "Talk to any AI model using real-time voice chat. Natural spoken conversations with your choice of language model, hands-free." },
      { heading: "PDF Analysis & Document Chat", body: "Upload any PDF and chat with its contents. Ask questions, get summaries, extract key information, and analyze documents using AI-powered comprehension." },
      { heading: "AI Image Generation", body: "Generate stunning images from text prompts using state-of-the-art image generation models, all from within the Integri AI platform." },
      { heading: "AI News & Blog", body: "Stay up to date with the latest developments in artificial intelligence. Curated AI news and in-depth articles on AI trends, model releases, and research breakthroughs." },
    ],
  },
  {
    route: "agents",
    title: "AI Agents - Build & Deploy Custom AI Assistants | Integri AI",
    description:
      "Create, customize, and share AI agents with Integri AI. Use pre-built system agents for email crafting, document analysis, and more - or build your own no-code AI assistant.",
    h1: "Custom AI Agents",
    sections: [
      { heading: "Pre-built System Agents", body: "Get started instantly with built-in agents: Email Crafter for professional emails, Document Explainer for summarizing complex files, and Cost of Living Analyzer for financial comparisons." },
      { heading: "Build Your Own Agent", body: "Create specialized AI assistants with a custom system prompt, name, and description. Choose from any supported AI model as the agent's brain." },
      { heading: "Share & Discover", body: "Publish your agents to the Integri AI community. Discover agents built by other users and add them to your workspace with one click." },
    ],
  },
  {
    route: "subscriptions",
    title: "Pricing & Plans - Integri AI",
    description:
      "Flexible pricing plans for individuals and teams. Start free and upgrade for access to GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, and all premium AI models on Integri AI.",
    h1: "Pricing & Subscription Plans",
    sections: [
      { heading: "Free Plan", body: "Access a curated set of AI models at no cost. Perfect for casual users exploring AI chat, PDF analysis, and basic agent use." },
      { heading: "Premium Plan", body: "Unlock all major models including GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, Grok, DeepSeek, and Mistral. Includes higher message limits, voice AI, and image generation." },
      { heading: "Teams", body: "Collaborative features for teams. Shared agent libraries, usage dashboards, and priority support." },
    ],
  },
  {
    route: "help",
    title: "Help Center - Integri AI",
    description:
      "Find answers to frequently asked questions about Integri AI. Learn how to use AI models, build agents, analyze PDFs, generate images, and manage your account.",
    h1: "Help Center",
    sections: [
      { heading: "Getting Started", body: "Learn how to sign up, choose an AI model, and start your first conversation. Integri AI works in your browser with no installation required." },
      { heading: "Using AI Models", body: "Understand how to switch between GPT-4o, Claude, Gemini, Grok, DeepSeek, and Mistral. Learn about message limits and model capabilities." },
      { heading: "AI Agents", body: "How to create, edit, and use custom AI agents. Discover system agents and community-shared agents." },
      { heading: "PDF & Document Chat", body: "How to upload PDFs and start a conversation. File size limits, supported formats, and tips for best results." },
    ],
  },
  {
    route: "news",
    title: "AI News - Latest Artificial Intelligence Updates | Integri AI",
    description:
      "Read the latest AI news curated by Integri AI. Stay informed about new model releases, research breakthroughs, AI company updates, and industry developments.",
    h1: "AI News",
    sections: [
      { heading: "Model Releases & Updates", body: "Breaking news on new language model releases from OpenAI, Anthropic, Google DeepMind, xAI, Mistral, DeepSeek and other leading AI labs." },
      { heading: "Research Breakthroughs", body: "Summaries of significant AI research papers and scientific advances in machine learning, reasoning, multimodal AI, and alignment." },
      { heading: "Industry Updates", body: "News on AI policy, regulation, funding rounds, acquisitions, and major company announcements from across the AI industry." },
    ],
  },
  {
    route: "blog",
    title: "Blog - AI Insights, Guides & Analysis | Integri AI",
    description:
      "In-depth articles on artificial intelligence. AI model comparisons, how-to guides, opinion pieces, and analysis of trends shaping the future of AI.",
    h1: "Integri AI Blog",
    sections: [
      { heading: "Model Comparisons", body: "Side-by-side comparisons of GPT-4o vs Claude vs Gemini and other leading AI models. Benchmarks, strengths, weaknesses, and use-case recommendations." },
      { heading: "How-To Guides", body: "Step-by-step tutorials on prompt engineering, building AI agents, analyzing documents with AI, and getting the most out of your AI tools." },
      { heading: "AI Trends & Analysis", body: "Expert analysis of where AI is heading. Long-form pieces on AI safety, AGI timelines, multimodal models, and the AI landscape." },
    ],
  },
  {
    route: "playground",
    title: "AI Playground - Experiment with Any AI Model | Integri AI",
    description:
      "Test and experiment with AI models in a clean, distraction-free environment. Compare model outputs, fine-tune prompts, and explore AI capabilities on the Integri AI Playground.",
    h1: "AI Model Playground",
    sections: [
      { heading: "Multi-Model Experimentation", body: "Switch between GPT-4o, Claude, Gemini, Grok, DeepSeek, and Mistral in seconds. Test the same prompt across multiple models to find the best output." },
      { heading: "Advanced Prompt Control", body: "Adjust temperature, system prompts, and model parameters. Build and test complex prompt structures for specialized use cases." },
    ],
  },
  {
    route: "voice",
    title: "Voice AI - Talk to Any AI Model | Integri AI",
    description:
      "Use real-time voice chat to converse with any AI model on Integri AI. Natural spoken conversations with GPT-4o, Claude, Gemini, and more - completely hands-free.",
    h1: "Voice AI Chat",
    sections: [
      { heading: "Real-Time Voice Conversations", body: "Speak naturally and get instant AI responses. Integri AI's voice feature supports low-latency, real-time conversation with any supported language model." },
      { heading: "Choose Your AI Model", body: "Pick any model - GPT-4o, Claude, Gemini, Grok, or others - as the voice behind your conversation. Switch models without losing context." },
    ],
  },
  {
    route: "pdf",
    title: "PDF Chat - Analyze Documents with AI | Integri AI",
    description:
      "Upload any PDF and have an AI-powered conversation with its contents. Ask questions, get summaries, extract key facts, and analyze documents instantly with Integri AI.",
    h1: "PDF & Document Analysis",
    sections: [
      { heading: "Chat with Any PDF", body: "Upload research papers, contracts, reports, or any PDF. Ask natural language questions and get precise, cited answers from the document." },
      { heading: "AI-Powered Summaries", body: "Get instant summaries of long documents. Extract key insights, action items, or main arguments in seconds." },
    ],
  },
  {
    route: "imageGen",
    title: "AI Image Generation - Create Images from Text | Integri AI",
    description:
      "Generate stunning images from text prompts with Integri AI. Create artwork, illustrations, product visuals, and more using state-of-the-art AI image generation models.",
    h1: "AI Image Generation",
    sections: [
      { heading: "Text-to-Image Generation", body: "Describe any image and watch AI bring it to life. Generate photorealistic images, digital art, illustrations, icons, and more." },
      { heading: "Multiple Generation Models", body: "Access a range of image generation models within Integri AI. Choose the model that best fits your style, quality, and speed requirements." },
    ],
  },
];
