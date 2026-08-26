import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import confetti from 'canvas-confetti';
import {
  Youtube,
  Sparkles,
  Clock,
  BookOpen,
  Layers,
  HelpCircle,
  FileSpreadsheet,
  Network,
  CheckSquare,
  MessageSquare,
  Download,
  Copy,
  Printer,
  ChevronRight,
  ExternalLink,
  RotateCw,
  Send,
  Loader2,
  Check,
  AlertCircle,
  FileText,
  FileDown,
  CheckCircle2,
  Trash2,
  Edit3,
} from 'lucide-react';
import { YouTubeStudyNotes, Flashcard, QuizQuestion } from '../types';
import { SAMPLE_VIDEO_PRESETS } from '../data/sampleStudyData';
import { useAuth } from '../context/AuthContext';
import { AdBanner } from './AdBanner';
import { CornellNotesView } from './CornellNotesView';
import { exportNotesToPDF } from '../utils/pdfExport';
import { useAutoSaveNotes } from '../hooks/useAutoSaveNotes';

interface YouTubeNoteGemProps {
  currentNotes: YouTubeStudyNotes | null;
  onGenerateNotes: (url: string, transcript: string, subject: string, level: string) => Promise<void>;
  isLoading: boolean;
  onLoadPreset: (presetId: string) => void;
  isPro: boolean;
  onOpenUpgrade: () => void;
  onUpdateNotes?: (notes: YouTubeStudyNotes) => void;
  onClearNotes?: () => void;
}

const FORM_INPUT_STORAGE_KEY = 'studygem_form_input_draft';
const VPLINK_URL = 'https://vplink.in/05FBIm';
const VPLINK_RETURN_PARAM = 'vplink_complete';
const VPLINK_PENDING_KEY = 'studygem_vplink_pending_generation';

