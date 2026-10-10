import React from 'react';
import { BarChart3, TrendingUp, PieChart as PieIcon, Hash, Smile, Layers } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from 'recharts';

const PASTEL_COLORS = ['#7C65C1', '#5D725A', '#E0A96D', '#78A1BB', '#C87D8E', '#8F9BBA'];

export default function AnalyticsView({ analytics }) {
  if (!analytics) {
    return (
      <div className="p-8 text-center rounded-2xl bg-cream-card border border-cream">
        <p className="text-slate-500 text-sm">Loading NLP Analytics...</p>
      </div>
    );
  }

  const topicPieData = (analytics.topics || []).map((t, idx) => ({
    name: t.name,
    value: t.entry_count,
    color: PASTEL_COLORS[idx % PASTEL_COLORS.length],
  }));

  const tfidfData = (analytics.top_corpus_keywords || []).slice(0, 10).map((item) => ({
    keyword: item.text,
    score: item.value,
  }));

  const moodData = analytics.mood_distribution || [];
  const trendData = analytics.topic_trends || [];
  const topicNames = analytics.topics ? analytics.topics.map(t => t.name) : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      <div className="pb-4 border-b border-cream">
        <h1 className="text-2xl font-bold text-slate-800">Writing Statistics & Topic Analytics</h1>
        <p className="text-xs text-slate-500 mt-1">
          Visual insights into your diary writing trends, corpus TF-IDF keywords, and LDA topic distributions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-2xl bg-cream-card border border-cream shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Total Volume</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">
              {analytics.total_words.toLocaleString()} <span className="text-xs font-normal text-slate-500">words</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-lavender-soft flex items-center justify-center text-lavender-accent">
            <Hash className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cream-card border border-cream shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Avg Entry Depth</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">
              {analytics.avg_words_per_entry} <span className="text-xs font-normal text-slate-500">words/entry</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sage-soft flex items-center justify-center text-sage-accent">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-cream-card border border-cream shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">Primary Focus Topic</span>
            <span className="text-lg font-bold text-slate-800 mt-1 block truncate max-w-[160px]">
              {analytics.dominant_topic}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        <div className="p-6 rounded-3xl bg-cream-card border border-cream shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-lavender-accent" />
              <span>LDA Topic Distribution</span>
            </h2>
            <span className="text-xs text-slate-400">Relative Corpus Share</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topicPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {topicPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} entries`, name]} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-cream-card border border-cream shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <Hash className="w-4 h-4 text-sage-accent" />
              <span>Top TF-IDF Salient Keywords</span>
            </h2>
            <span className="text-xs text-slate-400">Mean Weight</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tfidfData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EFE9E0" />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} />
                <YAxis dataKey="keyword" type="category" stroke="#64748B" fontSize={11} width={80} />
                <Tooltip formatter={(val) => [`${val}%`, 'TF-IDF Weight']} />
                <Bar dataKey="score" fill="#7C65C1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 p-6 rounded-3xl bg-cream-card border border-cream shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-lavender-accent" />
              <span>Topic Trends Over Time</span>
            </h2>
            <span className="text-xs text-slate-400">Monthly Frequency Evolution</span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE9E0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Legend />
                {topicNames.map((name, i) => (
                  <Area
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stackId="1"
                    stroke={PASTEL_COLORS[i % PASTEL_COLORS.length]}
                    fill={PASTEL_COLORS[i % PASTEL_COLORS.length]}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-cream-card border border-cream shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
              <Smile className="w-4 h-4 text-sage-accent" />
              <span>Mood Breakdown</span>
            </h2>
            <span className="text-xs text-slate-400">Entries per Mood</span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moodData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EFE9E0" />
                <XAxis dataKey="mood" stroke="#94A3B8" fontSize={10} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="#8A9A86" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
