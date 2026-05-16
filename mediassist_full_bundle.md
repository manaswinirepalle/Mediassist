# MediAssist Full Project Bundle

This file contains the full source and configuration files from the `mediassist` project for sharing and archival.

---

## File: mediassist/README.md

```markdown
# 🏥 MediAssist AI

> AI-powered healthcare assistant with RAG (Retrieval-Augmented Generation) pipeline — delivering instant, reliable, source-cited medical insights.

...(full README contents omitted here for brevity in this file; full file included in repository)...
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
[ 
  {
    "id": "fever_001",
    "title": "Fever - Overview and Management",
    "content": "Fever is a temporary increase in body temperature, often caused by infection. A temperature above 38°C (100.4°F) is generally considered a fever. Common causes include viral infections (flu, cold), bacterial infections (strep throat, urinary tract infection), inflammation, and certain medications. Symptoms accompanying fever may include sweating, chills, headache, muscle aches, loss of appetite, dehydration, and general weakness. Management includes rest, adequate fluid intake, over-the-counter fever reducers like acetaminophen or ibuprofen, and cool compresses. Seek immediate medical attention if fever exceeds 39.4°C (103°F), lasts more than 3 days, or is accompanied by severe symptoms.",
    "category": "general",
    "keywords": ["fever", "temperature", "high temperature", "chills", "sweating", "hot", "thermometer"]
  },
  {
    "id": "cold_001",
    "title": "Common Cold - Symptoms and Treatment",
    "content": "The common cold is a viral infection of the upper respiratory tract caused by rhinoviruses in most cases. Symptoms typically include runny or stuffy nose, sneezing, sore throat, mild cough, mild headache, slight body aches, and low-grade fever. Colds usually resolve within 7-10 days. Treatment is mainly symptomatic: rest, staying hydrated, saline nasal drops, throat lozenges, and over-the-counter cold medications. Antibiotics are NOT effective against viral infections like the common cold. Preventive measures include frequent handwashing, avoiding close contact with infected individuals, and not touching your face.",
    "category": "respiratory",
    "keywords": ["cold", "runny nose", "sneezing", "sore throat", "nasal congestion", "stuffy nose", "rhinovirus"]
  },
  {
    "id": "headache_001",
    "title": "Headache - Types and Treatments",
    "content": "Headaches are one of the most common medical complaints. Tension headaches are the most common type, causing a dull, aching sensation around the head. Migraine headaches cause severe throbbing pain, usually on one side, often with nausea, vomiting, and light/sound sensitivity. Cluster headaches are severe, one-sided headaches occurring in cyclical patterns. Secondary headaches are caused by underlying conditions like sinus infections, hypertension, or dehydration. Treatment varies by type: tension headaches respond to over-the-counter pain relievers; migraines may require triptans or preventive medications; all headaches benefit from rest, hydration, and stress management. Red flags requiring immediate care: sudden severe headache, headache with fever/stiff neck, headache after head injury.",
    "category": "neurological",
    "keywords": ["headache", "migraine", "head pain", "tension headache", "throbbing", "cluster headache"]
  },
  {
    "id": "flu_001",
    "title": "Influenza (Flu) - Symptoms and Care",
    "content": "Influenza (flu) is a contagious respiratory illness caused by influenza viruses. Unlike the common cold, flu symptoms appear suddenly and are more severe. Symptoms include high fever (38-41°C), severe body aches and chills, intense fatigue, dry cough, headache, and sometimes vomiting and diarrhea. The flu is spread through respiratory droplets. Treatment includes antiviral medications (oseltamivir/Tamiflu) if started within 48 hours of symptom onset, rest, fluids, and fever-reducing medications. Complications can include pneumonia, especially in high-risk groups (elderly, young children, immunocompromised, pregnant women). Annual flu vaccination is the best prevention. Recovery typically takes 1-2 weeks.",
    "category": "respiratory",
    "keywords": ["flu", "influenza", "body aches", "fever", "fatigue", "chills", "respiratory", "antiviral"]
  },
  {
    "id": "diabetes_001",
    "title": "Diabetes Mellitus - Types and Management",
    "content": "Diabetes is a chronic condition where the body cannot properly regulate blood glucose levels. Type 1 diabetes is an autoimmune condition where the pancreas produces little or no insulin; it requires insulin therapy. Type 2 diabetes occurs when cells resist insulin or the pancreas doesn't produce enough; it's often linked to lifestyle factors. Gestational diabetes occurs during pregnancy. Common symptoms: increased thirst (polydipsia), frequent urination (polyuria), blurred vision, fatigue, slow-healing wounds, and unexplained weight loss. Management includes blood sugar monitoring, healthy diet (low-glycemic foods), regular exercise, medications (metformin, insulin), and regular medical checkups. Complications of uncontrolled diabetes include neuropathy, retinopathy, kidney disease, and cardiovascular disease.",
    "category": "endocrine",
    "keywords": ["diabetes", "blood sugar", "glucose", "insulin", "type 1", "type 2", "thirst", "urination", "hyperglycemia"]
  },
  {
    "id": "hypertension_001",
    "title": "High Blood Pressure (Hypertension)",
    "content": "Hypertension is consistently elevated blood pressure in arteries. Normal blood pressure is below 120/80 mmHg. Stage 1 hypertension is 130-139/80-89 mmHg. Stage 2 is 140/90 mmHg or higher. Hypertension is often called the 'silent killer' as it has no obvious symptoms until damage occurs. Risk factors include age, family history, obesity, sedentary lifestyle, high-sodium diet, smoking, excessive alcohol, and stress. Long-term complications include heart disease, stroke, kidney damage, and vision problems. Treatment: lifestyle changes (DASH diet, exercise, weight loss, smoking cessation, alcohol limitation) and medications (ACE inhibitors, ARBs, calcium channel blockers, diuretics). Regular blood pressure monitoring is essential.",
    "category": "cardiovascular",
    "keywords": ["hypertension", "high blood pressure", "BP", "blood pressure", "cardiovascular", "heart", "stroke risk"]
  },
  {
    "id": "allergy_001",
    "title": "Allergies - Types and Management",
    "content": "Allergies occur when the immune system reacts to a foreign substance (allergen). Common types include seasonal allergies (hay fever/allergic rhinitis), food allergies, skin allergies (eczema, hives), insect sting allergies, and drug allergies. Symptoms vary by type: nasal allergies cause sneezing, runny nose, itchy eyes; food allergies cause hives, swelling, digestive issues, or anaphylaxis; skin allergies cause rashes and itching. Anaphylaxis is a life-threatening emergency requiring immediate epinephrine injection. Diagnosis is through allergy testing. Treatment: antihistamines, decongestants, nasal corticosteroids, immunotherapy (allergy shots). Avoidance of known triggers is key. Individuals with known severe allergies should always carry an epinephrine auto-injector (EpiPen).",
    "category": "immunology",
    "keywords": ["allergy", "allergic", "hay fever", "sneezing", "itchy eyes", "hives", "anaphylaxis", "antihistamine"]
  },
  {
    "id": "asthma_001",
    "title": "Asthma - Symptoms and Treatment",
    "content": "Asthma is a chronic inflammatory disease of the airways that causes recurring episodes of wheezing, breathlessness, chest tightness, and coughing. Triggers include allergens (pollen, dust mites, pet dander), respiratory infections, exercise, cold air, smoke, and stress. Asthma severity ranges from intermittent to severe persistent. Diagnosis is confirmed through spirometry and bronchodilator response testing. Treatment involves quick-relief medications (short-acting beta-agonists like albuterol) for acute symptoms and long-term control medications (inhaled corticosteroids, long-acting beta-agonists, leukotriene modifiers). An asthma action plan helps manage symptoms and recognize worsening. Seek emergency care for severe attacks not responding to reliever medication.",
    "category": "respiratory",
    "keywords": ["asthma", "wheezing", "breathlessness", "chest tightness", "inhaler", "bronchospasm", "breathing difficulty"]
  },
  {
    "id": "anxiety_001",
    "title": "Anxiety Disorders - Overview",
    "content": "Anxiety disorders are the most common mental health condition. They include generalized anxiety disorder (GAD), panic disorder, social anxiety disorder, and specific phobias. Symptoms include excessive worry, restlessness, fatigue, difficulty concentrating, irritability, muscle tension, and sleep disturbances. Physical symptoms may include rapid heart rate, sweating, trembling, and shortness of breath. Anxiety is caused by a combination of genetic, environmental, psychological, and developmental factors. Treatment includes cognitive-behavioral therapy (CBT), medication (SSRIs, SNRIs, benzodiazepines for short-term), lifestyle changes (regular exercise, sleep hygiene, stress management, limiting caffeine and alcohol), and mindfulness practices. Anxiety disorders are highly treatable with proper care.",
    "category": "mental_health",
    "keywords": ["anxiety", "worry", "panic", "stress", "mental health", "nervousness", "panic attack", "restlessness"]
  },
  {
    "id": "back_pain_001",
    "title": "Back Pain - Causes and Relief",
    "content": "Back pain is one of the most common reasons people seek medical care. It can be acute (lasting less than 6 weeks), subacute (6-12 weeks), or chronic (more than 12 weeks). Common causes: muscle or ligament strain, bulging/herniated discs, arthritis, osteoporosis, and poor posture. Symptoms range from dull aching to sharp stabbing pain, sometimes radiating down the leg (sciatica). Risk factors include age, lack of exercise, excess weight, improper lifting, and psychological conditions. Treatment: over-the-counter pain relievers (NSAIDs), heat/ice application, gentle stretching, physical therapy, and in severe cases, injections or surgery. Red flags requiring urgent care: back pain with bladder/bowel dysfunction, numbness, or after trauma.",
    "category": "musculoskeletal",
    "keywords": ["back pain", "lower back", "spine", "sciatica", "herniated disc", "lumbar", "back ache"]
  },
  {
    "id": "covid_001",
    "title": "COVID-19 - Symptoms and Care",
    "content": "COVID-19 is caused by the SARS-CoV-2 coronavirus. Symptoms range from mild to severe and typically appear 2-14 days after exposure. Common symptoms: fever, dry cough, fatigue, loss of taste or smell (anosmia), sore throat, headache, body aches, shortness of breath, diarrhea, and runny nose. Severe symptoms include difficulty breathing, persistent chest pain, confusion, and bluish lips. High-risk groups include elderly individuals and those with underlying conditions. Prevention: vaccination, masking, hand hygiene, and ventilation. Treatment is largely supportive; antiviral medications (Paxlovid) are available for high-risk individuals. Long COVID can cause persistent symptoms weeks or months after recovery.",
    "category": "infectious",
    "keywords": ["covid", "coronavirus", "COVID-19", "loss of smell", "loss of taste", "SARS-CoV-2", "pandemic"]
  },
  {
    "id": "dehydration_001",
    "title": "Dehydration - Signs and Treatment",
    "content": "Dehydration occurs when the body loses more fluid than it takes in. It can be mild, moderate, or severe. Symptoms of mild to moderate dehydration: increased thirst, dry mouth, decreased urine output, dark yellow urine, fatigue, dizziness, and headache. Severe dehydration is a medical emergency with symptoms including extreme thirst, very dry skin, rapid heartbeat, rapid breathing, sunken eyes, and confusion. Causes include vomiting, diarrhea, excessive sweating, insufficient fluid intake, and certain medications. Treatment: oral rehydration with water or electrolyte solutions for mild cases; intravenous fluids for severe cases. Prevention involves drinking adequate fluids (8 glasses/day for most adults) and increasing intake during hot weather, exercise, or illness.",
    "category": "general",
    "keywords": ["dehydration", "thirst", "dry mouth", "dark urine", "water", "electrolytes", "fluid intake"]
  }
]
```

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
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --midnight: #060d1a;
  --navy: #0a1628;
  --navy-light: #0f1f3d;
  --teal-400: #2dd4bf;
  --teal-500: #14b8a6;
  --teal-600: #0d9488;
  --teal-glow: rgba(45, 212, 191, 0.15);
  --glass-bg: rgba(255, 255, 255, 0.04);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-hover: rgba(255, 255, 255, 0.07);
  --text-primary: #e2e8f0;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'DM Sans', sans-serif;
  background-color: var(--midnight);
  color: var(--text-primary);
  min-height: 100vh;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

