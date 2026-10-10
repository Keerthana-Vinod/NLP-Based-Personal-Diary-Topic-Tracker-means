import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './views/DashboardView';
import EditorView from './views/EditorView';
import HistoryView from './views/HistoryView';
import TopicExplorerView from './views/TopicExplorerView';
import AnalyticsView from './views/AnalyticsView';
import { api } from './services/api';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [entries, setEntries] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [editingEntry, setEditingEntry] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const loadData = async () => {
    try {
      const [entriesData, analyticsData] = await Promise.all([
        api.getEntries(),
        api.getAnalytics(),
      ]);
      setEntries(entriesData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error("Failed to load app data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSeedData = async () => {
    if (confirm("Re-seed sample diary entries? This will refresh your database with sample dataset entries.")) {
      setLoading(true);
      try {
        await api.seedData();
        await loadData();
        showToast("Successfully loaded demo diary entries!");
      } catch (err) {
        console.error("Failed to seed data:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setActiveTab('editor');
  };

  const handleDeleteEntry = async (id) => {
    try {
      await api.deleteEntry(id);
      await loadData();
      showToast("Entry deleted successfully.");
    } catch (err) {
      console.error("Failed to delete entry:", err);
    }
  };

  const handleSaveSuccess = async () => {
    setEditingEntry(null);
    await loadData();
    setActiveTab('history');
    showToast("Diary entry saved & NLP topic modeling updated!");
  };

  return (
    <div className="min-h-screen bg-cream-base flex flex-col font-sans selection:bg-lavender-soft selection:text-lavender-accent">
      
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab !== 'editor') setEditingEntry(null);
          setActiveTab(tab);
        }}
        onSeedData={handleSeedData}
        entryCount={entries.length}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-pastel-lg animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-lavender-soft border-t-lavender-accent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 font-medium">Running local NLP engine & loading database...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                analytics={analytics}
                entries={entries}
                onNavigate={setActiveTab}
                onEditEntry={handleEditEntry}
                onViewEntry={(entry) => handleEditEntry(entry)}
              />
            )}

            {activeTab === 'editor' && (
              <EditorView
                editingEntry={editingEntry}
                onSaveSuccess={handleSaveSuccess}
                onCancel={() => {
                  setEditingEntry(null);
                  setActiveTab('history');
                }}
              />
            )}

            {activeTab === 'history' && (
              <HistoryView
                entries={entries}
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
                onViewEntry={(entry) => handleEditEntry(entry)}
              />
            )}

            {activeTab === 'topics' && (
              <TopicExplorerView
                analytics={analytics}
                entries={entries}
                onViewEntry={(entry) => handleEditEntry(entry)}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView analytics={analytics} />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-cream bg-cream-card/50 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NLP-Based Personal Diary Topic Tracker • Powered by FastAPI, React & Local Scikit-Learn / NLTK</span>
          <span className="font-semibold text-slate-500">Local TF-IDF & LDA Engine</span>
        </div>
      </footer>

    </div>
  );
}
