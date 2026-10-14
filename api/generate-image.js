

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt, imageSize } = req.body || {};

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Please enter an image prompt."
      });
    }

    if (!process.env.FAL_KEY) {
      return res.status(500).json({
        error: "FAL_KEY is missing in Vercel environment variables."
      });
    }

    const response = await fetch(
      "https://fal.run/fal-ai/flux/schnell",
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${process.env.FAL_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          image_size: imageSize || "landscape_16_9",
          num_images: 1
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.detail || data.message || "Image generation failed."
      });
    }

    const imageUrl = data.images?.[0]?.url;

    if (!imageUrl) {
      return res.status(500).json({
        error: "No image URL returned by the API."
      });
    }

    return res.status(200).json({ imageUrl });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Something went wrong."
    });
  }
}
