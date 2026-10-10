from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    content = Column(Text, nullable=False)
    entry_date = Column(String, index=True, nullable=False)  # Format: YYYY-MM-DD
    mood = Column(String, default="Reflective")
    keywords = Column(String, default="[]")  # JSON list string of top TF-IDF keywords
    topic_id = Column(Integer, default=0)
    topic_name = Column(String, default="General")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