export const YouTubeNoteGem: React.FC<YouTubeNoteGemProps> = ({
  currentNotes,
  onGenerateNotes,
  isLoading,
  onLoadPreset,
  isPro,
  onOpenUpgrade,
  onUpdateNotes,
  onClearNotes,
}) => {
  // Auto-save hook for active lecture note draft
  const {
    notes: activeNotes,
    updateNotes,
    saveStatus,
    lastSavedTime,
    clearDraft,
  } = useAutoSaveNotes(currentNotes, onUpdateNotes, 650);

  const notes = activeNotes || currentNotes;

  // Form inputs state initialized from localStorage draft
  const [videoUrl, setVideoUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(FORM_INPUT_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          return parsed.videoUrl || '';
        }
      } catch {}
    }
    return '';
  });

  const [subject, setSubject] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(FORM_INPUT_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          return parsed.subject || 'General Academic';
        }
      } catch {}
    }
    return 'General Academic';
  });

  const [targetLevel, setTargetLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(FORM_INPUT_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          return parsed.targetLevel || 'College Intro / AP';
        }
      } catch {}
    }
    return 'College Intro / AP';
  });

  const [rawTranscript, setRawTranscript] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(FORM_INPUT_STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          return parsed.rawTranscript || '';
        }
      } catch {}
    }
    return '';
  });

  const [showTranscriptInput, setShowTranscriptInput] = useState(false);
  const [showVplinkInstructions, setShowVplinkInstructions] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  // Auto-save form inputs with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          FORM_INPUT_STORAGE_KEY,
          JSON.stringify({ videoUrl, rawTranscript, subject, targetLevel })
        );
      } catch {}
    }, 500);
    return () => clearTimeout(timer);
  }, [videoUrl, rawTranscript, subject, targetLevel]);

  const [activeTab, setActiveTab] = useState<
    'cornell' | 'timestamps' | 'flashcards' | 'quiz' | 'definitions' | 'mindmap' | 'checklist' | 'chat'
  >('cornell');

  // Flashcard State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qIndex: number]: number }>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  // Checklist State
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());

  // Ask AI Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: 'Hi! I am your AI Study Tutor. Ask me anything about this lecture, clarification on formulas, or memory tips!',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Copy state
  const [copied, setCopied] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Extract YouTube ID helper (supports watch?v=, youtu.be, shorts, embed)
  const extractId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const currentVideoId = notes?.videoId || (videoUrl ? extractId(videoUrl) : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!videoUrl && !rawTranscript) || isLoading) return;
    setShowVplinkInstructions(true);
  };

  const handleContinueToVplink = () => {
    if ((!videoUrl && !rawTranscript) || isLoading) return;

    try {
      localStorage.setItem(
        VPLINK_PENDING_KEY,
        JSON.stringify({
          videoUrl,
          rawTranscript,
          subject,
          targetLevel,
          createdAt: Date.now(),
        })
      );
    } catch (error) {
      console.error('Unable to save pending note generation:', error);
      return;
    }

    setShowVplinkInstructions(false);
    window.location.assign(VPLINK_URL);
  };

  // VPlink returns visitors to /?vplink_complete=1. Restore the pending
  // request and generate the notes once after the visitor returns.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const referrer = document.referrer || '';
    const cameBackFromVplink = /(^|\.)vplink\.in(\/|$)/i.test(referrer);
    let returnReady = params.get(VPLINK_RETURN_PARAM) === '1' || cameBackFromVplink;

    try {
      returnReady = returnReady || sessionStorage.getItem('studygem_vplink_return_ready') === '1';
      sessionStorage.removeItem('studygem_vplink_return_ready');
    } catch {}

    if (!returnReady) return;

    let pending: {
      videoUrl: string;
      rawTranscript: string;
      subject: string;
      targetLevel: string;
      createdAt: number;
    } | null = null;

    try {
      const saved = localStorage.getItem(VPLINK_PENDING_KEY);
      if (saved) pending = JSON.parse(saved);
    } catch (error) {
      console.error('Unable to restore pending note generation:', error);
    }

    // Remove the return flag so refreshes do not trigger another generation.
    const cleanUrl = `${window.location.pathname}${window.location.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);

    if (!pending) return;

    // Ignore stale pending requests older than 30 minutes.
    if (!pending.createdAt || Date.now() - pending.createdAt > 30 * 60 * 1000) {
      return;
    }

    setVideoUrl(pending.videoUrl || '');
    setRawTranscript(pending.rawTranscript || '');
    setSubject(pending.subject || 'General Academic');
    setTargetLevel(pending.targetLevel || 'College Intro / AP');

    void onGenerateNotes(
      pending.videoUrl || '',
      pending.rawTranscript || '',
      pending.subject || 'General Academic',
      pending.targetLevel || 'College Intro / AP'
    ).finally(() => {
      try {
        localStorage.removeItem(VPLINK_PENDING_KEY);
      } catch {}
    });
  }, [onGenerateNotes]);

  const handleCopyMarkdown = () => {
    if (!notes) return;
    const watermark = isPro ? '' : '\n\n*Generated with StudyGem.ai - The #1 AI Study Suite for Students*';
    const text = `# ${notes.title}\n**Subject:** ${notes.subject} | **Level:** ${notes.difficulty}\n\n## Executive Summary\n${notes.executiveSummary}\n\n## Cornell Notes\n${notes.cornellNotes.detailedNotes}\n\n### Bottom Summary\n${notes.cornellNotes.bottomSummary}${watermark}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!notes) return;
    const watermark = isPro ? '' : '\n\n*Generated with StudyGem.ai - The #1 AI Study Suite for Students*';
    const content = `# ${notes.title}\n\n## Executive Summary\n${notes.executiveSummary}\n\n## Key Takeaways\n${notes.keyTakeaways.map((t) => `- ${t}`).join('\n')}\n\n## Detailed Notes\n${notes.cornellNotes.detailedNotes}\n\n## Summary\n${notes.cornellNotes.bottomSummary}${watermark}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${notes.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAnki = () => {
    if (!notes || !notes.flashcards?.length) return;
    const csvContent = notes.flashcards
      .map((c) => `"${c.front.replace(/"/g, '""')}","${c.back.replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${notes.title.replace(/[^a-z0-9]/gi, '_')}_anki_deck.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPDF = () => {
    if (!notes) return;
    setIsExportingPdf(true);
    try {
      exportNotesToPDF(notes, isPro);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Falling back to browser print...');
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClearCurrentDraft = () => {
    if (confirm('Start a new lecture note? This will reset the current draft from your browser storage.')) {
      clearDraft();
      if (onClearNotes) onClearNotes();
    }
  };

  const handleToggleCardMastery = (index: number) => {
    const next = new Set(masteredCards);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
      if (next.size === currentNotes?.flashcards?.length) {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      }
    }
    setMasteredCards(next);
  };

  const handleQuizAnswer = (qIndex: number, optionIndex: number) => {
    if (showQuizResults) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleGradeQuiz = () => {
    setShowQuizResults(true);
    if (!currentNotes?.quiz) return;
    let correct = 0;
    currentNotes.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });
    if (correct >= currentNotes.quiz.length * 0.7) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setShowQuizResults(false);
  };

  const handleToggleTask = (index: number) => {
    const next = new Set(completedTasks);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setCompletedTasks(next);
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userQ = chatInput.trim();
    setChatInput('');
    setChatMessages((prev) => [...prev, { role: 'user', content: userQ }]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/gemini/chat-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQ,
          contextNotes: JSON.stringify(currentNotes || {}),
        }),
      });
      const data = await response.json();
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer || 'I am ready to help you study this topic!' },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Could not connect to AI Tutor. Please try again.' },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Input Hero Section matching Design HTML */}
      <section className="no-print bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="p-1 rounded-md bg-red-600 text-white font-black text-[10px] uppercase tracking-widest px-2 py-0.5">
                LIVE NOTE SYNC
              </span>
              <span className="text-indigo-600 font-black text-xs tracking-widest uppercase">
                Active Session Generator
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#1a1a1a] tracking-tighter uppercase leading-none">
              YouTube Video to AI Notes
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-bold mt-1">
              Synthesize full lectures into Cornell notes, flashcards, practice quizzes, and cheat sheets.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-1">Demo Workspaces:</span>
            {SAMPLE_VIDEO_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setVideoUrl(preset.url);
                  onLoadPreset(preset.id);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-[#fafafa] hover:bg-black hover:text-white border border-[#eeeeee] hover:border-black text-[#1a1a1a] font-black uppercase tracking-tight transition-all cursor-pointer"
              >
                {preset.subject.split(' ')[0]} ({preset.duration})
              </button>
            ))}
          </div>
        </div>

        {showVplinkInstructions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in no-print">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="vplink-instructions-title"
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-5"
            >
              <div className="space-y-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-300 text-black text-[10px] font-black uppercase tracking-widest border border-black">
                  Before generating
                </span>
                <h2 id="vplink-instructions-title" className="text-xl sm:text-2xl font-black uppercase tracking-tight text-black">
                  One quick step before your notes
                </h2>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  You'll be taken to an external VPlink advertising page. After the ad step, you'll automatically return to STUDENT-GEM and your notes will start generating.
                </p>
              </div>

              <div className="rounded-2xl border-2 border-black bg-[#fafafa] p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-black text-white flex items-center justify-center text-xs font-black">1</span>
                  <p className="text-xs sm:text-sm font-bold text-gray-700">Read this instruction and click Continue.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-black text-white flex items-center justify-center text-xs font-black">2</span>
                  <p className="text-xs sm:text-sm font-bold text-gray-700">Complete the VPlink advertising step.</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 shrink-0 rounded-full bg-black text-white flex items-center justify-center text-xs font-black">3</span>
                  <p className="text-xs sm:text-sm font-bold text-gray-700">Return to STUDENT-GEM and wait for your notes to generate.</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowVplinkInstructions(false)}
                  className="flex-1 py-3 rounded-full border-2 border-black bg-white hover:bg-gray-100 text-black text-xs font-black uppercase tracking-widest cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleContinueToVplink}
                  className="flex-1 py-3 rounded-full border-2 border-black bg-black hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                >
                  Continue to Ad
                </button>
              </div>

              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                VPlink is an external service
              </p>
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-red-600">
                <Youtube className="w-5 h-5" />
              </div>
              <input
                id="youtube-url-input"
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube Lecture URL (e.g. https://www.youtube.com/watch?v=...)"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-black focus:border-indigo-600 text-sm font-bold bg-[#fafafa] outline-hidden transition-all shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="px-3.5 py-3 rounded-2xl border-2 border-black text-xs sm:text-sm font-black bg-white focus:border-indigo-600 outline-hidden"
              >
                <option value="General Academic">All Subjects</option>
                <option value="Mathematics & Calculus">Mathematics</option>
                <option value="Physics & Engineering">Physics</option>
                <option value="Chemistry & Biochemistry">Chemistry</option>
                <option value="Biology & Medicine">Biology</option>
                <option value="Computer Science & AI">Computer Science</option>
                <option value="History & Humanities">History</option>
                <option value="Economics & Finance">Economics</option>
                <option value="Psychology & Neuroscience">Psychology</option>
              </select>

              <select
                value={targetLevel}
                onChange={(e) => setTargetLevel(e.target.value)}
                className="px-3.5 py-3 rounded-2xl border-2 border-black text-xs sm:text-sm font-black bg-white focus:border-indigo-600 outline-hidden hidden sm:block"
              >
                <option value="High School">High School</option>
                <option value="College Intro / AP">College Intro / AP</option>
                <option value="Advanced University">Advanced University</option>
                <option value="Graduate / Professional">Graduate</option>
              </select>

              <button
                id="generate-notes-btn"
                type="submit"
                disabled={isLoading || (!videoUrl && !rawTranscript)}
                className="flex items-center space-x-2 px-6 py-3 rounded-full bg-black hover:bg-indigo-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SYNTHESIZING...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>GENERATE GEMS</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Optional Transcript Input Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowTranscriptInput(!showTranscriptInput)}
              className="text-xs text-indigo-600 hover:text-black font-black uppercase tracking-wider inline-flex items-center space-x-1 cursor-pointer pt-1"
            >
              <span>{showTranscriptInput ? '▲ Hide manual transcript input' : '▼ + Paste custom transcript or textbook text (Optional)'}</span>
            </button>

            {showTranscriptInput && (
              <div className="mt-2.5">
                <textarea
                  value={rawTranscript}
                  onChange={(e) => setRawTranscript(e.target.value)}
                  placeholder="Paste lecture transcript, speech-to-text dump, or classroom notes here for deeper precision..."
                  rows={4}
                  className="w-full p-3.5 rounded-2xl border-2 border-black text-xs bg-[#fafafa] focus:border-indigo-600 outline-hidden font-mono font-medium"
                />
              </div>
            )}
          </div>
        </form>
      </section>

      {/* Sponsor Ad Banner for Free Tier */}
      <AdBanner onOpenUpgradeModal={onOpenUpgrade} />

      {/* Loading Skeleton Indicator */}
      {isLoading && (
        <div className="bg-white rounded-3xl p-10 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white animate-bounce mx-auto flex items-center justify-center shadow-lg">
            <span className="font-black text-2xl">G</span>
          </div>
          <div>
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Processing Lecture</span>
            <h3 className="text-xl sm:text-2xl font-black text-[#1a1a1a] uppercase tracking-tight mt-1">Synthesizing Comprehensive Study Suite...</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mt-2 font-medium">
              Extracting key concepts, building Cornell lecture notes, drafting active-recall flashcards, and formulating exam questions with Gemini 2.5 Flash.
            </p>
          </div>
        </div>
      )}

      {/* Main Study Suite Display */}
      {notes && !isLoading && (
        <div className="space-y-6">
          {/* Header Action Bar: Title, Tags & Exports matching Design HTML active session */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-indigo-600 font-black text-xs tracking-widest uppercase">
                  Active Session
                </span>
                <span className="text-gray-300 font-bold">•</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black text-white">
                  {notes.subject}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {notes.difficulty}
                </span>
                <span className="flex items-center text-xs font-bold text-gray-400">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {notes.estimatedReadTime}
                </span>

                {/* Auto-save Status Pill */}
                <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ml-auto sm:ml-2 bg-slate-50 border-slate-300 text-slate-700">
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />
                      <span>Auto-saving draft...</span>
                    </>
                  ) : saveStatus === 'saved' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-800">
                        Draft saved {lastSavedTime ? `at ${lastSavedTime}` : 'locally'}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-gray-400" />
                      <span>Draft preserved locally</span>
                    </>
                  )}
                </div>
              </div>

              {/* Title & Inline Editor */}
              {isEditingTitle ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={notes.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      updateNotes((prev) => ({ ...prev, title: newTitle }));
                    }}
                    className="w-full text-xl sm:text-3xl font-black tracking-tight text-[#1a1a1a] uppercase bg-slate-50 border-2 border-indigo-600 rounded-xl px-3 py-1.5 focus:outline-hidden"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsEditingTitle(false)}
                    className="px-4 py-2 bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer hover:bg-indigo-600"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group">
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tighter text-[#1a1a1a] uppercase leading-[0.95]">
                    {notes.title}
                  </h2>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="no-print opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-black transition-opacity cursor-pointer"
                    title="Edit Note Title"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="no-print flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                disabled={isExportingPdf}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full border-2 border-indigo-600 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
                title="Download formatted Study Notes as PDF using jsPDF"
              >
                {isExportingPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileDown className="w-3.5 h-3.5" />
                )}
                <span>{isExportingPdf ? 'SAVING PDF...' : 'DOWNLOAD PDF'}</span>
              </button>

              <button
                onClick={handleCopyMarkdown}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full border-2 border-black bg-white hover:bg-slate-100 text-[#1a1a1a] text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                title="Copy Markdown to Clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-black" />}
                <span>{copied ? 'COPIED!' : 'COPY'}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full border-2 border-black bg-white hover:bg-slate-100 text-[#1a1a1a] text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                title="Download as Markdown"
              >
                <Download className="w-3.5 h-3.5 text-black" />
                <span>MARKDOWN</span>
              </button>

              <button
                onClick={handleExportAnki}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full border-2 border-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                title="Export Flashcards to Anki CSV"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>ANKI CSV</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full bg-black hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                title="Print Browser View"
              >
                <Printer className="w-3.5 h-3.5 text-white" />
                <span>PRINT</span>
              </button>

              <button
                onClick={handleClearCurrentDraft}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-full border-2 border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                title="Clear current note draft and reset"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>NEW LECTURE</span>
              </button>
            </div>
          </div>

          {/* Dual-Pane Study Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Pane: Embedded Video Player + Executive Summary + Side Pro Banner */}
            <div className="lg:col-span-5 space-y-5">
              {/* Video Embed with Brutalist Shadow */}
              {currentVideoId ? (
                <div className="bg-black rounded-3xl overflow-hidden relative shadow-2xl aspect-video border-2 border-black group">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?rel=0`}
                    title={notes.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              ) : null}

              {/* Key Insight & Executive Summary Card */}
              <div className="p-6 bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                    Executive Summary & Takeaways
                  </p>
                  <button
                    onClick={() => setIsEditingSummary(!isEditingSummary)}
                    className="text-[10px] font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase cursor-pointer flex items-center space-x-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>{isEditingSummary ? 'Done Editing' : 'Edit Summary'}</span>
                  </button>
                </div>

                {isEditingSummary ? (
                  <textarea
                    value={notes.executiveSummary}
                    onChange={(e) => {
                      const newSummary = e.target.value;
                      updateNotes((prev) => ({ ...prev, executiveSummary: newSummary }));
                    }}
                    rows={4}
                    className="w-full p-3 rounded-xl border-2 border-indigo-600 text-xs font-medium text-[#1a1a1a] bg-slate-50 focus:outline-hidden leading-relaxed"
                  />
                ) : (
                  <p className="text-xs sm:text-sm font-bold text-[#1a1a1a] leading-relaxed">
                    {notes.executiveSummary}
                  </p>
                )}

                {/* Key Takeaways Chips */}
                <div className="pt-3 border-t border-[#eeeeee] space-y-2">
                  <span className="text-xs font-black text-gray-400 uppercase tracking-wider">High Yield Points:</span>
                  <ul className="space-y-2">
                    {notes.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start text-xs font-bold text-gray-700 space-x-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 mt-1 shrink-0" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Study Smarter Pro Banner matching Design HTML */}
              <div className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white shadow-xl space-y-3">
                <h4 className="text-xl font-black">Study Smarter.</h4>
                <p className="text-xs font-medium opacity-90 leading-relaxed">
                  Unlock AI summaries for videos longer than 30 minutes, real-time voice lecture capture, and unlimited Anki exports.
                </p>
                <button
                  onClick={onOpenUpgrade}
                  className="w-full bg-white text-indigo-600 py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors cursor-pointer shadow-md"
                >
                  Get Pro Access (50% Off)
                </button>
              </div>

              {/* Ask Video AI Chat Box */}
              <div className="bg-white rounded-2xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-black text-[#1a1a1a] uppercase tracking-wider">
                      Ask Video AI Tutor
                    </h4>
                  </div>
                  <span className="text-[10px] font-black uppercase text-indigo-600">Socratic Mode</span>
                </div>

                {/* Chat Stream */}
                <div className="h-44 overflow-y-auto space-y-2 p-2 rounded-xl bg-[#fafafa] border border-[#eeeeee] text-xs">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl font-medium ${
                        msg.role === 'user'
                          ? 'bg-black text-white ml-6 font-bold'
                          : 'bg-white text-[#1a1a1a] border-2 border-black mr-6 shadow-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex items-center space-x-2 text-xs text-gray-500 p-2 font-bold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                      <span>AI Tutor formulating explanation...</span>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChatMessage} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about equations, proofs, or concepts..."
                    className="flex-1 px-3 py-2.5 rounded-xl border border-black text-xs font-bold bg-[#fafafa] focus:border-indigo-600 outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={isChatLoading || !chatInput.trim()}
                    className="p-2.5 rounded-xl bg-black hover:bg-indigo-600 text-white disabled:opacity-50 cursor-pointer transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right Pane: Interactive Tabs */}
            <div className="lg:col-span-7 space-y-5">
              {/* Tab Selector Bar matching Design HTML nav tabs */}
              <div className="no-print flex items-center space-x-2 p-2 bg-[#fafafa] rounded-2xl overflow-x-auto border border-[#eeeeee]">
                {[
                  { id: 'cornell', label: 'Cornell Notes', icon: BookOpen },
                  { id: 'timestamps', label: 'Chapters', icon: Clock },
                  { id: 'flashcards', label: `Flashcards (${notes.flashcards?.length || 0})`, icon: Layers },
                  { id: 'quiz', label: `Practice Quiz (${notes.quiz?.length || 0})`, icon: HelpCircle },
                  { id: 'definitions', label: 'Definitions', icon: FileSpreadsheet },
                  { id: 'mindmap', label: 'Mind Map', icon: Network },
                  { id: 'checklist', label: 'Checklist', icon: CheckSquare },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                        isActive
                          ? 'bg-black text-white shadow-xs'
                          : 'text-gray-400 hover:text-black hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: Cornell Study Notes */}
              {activeTab === 'cornell' && notes.cornellNotes && (
                <CornellNotesView
                  cornellNotes={notes.cornellNotes}
                  subject={notes.subject}
                  title={notes.title}
                  onPrint={handlePrint}
                  onUpdateCornellNotes={(updatedCornell) =>
                    updateNotes((prev) => ({ ...prev, cornellNotes: updatedCornell }))
                  }
                  autoSaveStatus={saveStatus}
                  lastSavedTime={lastSavedTime}
                />
              )}

              {/* Tab 2: Timestamped Chapters */}
              {activeTab === 'timestamps' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-xl tracking-tight italic">
                      Timestamped Chapter Breakdown
                    </h3>
                    <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">
                      {notes.timestampedSections?.length || 0} Key Points
                    </span>
                  </div>
                  <div className="space-y-3">
                    {notes.timestampedSections?.map((section, idx) => (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl transition-all space-y-2 ${
                          idx % 2 === 0
                            ? 'bg-[#f3f4ff] border-2 border-indigo-600'
                            : 'bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-md bg-black text-white text-xs font-mono font-black">
                            {section.timestamp}
                          </span>
                          <span className="text-sm font-black uppercase tracking-tight text-[#1a1a1a]">{section.topic}</span>
                        </div>
                        <p className="text-xs font-medium text-gray-700 leading-relaxed">{section.summary}</p>
                        {section.keyTerms && section.keyTerms.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {section.keyTerms.map((term, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2.5 py-0.5 bg-white border border-black text-[#1a1a1a] text-[10px] rounded-full font-black uppercase tracking-wider"
                              >
                                #{term}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Active-Recall Flashcards */}
              {activeTab === 'flashcards' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-xl tracking-tight italic">
                        Active-Recall Flashcards
                      </h3>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">
                        Card {currentCardIndex + 1} of {notes.flashcards?.length} • {masteredCards.size} Mastered
                      </p>
                    </div>
                    <button
                      onClick={handleExportAnki}
                      className="text-xs font-black text-indigo-600 border-b-2 border-indigo-600 uppercase tracking-widest pb-0.5 flex items-center space-x-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Anki Deck</span>
                    </button>
                  </div>

                  {notes.flashcards && notes.flashcards.length > 0 ? (
                    <div className="space-y-4">
                      {/* 3D Flip Card Container with Bold styling */}
                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="relative h-64 w-full cursor-pointer rounded-3xl perspective-1000 transition-all select-none"
                      >
                        <div
                          className={`w-full h-full rounded-3xl p-8 flex flex-col justify-between text-center transition-all duration-300 border-2 ${
                            isFlipped
                              ? 'bg-black text-white border-black shadow-[6px_6px_0px_0px_rgba(79,70,229,1)]'
                              : 'bg-[#f3f4ff] text-[#1a1a1a] border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-black uppercase tracking-widest text-indigo-600">
                              {isFlipped ? 'Answer' : 'Question / Prompt'}
                            </span>
                            <span className="text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider bg-black text-white">
                              Click to Flip
                            </span>
                          </div>

                          <div className="my-auto">
                            <p className="text-lg sm:text-xl font-black leading-snug tracking-tight">
                              {isFlipped
                                ? notes.flashcards[currentCardIndex].back
                                : notes.flashcards[currentCardIndex].front}
                            </p>
                            {!isFlipped && notes.flashcards[currentCardIndex].hint && (
                              <p className="text-xs font-bold text-gray-500 mt-2 italic">
                                Hint: {notes.flashcards[currentCardIndex].hint}
                              </p>
                            )}
                          </div>

                          <div className="flex justify-center items-center text-xs font-black uppercase tracking-wider text-gray-400">
                            <RotateCw className="w-3.5 h-3.5 mr-1.5" />
                            <span>Flip to view {isFlipped ? 'Question' : 'Answer'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Navigation & Mastery Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => {
                            setIsFlipped(false);
                            setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                          }}
                          disabled={currentCardIndex === 0}
                          className="px-5 py-2.5 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider text-[#1a1a1a] hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          Previous
                        </button>

                        <button
                          onClick={() => handleToggleCardMastery(currentCardIndex)}
                          className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 ${
                            masteredCards.has(currentCardIndex)
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white border-black text-[#1a1a1a] hover:bg-black hover:text-white'
                          }`}
                        >
                          {masteredCards.has(currentCardIndex) ? '✓ Mastered' : 'Mark as Mastered'}
                        </button>

                        <button
                          onClick={() => {
                            setIsFlipped(false);
                            setCurrentCardIndex((prev) =>
                              Math.min((notes.flashcards?.length || 1) - 1, prev + 1)
                            );
                          }}
                          disabled={currentCardIndex === (notes.flashcards?.length || 1) - 1}
                          className="px-5 py-2.5 rounded-full border-2 border-black text-xs font-black uppercase tracking-wider text-[#1a1a1a] hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                        >
                          Next Card
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">No flashcards available for this topic.</p>
                  )}
                </div>
              )}

              {/* Tab 4: Practice Quiz */}
              {activeTab === 'quiz' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-xl tracking-tight italic">
                        Interactive Mock Exam
                      </h3>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">
                        Test your active recall against standard university exam questions.
                      </p>
                    </div>
                    {showQuizResults && (
                      <button
                        onClick={handleResetQuiz}
                        className="text-xs font-black text-indigo-600 border-b-2 border-indigo-600 uppercase tracking-widest pb-0.5 flex items-center space-x-1 cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        <span>Retake Quiz</span>
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {notes.quiz?.map((q, qIndex) => {
                      const isAnswered = selectedAnswers[qIndex] !== undefined;
                      const isCorrect = selectedAnswers[qIndex] === q.correctIndex;
                      return (
                        <div
                          key={qIndex}
                          className={`p-5 rounded-2xl border-2 transition-all ${
                            showQuizResults
                              ? isCorrect
                                ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                                : 'bg-rose-50 border-rose-500 shadow-sm'
                              : 'bg-[#fafafa] border-black'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                              {qIndex + 1}
                            </span>
                            <p className="text-sm font-black text-[#1a1a1a]">{q.question}</p>
                          </div>

                          {/* Options */}
                          <div className="mt-4 space-y-2.5">
                            {q.options.map((option, optIndex) => {
                              const isSelected = selectedAnswers[qIndex] === optIndex;
                              const isThisCorrect = optIndex === q.correctIndex;

                              let btnClasses = 'border-2 border-black bg-white text-[#1a1a1a] hover:bg-slate-50 font-bold';
                              if (isSelected) {
                                btnClasses = 'border-2 border-indigo-600 bg-indigo-50 text-indigo-950 font-black shadow-xs';
                              }
                              if (showQuizResults) {
                                if (isThisCorrect) {
                                  btnClasses = 'border-2 border-emerald-600 bg-emerald-100 text-emerald-950 font-black';
                                } else if (isSelected && !isCorrect) {
                                  btnClasses = 'border-2 border-rose-500 bg-rose-100 text-rose-950 line-through font-bold';
                                }
                              }

                              return (
                                <button
                                  key={optIndex}
                                  type="button"
                                  onClick={() => handleQuizAnswer(qIndex, optIndex)}
                                  disabled={showQuizResults}
                                  className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer ${btnClasses}`}
                                >
                                  <span>{option}</span>
                                  {showQuizResults && isThisCorrect && (
                                    <span className="text-emerald-700 font-black text-xs uppercase">✓ Correct</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          {showQuizResults && (
                            <div className="mt-4 p-4 rounded-xl bg-white border-2 border-black text-xs text-[#1a1a1a] space-y-1">
                              <span className="font-black uppercase tracking-wider text-indigo-600">Explanation:</span>
                              <p className="font-medium leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {!showQuizResults ? (
                      <button
                        onClick={handleGradeQuiz}
                        disabled={Object.keys(selectedAnswers).length === 0}
                        className="w-full py-3.5 rounded-full bg-black hover:bg-indigo-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:scale-[1.01] transition-transform disabled:opacity-50 cursor-pointer"
                      >
                        Submit & Grade Exam
                      </button>
                    ) : (
                      <div className="p-6 rounded-2xl bg-black text-white text-center space-y-2 border-2 border-black">
                        <h4 className="text-lg font-black uppercase tracking-tight">Quiz Results Breakdown</h4>
                        <p className="text-xs text-gray-300 font-bold">
                          You scored{' '}
                          <span className="font-black text-emerald-400 text-base">
                            {
                              notes.quiz?.filter(
                                (q, idx) => selectedAnswers[idx] === q.correctIndex
                              ).length
                            }
                          </span>{' '}
                          out of {notes.quiz?.length} questions.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 5: Definitions & Cheat Sheet */}
              {activeTab === 'definitions' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
                  <h3 className="font-black text-xl tracking-tight italic">
                    Key Definitions & Memory Hooks
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notes.keyDefinitions?.map((def, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-2"
                      >
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Key Concept</p>
                        <h4 className="text-sm font-black text-[#1a1a1a]">{def.term}</h4>
                        <p className="text-xs font-medium text-gray-700 leading-relaxed">{def.definition}</p>
                        {def.exampleOrMnemonic && (
                          <div className="p-3 rounded-xl bg-[#f3f4ff] border border-indigo-200 text-[11px] text-indigo-950 font-bold">
                            <span className="font-black uppercase tracking-wider text-indigo-700">Mnemonic:</span> {def.exampleOrMnemonic}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 6: Mind Map Tree */}
              {activeTab === 'mindmap' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
                  <h3 className="font-black text-xl tracking-tight italic">
                    Conceptual Mind Map & Knowledge Tree
                  </h3>
                  <div className="space-y-4">
                    {notes.mindmap?.map((node, idx) => (
                      <div
                        key={idx}
                        className="p-5 rounded-2xl border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <Network className="w-5 h-5 text-indigo-600" />
                          <h4 className="text-base font-black text-[#1a1a1a] uppercase tracking-tight">{node.mainBranch}</h4>
                        </div>
                        <div className="pl-6 border-l-2 border-indigo-600 space-y-2">
                          {node.subNodes?.map((sub, sIdx) => (
                            <div key={sIdx} className="text-xs font-bold text-gray-800 flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-600" />
                              <span>{sub}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 7: Action Checklist */}
              {activeTab === 'checklist' && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4">
                  <h3 className="font-black text-xl tracking-tight italic">
                    Pre-Exam Action Checklist
                  </h3>
                  <div className="space-y-2.5">
                    {notes.actionChecklist?.map((task, idx) => {
                      const isDone = completedTasks.has(idx);
                      return (
                        <div
                          key={idx}
                          onClick={() => handleToggleTask(idx)}
                          className={`p-4 rounded-2xl border-2 text-xs sm:text-sm font-bold flex items-center space-x-3 cursor-pointer transition-all ${
                            isDone
                              ? 'bg-emerald-50 border-emerald-500 text-gray-400 line-through'
                              : 'bg-white border-black text-[#1a1a1a] hover:bg-[#fafafa] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 ${
                              isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-black bg-white'
                            }`}
                          >
                            {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>
                          <span>{task}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty State: Prompt User to Enter any YouTube Video URL */}
      {!notes && !isLoading && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border-2 border-black mx-auto flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Youtube className="w-8 h-8" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-[#1a1a1a] uppercase tracking-tight">
              Ready to Synthesize Your Lecture
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 font-bold leading-relaxed">
              Paste any YouTube video link, university lecture, or tutorial into the input above and click <span className="text-black font-black">"GENERATE GEMS"</span>. StudyGem will automatically analyze the video and generate structured Cornell notes, formulas, active-recall flashcards, and practice quiz questions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
