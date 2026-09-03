const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const router = express.Router();


const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function generateStreamWithRetry(model, prompt, maxAttempts = 4) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await model.generateContentStream(prompt);
    } catch (error) {
      const retryable = [429, 500, 502, 503, 504].includes(error.status);

      if (!retryable || attempt === maxAttempts - 1) {
        throw error;
      }

      const backoff = Math.min(16000, 1000 * 2 ** attempt);
      const jitter = Math.floor(Math.random() * 500);

      console.log(
        `Gemini request failed; retrying in ${backoff + jitter}ms`
      );

      await wait(backoff + jitter);
    }
  }

  throw new Error("Gemini request failed after all retries.");
}


router.post("/stream", async (req, res) => {
  const { prompt } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "A prompt is required." });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = gemini.getGenerativeModel({
      model: process.env.GEMINI_MODEL,
    });

    const result = await generateStreamWithRetry(model, prompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();

      if (text) {
        res.write(`data: ${JSON.stringify(text)}\n\n`);
      }
    }

    res.write("event: done\ndata: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Gemini stream failed:", error);
    res.write(`event: error\ndata: ${JSON.stringify("AI request failed.")}\n\n`);
    res.end();
  }
});

module.exports = router;