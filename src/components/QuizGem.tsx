import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle,
  Sparkles,
  Timer,
  CheckCircle2,
  XCircle,
  RotateCw,
  Printer,
  Flag,
  Loader2,
  Award,
} from 'lucide-react';
import { QuizQuestion } from '../types';
import { useAuth } from '../context/AuthContext';
import { AdBanner } from './AdBanner';

interface QuizGemProps {
  isPro: boolean;
  onOpenUpgrade: () => void;
}

export const QuizGem: React.FC<QuizGemProps> = ({ isPro, onOpenUpgrade }) => {
  const { triggerAdProtectedAction } = useAuth();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('University Exam Level');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active Quiz State
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      id: 'demo-1',
      question: 'Which of the following best describes the function of the myelin sheath in human neuron physiology?',
      options: [
        'It increases the speed of action potential propagation via saltatory conduction.',
        'It manufactures neurotransmitters for synaptic vesicle packaging.',
        'It directly absorbs glucose from blood vessels to feed the neuron cell body.',
        'It generates resting potential by actively pumping sodium ions out.',
      ],
      correctIndex: 0,
      explanation:
        'The myelin sheath acts as an electrical insulator produced by oligodendrocytes (CNS) or Schwann cells (PNS), enabling saltatory conduction across Nodes of Ranvier to dramatically speed up nerve impulses.',
      topicTag: 'Neurobiology',
    },
    {
      id: 'demo-2',
      question: 'In macroeconomics, what effect does an increase in the Central Bank reserve requirement ratio have on the money supply?',
      options: [
        'It decreases the money multiplier and contracts the total money supply.',
        'It increases commercial bank lending capacity and expands the money supply.',
        'It has zero impact on broad M2 money supply.',
        'It permanently lowers the federal funds interest rate.',
      ],
      correctIndex: 0,
      explanation:
        'The money multiplier is given by 1 / Reserve Requirement. Increasing the reserve requirement forces banks to hold more liquid reserves, decreasing lending capacity and contracting the money supply.',
      topicTag: 'Economics',
    },
    {
      id: 'demo-3',
      question: 'What is the time complexity of searching for an element in a balanced Binary Search Tree (AVL or Red-Black Tree)?',
      options: ['O(log N)', 'O(1)', 'O(N)', 'O(N log N)'],
      correctIndex: 0,
      explanation:
        'In a balanced BST, height is strictly bounded by log2(N). Therefore, search, insertion, and deletion operations all run in worst-case O(log N) time.',
      topicTag: 'Computer Science',
    },
  ]);

  const [selectedAnswers, setSelectedAnswers] = useState<{ [index: number]: number }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(600); // 10 mins
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && secondsRemaining > 0 && !isSubmitted) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && !isSubmitted) {
      handleSubmitQuiz();
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsRemaining, isSubmitted]);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    triggerAdProtectedAction('AI Practice Exam Generation', async () => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/gemini/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            numQuestions,
            difficulty,
          }),
        });
        const result = await res.json();
        if (result.success && result.data?.questions) {
          setQuestions(result.data.questions);
          setSelectedAnswers({});
          setFlaggedQuestions(new Set());
          setIsSubmitted(false);
          setSecondsRemaining(numQuestions * 120); // 2 mins per question
          setTimerRunning(true);
          confetti({ particleCount: 60, spread: 60 });
        }
      } catch {
        alert('Failed to generate quiz. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    });
  };

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleToggleFlag = (qIdx: number) => {
    const next = new Set(flaggedQuestions);
    if (next.has(qIdx)) {
      next.delete(qIdx);
    } else {
      next.add(qIdx);
    }
    setFlaggedQuestions(next);
  };

  const handleSubmitQuiz = () => {
    setIsSubmitted(true);
    setTimerRunning(false);
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    const percentage = Math.round((correct / questions.length) * 100);
    if (percentage >= 70) {
      confetti({ particleCount: 120, spread: 80 });
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setFlaggedQuestions(new Set());
    setIsSubmitted(false);
    setSecondsRemaining(questions.length * 120);
    setTimerRunning(true);
  };

  const scoreCount = questions.filter((q, idx) => selectedAnswers[idx] === q.correctIndex).length;
  const scorePercent = Math.round((scoreCount / questions.length) * 100);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              AI Mock Exam & Practice Quiz Studio
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Simulate timed college exams and AP tests with detailed rationale explanations and diagnostic grading.
          </p>
        </div>

        {/* Action Controls */}
        <div className="no-print flex items-center space-x-2">
          {timerRunning && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-mono">
              <Timer className="w-4 h-4 text-amber-600" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Worksheet</span>
          </button>
        </div>
      </div>

      {/* Generator Box */}
      <div className="no-print bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Generate Custom Practice Test</span>
        </h3>

        <form onSubmit={handleGenerateQuiz} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Topic or Exam (e.g. AP US History Civil War, Organic Chem SN1/SN2, Microeconomics Elasticity)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:border-indigo-500 outline-hidden"
            />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 outline-hidden"
            >
              <option value="High School / AP Exam">AP Exam Standard</option>
              <option value="University Exam Level">College Midterm / Final</option>
              <option value="Graduate / Medical / MCAT">Advanced / MCAT / LSAT</option>
            </select>
            <select
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 outline-hidden"
            >
              <option value={3}>3 Questions (Quick Drill)</option>
              <option value={5}>5 Questions (Standard)</option>
              <option value={10}>10 Questions (Full Test)</option>
            </select>
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Drafting Test...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create Exam</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sponsor Ad Banner for Free Tier */}
      <AdBanner onOpenUpgradeModal={onOpenUpgrade} />

      {/* Score Summary Banner if Submitted */}
      {isSubmitted && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg">
              <Award className="w-8 h-8 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Exam Results: {scorePercent}% Score</h3>
              <p className="text-xs text-slate-300">
                You answered {scoreCount} out of {questions.length} questions correctly.
              </p>
            </div>
          </div>
          <button
            onClick={handleResetQuiz}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
          >
            <RotateCw className="w-4 h-4" />
            <span>Retake Exam</span>
          </button>
        </div>
      )}

      {/* Question List */}
      <div className="space-y-6">
        {questions.map((q, qIdx) => {
          const isSelected = selectedAnswers[qIdx] !== undefined;
          const isCorrect = selectedAnswers[qIdx] === q.correctIndex;
          const isFlagged = flaggedQuestions.has(qIdx);

          return (
            <div
              key={qIdx}
              className={`p-6 rounded-2xl border bg-white shadow-xs transition-all ${
                isSubmitted
                  ? isCorrect
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-rose-300 bg-rose-50/20'
                  : isFlagged
                  ? 'border-amber-300'
                  : 'border-slate-200'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-start space-x-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {qIdx + 1}
                  </span>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {q.topicTag || 'Multiple Choice'}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">{q.question}</h3>
                  </div>
                </div>

                {!isSubmitted && (
                  <button
                    onClick={() => handleToggleFlag(qIdx)}
                    className={`p-1.5 rounded-lg border text-xs flex items-center space-x-1 ${
                      isFlagged
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'text-slate-400 hover:text-slate-600 border-transparent'
                    }`}
                    title="Flag for review"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                {q.options.map((option, optIdx) => {
                  const isThisSelected = selectedAnswers[qIdx] === optIdx;
                  const isThisCorrect = optIdx === q.correctIndex;

                  let optClass = 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700';
                  if (isThisSelected) {
                    optClass = 'border-indigo-500 bg-indigo-50 text-indigo-950 font-semibold ring-1 ring-indigo-400';
                  }
                  if (isSubmitted) {
                    if (isThisCorrect) {
                      optClass = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                    } else if (isThisSelected && !isCorrect) {
                      optClass = 'border-rose-400 bg-rose-50 text-rose-950 line-through';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handleSelectOption(qIdx, optIdx)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-all ${optClass}`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center text-xs font-semibold text-slate-500">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{option}</span>
                      </div>
                      {isSubmitted && isThisCorrect && (
                        <span className="text-emerald-700 text-xs font-bold flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Correct Answer
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Dropdown if Submitted */}
              {isSubmitted && (
                <div className="mt-4 p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 space-y-1">
                  <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">
                    Detailed Answer Rationale:
                  </span>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Submit Bar */}
      {!isSubmitted && (
        <div className="no-print sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-lg flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <strong>{Object.keys(selectedAnswers).length}</strong> of {questions.length} answered
          </div>
          <button
            onClick={handleSubmitQuiz}
            disabled={Object.keys(selectedAnswers).length === 0}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 disabled:opacity-50 cursor-pointer"
          >
            Submit & View Full Grade Report
          </button>
        </div>
      )}
    </div>
  );
};
