# apps/backend/app/pipelines.py
import logging
import asyncio
from sqlmodel import Session
from apscheduler.schedulers.background import BackgroundScheduler
from langchain.prompts import PromptTemplate
from langchain.schema.runnable import RunnableLambda, RunnableSequence

from .db import engine
from .models import Report
from .fetch_helpers import fetch_news_helper, fetch_stock_helper, search_web_helper
from .utils.fallback_llm import generate_response_with_fallback

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------------------
# Helper: Save report into DB
# ---------------------------
def save_report(kind: str, content: str):
    """Save summarized report into the database"""
    with Session(engine) as session:
        report = Report(kind=kind, content=content)
        session.add(report)
        session.commit()
        logger.info(f"✅ Saved {kind} report at {report.created_at}")

# ---------------------------
# Prompt Templates
# ---------------------------
news_prompt = PromptTemplate.from_template(
    "Summarize the following news article:\n\n{text}"
)

stock_prompt = PromptTemplate.from_template(
    "Analyze the stock performance for {symbol} given this data:\n\n{text}"
)

trends_prompt = PromptTemplate.from_template(
    "Identify the main trends from the following search results:\n\n{text}"
)

# ---------------------------
# Runnable Wrappers for fallback LLM
# ---------------------------
news_llm = RunnableLambda(lambda x: generate_response_with_fallback(x))
stock_llm = RunnableLambda(lambda x: generate_response_with_fallback(x))
trends_llm = RunnableLambda(lambda x: generate_response_with_fallback(x))

# ---------------------------
# Pipelines
# ---------------------------
news_pipeline: RunnableSequence = news_prompt | news_llm
stock_pipeline: RunnableSequence = stock_prompt | stock_llm
trends_pipeline: RunnableSequence = trends_prompt | trends_llm

# ---------------------------
# Pipeline Runner (Sync)
# ---------------------------
def run_pipeline(topic="technology", symbol="AAPL", query="AI trends 2025",
                 limit_news=5, limit_stock=3, limit_trends=5):
    """Run all AI pipelines synchronously: news summarization, stock analysis, trends."""
    logger.info("🚀 Running full LangChain pipeline...")

    try:
        # Fetch raw data
        news_items = fetch_news_helper(topic)
        stock_items = fetch_stock_helper(symbol)
        trends_items = search_web_helper(query)

        news_text = " ".join([i["text"] for i in news_items[:limit_news]]) if news_items else ""
        stock_text = " ".join([i["text"] for i in stock_items[:limit_stock]]) if stock_items else ""
        trends_text = " ".join([i["text"] for i in trends_items[:limit_trends]]) if trends_items else ""

        if not any([news_text, stock_text, trends_text]):
            logger.warning("⚠️ No data fetched for any pipeline")
            return {}

        # Run pipelines
        news_summary = news_pipeline.invoke({"text": news_text})
        stock_summary = stock_pipeline.invoke({"text": stock_text, "symbol": symbol})
        trends_summary = trends_pipeline.invoke({"text": trends_text, "query": query})

        # Save results
        if news_summary:
            save_report("news", news_summary)
        if stock_summary:
            save_report("stock", stock_summary)
        if trends_summary:
            save_report("trends", trends_summary)

        logger.info("✅ Pipeline execution completed")
        return {
            "news_summary": news_summary,
            "stock_summary": stock_summary,
            "trends_summary": trends_summary,
        }

    except Exception as e:
        logger.error(f"❌ Pipeline execution failed: {e}")
        raise

# ---------------------------
# Pipeline Runner (Async)
# ---------------------------
async def run_pipeline_async(news_text, stock_text, trends_text, symbol, query):
    """Run all AI pipelines asynchronously (parallel execution)."""
    news_summary, stock_summary, trends_summary = await asyncio.gather(
        news_pipeline.ainvoke({"text": news_text}),
        stock_pipeline.ainvoke({"text": stock_text, "symbol": symbol}),
        trends_pipeline.ainvoke({"text": trends_text, "query": query}),
    )

    return {
        "news_summary": news_summary,
        "stock_summary": stock_summary,
        "trends_summary": trends_summary,
    }

# ---------------------------
# Scheduler for autonomous tasks
# ---------------------------
scheduler = BackgroundScheduler()

# Example schedule: news 9 AM daily, stock every 6 hours, trends 10 AM daily
scheduler.add_job(lambda: run_pipeline(topic="technology"), 'cron', hour=9, id="scheduled_news_summary")
scheduler.add_job(lambda: run_pipeline(symbol="AAPL"), 'interval', hours=6, id="scheduled_stock_check")
scheduler.add_job(lambda: run_pipeline(query="AI trends 2025"), 'cron', hour=10, id="scheduled_google_trends")

scheduler.start()
logger.info("⏰ Scheduler started: news 9 AM, stock every 6h, trends 10 AM")
