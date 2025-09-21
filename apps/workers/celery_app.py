import os
from celery import Celery

broker = os.getenv("REDIS_URL", "redis://localhost:6379/0")
app = Celery("ai_worker", broker=broker, backend=broker)
