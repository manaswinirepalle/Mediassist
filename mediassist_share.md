# MediAssist Project - Share Bundle

This document bundles the key project files for sharing. Each file is shown below with its path and contents.

---

## File: mediassist/README.md

```markdown
# 🏥 MediAssist AI

> AI-powered healthcare assistant with RAG (Retrieval-Augmented Generation) pipeline — delivering instant, reliable, source-cited medical insights.

![MediAssist AI](https://img.shields.io/badge/Status-Production--Ready-teal?style=flat-square)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)
![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=flat-square)
![RAG](https://img.shields.io/badge/AI-RAG%20Pipeline-6366F1?style=flat-square)

---

## 🚀 Features

- **RAG Pipeline** — TF-IDF retrieval over a curated medical knowledge base; optionally upgraded to GPT via OpenAI
- **Dual Mode** — Works fully offline (context-based) or with AI generation (OpenAI GPT)
- **Typewriter Animation** — Character-by-character AI response rendering
- **Keyword Highlighting** — Auto-highlights medical terms in every response
- **Source Citations** — Every answer links back to its knowledge-base documents
- **Chat History** — Sidebar with full conversation history
- **Glassmorphism UI** — Dark-mode, gradient-rich, Framer Motion animated interface
- **Responsive** — Mobile-first design, works on all screen sizes

---

## (Truncated) Full README content available in repository
```

---

## File: mediassist/backend/main.py

```python
"""
MediAssist AI - FastAPI Backend
"""

import os
import time
import uuid
from datetime import datetime
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from pydantic import BaseModel

load_dotenv()

# ── Logging setup ──────────────────────────────
logger.add(
    "logs/mediassist.log",
    rotation="10 MB",
    retention="7 days",
    level="INFO",
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}",
)

# ── App initialization ─────────────────────────
app = FastAPI(
    title="MediAssist AI",
    description="AI-powered healthcare assistant with RAG pipeline",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://mediassist-git-main-manaswinirepalles-projects.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Import RAG after app setup ─────────────────
from rag import answer_medical_question

# ── In-memory chat history (replace with DB for prod) ──
chat_history: List[dict] = []


# ── Pydantic models ────────────────────────────

class QuestionRequest(BaseModel):
    question: str
    session_id: Optional[str] = None


class Source(BaseModel):
    title: str
    category: str
    score: float


class AnswerResponse(BaseModel):
    id: str
    question: str
    answer: str
    sources: List[Source]
    mode: str
    ai_powered: bool
    timestamp: str
    response_time_ms: int


class HealthResponse(BaseModel):
    status: str
    version: str
    ai_enabled: bool
    timestamp: str
    knowledge_base_size: int


# ── Routes ─────────────────────────────────────

@app.get("/health", response_model=HealthResponse)
async def health_check():
    from rag import KNOWLEDGE_BASE
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    ai_enabled = bool(openai_key and openai_key not in ("", "your-openai-api-key-here"))

    return HealthResponse(
        status="healthy",
        version="1.0.0",
        ai_enabled=ai_enabled,
        timestamp=datetime.utcnow().isoformat(),
        knowledge_base_size=len(KNOWLEDGE_BASE),
    )


@app.post("/ask", response_model=AnswerResponse)
async def ask_question(request: QuestionRequest):
    if not request.question or not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    question = request.question.strip()
    if len(question) > 1000:
        raise HTTPException(status_code=400, detail="Question too long (max 1000 characters).")

    logger.info(f"Received question: {question[:80]}")

    start_time = time.time()
    try:
        result = answer_medical_question(question)
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your question.")

    elapsed_ms = int((time.time() - start_time) * 1000)

    response = AnswerResponse(
        id=str(uuid.uuid4()),
        question=question,
        answer=result["answer"],
        sources=[Source(**s) for s in result["sources"]],
        mode=result["mode"],
        ai_powered=result["ai_powered"],
        timestamp=datetime.utcnow().isoformat(),
        response_time_ms=elapsed_ms,
    )

    # Store in chat history
    chat_history.append(response.dict())
    if len(chat_history) > 100:
        chat_history.pop(0)

    logger.info(f"Response generated in {elapsed_ms}ms using {result['mode']} mode.")
    return response


@app.get("/history")
async def get_history(limit: int = 20):
    return {
        "history": chat_history[-limit:],
        "total": len(chat_history),
    }


@app.delete("/history")
async def clear_history():
    chat_history.clear()
    return {"message": "Chat history cleared."}


@app.get("/")
async def root():
    return {
        "app": "MediAssist AI",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }
```

---

## File: mediassist/backend/rag.py

