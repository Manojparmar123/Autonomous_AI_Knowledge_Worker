from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form
from pydantic import BaseModel
from pathlib import Path
from typing import Optional, Tuple
import uuid
import traceback
import time
import logging
import re
import asyncio

from fastapi.responses import JSONResponse
from sqlmodel import Session, select

# Import existing utils / helpers
from .utils.vector_db import search_in_pinecone, upsert_embeddings
from .utils.fallback_llm import get_embedding_with_fallback, generate_response_with_fallback
from .fetch_helpers import fetch_news_helper, fetch_stock_helper, search_web_helper
from .db import get_session
from .models import Report
from .context_memory import get_context, save_context
from .upload_api import extract_text

# Import your pipelines
from .pipelines import news_pipeline, stock_pipeline, trends_pipeline

logger = logging.getLogger("rag_api")
logger.setLevel(logging.DEBUG)

router = APIRouter(prefix="/rag", tags=["rag"])

BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BASE_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# -------------------- Error helper -------------------- #
def error_response(e: Exception, message: str = "Unexpected error"):
    tb = traceback.format_exc()
    logger.error("%s: %s\n%s", message, str(e), tb)
    return JSONResponse(
        status_code=500,
        content={"detail": str(e), "traceback": tb},
    )

# -------------------- Request models -------------------- #
class AskRequest(BaseModel):
    query: str

# -------------------- Safe decode helper -------------------- #
def safe_decode(x):
    if isinstance(x, bytes):
        return x.decode("utf-8", errors="ignore")
    if x is None:
        return ""
    if isinstance(x, (list, tuple)):
        return [safe_decode(i) for i in x]
    return str(x)

# -------------------- Rate limiting -------------------- #
_API_RATE_STATE = {
    "google": {"last": 0.0, "period": 60.0, "max_calls": 5, "count": 0},
    "news": {"last": 0.0, "period": 60.0, "max_calls": 5, "count": 0},
    "stock": {"last": 0.0, "period": 60.0, "max_calls": 5, "count": 0},
}

def _check_rate_limit(key: str):
    state = _API_RATE_STATE.get(key)
    if not state:
        return
    now = time.time()
    period = state["period"]
    if now - state["last"] > period:
        state["last"] = now
        state["count"] = 0
    if state["count"] >= state["max_calls"]:
        raise HTTPException(
            status_code=429, detail=f"Rate limit for {key} exceeded. Try again later."
        )
    state["count"] += 1

# -------------------- Intent + Entity classifier -------------------- #
def classify_query_intent_and_entity(query: str) -> Tuple[str, Optional[str]]:
    prompt = f"""
You are an assistant that must classify user queries and extract a single short entity (topic or stock ticker or search phrase).
Classify the following query into exactly one of: news, stock, search, general.
Then provide a short single-word or short-phrase entity (if applicable).

Respond in exactly two lines:
intent:<intent>
entity:<entity or leave blank>

Query: "{query}"
"""
    try:
        # ✅ FIX: pass query=prompt, context="" instead of wrong ordering
        resp = generate_response_with_fallback(prompt, "")
        text = (resp or "").strip()
        intent = "general"
        entity = None
        for line in text.splitlines():
            line = line.strip()
            if line.lower().startswith("intent:"):
                intent = line.split(":", 1)[1].strip().lower()
            elif line.lower().startswith("entity:"):
                ent = line.split(":", 1)[1].strip()
                if ent:
                    entity = ent
        if intent not in {"news", "stock", "search", "general"}:
            intent = "general"
        if entity:
            entity = entity.strip().strip('"').strip("'")
        return intent, entity
    except Exception as e:
        logger.warning("Intent/entity classification failed: %s", e)
        return "general", None

# -------------------- Upload endpoint -------------------- #
@router.post("/upload")
async def upload(file: UploadFile = File(...)):
    try:
        safe_name = f"{int(time.time())}-{uuid.uuid4().hex}-{file.filename}"
        file_path = UPLOAD_DIR / safe_name
        with open(file_path, "wb") as f:
            f.write(await file.read())
        logger.info("Saved upload to %s", str(file_path))
        return {
            "status": "success",
            "message": f"Saved file to {file_path.name}. Use /rag/ingest to trigger ingestion.",
            "filename": file_path.name,
        }
    except Exception as e:
        return error_response(e, "Upload failed")

