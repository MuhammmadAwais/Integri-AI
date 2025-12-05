import OpenAI from "openai";

// Safely access the API key
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

// Log a warning if missing, but DO NOT crash the app
if (!apiKey) {
  console.warn("VITE_OPENAI_API_KEY is missing. AI responses will fail.");
}

// Initialize OpenAI conditionally
let openai: OpenAI | null = null;

try {
  if (apiKey) {
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
}

export const generateAIResponse = async (
  messages: { role: string; content: string }[],
  model: string = "gpt-3.5-turbo"
  
): Promise<string> => {
  console.log("Generating AI response using model:", model);
  if (!openai) {
    return "Error: API Key is missing or invalid. Please check your Vercel/Environment settings.";
  }

  try {
    const apiMessages = messages.map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
      content: msg.content,
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || "No response received.";
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    return `Error generating response: ${error.message || "Unknown error"}`;
  }
};
