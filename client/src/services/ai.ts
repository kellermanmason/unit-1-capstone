export async function streamAIResponse(
  prompt: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch("http://localhost:3000/api/ai/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok || !response.body) {
    throw new Error("The AI request failed.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const eventType =
        event.match(/^event:\s*(.+)$/m)?.[1] ?? "message";
      const dataLine = event
        .split("\n")
        .find((line) => line.startsWith("data:"));

      if (!dataLine) continue;

      const data = dataLine.replace(/^data:\s*/, "");

      if (eventType === "done" || data === "[DONE]") return;

      if (eventType === "error") {
        throw new Error(JSON.parse(data));
      }

      onChunk(JSON.parse(data));
    }
  }
}