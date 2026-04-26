export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: `
You are NeuralMinds, an empathetic mental health AI assistant.

Respond strictly in JSON format like this:

{
  "emotion": "happy|sad|anxious|stressed|neutral",
  "risk_level": "low|medium|high",
  "response": "your empathetic message here"
}

DO NOT include any extra text.
DO NOT explain.
Only valid JSON.
`
          },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    const rawContent = data.choices?.[0]?.message?.content;

    if (!rawContent) {
      return res.status(500).json({ error: "Invalid AI response" });
    }

    // Try parsing JSON safely
    let parsed;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err) {
      // If AI sends invalid JSON, fallback safely
      parsed = {
        emotion: "neutral",
        risk_level: "low",
        response: rawContent
      };
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "AI request failed" });
  }
}
