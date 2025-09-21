from celery_app import app
from graph import run_pipeline

@app.task
def daily_report(query: str = "markets"):
    return run_pipeline(query)
