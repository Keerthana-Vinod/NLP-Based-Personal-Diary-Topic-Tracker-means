import React from 'react';
import { PlusCircle, BookOpen, Layers, Sparkles, TrendingUp, Calendar, Hash, Smile } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PASTEL_COLORS = ['#7C65C1', '#5D725A', '#E0A96D', '#78A1BB', '#C87D8E'];

export default function DashboardView({ analytics, entries, onNavigate, onEditEntry, onViewEntry }) {
  const recentEntries = entries.slice(0, 4);

  const topicChartData = (analytics?.topics || []).map((t, idx) => ({
    name: t.name,
    value: t.entry_count,
    color: PASTEL_COLORS[idx % PASTEL_COLORS.length],
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#F3F0FF] via-[#FFFDF9] to-[#F1F5F0] p-6 sm:p-8 border border-cream shadow-pastel">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/80 border border-lavender text-xs font-semibold text-lavender-accent mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-lavender-accent" />
            <span>Unsupervised Topic Modeling & TF-IDF Powered</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Welcome to Your Personal Diary Topic Tracker
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Write your daily reflections and let local Latent Dirichlet Allocation (LDA) and TF-IDF extract recurring themes, keywords, and writing trends across your entries.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('editor')}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C65C1] to-[#684FA9] text-white font-medium text-sm shadow-pastel hover:opacity-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Write New Entry</span>
            </button>
            <button
              onClick={() => onNavigate('topics')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-all"
            >
              <Layers className="w-4 h-4 text-sage-accent" />
              <span>Explore Topics</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-cream-card border border-cream shadow-sm hover:shadow-pastel transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Entries</span>
            <div className="w-8 h-8 rounded-lg bg-lavender-soft flex items-center justify-center text-lavender-accent">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-800">{analytics?.total_entries || 0}</span>
            <span className="text-xs text-slate-500 font-medium">Logged</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cream-card border border-cream shadow-sm hover:shadow-pastel transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Word Count</span>
            <div className="w-8 h-8 rounded-lg bg-sage-soft flex items-center justify-center text-sage-accent">
              <Hash className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-800">{analytics?.avg_words_per_entry || 0}</span>
            <span className="text-xs text-slate-500 font-medium">words/entry</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cream-card border border-cream shadow-sm hover:shadow-pastel transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Dominant Topic</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg font-bold text-slate-800 truncate block">
              {analytics?.dominant_topic || 'General'}
            </span>
            <span className="text-xs text-amber-600 font-medium">Most Frequent</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cream-card border border-cream shadow-sm hover:shadow-pastel transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Writing Streak</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-800">{analytics?.streak_days || 0}</span>
            <span className="text-xs text-rose-500 font-medium">active days</span>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-lavender-accent" />
              <span>Recent Diary Entries</span>
            </h2>
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-lavender-accent hover:underline"
            >
              View All ({entries.length})
            </button>
          </div>

          {recentEntries.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-cream-card border border-dashed border-slate-300">
              <p className="text-slate-500 text-sm">No diary entries found.</p>
              <button
                onClick={() => onNavigate('editor')}
                className="mt-3 px-4 py-2 bg-lavender-accent text-white rounded-xl text-xs font-medium"
              >
                Write Your First Entry
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => onViewEntry(entry)}
                  className="group p-5 rounded-2xl bg-cream-card border border-cream shadow-xs hover:shadow-pastel hover:border-lavender transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-slate-400 font-medium">{entry.entry_date}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-lavender-soft text-lavender-accent border border-lavender">
                        {entry.topic_name || 'General'}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm group-hover:text-lavender-accent transition-colors line-clamp-1">
                      {entry.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {entry.content}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {(entry.keywords || []).slice(0, 3).map((kw, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          #{kw}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-sage-accent font-semibold flex items-center space-x-1">
                      <Smile className="w-3 h-3" />
                      <span>{entry.mood || 'Reflective'}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-sage-accent" />
            <span>Topic Share (LDA)</span>
          </h2>

          <div className="p-5 rounded-2xl bg-cream-card border border-cream shadow-sm flex flex-col items-center">
            {topicChartData.length === 0 ? (
              <p className="text-slate-400 text-xs py-8">No topic data available yet.</p>
            ) : (
              <>
                <div className="w-full h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topicChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {topicChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} entries`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full space-y-2 mt-2">
                  {topicChartData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-700 font-medium truncate max-w-[140px]">{item.name}</span>
                      </div>
                      <span className="text-slate-500 font-semibold">{item.value} entries</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
