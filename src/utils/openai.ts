const API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";

export const generateAIResponse = async (
  messages: { role: string; content: string }[]
) => {
  if (!API_KEY) {
    // Fallback if no key provided (for testing)
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

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Using the model you requested
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
    return "I'm having trouble connecting to the galaxy server right now. Please try again.";
  }
};
