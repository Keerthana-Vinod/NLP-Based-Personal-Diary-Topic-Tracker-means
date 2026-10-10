import React from 'react';
import { BookOpen, Edit3, History, Layers, BarChart3, RotateCcw, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onSeedData, entryCount }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
    { id: 'editor', label: 'Diary Editor', icon: Edit3 },
    { id: 'history', label: 'Diary History', icon: History },
    { id: 'topics', label: 'Topic Explorer', icon: Layers },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-30 bg-cream-card/90 backdrop-blur-md border-b border-cream shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C65C1] to-[#8A9A86] flex items-center justify-center text-white shadow-pastel">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-800 tracking-tight block leading-tight">
                TopicTracker <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lavender-soft text-lavender-accent border border-lavender">NLP</span>
              </span>
              <span className="text-xs text-slate-500 hidden sm:block">NLP-Based Personal Diary</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-lavender-soft text-lavender-accent border border-lavender shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-lavender-accent' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-sage-soft text-sage-accent border border-sage">
              {entryCount} {entryCount === 1 ? 'Entry' : 'Entries'} Saved
            </span>
            <button
              onClick={onSeedData}
              title="Reset & Load Demo Data"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cream-base text-slate-600 hover:bg-lavender-soft hover:text-lavender-accent border border-slate-200 transition-all duration-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>

        </div>

        <div className="md:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center min-w-[64px] py-1 px-2 text-xs font-medium rounded-lg ${
                  isActive ? 'text-lavender-accent bg-lavender-soft font-bold' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
