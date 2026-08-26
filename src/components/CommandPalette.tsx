import React, { useState, useEffect } from 'react';
import {
  Search,
  Youtube,
  Layers,
  HelpCircle,
  FileSpreadsheet,
  PenTool,
  Calendar,
  Mic,
  Timer,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { GemMode } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGem: (gem: GemMode) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectGem,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items: { id: GemMode; label: string; desc: string; icon: any }[] = [
    {
      id: 'youtube-notes',
      label: 'YouTube Video to Cornell Notes',
      desc: 'Summarize lectures with timestamps & key takeaways',
      icon: Youtube,
    },
    {
      id: 'flashcards',
      label: 'Flashcard Studio & Leitner Box',
      desc: 'Spaced repetition decks with Anki export',
      icon: Layers,
    },
    {
      id: 'quiz',
      label: 'Practice Mock Exam Simulator',
      desc: 'Timed college test questions with step-by-step rationales',
      icon: HelpCircle,
    },
    {
      id: 'cheat-sheet',
      label: 'Formula & Concept Cheat Sheet',
      desc: 'High-yield equation sheets for STEM & Humanities',
      icon: FileSpreadsheet,
    },
    {
      id: 'essay-helper',
      label: 'Academic Essay Outliner',
      desc: 'Thesis generator, paragraph evidence & APA citations',
      icon: PenTool,
    },
    {
      id: 'study-planner',
      label: 'Spaced Revision Exam Schedule',
      desc: 'Personalized day-by-day exam roadmap',
      icon: Calendar,
    },
    {
      id: 'voice-lecture',
      label: 'Live Lecture Voice Transcriber',
      desc: 'Record in-class audio and convert to notes',
      icon: Mic,
    },
    {
      id: 'focus-room',
      label: 'Pomodoro Focus Room',
      desc: '25/5 focus cycles with binaural beats & rain audio',
      icon: Timer,
    },
    {
      id: 'seo-hub',
      label: 'Learning Science & SEO Guides',
      desc: 'Articles on Feynman Technique & Active Recall',
      icon: BookOpen,
    },
  ];

  const filtered = items.filter(
    (i) =>
      i.label.toLowerCase().includes(query.toLowerCase()) ||
      i.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center px-4 py-3 border-b border-slate-100">
          <Search className="w-4 h-4 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or study tool..."
            className="w-full text-sm bg-transparent outline-hidden text-slate-900 placeholder:text-slate-400"
          />
          <span className="text-[10px] font-mono text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded">
            ESC
          </span>
        </div>

        <div className="p-2 max-h-80 overflow-y-auto space-y-1">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectGem(item.id);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl hover:bg-indigo-50 flex items-center space-x-3 transition-colors cursor-pointer group"
              >
                <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-950">
                    {item.label}
                  </h4>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
