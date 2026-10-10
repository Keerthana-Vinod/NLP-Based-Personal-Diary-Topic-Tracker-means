import re
import json
import logging
from typing import List, Dict, Tuple, Any

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation

for resource in ['stopwords', 'punkt', 'wordnet', 'omw-1.4']:
    try:
        nltk.download(resource, quiet=True)
    except Exception as e:
        logging.warning(f"Could not download NLTK resource {resource}: {e}")

lemmatizer = WordNetLemmatizer()

CUSTOM_STOPWORDS = {
    "today", "felt", "feel", "feels", "feeling", "went", "got", "also", "like", 
    "really", "day", "much", "time", "going", "think", "thought", "back", "still",
    "see", "good", "make", "made", "know", "want", "wanted", "one", "things", "thing"
}

def get_stop_words() -> set:
    try:
        sw = set(stopwords.words('english'))
    except Exception:
        sw = set()
    return sw.union(CUSTOM_STOPWORDS)

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    
    stop_words = get_stop_words()
    tokens = text.split()
    cleaned_tokens = []
    for token in tokens:
        if len(token) > 2 and token not in stop_words:
            try:
                lemma = lemmatizer.lemmatize(token)
            except Exception:
                lemma = token
            if lemma not in stop_words:
                cleaned_tokens.append(lemma)
                
    return " ".join(cleaned_tokens)

def extract_keywords_single(text: str, top_n: int = 5) -> List[str]:
    cleaned = clean_text(text)
    if not cleaned or len(cleaned.split()) < 3:
        words = [w for w in text.lower().split() if len(w) > 3 and w not in get_stop_words()]
        return list(dict.from_keys(words))[:top_n]
    
    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=25, stop_words='english')
        tfidf_matrix = vectorizer.fit_transform([cleaned])
        feature_names = vectorizer.get_feature_names_out()
        scores = tfidf_matrix.toarray()[0]
        
        word_score = list(zip(feature_names, scores))
        word_score.sort(key=lambda x: x[1], reverse=True)
        return [word for word, score in word_score if score > 0][:top_n]
    except Exception:
        words = [w for w in cleaned.split() if len(w) > 3]
        return list(dict.from_keys(words))[:top_n]

def extract_corpus_keywords(texts: List[str], top_n: int = 15) -> List[Dict[str, Any]]:
    cleaned_texts = [clean_text(t) for t in texts if clean_text(t)]
    if not cleaned_texts:
        return []
    
    try:
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=100, stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(cleaned_texts)
        feature_names = vectorizer.get_feature_names_out()
        
        mean_scores = tfidf_matrix.mean(axis=0).A1
        word_score = list(zip(feature_names, mean_scores))
        word_score.sort(key=lambda x: x[1], reverse=True)
        
        results = []
        for word, score in word_score[:top_n]:
            results.append({"text": word, "value": round(float(score) * 100, 2)})
        return results
    except Exception as e:
        logging.error(f"Error extracting corpus keywords: {e}")
        return []

def derive_topic_label(top_words: List[str]) -> str:
    words_set = set(top_words)
    
    academia_kw = {"study", "exam", "assignment", "course", "lecture", "professor", "class", "university", "math", "test", "grade", "research", "paper"}
    projects_kw = {"code", "project", "python", "bug", "github", "api", "react", "app", "database", "feature", "build", "developer", "model", "nlp"}
    social_kw = {"friend", "coffee", "hangout", "party", "dinner", "lunch", "fun", "family", "movie", "weekend", "chat", "met", "park"}
    career_kw = {"career", "interview", "resume", "job", "goal", "future", "work", "apply", "internship", "company", "linkedin", "skills", "salary"}
    health_kw = {"workout", "gym", "health", "sleep", "walk", "run", "tired", "meditation", "exercise", "rest", "diet", "mental"}

    if len(words_set.intersection(academia_kw)) >= 1:
        return "Studies & Academia"
    elif len(words_set.intersection(projects_kw)) >= 1:
        return "Projects & Coding"
    elif len(words_set.intersection(social_kw)) >= 1:
        return "Social & Friends"
    elif len(words_set.intersection(career_kw)) >= 1:
        return "Career & Future"
    elif len(words_set.intersection(health_kw)) >= 1:
        return "Health & Wellness"
    else:
        caps = [w.capitalize() for w in top_words[:2]]
        return " & ".join(caps) if caps else "General Reflections"

