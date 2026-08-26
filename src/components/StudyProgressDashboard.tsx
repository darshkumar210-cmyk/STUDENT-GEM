import React from 'react';
import { motion } from 'motion/react';
import {
  Flame,
  Clock,
  Layers,
  BrainCircuit,
  Trophy,
  Target,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GemType } from '../types';
import { STUDY_SITEMAP } from '../sitemap';

interface StudyProgressDashboardProps {
  onNavigateGem: (gem: GemType) => void;
  onOpenUpgrade?: () => void;
}

export const StudyProgressDashboard: React.FC<StudyProgressDashboardProps> = ({
  onNavigateGem,
  onOpenUpgrade,
}) => {
  const { user, studyProgress, isPro } = useAuth();

  const xpProgressInLevel = studyProgress.xp % 250;
  const xpPercent = Math.min(100, Math.round((xpProgressInLevel / 250) * 100));

  const streakDays = studyProgress.streakDays || 1;
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const allAchievements = [
    { id: 'first_note', title: 'First Lecture Synthesized', desc: 'Generated your first Cornell study packet', icon: '📝', unlocked: studyProgress.notesGenerated >= 1 },
    { id: 'flashcard_pro', title: 'Active Recall Prodigy', desc: 'Mastered 15+ study flashcards', icon: '🎴', unlocked: studyProgress.flashcardsMastered >= 15 },
    { id: 'quiz_ace', title: 'Exam Ace (90%+)', desc: 'Scored 90%+ on practice exams', icon: '🎯', unlocked: studyProgress.averageQuizScore >= 90 },
    { id: 'pomodoro_streak', title: 'Deep Focus Master', desc: 'Completed 2+ Pomodoro deep work blocks', icon: '⏱️', unlocked: studyProgress.pomodoroSessionsCompleted >= 2 },
    { id: 'streak_master', title: '3-Day Study Streak', desc: 'Studied 3 days consecutively', icon: '🔥', unlocked: streakDays >= 3 },
    { id: 'scholar_tier', title: "Dean's Honor Tier", desc: 'Earned 500+ XP in academic synthesis', icon: '👑', unlocked: studyProgress.xp >= 500 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto no-print">
      {/* Header Level & XP Progress Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-emerald-900/60 border border-emerald-800/40 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-2xl font-black text-emerald-400 shadow-inner">
                Lvl {studyProgress.level}
              </div>
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider">
                XP {studyProgress.xp}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">
                  Academic Scholar
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {250 - xpProgressInLevel} XP to Level {studyProgress.level + 1} • {studyProgress.notesGenerated} study packets synthesized
              </p>

              {/* XP Progress Bar */}
              <div className="w-full sm:w-64 h-2 rounded-full bg-zinc-800 mt-2.5 overflow-hidden border border-zinc-700/50">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Streak & Fast Stats */}
          <div className="flex items-center gap-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400">
                <Flame className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{streakDays}</span>
                  <span className="text-xs text-zinc-400 font-medium">Day Streak</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {daysOfWeek.map((day, idx) => (
                    <span
                      key={idx}
                      className={`w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center ${
                        idx <= todayIdx
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {!isPro && onOpenUpgrade && (
              <button
                onClick={onOpenUpgrade}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md"
              >
                <Zap className="w-3.5 h-3.5" />
                Upgrade Pro
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Core Study Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Study Time</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{studyProgress.totalMinutesStudied}m</div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" /> All active sessions
          </p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Cards Mastered</span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">{studyProgress.flashcardsMastered}</div>
          <p className="text-[11px] text-zinc-400 mt-1">Active recall memory</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Quiz Average</span>
            <BrainCircuit className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">{studyProgress.averageQuizScore}%</div>
          <p className="text-[11px] text-zinc-400 mt-1">{studyProgress.quizzesTaken} exams completed</p>
        </div>

        <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Focus Blocks</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{studyProgress.pomodoroSessionsCompleted}</div>
          <p className="text-[11px] text-amber-400 mt-1 font-medium">Pomodoro cycles</p>
        </div>
      </div>

      {/* Two Column Layout: Achievements & Study Modules Side Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Badges & Achievements */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Academic Achievements & Badges
            </h4>
            <span className="text-xs text-zinc-400 font-medium">
              {allAchievements.filter((a) => a.unlocked).length} / {allAchievements.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allAchievements.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                  item.unlocked
                    ? 'bg-zinc-900/90 border-emerald-800/50 shadow-sm'
                    : 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                }`}
              >
                <div className="text-2xl p-2 rounded-lg bg-zinc-800/80 shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-white truncate">{item.title}</h5>
                    {item.unlocked ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] text-zinc-500 uppercase font-semibold">Locked</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity Log */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 mt-4">
            <h5 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Recent Study Milestones
            </h5>
            <div className="space-y-2.5">
              {studyProgress.recentActivity && studyProgress.recentActivity.length > 0 ? (
                studyProgress.recentActivity.slice(0, 4).map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-zinc-200 font-medium">{act.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="text-[11px] text-zinc-500">{act.timestamp}</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                        +{act.points} XP
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 italic">No recent activities recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Study Module Side Map & Quick Jump */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-400" /> Study Module Side Map
          </h4>

          <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1.5">
            {STUDY_SITEMAP.slice(0, 7).map((entry) => (
              <button
                key={entry.path}
                onClick={() => onNavigateGem(entry.gemType)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/80 transition-colors text-left group"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-300">
                    {entry.title.split(' - ')[0]}
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate max-w-[200px]">
                    {entry.description}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