# -------------------- Ingest endpoint -------------------- #
@router.post("/ingest")
async def ingest_document(
    filename: str = Form(...), session: Session = Depends(get_session)
):
    try:
        file_path = UPLOAD_DIR / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="File not found")
        content = await asyncio.to_thread(extract_text, file_path)
        if not content:
            raise HTTPException(status_code=400, detail="No text extracted from file")
        context_dict = get_context(session_id="default_session", session=session) or {}
        context_dict["document"] = content
        save_context(session_id="default_session", context_data=context_dict, session=session)
        embedding = await asyncio.to_thread(get_embedding_with_fallback, content)
        await asyncio.to_thread(upsert_embeddings, [{
            "doc_id": f"doc_{uuid.uuid4().hex}",
            "chunk_id": "chunk_0",
            "text": content,
            "source": filename,
            "embedding": embedding
        }], provider="ingested_docs")
        logger.info("Ingested document %s into context memory and vector DB", filename)
        return {"status": "success", "message": f"Document {filename} ingested and embedded"}
    except HTTPException:
        raise
    except Exception as e:
        return error_response(e, "Error in /ingest")

# -------------------- /ask endpoint -------------------- #
@router.post("/ask")
async def ask(request: AskRequest, session: Session = Depends(get_session)):
    try:
        query = request.query.strip()
        if not query:
            raise HTTPException(status_code=400, detail="query cannot be empty")
        context_dict = get_context("default_session", session=session)
        context_str = "\n".join([f"Q: {q}\nA: {a}" for q, a in context_dict.items()]) if context_dict else ""
        enriched_context = f"{context_str}\n\nUser: {query}" if context_str else f"User: {query}"

        # -------------------- Vector DB retrieval -------------------- #
        try:
            q_emb = await asyncio.to_thread(get_embedding_with_fallback, query)
            results = await asyncio.to_thread(search_in_pinecone, q_emb, top_k=5)
            if results:
                enriched_context += "\n\nContext from Pinecone:\n" + "\n\n".join([safe_decode(r.get("text", "")) for r in results if r.get("text")])
        except Exception as e:
            logger.warning("Pinecone/embedding failed: %s", e)

        # -------------------- Intent classification -------------------- #
        intent, entity = classify_query_intent_and_entity(query)
        logger.debug("Classified intent=%s entity=%s for query=%s", intent, entity, query)

        # -------------------- Run pipelines based on intent -------------------- #
        try:
            if intent == "news":
                _check_rate_limit("news")
                topic = entity if entity else query
                await asyncio.to_thread(news_pipeline, topic=topic)
                latest = session.exec(
                    select(Report).where(Report.kind=="news").order_by(Report.created_at.desc())
                ).first()
                if latest:
                    enriched_context += f"\n\nNews Pipeline Result:\n{latest.content}"

            elif intent == "stock":
                _check_rate_limit("stock")
                symbol = entity.upper() if entity else None
                if not symbol:
                    candidates = [t for t in re.findall(r"\b[A-Za-z0-9]{1,5}\b", query) if t.isupper()]
                    symbol = candidates[0] if candidates else "AAPL"
                await asyncio.to_thread(stock_pipeline, symbol=symbol)
                latest = session.exec(
                    select(Report).where(Report.kind=="stock").order_by(Report.created_at.desc())
                ).first()
                if latest:
                    enriched_context += f"\n\nStock Pipeline Result:\n{latest.content}"

            elif intent == "search":
                _check_rate_limit("google")
                q = entity if entity else query
                await asyncio.to_thread(trends_pipeline, query=q)
                latest = session.exec(
                    select(Report).where(Report.kind=="trends").order_by(Report.created_at.desc())
                ).first()
                if latest:
                    enriched_context += f"\n\nTrends Pipeline Result:\n{latest.content}"
        except HTTPException:
            raise
        except Exception as e:
            logger.warning("Pipeline execution failed: %s", e)

        # -------------------- Generate final response -------------------- #
        answer = await asyncio.to_thread(generate_response_with_fallback, query, enriched_context)
        answer = safe_decode(answer)

        # -------------------- Save context -------------------- #
        try:
            new_context_dict = context_dict or {}
            new_context_dict[query] = answer
            save_context("default_session", new_context_dict, session=session)
        except Exception as e:
            logger.warning("Saving context failed: %s", e)

        return {"query": query, "answer": answer, "intent": intent, "entity": entity, "context_used": context_str}

    except HTTPException:
        raise
    except Exception as e:
        return error_response(e, "Unexpected error in /ask")

# -------------------- /insights endpoint -------------------- #
@router.get("/insights")
async def get_insights(session: Session = Depends(get_session)):
    try:
        results = session.exec(select(Report.created_at).order_by(Report.created_at.asc())).all()
        if not results:
            return {"insights": []}
        insights = {}
        for dt in results:
            day = dt.strftime("%Y-%m-%d")
            insights[day] = insights.get(day, 0) + 1
        data = [{"date": day, "value": count} for day, count in insights.items()]
        return {"insights": data}
    except Exception as e:
        return error_response(e, "Error fetching insights")



