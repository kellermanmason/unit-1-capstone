# Week 1 Capstone: React Application

### What You'll Build

You will consume an API rendering it using react. The Figma design and user stories are provided. Your job is to connect the frontend to the backend, and deliver a working product.

In addition to the original scope, your application must include an AI-powered feature that calls Google Gemini and displays a streamed response to the user.

### Setup

- clone this repo and `cd unit1-capstone`
- remove the git repo `rm -rf .git`
- initialize a new repo `git init`
- add and commit `setup starter code`
- add a github remote to the local repo

## Step 1: Setup Backend

- [backend commands reference](./backend/README.md)

## Step 2: Consult Design Docs

- [design docs](./DESIGN.md)

## Step 3: Build the React Frontend

- **Connect to Your Backend:**\
  Your React app must call and use all the API endpoints you've built.

- **Set Up Routing:**\
  Implement routing for navigation between all major app sections/components.

- **Responsive Design:**\
  Use CSS and Flexbox so your app looks good on mobile, tablet, and desktop.

- **Match the Figma Design:**\
  Strive for a pixel-perfect implementation of the provided UI.

- **Component Testing:**\
  Write tests for at least four different UI components.

- [react client command reference](./client/README.md)

## Step 4: Add an AI-Powered Feature

Build a dedicated route in your app that calls Google Gemini and displays a streamed response to the user. Choose one of the following (or propose your own of similar complexity):

- **A content generator** — user provides a topic or prompt, the app calls Gemini and displays generated text
- **A text analyzer** — user pastes text, the app calls Gemini to summarize it, extract key points, or classify its tone
- **A Q&A assistant** — user asks a question, the app calls Gemini and displays the answer

**Your AI feature must call Gemini through your backend — not directly from the browser.** Your API key lives only in the backend's `.env`, and your React app only ever talks to your own API.

### Getting a Gemini API Key

Gemini's free tier requires no billing setup — just a Google account.

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with any Google account
3. Click **Get API key** (left sidebar, or under your profile menu)
4. Click **Create API key**
5. Choose **Create API key in new project** (or select an existing project if you have one)
6. Copy the generated key — it starts with `AIza...`

> The free tier currently allows a generous number of requests per minute/day — more than enough for this capstone. No credit card is required at any point.

### Backend: Add the AI Route

Create `backend/routes/ai.js`:

```js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Check https://ai.google.dev/gemini-api/docs/models for the current
// recommended model if this one has been retired.
const GEMINI_MODEL = 'gemini-3.6-flash';

router.post('/stream', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    return res.status(500).json({ error: 'AI service is not configured' });
  }

  try {
    const upstream = await axios({
      method: 'post',
      url: `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY,
      },
      data: {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt.trim() }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1024,
        },
      },
      responseType: 'stream',
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    upstream.data.pipe(res);

    upstream.data.on('error', (err) => {
      console.error('Stream error:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Streaming error' });
      }
    });
  } catch (err) {
    // responseType: 'stream' means error responses ALSO come back as a
    // stream, not parsed JSON — read it manually to see the real error.
    let errorBody = '';

    if (err.response?.data && typeof err.response.data.on === 'function') {
      try {
        errorBody = await new Promise((resolve) => {
          let chunks = '';
          err.response.data.on('data', (chunk) => (chunks += chunk));
          err.response.data.on('end', () => resolve(chunks));
          err.response.data.on('error', () => resolve('(could not read error stream)'));
        });
      } catch {
        errorBody = '(failed to parse error stream)';
      }
    } else {
      errorBody = err.message;
    }

    console.error('AI stream error:', err.response?.status, errorBody);

    if (!res.headersSent) {
      const status = err.response?.status || 500;
      res.status(status).json({ error: 'Failed to reach AI service', details: errorBody });
    }
  }
});

module.exports = router;
```

Register it in `backend/server.js` alongside your existing routes:

```js
app.use('/api/ai', require('./routes/ai'));
```

Add your Gemini key to `backend/.env`:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Never commit your API key.** Confirm `.env` is in `.gitignore` before your first commit.

Rebuild the backend so it picks up the new route and dependency — see [backend commands reference](./backend/README.md) for the docker-compose command.

> **✅ Check:** Test the route directly before touching the frontend:
> ```bash
> curl -X POST http://localhost:3000/api/ai/stream \
>   -H "Content-Type: application/json" \
>   -d '{"prompt": "hello, tell me a fun fact"}'
> ```
> Confirm you see streamed `data:` chunks in the terminal, not an error.

### Frontend: Call Your Backend

```jsx
// src/pages/AIAssistant/AIAssistant.jsx
import { useState } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setResponse('');
    setError('');

    let fullText = '';
    let buffer = '';

    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorBody.error || `Server error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Gemini's SSE stream can split one JSON object across multiple
        // chunks, so buffer and only process complete lines.
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const data = line.replace(/^data:\s*/, '').trim();
          if (!data) continue;

          try {
            const parsed = JSON.parse(data);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              fullText += text;
              setResponse(fullText);
            }
          } catch {
            // incomplete chunk, continue
          }
        }
      }

      setHistory((prev) => [{ prompt, answer: fullText }, ...prev].slice(0, 3));
      setPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>AI Assistant</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask something..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !prompt.trim()}>
          {isLoading ? 'Generating...' : 'Submit'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {isLoading && !response && <p>Gemini is thinking...</p>}
      {response && <pre style={{ whiteSpace: 'pre-wrap' }}>{response}</pre>}

      <h3>Recent History</h3>
      {history.map((h, i) => (
        <div key={i}>
          <strong>Q:</strong> {h.prompt} <br />
          <strong>A:</strong> {h.answer}
        </div>
      ))}
    </div>
  );
}

export default AIAssistant;
```

Add `VITE_BACKEND_URL` to `client/.env`:

```
VITE_BACKEND_URL=http://localhost:3000
```

### Requirements

- Loading state while waiting for Gemini's response
- Error handling if the API call fails
- Input validation — don't call the backend with an empty prompt
- The AI feature must be its own route, reachable from your navigation
- Maintain a history of at least the last 3 prompts/responses in the session (in-memory state is fine — no persistence required)

> **✅ Check:** Open your browser's dev tools, Network tab, and submit a prompt. Confirm the request to `/api/ai/stream` contains no API key anywhere — your key should never appear in anything the browser sends.

## Must-Have Checklist

> 🥉 Bronze - complete all must-haves

- Backend supports full CRUD, all endpoints in use

- React app calls all endpoints

- Routing set up for major components

- Responsive CSS/Flexbox design

- Pixel-perfect Figma implementation

- Four or more tested React components

- AI-powered feature calling Gemini through your backend, with loading, error, and empty-input handling

- AI feature maintains a 3-item session history

- API key stored in backend `.env`, never committed

- Full application runs successfully via docker-compose for both `client` and `backend`

## Stretch Goals:

> 🥈 Silver - complete 1 stretch goal <br> 🥇 Gold - complete 2

- Add a second AI-powered feature using a different Gemini use case than your first

- Add Playwright end-to-end tests

- Set up Github Actions or other CI/CD for automated builds and tests

## Tips for Success

- **Work in small steps:** Build and test each part before moving on.

- **Test your AI feature early:** Confirm the Gemini API call works in isolation (via `curl`) before wiring it into your full component — it's easier to debug a single endpoint than a full component tree.

- **Stick to the blueprint:** The Figma file and user stories define your target for the core app; the AI feature is yours to design within the requirements above.

- **Ask questions:** Don't spend too long blocked. Help is here if you need it!
