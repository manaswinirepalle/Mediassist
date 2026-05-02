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

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, Framer Motion |
| Backend | FastAPI, Python 3.10+ |
| RAG Retrieval | TF-IDF + Cosine Similarity (scikit-learn) |
| Vector Store | FAISS-ready (TF-IDF by default, swap in FAISS easily) |
| AI Generation | OpenAI GPT-3.5-turbo (optional fallback included) |
| Logging | Loguru |

---

## 📁 Project Structure

```
mediassist/
├── backend/
│   ├── main.py           # FastAPI app + endpoints
│   ├── rag.py            # RAG pipeline (retrieval + generation)
│   ├── requirements.txt
│   ├── .env.example
│   └── data/
│       └── medical_kb.json   # 12-condition knowledge base
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css         # Design system + glassmorphism
    │   ├── components/
    │   │   ├── ChatMessage.jsx      # Message bubbles + typewriter
    │   │   ├── ChatInput.jsx        # Input bar + quick questions
    │   │   ├── Sidebar.jsx          # History panel
    │   │   └── TypingIndicator.jsx  # Animated dots
    │   ├── pages/
    │   │   ├── LandingPage.jsx      # Hero, features, CTA
    │   │   └── ChatPage.jsx         # Chat dashboard
    │   ├── hooks/
    │   │   └── useChat.js           # Chat state + API calls
    │   └── utils/
    │       ├── api.js               # Axios API layer
    │       └── highlight.js         # Medical keyword highlighter
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

---

### 1. Backend Setup

```bash
cd mediassist/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — optionally add your OPENAI_API_KEY
# (App works without it in context-based mode)

# Create logs directory
mkdir -p logs

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: http://localhost:8000  
API docs at: http://localhost:8000/docs

---

### 2. Frontend Setup

```bash
cd mediassist/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🌐 API Reference

### `POST /ask`
Submit a medical question.

**Request:**
```json
{ "question": "What are the symptoms of diabetes?" }
```

**Response:**
```json
{
  "id": "uuid",
  "question": "What are the symptoms of diabetes?",
  "answer": "Diabetes is a chronic condition...",
  "sources": [
    { "title": "Diabetes Mellitus - Types and Management", "category": "endocrine", "score": 0.84 }
  ],
  "mode": "Context-Based (Offline)",
  "ai_powered": false,
  "timestamp": "2024-01-01T12:00:00",
  "response_time_ms": 45
}
```

### `GET /health`
Check API health and AI status.

### `GET /history?limit=20`
Retrieve recent chat history.

### `DELETE /history`
Clear chat history.

---

## 🤖 AI Modes

| Mode | When | Description |
|------|------|-------------|
| **AI-Powered (GPT)** | `OPENAI_API_KEY` set | Uses GPT-3.5-turbo with RAG context |
| **Context-Based (Offline)** | No API key | Returns structured content from KB |

The app seamlessly switches between modes — no code changes required.

---

## 🧠 Knowledge Base

The medical knowledge base (`data/medical_kb.json`) covers:

- Fever · Common Cold · Influenza (Flu)
- Headache · Migraine
- Diabetes Mellitus (Type 1 & 2)
- Hypertension (High Blood Pressure)
- Asthma · Allergies
- Anxiety Disorders
- Back Pain · Dehydration · COVID-19

**Extend it** by adding entries to `medical_kb.json` — the TF-IDF index rebuilds automatically on startup.

---

## 🎨 Design System

- **Theme**: Dark glassmorphism with teal accent palette
- **Typography**: DM Sans (UI) + JetBrains Mono (code)
- **Animations**: Framer Motion for page transitions, message reveals, and hover effects
- **Typewriter**: Character-by-character rendering of AI responses

---

## ⚠️ Medical Disclaimer

MediAssist AI is intended for **informational and educational purposes only**. It does not provide medical diagnoses, professional medical advice, or treatment recommendations. Always consult a qualified and licensed healthcare professional for personal medical concerns.

---

## 📄 License

MIT License — use freely for personal and commercial projects.
