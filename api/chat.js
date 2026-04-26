const fetch = require("node-fetch");

module.exports = async function (req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY missing" });
    }

    const { message } = req.body;

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
            content: "You are a helpful mental health assistant."
          },
          { role: "user", content: message }
        ]
      })
    });

    const text = await response.text();

    return res.status(200).json({
      groqStatus: response.status,
      groqRawResponse: text.substring(0, 500)
    });

  } catch (error) {
    return res.status(500).json({
      serverError: error.message
    });
  }
};
