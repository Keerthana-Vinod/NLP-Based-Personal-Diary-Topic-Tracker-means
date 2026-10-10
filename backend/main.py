import json
import logging
from typing import List, Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db
import nlp_engine
from seed_data import SAMPLE_ENTRIES

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NLP-Based Personal Diary Topic Tracker API",
    description="Backend API for Diary management, TF-IDF keyword extraction, and LDA topic modeling",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def update_all_topics_and_keywords(db: Session):
    entries = db.query(models.Entry).all()
    if not entries:
        return

    for entry in entries:
        kw = nlp_engine.extract_keywords_single(f"{entry.title} {entry.content}", top_n=6)
        entry.keywords = json.dumps(kw)

    topics_info, entry_topic_map = nlp_engine.perform_lda_topic_modeling(entries, n_topics=4)

    for entry in entries:
        if entry.id in entry_topic_map:
            t_id, t_name = entry_topic_map[entry.id]
            entry.topic_id = t_id
            entry.topic_name = t_name

    db.commit()

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    try:
        count = db.query(models.Entry).count()
        if count == 0:
            logging.info("Database is empty. Seeding sample diary entries...")
            for sample in SAMPLE_ENTRIES:
                entry = models.Entry(
                    title=sample["title"],
                    content=sample["content"],
                    entry_date=sample["entry_date"],
                    mood=sample["mood"]
                )
                db.add(entry)
            db.commit()
            update_all_topics_and_keywords(db)
            logging.info("Sample entries successfully seeded and processed with NLP!")
    except Exception as e:
        logging.error(f"Error during startup auto-seeding: {e}")
    finally:
        db.close()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/entries", response_model=List[schemas.EntryResponse])
def get_entries(
    search: Optional[str] = None,
    topic: Optional[str] = None,
    mood: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Entry)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (models.Entry.title.ilike(search_pattern)) | 
            (models.Entry.content.ilike(search_pattern)) |
            (models.Entry.keywords.ilike(search_pattern))
        )

    if topic and topic != "All":
        query = query.filter(models.Entry.topic_name == topic)

    if mood and mood != "All":
        query = query.filter(models.Entry.mood == mood)

    entries = query.order_by(models.Entry.entry_date.desc(), models.Entry.id.desc()).all()

    result = []
    for e in entries:
        try:
            kw_list = json.loads(e.keywords) if e.keywords else []
        except Exception:
            kw_list = []
        
        word_count = len(e.content.split())
        result.append(schemas.EntryResponse(
            id=e.id,
            title=e.title,
            content=e.content,
            entry_date=e.entry_date,
            mood=e.mood,
            keywords=kw_list,
            topic_id=e.topic_id or 0,
            topic_name=e.topic_name or "General",
            word_count=word_count,
            created_at=e.created_at,
            updated_at=e.updated_at
        ))

    return result

@app.post("/api/entries", response_model=schemas.EntryResponse, status_code=status.HTTP_201_CREATED)
def create_entry(entry_in: schemas.EntryCreate, db: Session = Depends(get_db)):
    kw = nlp_engine.extract_keywords_single(f"{entry_in.title} {entry_in.content}", top_n=6)
    
    new_entry = models.Entry(
        title=entry_in.title,
        content=entry_in.content,
        entry_date=entry_in.entry_date,
        mood=entry_in.mood,
        keywords=json.dumps(kw)
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)

    update_all_topics_and_keywords(db)
    db.refresh(new_entry)

    kw_list = json.loads(new_entry.keywords) if new_entry.keywords else []
    return schemas.EntryResponse(
        id=new_entry.id,
        title=new_entry.title,
        content=new_entry.content,
        entry_date=new_entry.entry_date,
        mood=new_entry.mood,
        keywords=kw_list,
        topic_id=new_entry.topic_id or 0,
        topic_name=new_entry.topic_name or "General",
        word_count=len(new_entry.content.split()),
        created_at=new_entry.created_at,
        updated_at=new_entry.updated_at
    )

@app.get("/api/entries/{entry_id}", response_model=schemas.EntryResponse)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Diary entry not found")
    
    kw_list = json.loads(entry.keywords) if entry.keywords else []
    return schemas.EntryResponse(
        id=entry.id,
        title=entry.title,
        content=entry.content,
        entry_date=entry.entry_date,
        mood=entry.mood,
        keywords=kw_list,
        topic_id=entry.topic_id or 0,
        topic_name=entry.topic_name or "General",
        word_count=len(entry.content.split()),
        created_at=entry.created_at,
        updated_at=entry.updated_at
    )

