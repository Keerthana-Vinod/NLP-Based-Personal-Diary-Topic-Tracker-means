import React, { useState } from 'react';
import { Search, Filter, Grid, List as ListIcon, Edit2, Trash2, Eye, Calendar, Smile, Tag, X } from 'lucide-react';

export default function HistoryView({ entries, onEditEntry, onDeleteEntry, onViewEntry }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedMood, setSelectedMood] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  
  const [selectedModalEntry, setSelectedModalEntry] = useState(null);

  const uniqueTopics = ['All', ...Array.from(new Set(entries.map((e) => e.topic_name).filter(Boolean)))];
  const uniqueMoods = ['All', 'Happy', 'Calm', 'Stressed', 'Motivated', 'Reflective'];

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      !searchQuery ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.keywords || []).some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTopic = selectedTopic === 'All' || entry.topic_name === selectedTopic;
    const matchesMood = selectedMood === 'All' || entry.mood === selectedMood;

    return matchesSearch && matchesTopic && matchesMood;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-cream">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Diary Entry History</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse, search, and filter your past diary entries and NLP topic tags.
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-cream-card p-1 rounded-xl border border-cream self-start md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'grid' ? 'bg-lavender-soft text-lavender-accent font-bold shadow-xs' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'list' ? 'bg-lavender-soft text-lavender-accent font-bold shadow-xs' : 'text-slate-400 hover:text-slate-600'
            }`}
            title="List View"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-cream-card border border-cream shadow-xs">
        
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search keywords, title, or text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-cream-base border border-cream text-xs text-slate-800 focus:border-lavender focus:ring-1 focus:ring-lavender-soft outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full py-2 px-3 rounded-xl bg-cream-base border border-cream text-xs text-slate-700 outline-none focus:border-lavender"
          >
            {uniqueTopics.map((t) => (
              <option key={t} value={t}>
                Topic: {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <Smile className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="w-full py-2 px-3 rounded-xl bg-cream-base border border-cream text-xs text-slate-700 outline-none focus:border-lavender"
          >
            {uniqueMoods.map((m) => (
              <option key={m} value={m}>
                Mood: {m}
              </option>
            ))}
          </select>
        </div>

      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>Showing {filteredEntries.length} of {entries.length} entries</span>
        {(searchQuery || selectedTopic !== 'All' || selectedMood !== 'All') && (
          <button
            onClick={() => { setSearchQuery(''); setSelectedTopic('All'); setSelectedMood('All'); }}
            className="text-lavender-accent hover:underline text-xs"
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredEntries.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-cream-card border border-dashed border-slate-200">
          <p className="text-slate-500 text-sm">No diary entries matched your filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedTopic('All'); setSelectedMood('All'); }}
            className="mt-3 px-4 py-2 bg-lavender-soft text-lavender-accent rounded-xl text-xs font-semibold"
          >
            Reset Search Filters
          </button>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="group p-5 rounded-2xl bg-cream-card border border-cream shadow-xs hover:shadow-pastel hover:border-lavender transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400 font-medium flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{entry.entry_date}</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-lavender-soft text-lavender-accent border border-lavender">
                    {entry.topic_name || 'General'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base group-hover:text-lavender-accent transition-colors line-clamp-1 mb-2">
                  {entry.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {entry.content}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-1 mb-4">
                  {(entry.keywords || []).slice(0, 4).map((kw, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-sage-soft text-sage-accent font-medium">
                      #{kw}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500 flex items-center space-x-1">
                    <Smile className="w-3 h-3 text-sage-accent" />
                    <span>{entry.mood}</span>
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setSelectedModalEntry(entry)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Read Full Entry"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditEntry(entry)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-lavender-accent hover:bg-lavender-soft transition-colors"
                      title="Edit Entry"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete diary entry "${entry.title}"?`)) {
                          onDeleteEntry(entry.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 rounded-xl bg-cream-card border border-cream hover:border-lavender transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-medium">{entry.entry_date}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-lavender-soft text-lavender-accent border border-lavender">
                    {entry.topic_name}
                  </span>
                  <span className="text-[10px] text-sage-accent font-semibold px-2 py-0.5 rounded bg-sage-soft">
                    {entry.mood}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm hover:text-lavender-accent cursor-pointer" onClick={() => setSelectedModalEntry(entry)}>
                  {entry.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-1">{entry.content}</p>
              </div>

              <div className="flex items-center space-x-2 self-end md:self-center">
                <button
                  onClick={() => setSelectedModalEntry(entry)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 text-xs flex items-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">View</span>
                </button>
                <button
                  onClick={() => onEditEntry(entry)}
                  className="p-2 rounded-lg text-lavender-accent hover:bg-lavender-soft text-xs flex items-center space-x-1"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete "${entry.title}"?`)) onDeleteEntry(entry.id);
                  }}
                  className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 text-xs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl bg-cream-card rounded-3xl border border-cream shadow-pastel-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-lavender-soft text-lavender-accent border border-lavender">
                  Topic: {selectedModalEntry.topic_name}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-sage-soft text-sage-accent">
                  Mood: {selectedModalEntry.mood}
                </span>
              </div>

              <button
                onClick={() => setSelectedModalEntry(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium">{selectedModalEntry.entry_date}</span>
              <h2 className="text-xl font-bold text-slate-800 mt-1">{selectedModalEntry.title}</h2>
            </div>

            <div className="p-4 rounded-2xl bg-cream-base border border-cream text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
              {selectedModalEntry.content}
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                TF-IDF Salient Keywords
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(selectedModalEntry.keywords || []).map((kw, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-lavender-soft text-lavender-accent font-medium border border-lavender">
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  const e = selectedModalEntry;
                  setSelectedModalEntry(null);
                  onEditEntry(e);
                }}
                className="px-4 py-2 rounded-xl bg-lavender-accent text-white text-xs font-semibold hover:opacity-95"
              >
                Edit Entry
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
