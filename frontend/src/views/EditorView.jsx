import React, { useState, useEffect } from 'react';
import { Save, Sparkles, Hash, Calendar, Smile, X, Check, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const MOODS = ['Happy', 'Calm', 'Stressed', 'Motivated', 'Reflective'];

export default function EditorView({ editingEntry, onSaveSuccess, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [mood, setMood] = useState('Reflective');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [nlpPreview, setNlpPreview] = useState(null);

  useEffect(() => {
    if (editingEntry) {
      setTitle(editingEntry.title || '');
      setContent(editingEntry.content || '');
      setEntryDate(editingEntry.entry_date || new Date().toISOString().split('T')[0]);
      setMood(editingEntry.mood || 'Reflective');
    }
  }, [editingEntry]);

  const handleRunNlpPreview = async () => {
    if (!content.trim() && !title.trim()) return;
    setPreviewLoading(true);
    try {
      const res = await api.previewNLP({ title, content });
      setNlpPreview(res);
    } catch (err) {
      console.error("NLP Preview Error", err);
    } finally {
      setPreviewLoading(false);
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("Please provide both a title and content for your entry.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        entry_date: entryDate,
        mood,
      };

      if (editingEntry) {
        await api.updateEntry(editingEntry.id, payload);
      } else {
        await api.createEntry(payload);
      }

      onSaveSuccess();
    } catch (err) {
      console.error("Failed to save entry", err);
      alert("Error saving diary entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      
      <div className="flex items-center justify-between pb-4 border-b border-cream">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {editingEntry ? 'Edit Diary Entry' : 'Write New Entry'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Express your thoughts. Local TF-IDF and LDA will automatically extract keywords and topics.
          </p>
        </div>

        {editingEntry && (
          <button
            onClick={onCancel}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
            <span>Cancel Edit</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Entry Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Acing the NLP Exam & Afternoon Coffee..."
              required
              className="w-full px-4 py-3 rounded-xl bg-cream-card border border-cream focus:border-lavender focus:ring-2 focus:ring-lavender-soft text-slate-800 text-sm font-semibold outline-none transition-all shadow-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-lavender-accent" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-cream-card border border-cream focus:border-lavender focus:ring-2 focus:ring-lavender-soft text-slate-700 text-sm outline-none transition-all shadow-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center space-x-1">
                <Smile className="w-3.5 h-3.5 text-sage-accent" />
                <span>Mood Tag</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMood(m)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      mood === m
                        ? 'bg-sage-accent text-white shadow-xs'
                        : 'bg-cream-card text-slate-600 border border-slate-200 hover:bg-sage-soft'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Diary Content
              </label>
              <span className="text-xs text-slate-400 font-medium">
                {wordCount} words
              </span>
            </div>
            <textarea
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you work on, learn, or experience today? Write freely..."
              required
              className="w-full p-4 rounded-2xl bg-cream-card border border-cream focus:border-lavender focus:ring-2 focus:ring-lavender-soft text-slate-800 text-sm leading-relaxed outline-none transition-all shadow-xs resize-y"
            ></textarea>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleRunNlpPreview}
              disabled={previewLoading || (!title.trim() && !content.trim())}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-lavender-soft text-lavender-accent border border-lavender hover:bg-lavender-100 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${previewLoading ? 'animate-spin' : ''}`} />
              <span>{previewLoading ? 'Analyzing...' : 'Preview Live NLP Analysis'}</span>
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7C65C1] to-[#684FA9] text-white text-sm font-semibold shadow-pastel hover:opacity-95 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : editingEntry ? 'Update Entry' : 'Save Diary Entry'}</span>
            </button>
          </div>

        </form>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-cream-card border border-cream shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-lavender-accent" />
              <h3 className="font-bold text-slate-800 text-sm">Real-time NLP Insights</h3>
            </div>

            {nlpPreview ? (
              <div className="space-y-4 animate-fadeIn">
                
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Estimated LDA Topic
                  </span>
                  <div className="inline-block px-3 py-1 rounded-full bg-lavender-soft text-lavender-accent border border-lavender text-xs font-bold">
                    {nlpPreview.suggested_topic}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                    TF-IDF Key Phrases
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {nlpPreview.keywords.length > 0 ? (
                      nlpPreview.keywords.map((kw, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-sage-soft text-sage-accent border border-sage font-medium">
                          #{kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No salient keywords extracted yet.</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Tone / Sentiment
                  </span>
                  <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md inline-block">
                    {nlpPreview.sentiment_hint}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Length Metric
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {nlpPreview.word_count} words analyzed
                  </span>
                </div>

              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Type your entry content and click <strong className="text-lavender-accent">"Preview Live NLP Analysis"</strong> to see extracted TF-IDF keywords and estimated LDA topic tag before saving.
                </p>
              </div>
            )}

          </div>

          <div className="p-4 rounded-xl bg-sage-soft border border-sage text-xs text-sage-accent space-y-1">
            <p className="font-semibold">Local Processing Guarantee</p>
            <p className="text-[11px] opacity-90">
              All TF-IDF matrix transformations and LDA topic clustering run strictly on your local machine using NLTK and Scikit-learn.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
