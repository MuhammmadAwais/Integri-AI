const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";

export const generateAIResponse = async (
  messages: { role: string; content: string }[],
  modelId: string = "gpt-4o"
) => {
  if (!API_KEY) {
    return new Promise((resolve) =>
      setTimeout(
        () =>
          resolve(
            "Please set your VITE_OPENAI_API_KEY in .env file to use the real AI."
          ),
        1000
      )
    );
  }

  // Map frontend model IDs to actual OpenAI model IDs
  // Note: Since we only have an OpenAI Key, we force everything to use OpenAI models
  // but we can tweak system prompts or max_tokens if needed.
  let actualModel = "gpt-4o";
  if (modelId === "gpt-4o-mini") actualModel = "gpt-4o-mini";
  // For "Claude" or "Llama", we still have to use GPT-4o with this key,
  // unless you have keys for Anthropic/Groq.
  // We will use gpt-4o as the engine for all to ensure it works.

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: actualModel,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "API Error");
    }

    return data.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return `Error: Unable to connect to ${modelId} service. Please check your connection or API key.`;
  }
};
