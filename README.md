# AI Chat Platform

A full-stack AI chat platform that provides a unified interface for interacting with multiple LLM providers, with persistent chat history and provider-level usage analytics.

---

## Features

- 🤖 **Multi-LLM Support**
  - Integrates multiple LLM providers through a unified API interface.
  - Currently supports:
    - Google Gemini
    - Mistral

- ⚡ **Real-Time Streaming**
  - Uses **Server-Sent Events (SSE)** to stream AI responses token-by-token.
  - Provides a responsive chat experience without waiting for the complete response.

- 💬 **Persistent Chat History**
  - Stores conversations and messages in PostgreSQL.
  - Supports creating, loading, and deleting chat sessions.
  - Maintains conversation context for subsequent messages.

- 📊 **Analytics Dashboard**
  - Tracks:
    - Total requests
    - Input/prompt tokens
    - Output/completion tokens
    - Average latency
    - Success rate
  - Provides provider-level statistics using interactive **Recharts** visualizations.
  - Displays recent request logs.

- 🗄️ **PostgreSQL Database**
  - Structured schema for:
    - Chat sessions
    - Chat messages
    - Provider request logs
  - Uses indexes on frequently queried fields such as session IDs, users, providers, and timestamps.

- 📝 **Markdown & Mathematical Content**
  - Supports Markdown and GitHub-Flavored Markdown.
  - Supports mathematical expressions using KaTeX.

---

## Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- Recharts
- React Markdown
- Remark GFM
- Remark Math
- Rehype KaTeX

### Backend

- Node.js
- Express.js
- PostgreSQL
- `pg`
- Server-Sent Events (SSE)
- OpenAI SDK

### LLM Providers

- Google Gemini
- Mistral

---

## Architecture

```text
                    ┌──────────────────────┐
                    │      React UI        │
                    │                      │
                    │  Chat + Analytics    │
                    └──────────┬───────────┘
                               │
                               │ HTTP / SSE
                               ▼
                    ┌──────────────────────┐
                    │   Express Backend    │
                    │                      │
                    │  Chat Routes         │
                    │  Analytics Routes    │
                    └───────┬───────┬──────┘
                            │       │
                ┌───────────┘       └────────────┐
                │                                │
                ▼                                ▼
       ┌─────────────────┐             ┌─────────────────┐
       │ LLM Provider    │             │   PostgreSQL    │
       │ Abstraction     │             │                 │
       │                 │             │ Sessions        │
       │ Gemini / Mistral│             │ Messages        │
       └────────┬────────┘             │ Analytics Logs  │
                │                      └─────────────────┘
                ▼
       ┌─────────────────┐
       │ Streaming LLM   │
       │ Response        │
       └─────────────────┘
```
## Setup

### Backend

```bash
cd backend
npm install
```

### Create .env:

```bash
PORT=5000
DATABASE_URL=your_postgresql_connection_string
MISTRAL_API_KEY=your_mistral_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### Run:

```bash
npm start
Frontend
cd frontend
npm install
npm run dev
```