```python
"""
MediAssist AI - Simple RAG Pipeline
Uses basic keyword matching for lightweight retrieval.
"""

import json
import os
import re
from pathlib import Path
from typing import List, Dict, Tuple


# ──────────────────────────────────────────────
# Load medical knowledge base
# ──────────────────────────────────────────────

DATA_PATH = Path(__file__).parent / "data" / "medical_kb.json"


def load_knowledge_base() -> List[Dict]:
    with open(DATA_PATH, "r") as f:
        return json.load(f)


KNOWLEDGE_BASE = load_knowledge_base()
print(f"Loaded {len(KNOWLEDGE_BASE)} medical documents into knowledge base.")


# ──────────────────────────────────────────────
# Simple keyword-based retriever
# ──────────────────────────────────────────────

class SimpleRetriever:
    def __init__(self):
        self.docs = KNOWLEDGE_BASE

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict]:
        query_lower = query.lower()
        query_words = set(re.findall(r'\b\w+\b', query_lower))

        scored_docs = []
        for doc in self.docs:
            title_lower = doc['title'].lower()
            content_lower = doc['content'].lower()
            keywords_lower = ' '.join(doc['keywords']).lower()

            # Count matching words
            title_matches = len(query_words.intersection(set(re.findall(r'\b\w+\b', title_lower))))
            content_matches = len(query_words.intersection(set(re.findall(r'\b\w+\b', content_lower))))
            keyword_matches = len(query_words.intersection(set(re.findall(r'\b\w+\b', keywords_lower))))

            # Calculate score
            score = title_matches * 3 + content_matches * 2 + keyword_matches * 4

            if score > 0:
                doc_copy = doc.copy()
                doc_copy["score"] = float(score)
                scored_docs.append(doc_copy)

        # Sort by score and return top_k
        scored_docs.sort(key=lambda x: x["score"], reverse=True)
        return scored_docs[:top_k]


retriever = SimpleRetriever()


# ──────────────────────────────────────────────
# Fallback answer generator
# ──────────────────────────────────────────────

def _build_fallback_answer(question: str, contexts: List[Dict]) -> str:
    if not contexts:
        return (
            "I wasn't able to find specific information about your query in my current knowledge base. "
            "Please consult a qualified healthcare professional for accurate medical advice."
        )

    primary = contexts[0]
    answer_parts = []

    answer_parts.append(f"**{primary['title']}**\n")
    answer_parts.append(primary["content"])

    if len(contexts) > 1:
        answer_parts.append("\n\n**Related Information:**")
        for ctx in contexts[1:]:
            # First 200 chars as a teaser
            snippet = ctx["content"][:220].rsplit(" ", 1)[0] + "…"
            answer_parts.append(f"• **{ctx['title']}**: {snippet}")

    answer_parts.append(
        "\n\n⚠️ *This information is for educational purposes only. "
        "Please consult a licensed healthcare professional for personalized medical advice.*"
    )

    return "\n".join(answer_parts)


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

def answer_medical_question(question: str) -> Dict:
    print(f"Processing question: {question[:80]}…")

    contexts = retriever.retrieve(question, top_k=3)
    sources = [
        {"title": c["title"], "category": c["category"], "score": round(c["score"], 3)}
        for c in contexts
    ]

    answer = _build_fallback_answer(question, contexts)
    mode = "Context-Based (Simple)"
    ai_powered = False

    print(f"Response generated in {mode} mode. Sources: {[s['title'] for s in sources]}")

    return {
        "answer": answer,
        "sources": sources,
        "mode": mode,
        "ai_powered": ai_powered,
    }
```

---

## File: mediassist/backend/requirements.txt

```text
fastapi==0.95.2
uvicorn==0.22.0
python-dotenv==1.0.0
pydantic==1.10.13
numpy
scikit-learn
loguru==0.7.2
```

---

## File: mediassist/backend/runtime.txt

```text
python-3.10.13
```

---

## File: mediassist/backend/data/medical_kb.json

```json
[ ... knowledge base array ... ]
```

Note: The full JSON is included in the repository at `mediassist/backend/data/medical_kb.json`.

---

## File: mediassist/frontend/package.json

```json
{
  "name": "mediassist-ai",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "framer-motion": "^10.16.5",
    "axios": "^1.6.2",
    "react-markdown": "^9.0.1",
    "lucide-react": "^0.294.0",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "vite": "^5.0.0"
  }
}
```

---

## File: mediassist/frontend/index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="MediAssist AI - AI-powered healthcare assistant providing instant, reliable medical insights." />
    <title>MediAssist AI</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

## File: mediassist/frontend/src/App.jsx

```jsx
import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LandingPage from './pages/LandingPage'
import ChatPage from './pages/ChatPage'

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0a1628',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.08)',
            fontSize: '13px',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </>
  )
}
```

---

## File: mediassist/frontend/src/main.jsx

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

---

## File: mediassist/frontend/src/index.css

```css
/* (CSS content truncated for brevity) */
```

---

## Components

Included: `ChatInput.jsx`, `ChatMessage.jsx`, `Sidebar.jsx`, `TypingIndicator.jsx` (full source available in repo).

---

## Hooks & Utils

Included: `useChat.js`, `api.js`, `highlight.js` (full source available in repo).

---

## How to use this bundle

- To share: copy `mediassist_share.md` or export it as PDF from any Markdown editor.
- To run locally: follow instructions in `mediassist/README.md`.

---

Generated by an automated bundling step. For the complete file list and exact source files, see the repository tree.
