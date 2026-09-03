import { useState } from "react";
import type { FormEvent } from "react";
import { streamAIResponse } from "../services/ai";

type HistoryItem = {
  prompt: string;
  response: string;
};

function AIAssistantPage() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) {
      setError("Enter a prompt before submitting.");
      return;
    }

    setError("");
    setResponse("");
    setLoading(true);

    let streamedResponse = "";

    try {
      await streamAIResponse(trimmedPrompt, (chunk) => {
        streamedResponse += chunk;
        setResponse(streamedResponse);
      });

      setHistory((currentHistory) =>
        [
          { prompt: trimmedPrompt, response: streamedResponse },
          ...currentHistory,
        ].slice(0, 3)
      );

      setPrompt("");
    } catch {
      setError("The AI assistant is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Spoonful AI Assistant</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="ai-prompt">Ask a cooking question</label>
        <textarea
          id="ai-prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}
      {loading && !response && <p>Waiting for the first response...</p>}
      {response && <section aria-live="polite">{response}</section>}

      <section>
        <h2>Recent questions</h2>
        {history.map((item, index) => (
          <article key={`${item.prompt}-${index}`}>
            <h3>{item.prompt}</h3>
            <p>{item.response}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default AIAssistantPage;