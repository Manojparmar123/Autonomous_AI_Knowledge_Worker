# Minimal orchestration chain (ingest -> summarize -> insight -> report)
def run_pipeline(query: str):
    docs = step_ingest(query)
    summaries = step_summarize(docs)
    insights = step_insight(summaries)
    report = step_report(insights)
    return {"docs": docs, "summaries": summaries, "insights": insights, "report": report}

def step_ingest(query: str):
    return [{"title": f"Doc about {query}", "text": f"Some content about {query}"}]

def step_summarize(docs):
    return [{"doc": d["title"], "summary": d["text"][:120]} for d in docs]

def step_insight(summaries):
    return [{"type": "trend", "text": f"Trend detected in {s['doc']}", "confidence": 0.7, "topics": []} for s in summaries]

def step_report(insights):
    return {"blocks": [{"type": "markdown", "text": f"Found {len(insights)} insights."}]}
