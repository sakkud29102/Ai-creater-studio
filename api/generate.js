export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { topic, videoType, language, style } = req.body;

    if (!topic) {
      return res.status(400).json({
        error: "Please enter a video topic."
      });
    }

    const prompt = `
Write a YouTube ${videoType} script.

Topic: ${topic}
Language: ${language}
Style: ${style}

Make the script engaging, clear and interesting.
`;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || "OpenAI request failed"
      );
    }

    const script =
      data.choices?.[0]?.message?.content;

    return res.status(200).json({
      script
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
