import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle,
  Clock,
  Printer,
  Loader2,
  Check,
} from 'lucide-react';
import { StudyPlanData } from '../types';
import { useAuth } from '../context/AuthContext';
import { AdBanner } from './AdBanner';

interface StudyPlannerGemProps {
  isPro: boolean;
  onOpenUpgrade: () => void;
}

export const StudyPlannerGem: React.FC<StudyPlannerGemProps> = ({ isPro, onOpenUpgrade }) => {
  const { triggerAdProtectedAction } = useAuth();
  const [examName, setExamName] = useState('');
  const [daysRemaining, setDaysRemaining] = useState(7);
  const [hoursPerDay, setHoursPerDay] = useState(3);
  const [topicsList, setTopicsList] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  const [activePlan, setActivePlan] = useState<StudyPlanData>({
    id: 'plan-organic-chem',
    planTitle: '7-Day High-Yield Organic Chemistry Midterm Mastery Schedule',
    totalStudyHours: 21,
    dailyTargetMinutes: 180,
    strategyOverview:
      'This schedule leverages the Spaced Retrieval & Interleaving principle. Early days establish deep mechanistic foundations, middle days drill mixed problem-solving under exam constraints, and final days focus strictly on error log review and high-yield synthesis.',
    schedule: [
      {
        dayNumber: 1,
        phase: 'Foundation & Resonance',
        dayTitle: 'Acid-Base Equilibria & Resonance Structures',
        sessions: [
          {
            duration: '60 mins',
            task: 'Draw all major curved-arrow resonance contributors for carbocation intermediates.',
            technique: 'Feynman Technique',
          },
          {
            duration: '60 mins',
            task: 'Rank pKa values of alcohols, carboxylic acids, and phenols; solve 15 acid-base ranking questions.',
            technique: 'Active Recall Drills',
          },
          {
            duration: '60 mins',
            task: 'Draft a 1-page formula cheat sheet of electrophile vs nucleophile rules.',
            technique: 'Blurting Method',
          },
        ],
        milestone: 'Score 90%+ on acid-base equilibrium practice drill before sleep.',
      },
      {
        dayNumber: 2,
        phase: 'Core Mechanisms',
        dayTitle: 'SN1 vs SN2 & E1 vs E2 Substitution and Elimination',
        sessions: [
          {
            duration: '60 mins',
            task: 'Map out the 4-quadrant decision matrix: Substrate steric hindrance, Nucleophile strength, Solvent (protic vs aprotic).',
            technique: 'Conceptual Flowcharting',
          },
          {
            duration: '60 mins',
            task: 'Solve 20 stereochemistry inversion vs racemization reaction problems.',
            technique: 'Pomodoro 25/5 Sprint',
          },
          {
            duration: '60 mins',
            task: 'Review Zaitsev vs Hofmann elimination regioselectivity with bulky bases (t-BuOK).',
            technique: 'Flashcard Drill',
          },
        ],
        milestone: 'Zero errors on stereochemical inversion questions.',
      },
      {
        dayNumber: 3,
        phase: 'Alkene & Alkyne Additions',
        dayTitle: 'Markovnikov vs Anti-Markovnikov Addition Reactions',
        sessions: [
          {
            duration: '90 mins',
            task: 'Synthesize reaction map for Hydroboration-Oxidation, Oxymercuration-Demercuration, and Ozonolysis.',
            technique: 'Mind Mapping',
          },
          {
            duration: '90 mins',
            task: 'Complete 25 mixed reaction prediction problems without notes.',
            technique: 'Timed Simulation',
          },
        ],
        milestone: 'Predict all 12 alkene reagent outcomes in under 15 minutes.',
      },
      {
        dayNumber: 4,
        phase: 'Full Mock Exam 1',
        dayTitle: 'Timed Past Midterm Exam Simulation',
        sessions: [
          {
            duration: '90 mins',
            task: 'Take full-length timed past exam paper in quiet conditions.',
            technique: 'Exam Simulation',
          },
          {
            duration: '90 mins',
            task: 'Analyze every missed question; log exact root cause in Error Diary.',
            technique: 'Diagnostic Post-Mortem',
          },
        ],
        milestone: 'Identify top 3 persistent conceptual gaps.',
      },
    ],
    proTips: [
      'Stop studying 2 hours before bed to allow slow-wave sleep memory consolidation.',
      'Always draw out full arrow mechanisms rather than memorizing starting materials to products.',
    ],
    createdAt: new Date().toISOString(),
  });

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName.trim()) return;

    triggerAdProtectedAction('AI Revision Plan Generation', async () => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/gemini/study-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            examName,
            daysRemaining,
            hoursPerDay,
            topicsList: topicsList || 'All standard exam syllabus topics',
          }),
        });
        const result = await res.json();
        if (result.success && result.data) {
          setActivePlan({
            id: `plan-${Date.now()}`,
            planTitle: result.data.planTitle || `${daysRemaining}-Day Revision Plan for ${examName}`,
            totalStudyHours: result.data.totalStudyHours || daysRemaining * hoursPerDay,
            dailyTargetMinutes: result.data.dailyTargetMinutes || hoursPerDay * 60,
            strategyOverview: result.data.strategyOverview || '',
            schedule: result.data.schedule || [],
            proTips: result.data.proTips || [],
            createdAt: new Date().toISOString(),
          });
          setCompletedDays(new Set());
        }
      } catch {
        alert('Failed to generate study plan. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    });
  };

  const handleToggleDay = (dayNum: number) => {
    const next = new Set(completedDays);
    if (next.has(dayNum)) {
      next.delete(dayNum);
    } else {
      next.add(dayNum);
    }
    setCompletedDays(next);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Spaced-Repetition Exam Study Planner
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Build day-by-day revision roadmaps tailored to your exam date, daily hours, and syllabus gaps.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="no-print flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Schedule</span>
        </button>
      </div>

      {/* Generator Form */}
      <div className="no-print bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Generate Customized Revision Roadmap</span>
        </h3>

        <form onSubmit={handleGeneratePlan} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="Exam Name (e.g. AP Calculus BC, Biology Final, MCAT Chem)"
              className="sm:col-span-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:border-indigo-500 outline-hidden"
            />
            <select
              value={daysRemaining}
              onChange={(e) => setDaysRemaining(Number(e.target.value))}
              className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 outline-hidden"
            >
              <option value={3}>3 Days (Crash Revision)</option>
              <option value={7}>7 Days (1 Week Sprint)</option>
              <option value={14}>14 Days (2 Weeks Deep)</option>
              <option value={30}>30 Days (Full Month)</option>
            </select>
            <select
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 outline-hidden"
            >
              <option value={2}>2 Hours / Day</option>
              <option value={3}>3 Hours / Day</option>
              <option value={4}>4 Hours / Day</option>
              <option value={6}>6 Hours / Day (Intensive)</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topicsList}
              onChange={(e) => setTopicsList(e.target.value)}
              placeholder="List specific weak topics or chapters (e.g. Integration by parts, Taylor series, Volumes)..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:border-indigo-500 outline-hidden"
            />
            <button
              type="submit"
              disabled={isGenerating || !examName.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating Pacing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Build Study Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sponsor Ad Banner for Free Tier */}
      <AdBanner onOpenUpgradeModal={onOpenUpgrade} />

      {/* Main Schedule Display */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{activePlan.planTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Total Target: <strong>{activePlan.totalStudyHours} Study Hours</strong> ({activePlan.dailyTargetMinutes} mins/day)
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-600">
            <span>Completed:</span>
            <strong className="text-indigo-600">{completedDays.size}</strong> of {activePlan.schedule.length} Days
          </div>
        </div>

        {/* Strategy Overview */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <span className="font-bold text-indigo-900 block mb-1">Cognitive Strategy:</span>
          {activePlan.strategyOverview}
        </div>

        {/* Days List */}
        <div className="space-y-4">
          {activePlan.schedule.map((day) => {
            const isCompleted = completedDays.has(day.dayNumber);
            return (
              <div
                key={day.dayNumber}
                className={`p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-75'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => handleToggleDay(day.dayNumber)}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border mt-0.5 transition-colors ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white hover:border-indigo-500'
                      }`}
                    >
                      {isCompleted && <Check className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          Day {day.dayNumber} • {day.phase}
                        </span>
                      </div>
                      <h3
                        className={`text-base font-bold text-slate-900 mt-1 ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {day.dayTitle}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Day Sessions */}
                <div className="mt-4 space-y-2 pl-9">
                  {day.sessions.map((session, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-900">{session.duration}:</span>
                        <span>{session.task}</span>
                      </div>
                      <span className="self-start sm:self-auto px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[10px] font-bold">
                        {session.technique}
                      </span>
                    </div>
                  ))}

                  {/* Daily Milestone */}
                  <div className="mt-2 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-900">
                    <strong>Daily Milestone:</strong> {day.milestone}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