@app.put("/api/entries/{entry_id}", response_model=schemas.EntryResponse)
def update_entry(entry_id: int, entry_in: schemas.EntryUpdate, db: Session = Depends(get_db)):
    entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Diary entry not found")

    if entry_in.title is not None:
        entry.title = entry_in.title
    if entry_in.content is not None:
        entry.content = entry_in.content
    if entry_in.entry_date is not None:
        entry.entry_date = entry_in.entry_date
    if entry_in.mood is not None:
        entry.mood = entry_in.mood

    kw = nlp_engine.extract_keywords_single(f"{entry.title} {entry.content}", top_n=6)
    entry.keywords = json.dumps(kw)
    entry.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(entry)

    update_all_topics_and_keywords(db)
    db.refresh(entry)

    kw_list = json.loads(entry.keywords) if entry.keywords else []
    return schemas.EntryResponse(
        id=entry.id,
        title=entry.title,
        content=entry.content,
        entry_date=entry.entry_date,
        mood=entry.mood,
        keywords=kw_list,
        topic_id=entry.topic_id or 0,
        topic_name=entry.topic_name or "General",
        word_count=len(entry.content.split()),
        created_at=entry.created_at,
        updated_at=entry.updated_at
    )

@app.delete("/api/entries/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Diary entry not found")

    db.delete(entry)
    db.commit()

    update_all_topics_and_keywords(db)
    return {"message": "Entry successfully deleted"}

@app.post("/api/entries/seed")
def seed_database(db: Session = Depends(get_db)):
    db.query(models.Entry).delete()
    db.commit()

    for sample in SAMPLE_ENTRIES:
        entry = models.Entry(
            title=sample["title"],
            content=sample["content"],
            entry_date=sample["entry_date"],
            mood=sample["mood"]
        )
        db.add(entry)
    db.commit()
    update_all_topics_and_keywords(db)
    return {"message": "Database successfully re-seeded with sample diary entries"}

@app.post("/api/nlp/preview", response_model=schemas.NLPPreviewResponse)
def preview_nlp(request: schemas.NLPPreviewRequest):
    full_text = f"{request.title} {request.content}".strip()
    if not full_text:
        return schemas.NLPPreviewResponse(
            keywords=[],
            suggested_topic="General",
            word_count=0,
            sentiment_hint="Neutral"
        )

    keywords = nlp_engine.extract_keywords_single(full_text, top_n=5)
    topic_label = nlp_engine.derive_topic_label(keywords)
    sentiment = nlp_engine.get_sentiment_hint(full_text)
    word_count = len(request.content.split())

    return schemas.NLPPreviewResponse(
        keywords=keywords,
        suggested_topic=topic_label,
        word_count=word_count,
        sentiment_hint=sentiment
    )

@app.get("/api/analytics", response_model=schemas.AnalyticsSummary)
def get_analytics(db: Session = Depends(get_db)):
    entries = db.query(models.Entry).all()
    if not entries:
        return schemas.AnalyticsSummary(
            total_entries=0,
            total_words=0,
            avg_words_per_entry=0,
            dominant_topic="None",
            streak_days=0,
            topics=[],
            top_corpus_keywords=[],
            mood_distribution=[],
            topic_trends=[]
        )

    total_entries = len(entries)
    total_words = sum(len(e.content.split()) for e in entries)
    avg_words = round(total_words / total_entries) if total_entries > 0 else 0

    dates = sorted(set(e.entry_date for e in entries), reverse=True)
    streak = len(dates)

    topics_info, _ = nlp_engine.perform_lda_topic_modeling(entries, n_topics=4)
    
    formatted_topics = []
    dominant_topic = "General"
    max_count = -1
    for t in topics_info:
        formatted_topics.append(schemas.TopicDetail(
            id=t["id"],
            name=t["name"],
            top_words=t["top_words"],
            entry_count=t["entry_count"],
            percentage=t["percentage"]
        ))
        if t["entry_count"] > max_count:
            max_count = t["entry_count"]
            dominant_topic = t["name"]

    corpus_texts = [f"{e.title} {e.content}" for e in entries]
    top_corpus_keywords = nlp_engine.extract_corpus_keywords(corpus_texts, top_n=12)

    mood_counts = {}
    for e in entries:
        m = e.mood or "Reflective"
        mood_counts[m] = mood_counts.get(m, 0) + 1
    
    mood_distribution = [{"mood": m, "count": cnt} for m, cnt in mood_counts.items()]

    trends_by_month = {}
    topic_names = list(set(e.topic_name for e in entries if e.topic_name))

    for e in entries:
        month_str = e.entry_date[:7] if e.entry_date and len(e.entry_date) >= 7 else "2026-10"
        if month_str not in trends_by_month:
            trends_by_month[month_str] = {t_name: 0 for t_name in topic_names}
        
        t_name = e.topic_name or "General"
        trends_by_month[month_str][t_name] = trends_by_month[month_str].get(t_name, 0) + 1

    sorted_months = sorted(trends_by_month.keys())
    topic_trends = []
    for m in sorted_months:
        row = {"date": m}
        row.update(trends_by_month[m])
        topic_trends.append(row)

    return schemas.AnalyticsSummary(
        total_entries=total_entries,
        total_words=total_words,
        avg_words_per_entry=avg_words,
        dominant_topic=dominant_topic,
        streak_days=streak,
        topics=formatted_topics,
        top_corpus_keywords=top_corpus_keywords,
        mood_distribution=mood_distribution,
        topic_trends=topic_trends
    )