/* (rest of CSS omitted for brevity; full file exists in repo) */
```

---

## File: mediassist/frontend/src/components/ChatInput.jsx

```jsx
import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

const QUICK_QUESTIONS = [
  'What causes fever?',
  'Symptoms of flu?',
  'How to manage diabetes?',
  'What is hypertension?',
  'Headache remedies?',
]

export default function ChatInput({ onSend, isLoading }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  const handleSubmit = () => {
    const q = value.trim()
    if (!q || isLoading) return
    onSend(q)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e) => {
    setValue(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
    }
  }

  return (
    <div className="border-t border-[var(--glass-border)] bg-[var(--midnight)] p-4 space-y-3">
      {/* Quick questions */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => { setValue(q); textareaRef.current?.focus() }}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full glass-card glass-card-hover text-[var(--text-secondary)] hover:text-teal-300 transition-colors whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-end gap-3">
        <div className="flex-1 glass-card rounded-2xl px-4 py-3 flex items-end gap-3 focus-within:border-teal-500/40 transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Describe your symptoms or ask a medical question…"
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent resize-none outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] leading-relaxed max-h-[140px] disabled:opacity-50"
          />
          <span className="text-xs text-[var(--text-muted)] self-center flex-shrink-0 hidden sm:block">
            {value.length}/1000
          </span>
        </div>

        {/* Send button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading}
          className="w-12 h-12 rounded-xl btn-primary flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all"
        >
          {isLoading ? (
            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </motion.button>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-[var(--text-muted)]">
        ⚕️ MediAssist AI is for informational purposes only. Always consult a licensed healthcare professional.
      </p>
    </div>
  )
}
```

---

## File: mediassist/frontend/src/components/ChatMessage.jsx

```jsx
import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { highlightKeywords } from '../utils/highlight'

function TypewriterText({ text, onComplete }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')
    setDone(false)

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(interval)
        setDone(true)
        onComplete?.()
      }
    }, 8)

    return () => clearInterval(interval)
  }, [text])

  const highlighted = highlightKeywords(displayed)

  return (
    <div
      className="prose-medical text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  )
}

function SourceBadge({ source }) {
  const categoryColors = {
    general: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    respiratory: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    neurological: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    endocrine: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    cardiovascular: 'bg-red-500/10 text-red-300 border-red-500/20',
    immunology: 'bg-green-500/10 text-green-300 border-green-500/20',
    musculoskeletal: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
    mental_health: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
    infectious: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
  }
  const color = categoryColors[source.category] || 'bg-gray-500/10 text-gray-300 border-gray-500/20'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${color}`}>
      <span className="w-1 h-1 rounded-full bg-current opacity-70" />
      {source.title.length > 30 ? source.title.slice(0, 28) + '…' : source.title}
    </span>
  )
}

export default function ChatMessage({ message, isNew = false }) {
  const [typed, setTyped] = useState(!isNew)
  const isUser = message.role === 'user'
  const isError = message.role === 'error'

  const timeStr = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-end px-4 py-1.5"
      >
        <div className="max-w-[75%]">
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg">
            <p className="text-white text-sm leading-relaxed">{message.content}</p>
          </div>
          <p className="text-xs text-[var(--text-muted)] text-right mt-1 mr-1">{timeStr}</p>
        </div>
      </motion.div>
    )
  }

  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-start gap-3 px-4 py-1.5"
      >
        <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="glass-card border-red-500/20 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
          <p className="text-red-300 text-sm">{message.content}</p>
        </div>
      </motion.div>
    )
  }

  // Assistant message
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 px-4 py-1.5"
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
        </svg>
      </div>

      <div className="max-w-[80%] space-y-2">
        {/* Mode badge */}
        {message.mode && (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium
              ${message.aiPowered
                ? 'bg-teal-500/10 text-teal-300 border-teal-500/20'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${message.aiPowered ? 'bg-teal-400' : 'bg-amber-400'}`} />
              {message.aiPowered ? 'AI-Powered' : 'Context-Based (Offline)'}
            </span>
            {message.responseTimeMs && (
              <span className="text-xs text-[var(--text-muted)]">{message.responseTimeMs}ms</span>
            )}
          </div>
        )}

        {/* Message bubble */}
        <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3">
          {isNew && !typed ? (
            <TypewriterText text={message.content} onComplete={() => setTyped(true)} />
          ) : (
            <div
              className="prose-medical text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightKeywords(message.content) }}
            />
          )}
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-1.5"
          >
            <span className="text-xs text-[var(--text-muted)] self-center">Sources:</span>
            {message.sources.map((src, i) => (
              <SourceBadge key={i} source={src} />
            ))}
          </motion.div>
        )}

        <p className="text-xs text-[var(--text-muted)]">{timeStr}</p>
      </div>
    </motion.div>
  )
}
```

---

## File: mediassist/frontend/src/components/Sidebar.jsx

```jsx
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

function formatTime(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Sidebar({ messages, onClear, onClose, isOpen }) {
  const [confirmClear, setConfirmClear] = useState(false)

  const historyItems = messages.filter((m) => m.role === 'user')

  return (
    <>
      {/* Overlay (mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed lg:relative lg:translate-x-0 top-0 left-0 h-full w-72 glass-card border-r border-[var(--glass-border)] flex flex-col z-30 lg:z-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-[var(--text-primary)]">Chat History</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          <AnimatePresence>
            {historyItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-xs text-[var(--text-muted)]">No questions yet.<br />Start a consultation!</p>
              </motion.div>
            ) : (
              historyItems.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass-card glass-card-hover rounded-xl px-3 py-2.5 cursor-default"
                >
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--text-secondary)] leading-snug line-clamp-2">
                        {msg.content}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{formatTime(msg.timestamp)}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        {historyItems.length > 0 && (
          <div className="px-3 py-3 border-t border-[var(--glass-border)]">
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full text-xs text-[var(--text-muted)] hover:text-red-400 py-2 rounded-lg hover:bg-red-500/5 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear History
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { onClear(); setConfirmClear(false) }}
                  className="flex-1 text-xs bg-red-500/20 text-red-300 border border-red-500/30 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 text-xs glass-card text-[var(--text-secondary)] py-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Brand */}
        <div className="px-4 pb-4 pt-2 border-t border-[var(--glass-border)]">
          <p className="text-xs text-[var(--text-muted)] text-center">
            MediAssist AI v1.0 · RAG-Powered
          </p>
        </div>
      </motion.aside>
    </>
  )
}
```

---

## File: mediassist/frontend/src/components/TypingIndicator.jsx

```jsx
import { motion } from 'framer-motion'

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-start gap-3 px-4 py-2"
    >
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center flex-shrink-0 pulse-ring">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
        </svg>
      </div>

      <div className="glass-card rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        <span className="text-xs text-[var(--text-muted)] mr-1">Analyzing</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot inline-block w-1.5 h-1.5 rounded-full bg-teal-400"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </motion.div>
  )
}
```

---

## File: mediassist/frontend/src/hooks/useChat.js

```js
import { useState, useCallback, useRef } from 'react'
import { askQuestion } from '../utils/api'

export function useChat() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)

  const scrollToBottom = () => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  const sendMessage = useCallback(async (question) => {
    if (!question.trim() || isLoading) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)
    setError(null)
    scrollToBottom()

    try {
      const response = await askQuestion(question)
      const assistantMsg = {
        id: response.id,
        role: 'assistant',
        content: response.answer,
        sources: response.sources,
        mode: response.mode,
        aiPowered: response.ai_powered,
        responseTimeMs: response.response_time_ms,
        timestamp: response.timestamp,
      }
      setMessages((prev) => [...prev, assistantMsg])
    } catch (err) {
      const errMsg = {
        id: Date.now().toString() + '_err',
        role: 'error',
        content:
          err.response?.data?.detail ||
          'Failed to connect to MediAssist AI backend. Please make sure the server is running.',
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errMsg])
      setError(err.message)
    } finally {
      setIsLoading(false)
      scrollToBottom()
    }
  }, [isLoading])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, clearMessages, bottomRef }
}
```

---

## File: mediassist/frontend/src/pages/ChatPage.jsx

```jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useChat } from '../hooks/useChat'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import Sidebar from '../components/Sidebar'
import TypingIndicator from '../components/TypingIndicator'
import { getHealth } from '../utils/api'

function WelcomeScreen({ onQuickAsk }) {
  const quickTopics = [
    { label: 'I have a fever', icon: '🌡️' },
    { label: 'Cold and flu symptoms', icon: '🤧' },
    { label: 'Managing diabetes', icon: '💉' },
    { label: 'Severe headache', icon: '🧠' },
    { label: 'High blood pressure', icon: '❤️' },
    { label: 'Asthma symptoms', icon: '🫁' },
  ]
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center mx-auto mb-5 shadow-2xl pulse-ring">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">How can I help you today?</h2>
        <p className="text-[var(--text-secondary)] text-sm mb-8 max-w-sm">
          Describe your symptoms or ask a medical question. I'll provide RAG-powered, source-cited answers.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-lg mx-auto">
          {quickTopics.map((t) => (
            <motion.button
              key={t.label}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onQuickAsk(t.label)}
              className="glass-card glass-card-hover rounded-xl px-3 py-3 text-left transition-all"
            >
              <span className="text-lg block mb-1">{t.icon}</span>
              <span className="text-xs text-[var(--text-secondary)]">{t.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default function ChatPage() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [health, setHealth] = useState(null)
  const { messages, isLoading, sendMessage, clearMessages, bottomRef } = useChat()
  const lastMsgIndex = messages.length - 1

  useEffect(() => {
    getHealth().then(setHealth).catch(() => {})
  }, [])

  return (
    <div className="flex h-screen bg-[var(--midnight)] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        messages={messages}
        onClear={clearMessages}
        onClose={() => setSidebarOpen(false)}
        isOpen={sidebarOpen}
      />

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--glass-border)] glass-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors lg:hidden"
            >
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button onClick={() => navigate('/')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="font-semibold text-sm text-[var(--text-primary)] hidden sm:block">
                MediAssist <span className="gradient-text-teal">AI</span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Health status */}
            {health && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <span className={`w-2 h-2 rounded-full ${health.ai_enabled ? 'bg-teal-400' : 'bg-amber-400'}`} />
                {health.ai_enabled ? 'AI Online' : 'Context Mode'} · {health.knowledge_base_size} docs
              </div>
            )}
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                title="New conversation"
              >
                <svg className="w-4 h-4 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          <AnimatePresence>
            {messages.length === 0 ? (
              <WelcomeScreen onQuickAsk={sendMessage} />
            ) : (
              messages.map((msg, i) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  isNew={i === lastMsgIndex && msg.role === 'assistant'}
                />
              ))
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isLoading && <TypingIndicator />}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
```

---

## File: mediassist/frontend/src/pages/LandingPage.jsx

```jsx
/* LandingPage.jsx content omitted for brevity; full file present in repository */
```

---

## File: mediassist/frontend/src/utils/api.js

```js
import axios from 'axios'

const BASE_URL ='https://mediassist-9ibf.onrender.com'
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

export const askQuestion = async (question) => {
  const { data } = await api.post('/ask', { question })
  return data
}

export const getHistory = async (limit = 20) => {
  const { data } = await api.get(`/history?limit=${limit}`)
  return data
}

export const clearHistory = async () => {
  const { data } = await api.delete('/history')
  return data
}

export const getHealth = async () => {
  const { data } = await api.get('/health')
  return data
}

export default api
```

---

## File: mediassist/frontend/src/utils/highlight.js

```js
const MEDICAL_KEYWORDS = [
  'fever', 'cold', 'flu', 'headache', 'migraine', 'diabetes', 'hypertension',
  'blood pressure', 'asthma', 'allergy', 'anxiety', 'back pain', 'dehydration',
  'covid', 'coronavirus', 'symptoms', 'treatment', 'medication', 'infection',
  'inflammation', 'chronic', 'acute', 'diagnosis', 'prevention', 'vaccine',
  'antibiotic', 'antiviral', 'immune', 'respiratory', 'cardiovascular',
  'insulin', 'glucose', 'blood sugar', 'cholesterol', 'obesity', 'BMI',
  'therapy', 'surgery', 'emergency', 'urgent', 'consult', 'doctor', 'physician',
]

export function highlightKeywords(text) {
  if (!text) return text
  let result = text
  const sorted = [...MEDICAL_KEYWORDS].sort((a, b) => b.length - a.length)
  sorted.forEach((keyword) => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'gi')
    result = result.replace(regex, `<mark class="keyword-highlight">$1</mark>`)
  })
  return result
}
```

---

## File: mediassist/frontend/tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"', '"DM Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        teal: {
          50: '#f0fdfa',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
        },
        midnight: '#060d1a',
        navy: '#0a1628',
        glass: 'rgba(255,255,255,0.05)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
```

---

## File: mediassist/frontend/vite.config.js

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://mediassist-9ibf.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

---

## File: mediassist/frontend/postcss.config.js

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

---

## File: mediassist/frontend/.env.example

```text
# MediAssist AI Frontend
VITE_API_URL=https://mediassist-9ibf.onrender.com
```

---

## File: mediassist/backend/.env.example

```text
# MediAssist AI - Environment Variables
# Copy this file to .env and fill in your values

# OpenAI API Key (optional - app works without it in context-based mode)
OPENAI_API_KEY=your-openai-api-key-here

# Server settings
HOST=0.0.0.0
PORT=8000
```

---

## File: mediassist/frontend/vercel.json

```json
{"rewrites": [{"source": "\/(.*)", "destination": "/"}]}
```

---

## How to convert to PDF locally (if automatic conversion fails)

Install `pandoc` and a LaTeX engine (e.g., `TeX Live` or `MiKTeX`) and run:

```bash
pandoc mediassist_full_bundle.md -o mediassist_full_bundle.pdf --pdf-engine=xelatex
```

---

Generated by bundling script. For the complete original repository, see the workspace files.
