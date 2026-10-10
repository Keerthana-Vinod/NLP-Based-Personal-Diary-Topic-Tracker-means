# NLP-Based Personal Diary Topic Tracker

A full-stack web application built with **React, Tailwind CSS, Python FastAPI, SQLite, NLTK, and Scikit-learn**.

The application allows users to write, save, edit, delete, search, and analyze personal diary entries. It employs **TF-IDF (Term Frequency-Inverse Document Frequency)** for keyword extraction and **LDA (Latent Dirichlet Allocation)** for automatic unsupervised topic modeling to discover recurring themes such as Studies, Coding Projects, Social Life, and Career Goals.

---

## Features

- **Diary Management (CRUD)**: Write, edit, delete, and search diary entries with mood tags and custom dates.
- **TF-IDF Keyword Extraction**: Identifies salient key phrases for individual entries and corpus-wide top terms.
- **LDA Topic Modeling**: Automatically groups diary entries into distinct recurring topic domains.
- **Live NLP Preview**: Instant TF-IDF keyword and LDA topic prediction for unsaved text directly in the diary editor.
- **Interactive Visual Analytics**: Charts built with Recharts displaying topic distributions, trend timelines over months, TF-IDF weights, and mood breakdowns.
- **Pastel Palette Aesthetic UI**: Tailored pastel lavender, cream, and sage green aesthetic with glassmorphism and subtle micro-animations.
- **Auto-Seeded Sample Data**: Pre-loaded with realistic diary entries covering various life themes.
- **100% Local & Free NLP**: Runs entirely on local CPU via NLTK and Scikit-learn without any paid APIs.

---

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide-React, Axios
- **Backend**: Python FastAPI, Uvicorn, SQLAlchemy, Pydantic, SQLite
- **NLP / ML**: Scikit-learn (`TfidfVectorizer`, `LatentDirichletAllocation`), NLTK (`stopwords`, `wordnet`)

---

## Setup & Running Instructions

### 1. Backend Setup (FastAPI)

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Launch FastAPI server
python -m uvicorn main:app --reload --port 8000
```

The FastAPI backend will start at `http://127.0.0.1:8000`. API documentation is available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Launch Vite development server
npm run dev
```

The frontend application will open at `http://localhost:5173`.
