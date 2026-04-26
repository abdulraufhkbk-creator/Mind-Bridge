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

Respond ONLY in JSON format:

{
  "emotion": "",
  "risk_level": "",
  "response": ""
}

Emotion options: happy, sad, anxious, stressed, neutral
Risk level options: low, medium, high
            `
          },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return res.status(200).json(parsed);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "AI request failed" });
  }
}
