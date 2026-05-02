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