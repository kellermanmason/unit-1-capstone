import { useState } from "react";
import type { FormEvent } from "react";
import "./AIAssistantPage.css";

type HistoryItem = {
  prompt: string;
  answer: string;
};

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function AIAssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setError("Please enter a prompt before submitting.");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setError("");
    setResponse("");

    let fullText = "";
    let buffer = "";

    function processEvent(eventText: string) {
      const data = eventText
        .split(/\r?\n/)
        .filter((line) => line.startsWith("data:"))
        .map((line) => line.replace(/^data:\s*/, ""))
        .join("")
        .trim();

      if (!data || data === "[DONE]") return;

      try {
        const parsed: unknown = JSON.parse(data);
        let text = "";

        if (typeof parsed === "string") {
          text = parsed;
        } else if (parsed && typeof parsed === "object") {
          const candidateResponse = parsed as {
            candidates?: Array<{
              content?: {
                parts?: Array<{ text?: string }>;
              };
            }>;
          };

          text =
            candidateResponse.candidates?.[0]?.content?.parts
              ?.map((part) => part.text || "")
              .join("") || "";
        }

        if (text) {
          fullText += text;
          setResponse(fullText);
        }
      } catch (parseError) {
        console.warn("Unable to parse AI stream event:", parseError);
      }
    }

    try {
      const result = await fetch(`${BACKEND_URL}/api/ai/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
        }),
      });

      if (!result.ok) {
        const errorBody = await result.json().catch(() => null);

        throw new Error(
          errorBody?.error || `Server error: ${result.status}`,
        );
      }

      if (!result.body) {
        throw new Error("The AI service returned no stream.");
      }

      const reader = result.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || "";

        events.forEach(processEvent);
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        processEvent(buffer);
      }

      if (!fullText.trim()) {
        throw new Error("The AI service returned no text.");
      }

      setHistory((currentHistory) =>
        [
          {
            prompt: trimmedPrompt,
            answer: fullText,
          },
          ...currentHistory,
        ].slice(0, 3),
      );

      setPrompt("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to contact the AI assistant.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="ai-assistant-page">
      <section className="ai-assistant-shell">
        <img
          className="auth-logo"
          src="/spoonful-logo.png"
          alt="Spoonful"
        />

        <h1>AI Assistant</h1>

        <p className="ai-assistant-intro">
          Paste a recipe or ask a question. The assistant can summarize
          recipes, extract key points, or explain cooking instructions.
        </p>

        <form className="ai-assistant-form" onSubmit={handleSubmit}>
          <label htmlFor="ai-prompt">
            What would you like help with?
          </label>

          <textarea
            id="ai-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Paste a recipe and ask me to summarize it..."
            rows={8}
            disabled={isLoading}
          />

          <button
            className="ai-submit-button"
            type="submit"
            disabled={isLoading || !prompt.trim()}
          >
            {isLoading ? "Generating..." : "Analyze Recipe"}
          </button>
        </form>

        {error && (
          <p className="ai-error" role="alert">
            {error}
          </p>
        )}

        {isLoading && !response && (
          <p className="ai-loading" role="status">
            Gemini is thinking...
          </p>
        )}

        {response && (
          <section className="ai-response-section" aria-live="polite">
            <h2>Response</h2>
            <p className="ai-response">{response}</p>
          </section>
        )}

        <section className="ai-history-section">
          <h2>Recent History</h2>

          {history.length === 0 ? (
            <p className="ai-empty-history">
              Your recent questions will appear here.
            </p>
          ) : (
            <div className="ai-history-list">
              {history.map((item, index) => (
                <article
                  className="ai-history-item"
                  key={`${item.prompt}-${index}`}
                >
                  <h3>Question</h3>
                  <p>{item.prompt}</p>

                  <h3>Response</h3>
                  <p>{item.answer}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default AIAssistantPage;