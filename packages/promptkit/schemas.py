from pydantic import BaseModel
from typing import List, Optional

class Evidence(BaseModel):
    document_id: str
    snippet: str
    url: Optional[str] = None

class Insight(BaseModel):
    type: str  # trend|anomaly|risk|opportunity|sentiment
    text: str
    confidence: float
    impact: str = "medium"
    topics: List[str] = []
    evidence: List[Evidence] = []
