import React, { useState } from 'react';
import { Layers, Sparkles, BookOpen, ChevronRight, Hash, ArrowUpRight } from 'lucide-react';

export default function TopicExplorerView({ analytics, entries, onViewEntry }) {
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  const topics = analytics?.topics || [];
  
  const activeTopic = selectedTopicId !== null 
    ? topics.find(t => t.id === selectedTopicId)
    : topics[0];

  const topicEntries = activeTopic 
    ? entries.filter(e => e.topic_name === activeTopic.name)
    : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      <div className="pb-4 border-b border-cream">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-lavender-soft border border-lavender text-xs font-semibold text-lavender-accent mb-2">
          <Layers className="w-3.5 h-3.5" />
          <span>Unsupervised Latent Dirichlet Allocation (LDA)</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Topic Explorer</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore recurring themes automatically discovered across your diary corpus by local LDA topic modeling.
        </p>
      </div>

      {topics.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-cream-card border border-dashed border-slate-300">
          <p className="text-slate-500 text-sm">No topics discovered yet. Add more diary entries!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 px-1">
              Discovered LDA Topics ({topics.length})
            </h2>

            <div className="space-y-3">
              {topics.map((t) => {
                const isSelected = activeTopic?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTopicId(t.id)}
                    className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 border ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#F3F0FF] to-[#FFFDF9] border-lavender shadow-pastel'
                        : 'bg-cream-card border-cream hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        isSelected ? 'bg-lavender-accent text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        Topic #{t.id + 1}
                      </span>
                      <span className="text-xs font-bold text-sage-accent">
                        {t.percentage}% share
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-800 text-base mt-2">
                      {t.name}
                    </h3>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {t.top_words.slice(0, 5).map((w, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium"
                        >
                          {w}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>{t.entry_count} {t.entry_count === 1 ? 'entry' : 'entries'}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-lavender-accent' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            
            {activeTopic && (
              <div className="p-6 rounded-3xl bg-cream-card border border-cream shadow-sm space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Topic Focus</span>
                    <h2 className="text-xl font-bold text-slate-800 mt-0.5">{activeTopic.name}</h2>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-sage-soft text-sage-accent text-xs font-bold border border-sage self-start sm:self-auto">
                    {activeTopic.entry_count} Assigned Entries ({activeTopic.percentage}% of Corpus)
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-lavender-accent" />
                    <span>Top Weighted Terms in LDA Matrix</span>
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {activeTopic.top_words.map((word, i) => {
                      const sizes = ['text-sm px-3.5 py-1.5', 'text-xs px-3 py-1', 'text-xs px-2.5 py-1'];
                      const sizeClass = sizes[i] || 'text-[11px] px-2 py-0.5';
                      return (
                        <div
                          key={i}
                          className={`rounded-xl font-bold shadow-xs transition-transform hover:scale-105 ${sizeClass} bg-lavender-soft text-lavender-accent border border-lavender flex items-center space-x-1`}
                        >
                          <Hash className="w-3 h-3 opacity-60" />
                          <span>{word}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                    <span>Associated Diary Entries ({topicEntries.length})</span>
                  </h3>

                  {topicEntries.length === 0 ? (
                    <p className="text-slate-400 text-xs py-4 italic">No entries tagged under this topic yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {topicEntries.map((entry) => (
                        <div
                          key={entry.id}
                          onClick={() => onViewEntry(entry)}
                          className="p-4 rounded-xl bg-cream-base border border-cream hover:border-lavender transition-all cursor-pointer flex items-center justify-between group"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-slate-400 font-medium">{entry.entry_date}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-sage-soft text-sage-accent font-semibold">
                                {entry.mood}
                              </span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm group-hover:text-lavender-accent transition-colors">
                              {entry.title}
                            </h4>
                            <p className="text-xs text-slate-600 line-clamp-1">{entry.content}</p>
                          </div>

                          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-lavender-accent transition-colors flex-shrink-0" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