def perform_lda_topic_modeling(entries: List[Any], n_topics: int = 4) -> Tuple[List[Dict[str, Any]], Dict[int, Tuple[int, str]]]:
    if not entries:
        return [], {}

    cleaned_texts = []
    valid_entries = []
    for entry in entries:
        full_txt = f"{entry.title} {entry.content}"
        c = clean_text(full_txt)
        if c:
            cleaned_texts.append(c)
            valid_entries.append(entry)

    if len(cleaned_texts) < 3:
        return _fallback_topic_modeling(entries)

    try:
        cv = CountVectorizer(max_features=150, min_df=1, stop_words='english')
        dtm = cv.fit_transform(cleaned_texts)
        feature_names = cv.get_feature_names_out()

        if dtm.shape[1] < n_topics:
            return _fallback_topic_modeling(entries)

        actual_n_topics = min(n_topics, dtm.shape[1])
        lda = LatentDirichletAllocation(n_components=actual_n_topics, random_state=42, max_iter=20)
        lda_matrix = lda.fit_transform(dtm)

        topics_info = []
        topic_labels = {}

        for topic_idx, topic in enumerate(lda.components_):
            top_word_indices = topic.argsort()[:-8:-1]
            top_words = [feature_names[i] for i in top_word_indices]
            label = derive_topic_label(top_words)
            topic_labels[topic_idx] = (label, top_words)

        entry_topic_map = {}
        topic_counts = {t_idx: 0 for t_idx in topic_labels.keys()}

        for i, entry in enumerate(valid_entries):
            topic_distribution = lda_matrix[i]
            dominant_topic_id = int(topic_distribution.argmax())
            t_name, _ = topic_labels[dominant_topic_id]
            entry_topic_map[entry.id] = (dominant_topic_id, t_name)
            topic_counts[dominant_topic_id] += 1

        total_valid = len(valid_entries)
        for t_idx, (t_name, t_words) in topic_labels.items():
            count = topic_counts[t_idx]
            pct = round((count / total_valid) * 100, 1) if total_valid > 0 else 0.0
            topics_info.append({
                "id": t_idx,
                "name": t_name,
                "top_words": t_words[:6],
                "entry_count": count,
                "percentage": pct
            })

        return topics_info, entry_topic_map

    except Exception as e:
        logging.error(f"LDA Topic Modeling Error: {e}")
        return _fallback_topic_modeling(entries)

def _fallback_topic_modeling(entries: List[Any]) -> Tuple[List[Dict[str, Any]], Dict[int, Tuple[int, str]]]:
    topic_categories = [
        {"id": 0, "name": "Studies & Academia", "kw": ["study", "exam", "course", "lecture", "assignment", "class"], "words": ["study", "exam", "assignment", "course", "lecture", "class"]},
        {"id": 1, "name": "Projects & Coding", "kw": ["code", "project", "python", "bug", "github", "api", "app"], "words": ["code", "project", "python", "github", "api", "react"]},
        {"id": 2, "name": "Social & Friends", "kw": ["friend", "coffee", "hangout", "party", "dinner", "fun"], "words": ["friend", "coffee", "hangout", "dinner", "family", "fun"]},
        {"id": 3, "name": "Career & Growth", "kw": ["career", "interview", "resume", "job", "goal", "future"], "words": ["career", "interview", "resume", "job", "goal", "skills"]}
    ]

    entry_topic_map = {}
    counts = {t["id"]: 0 for t in topic_categories}

    for entry in entries:
        txt = (entry.title + " " + entry.content).lower()
        matched_topic = 3
        max_matches = 0
        for cat in topic_categories:
            matches = sum(1 for kw in cat["kw"] if kw in txt)
            if matches > max_matches:
                max_matches = matches
                matched_topic = cat["id"]

        counts[matched_topic] += 1
        t_name = next(tc["name"] for tc in topic_categories if tc["id"] == matched_topic)
        entry_topic_map[entry.id] = (matched_topic, t_name)

    total = len(entries)
    topics_info = []
    for cat in topic_categories:
        cnt = counts[cat["id"]]
        pct = round((cnt / total) * 100, 1) if total > 0 else 0.0
        topics_info.append({
            "id": cat["id"],
            "name": cat["name"],
            "top_words": cat["words"],
            "entry_count": cnt,
            "percentage": pct
        })

    return topics_info, entry_topic_map

def get_sentiment_hint(text: str) -> str:
    positive_words = {"happy", "great", "awesome", "excited", "passed", "solved", "enjoyed", "proud", "wonderful", "relaxed", "peaceful", "good", "love"}
    negative_words = {"stressed", "tired", "failed", "bug", "hard", "difficult", "anxious", "sad", "frustrated", "worried", "exhausted", "late", "stuck"}

    tokens = set(re.findall(r'\b\w+\b', text.lower()))
    pos_count = len(tokens.intersection(positive_words))
    neg_count = len(tokens.intersection(negative_words))

    if pos_count > neg_count:
        return "Positive / Uplifting"
    elif neg_count > pos_count:
        return "Challenging / Reflective"
    else:
        return "Neutral / Balanced"
