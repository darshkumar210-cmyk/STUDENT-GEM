import React from 'react';
import {
  Youtube,
  Layers,
  BrainCircuit,
  FileSpreadsheet,
  FileText,
  Calendar,
  Mic,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Zap,
  GraduationCap,
  Database,
  LogIn,
  Flame,
  Award,
} from 'lucide-react';
import { GemType } from '../types';
import { useAuth } from '../context/AuthContext';

interface HomeOverviewProps {
  onSelectGem: (gem: GemType) => void;
  onOpenAuth: () => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  onSelectGem,
  onOpenAuth,
}) => {
  const { user, userProfile, studyProgress } = useAuth();

  const studyTools = [
    {
      id: 'youtube' as GemType,
      title: 'YouTube Lecture Synthesizer',
      category: 'Lecture Synthesis',
      description:
        'Transform long YouTube lectures or video transcripts into structured Cornell notes, key takeaways, and formula sheets.',
      badge: 'POPULAR',
      icon: Youtube,
      bgAccent: 'bg-red-50',
      iconColor: 'text-red-600',
      borderAccent: 'border-red-500',
      features: ['Timestamp Breakdown', 'Cornell Format', 'Feynman Simplifier'],
    },
    {
      id: 'flashcards' as GemType,
      title: 'Active Recall Flashcards',
      category: 'Spaced Repetition',
      description:
        'Generate 3D interactive flashcard decks from any topic, syllabus, or lecture for rapid pre-exam memorization.',
      badge: 'HIGH YIELD',
      icon: Layers,
      bgAccent: 'bg-amber-50',
      iconColor: 'text-amber-600',
      borderAccent: 'border-amber-500',
      features: ['3D Card Flip', 'Leitner System', 'CSV/Anki Export'],
    },
    {
      id: 'quiz' as GemType,
      title: 'Practice Exam & Timed Quiz',
      category: 'Exam Simulation',
      description:
        'Challenge yourself with AI-generated multiple choice and conceptual exam questions with distractor rationales.',
      badge: 'EXAM READY',
      icon: BrainCircuit,
      bgAccent: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      borderAccent: 'border-indigo-500',
      features: ['Instant Auto-Grading', 'Step-by-Step Rationale', 'Timed Mode'],
    },
    {
      id: 'cheatsheet' as GemType,
      title: 'Formula & Concept Cheat Sheet',
      category: 'Exam Cramming',
      description:
        'Produce one-page ultra-high-yield summary sheets highlighting formulas, core definitions, and top exam traps.',
      badge: 'ONE-PAGER',
      icon: FileSpreadsheet,
      bgAccent: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      borderAccent: 'border-emerald-500',
      features: ['Key Formula Tables', 'Common Pitfalls', 'Printable PDF'],
    },
    {
      id: 'essay' as GemType,
      title: 'Essay & Thesis Architect',
      category: 'Academic Writing',
      description:
        'Construct academic thesis statements, persuasive argument outlines, and APA/MLA evidence frameworks.',
      badge: 'WRITING LAB',
      icon: FileText,
      bgAccent: 'bg-teal-50',
      iconColor: 'text-teal-600',
      borderAccent: 'border-teal-500',
      features: ['Thesis Evaluator', 'Counterargument Matrix', 'Citations Helper'],
    },
    {
      id: 'planner' as GemType,
      title: 'Spaced Study Timetable',
      category: 'Study Strategy',
      description:
        'Generate a daily revision schedule tailored to your upcoming exam dates and course syllabi difficulty.',
      badge: 'SCHEDULE',
      icon: Calendar,
      bgAccent: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderAccent: 'border-purple-500',
      features: ['Daily Task Blocks', 'Burnout Prevention', 'Calendar Export'],
    },
    {
      id: 'voice' as GemType,
      title: 'Live Voice Lecture Transcriber',
      category: 'Audio Capture',
      description:
        'Record classroom audio via your microphone in real time and automatically extract notes, summaries, and cards.',
      badge: 'LIVE MIC',
      icon: Mic,
      bgAccent: 'bg-rose-50',
      iconColor: 'text-rose-600',
      borderAccent: 'border-rose-500',
      features: ['Real-Time Transcription', 'Instant Cornell Parsing', 'Key Term Catching'],
    },
    {
      id: 'focus' as GemType,
      title: 'Deep Work Focus Lounge',
      category: 'Productivity',
      description:
        'Boost study retention with customizable Pomodoro study intervals, ambient soundscapes, and focus stats.',
      badge: 'POMODORO',
      icon: Clock,
      bgAccent: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderAccent: 'border-blue-500',
      features: ['25/5 Study Loops', 'Lo-Fi Rain & Cafe Audio', 'Streak XP Rewards'],
    },
  ];

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      {/* Hero Welcome Section */}
      <section className="bg-white rounded-3xl border-2 border-black p-8 sm:p-12 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 border-2 border-black text-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
            <span>Intelligent Active-Recall Study Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#1a1a1a] leading-none">
            Master Any Course <br className="hidden sm:inline" />
            in <span className="underline decoration-amber-400 decoration-wavy">Half the Time</span>.
          </h1>

          <p className="text-base sm:text-lg text-gray-700 font-medium leading-relaxed max-w-2xl">
            Transform hours of YouTube lectures, complex textbooks, and syllabi into structured Cornell notes, interactive active-recall flashcard decks, and rigorous practice exams.
          </p>

          {/* Quick Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelectGem('youtube')}
              className="py-3.5 px-6 rounded-2xl bg-black text-white font-black text-sm uppercase tracking-wider hover:bg-neutral-800 transition-all flex items-center space-x-2.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
            >
              <Youtube className="w-4 h-4 text-red-400" />
              <span>Synthesize Video Lecture</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onSelectGem('flashcards')}
              className="py-3.5 px-6 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-wider border-2 border-black hover:bg-slate-50 transition-all flex items-center space-x-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
            >
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Smart Flashcard Studio</span>
            </button>

            {!user && (
              <button
                onClick={onOpenAuth}
                className="py-3.5 px-5 rounded-2xl bg-amber-300 text-black font-black text-xs uppercase tracking-wider border-2 border-black hover:bg-amber-400 transition-all flex items-center space-x-1.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In / Cloud Sync</span>
              </button>
            )}
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100 text-xs font-bold text-gray-600">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cornell Note Synthesizer</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Spaced-Repetition Leitner Flashcards</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Firebase Cloud Sync & XP Leveling</span>
            </div>
          </div>
        </div>

        {/* Floating Abstract Academic Badge */}
        <div className="hidden lg:block absolute right-8 bottom-8 p-6 bg-slate-50 border-2 border-black rounded-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">
              Live Study Stats
            </span>
            <span className="flex items-center space-x-1 text-xs font-black text-amber-600">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{studyProgress.streakDays} Day Streak</span>
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-bold text-gray-700">
              <span>Study Level:</span>
              <span className="font-black text-black">Level {studyProgress.level} Scholar</span>
            </div>
            <div className="flex justify-between font-bold text-gray-700">
              <span>Decks & Notes Created:</span>
              <span className="font-black text-black">{studyProgress.notesGenerated}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-700">
              <span>Flashcards Mastered:</span>
              <span className="font-black text-black">{studyProgress.flashcardsMastered}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Launchpad: "Go Tools You Used" */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-indigo-600 mb-1">
              <Zap className="w-4 h-4" />
              <span>All-In-One Study Suite</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1a1a1a]">
              Select a Study Tool to Get Started
            </h2>
            <p className="text-sm text-gray-600 font-medium mt-1">
              Click any engine below to synthesize notes, generate flashcards, or practice mock exams.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-black uppercase tracking-wider bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl text-gray-700">
              8 Dedicated Engines
            </span>
          </div>
        </div>

        {/* 8 Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {studyTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => onSelectGem(tool.id)}
                className="group bg-white rounded-3xl border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top bar in card */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-3 rounded-2xl border-2 border-black ${tool.bgAccent} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                    >
                      <Icon className={`w-6 h-6 ${tool.iconColor} stroke-[2.5]`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 border border-slate-300 text-gray-700">
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 block mb-0.5">
                      {tool.category}
                    </span>
                    <h3 className="text-lg font-black text-[#1a1a1a] group-hover:text-indigo-600 transition-colors leading-snug">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-gray-600 font-medium leading-relaxed mt-2">
                      {tool.description}
                    </p>
                  </div>

                  {/* Feature Bullets */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-100">
                    {tool.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center space-x-1.5 text-[11px] font-bold text-gray-700"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Launch Button */}
                <div className="pt-5 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-black group-hover:underline">
                    Launch Tool
                  </span>
                  <div className="p-1.5 rounded-xl bg-black text-white group-hover:bg-indigo-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3-Step Active Learning Workflow */}
      <section className="bg-slate-900 text-white rounded-3xl border-2 border-black p-8 sm:p-12 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-300 text-xs font-black uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Scientifically Proven Learning Loop</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            How to Study with StudyGem AI
          </h2>
          <p className="text-gray-400 text-sm font-medium">
            A continuous loop of lecture compression, active retrieval, and spaced reinforcement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-black font-black text-sm flex items-center justify-center border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              1
            </div>
            <h3 className="text-lg font-black text-white">Capture & Synthesize</h3>
            <p className="text-xs text-gray-300 font-medium leading-relaxed">
              Paste a YouTube video link or record your professor live. Gemini extracts Cornell notes, topic breakdowns, and formulas in seconds.
            </p>
          </div>

          <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-400 text-white font-black text-sm flex items-center justify-center border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              2
            </div>
            <h3 className="text-lg font-black text-white">Active Recall & Quizzing</h3>
            <p className="text-xs text-gray-300 font-medium leading-relaxed">
              Test your knowledge without looking at answers using the 3D flashcard studio and timed practice exams with distractor rationale.
            </p>
          </div>

          <div className="bg-slate-800/80 border-2 border-slate-700 rounded-2xl p-6 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-400 text-black font-black text-sm flex items-center justify-center border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              3
            </div>
            <h3 className="text-lg font-black text-white">Spaced Deep Focus</h3>
            <p className="text-xs text-gray-300 font-medium leading-relaxed">
              Maintain high productivity with the Pomodoro Focus Room, track XP gains, and maintain your multi-day study streak with cloud sync.
            </p>
          </div>
        </div>
      </section>

      {/* Cloud Sync & Firebase Status Box */}
      <section className="bg-white rounded-3xl border-2 border-black p-6 sm:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-4 rounded-2xl bg-indigo-50 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Database className="w-7 h-7 text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-black text-black">Firebase Cloud Database Active</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-gray-600 font-medium mt-1">
              Connected to database <span className="font-mono font-bold text-black">(default)</span> on project <span className="font-mono font-bold text-black">studentgem-9aa49</span>.
              {user ? ` Signed in as ${user.displayName || user.email || 'Student'}.` : ' Sign in to sync your study decks across devices.'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          {user ? (
            <div className="px-4 py-2 rounded-xl bg-emerald-50 border-2 border-emerald-500 text-emerald-800 text-xs font-black uppercase flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Cloud Sync Online</span>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="py-2.5 px-5 rounded-xl bg-black hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider flex items-center space-x-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Connect Account</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
