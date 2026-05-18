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
    # Allow both localhost (development) and deployed frontend origins
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://mediassist-ai.vercel.app",
        "*",  # Fallback for other deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Import RAG after app setup ─────────────────
# Use package-relative import so the module resolves when running as
# a package (e.g. `python -m uvicorn mediassist.backend.main`).
from .rag import answer_medical_question

# ── In-memory chat history (replace with DB for prod) ──
chat_history: List[dict] = []


# ── Startup event ──────────────────────────────
@app.on_event("startup")
async def startup_event():
    logger.info("=" * 60)
    logger.info("MediAssist AI Backend Starting Up")
    logger.info("=" * 60)
    
    # Verify environment
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()
    ai_enabled = bool(openai_key and openai_key not in ("", "your-openai-api-key-here"))
    
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"AI Powered Mode: {'✓ Enabled' if ai_enabled else '✗ Disabled (using context-based mode)'}")
    logger.info(f"Knowledge Base: Loaded successfully")
    logger.info("Backend is ready to accept requests")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("MediAssist AI Backend shutting down")


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
    from .rag import KNOWLEDGE_BASE
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
