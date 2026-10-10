from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class EntryBase(BaseModel):
    title: str
    content: str
    entry_date: str
    mood: Optional[str] = "Reflective"

class EntryCreate(EntryBase):
    pass

class EntryUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    entry_date: Optional[str] = None
    mood: Optional[str] = None

class EntryResponse(EntryBase):
    id: int
    keywords: List[str] = []
    topic_id: int = 0
    topic_name: str = "General"
    word_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class NLPPreviewRequest(BaseModel):
    content: str
    title: Optional[str] = ""

class NLPPreviewResponse(BaseModel):
    keywords: List[str]
    suggested_topic: str
    word_count: int
    sentiment_hint: str

class TopicDetail(BaseModel):
    id: int
    name: str
    top_words: List[str]
    entry_count: int
    percentage: float

class AnalyticsSummary(BaseModel):
    total_entries: int
    total_words: int
    avg_words_per_entry: int
    dominant_topic: str
    streak_days: int
    topics: List[TopicDetail]
    top_corpus_keywords: List[dict]
    mood_distribution: List[dict]
    topic_trends: List[dict]
