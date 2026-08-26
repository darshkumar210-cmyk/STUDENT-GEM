/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HomeOverview } from './components/HomeOverview';
import { YouTubeNoteGem } from './components/YouTubeNoteGem';
import { FlashcardGem } from './components/FlashcardGem';
import { QuizGem } from './components/QuizGem';
import { CheatSheetGem } from './components/CheatSheetGem';
import { EssayHelperGem } from './components/EssayHelperGem';
import { StudyPlannerGem } from './components/StudyPlannerGem';
import { VoiceLectureGem } from './components/VoiceLectureGem';
import { FocusRoomGem } from './components/FocusRoomGem';
import { SeoStudyHub } from './components/SeoStudyHub';
import { CommandPalette } from './components/CommandPalette';
import { AdModal } from './components/AdModal';
import { AuthModal } from './components/AuthModal';
import { StudyVoiceAssistant } from './components/StudyVoiceAssistant';
import { StudyProgressDashboard } from './components/StudyProgressDashboard';
import { useAuth } from './context/AuthContext';
import {
  GemType,
  GemMode,
  FlashcardDeck,
  YouTubeStudyNotes,
} from './types';
import { SAMPLE_VIDEO_PRESETS } from './data/sampleStudyData';
import { getGemTypeFromPath, getPathFromGemType } from './sitemap';
import { ShieldCheck, BarChart3, ChevronUp } from 'lucide-react';

export default function App() {
  const {
    recordNoteCreated,
    openAuthModal,
  } = useAuth();

  const [activeGem, setActiveGem] = useState<GemType>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      const params = new URLSearchParams(window.location.search);
      const referrer = document.referrer || '';
      const cameBackFromVplink = /(^|\.)vplink\.in(\/|$)/i.test(referrer);
      const isVplinkReturn =
        params.get('vplink_complete') === '1' ||
        path === '/vplink-complete' ||
        cameBackFromVplink;

      if (isVplinkReturn) {
        // The VPlink destination can land on the homepage or a dedicated
        // completion path. Mark the return before the YouTube component mounts.
        try {
          sessionStorage.setItem('studygem_vplink_return_ready', '1');
        } catch {}
        return 'youtube';
      }

      const match = getGemTypeFromPath(window.location.pathname);
      if (match) return match;
    }
    return 'home';
  });

  const [showProgressSection, setShowProgressSection] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Sync activeGem with URL history and deep linking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const targetPath = getPathFromGemType(activeGem);
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    }
  }, [activeGem]);

  useEffect(() => {
    const handlePopState = () => {
      const gem = getGemTypeFromPath(window.location.pathname);
      if (gem) setActiveGem(gem);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Focus room timer sync with Navbar
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState('25:00');

  // YouTube Note Gem Active State & History
  const [currentNotes, setCurrentNotes] = useState<YouTubeStudyNotes | null>(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);

  // Saved Decks in LocalStorage
  const [savedDecks, setSavedDecks] = useState<FlashcardDeck[]>(() => {
    const cached = localStorage.getItem('studygem_decks');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return [];
  });

  const handleSaveDeck = (newDeck: FlashcardDeck) => {
    const updated = [newDeck, ...savedDecks.filter((d) => d.id !== newDeck.id)];
    setSavedDecks(updated);
    localStorage.setItem('studygem_decks', JSON.stringify(updated));
  };

  const handleGenerateNotes = async (
    videoUrl: string,
    rawTranscript: string,
    subject: string,
    targetLevel: string
  ) => {
    setIsLoadingNotes(true);
    try {
      const res = await fetch('/api/gemini/youtube-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          rawTranscript,
          subject,
          targetLevel,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentNotes(data.data);
        recordNoteCreated(data.data.title || 'YouTube Lecture Notes');
      } else {
        alert(data.error || 'Failed to generate study notes. Please check the video transcript.');
      }
    } catch {
      alert('Network error connecting to StudyGem server.');
    } finally {
      setIsLoadingNotes(false);
    }
  };

  const handleLoadPreset = (presetId: string) => {
    const preset = SAMPLE_VIDEO_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setCurrentNotes(preset.mockData);
      recordNoteCreated(preset.title);
    }
  };

  // Map GemMode to GemType for navbar and command palette
  const handleSelectGemMode = (gem: GemMode) => {
    if (gem === 'home') setActiveGem('home');
    else if (gem === 'youtube-notes' || gem === 'youtube') setActiveGem('youtube');
    else if (gem === 'flashcards') setActiveGem('flashcards');
    else if (gem === 'quiz') setActiveGem('quiz');
    else if (gem === 'cheat-sheet' || gem === 'cheatsheet') setActiveGem('cheatsheet');
    else if (gem === 'essay-helper' || gem === 'essay') setActiveGem('essay');
    else if (gem === 'study-planner' || gem === 'planner') setActiveGem('planner');
    else if (gem === 'voice-lecture' || gem === 'voice') setActiveGem('voice');
    else if (gem === 'focus-room' || gem === 'focus') setActiveGem('focus');
    else if (gem === 'seo-hub' || gem === 'seoguides') setActiveGem('seoguides');
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#1a1a1a] font-sans antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Main Navbar */}
      <Navbar
        activeGem={activeGem}
        setActiveGem={setActiveGem}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        pomodoroActive={pomodoroActive}
        pomodoroTime={pomodoroTime}
        onToggleProgress={() => setShowProgressSection((prev) => !prev)}
        showProgress={showProgressSection}
        onOpenAuth={() => openAuthModal('Sign in to sync your study notes and progress')}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Toggleable Academic Progress Dashboard */}
        {showProgressSection && (
          <div className="transition-all animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-emerald-800">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>Your Academic Mastery Tracker</span>
              </div>
              <button
                onClick={() => setShowProgressSection(false)}
                className="text-xs font-bold text-gray-500 hover:text-black flex items-center space-x-1 cursor-pointer"
              >
                <span>Hide Dashboard</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
            <StudyProgressDashboard
              onNavigateGem={(gem) => {
                setActiveGem(gem);
                setShowProgressSection(false);
              }}
            />
          </div>
        )}

        {/* Dynamic Gem Active Studio */}
        <div className="w-full">
          {activeGem === 'home' && (
            <HomeOverview
              onSelectGem={setActiveGem}
              onOpenAuth={() => openAuthModal('Sign in to sync your study decks')}
            />
          )}

          {activeGem === 'youtube' && (
            <YouTubeNoteGem
              currentNotes={currentNotes}
              onGenerateNotes={handleGenerateNotes}
              isLoading={isLoadingNotes}
              onLoadPreset={handleLoadPreset}
              isPro={false}
              onOpenUpgrade={() => {}}
              onUpdateNotes={(updated) => setCurrentNotes(updated)}
              onClearNotes={() => setCurrentNotes(null)}
            />
          )}

          {activeGem === 'flashcards' && (
            <FlashcardGem
              decks={savedDecks}
              onSaveDeck={handleSaveDeck}
              isPro={false}
              onOpenUpgrade={() => {}}
            />
          )}

          {activeGem === 'quiz' && (
            <QuizGem
              isPro={false}
              onOpenUpgrade={() => {}}
            />
          )}

          {activeGem === 'cheatsheet' && (
            <CheatSheetGem
              isPro={false}
              onOpenUpgrade={() => {}}
            />
          )}

          {activeGem === 'essay' && (
            <EssayHelperGem
              isPro={false}
              onOpenUpgrade={() => {}}
            />
          )}

          {activeGem === 'planner' && (
            <StudyPlannerGem
              isPro={false}
              onOpenUpgrade={() => {}}
            />
          )}

          {activeGem === 'voice' && (
            <VoiceLectureGem
              isPro={false}
              onOpenUpgrade={() => {}}
              onSendToYouTubeSuite={(transcript) => {
                setActiveGem('youtube');
                handleGenerateNotes('', transcript, 'Classroom Lecture', 'University');
              }}
            />
          )}

          {activeGem === 'focus' && (
            <FocusRoomGem
              onTimeUpdate={(timeStr, isActive) => {
                setPomodoroActive(isActive);
                setPomodoroTime(timeStr);
              }}
            />
          )}

          {activeGem === 'seoguides' && (
            <SeoStudyHub
              onSelectGem={(gem) => {
                if (gem === 'youtube-notes') setActiveGem('youtube');
                else if (gem === 'flashcards') setActiveGem('flashcards');
                else if (gem === 'mock-exams' || gem === 'quiz') setActiveGem('quiz');
                else if (gem === 'cheat-sheets') setActiveGem('cheatsheet');
                else if (gem === 'essay-helper') setActiveGem('essay');
                else if (gem === 'study-planner') setActiveGem('planner');
                else if (gem === 'voice-lecture') setActiveGem('voice');
                else if (gem === 'focus-room') setActiveGem('focus');
              }}
            />
          )}
        </div>

        {/* Global SEO Tags & Academic Breadcrumbs */}
        <div className="no-print pt-6 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500 font-bold">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            <span className="uppercase tracking-wider text-black">
              High Yield Recall • Spaced Repetition Engine
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="text-gray-400 hover:text-black transition-colors cursor-pointer"
            >
              Shortcuts (⌘K)
            </button>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-emerald-700">Gemini 2.5 Active</span>
            </div>
          </div>
        </div>
      </main>

      {/* SEO-Optimized Footer */}
      <footer className="mt-16 border-t-2 border-black bg-[#121212] text-white py-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center font-black text-xs">
                  G
                </div>
                <span className="font-black text-xl tracking-tighter">STUDY.GEM AI</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed max-w-sm font-medium">
                The all-in-one high-yield AI study suite. Transform long YouTube lectures, course notes, and textbooks into Cornell summaries, active-recall flashcards, and practice exams.
              </p>
              <div className="flex items-center space-x-2 text-[11px] text-emerald-400 pt-1 font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Encrypted • Firebase Cloud Database Connected</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-400">
              <h4 className="text-white font-black uppercase tracking-widest text-[11px]">
                Study Engines
              </h4>
              <ul className="space-y-1.5 font-bold">
                <li>
                  <button
                    onClick={() => setActiveGem('home')}
                    className="hover:text-white transition-colors cursor-pointer tracking-tight"
                  >
                    Platform Overview
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveGem('youtube')}
                    className="hover:text-white transition-colors cursor-pointer tracking-tight"
                  >
                    YouTube Lecture Synthesizer
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveGem('flashcards')}
                    className="hover:text-white transition-colors cursor-pointer tracking-tight"
                  >
                    Active Recall Flashcard Studio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveGem('quiz')}
                    className="hover:text-white transition-colors cursor-pointer tracking-tight"
                  >
                    Mock Exam & Quiz Generator
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveGem('cheatsheet')}
                    className="hover:text-white transition-colors cursor-pointer tracking-tight"
                  >
                    One-Page Formula Cheat Sheets
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2 text-xs text-gray-400">
              <h4 className="text-white font-black uppercase tracking-widest text-[11px]">
                Productivity & Hub
              </h4>
              <ul className="space-y-1.5 font-bold">
                <li>
                  <button
                    onClick={() => setActiveGem('essay')}
                    className="hover:text-white transition-colors cursor-pointer tracking-tight"
                  >
                    Essay & Thesis Helper
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveGem('planner')}
                    className="hover:text-white transition-colors cursor-pointer tracking-tight"
                  >
                    Spaced Study Planner
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveGem('voice')}
                    className="hover:text-white transition-colors cursor-pointer tracking-tight"
                  >
                    Live Lecture Transcriber
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveGem('focus')}
                    className="hover:text-white transition-colors cursor-pointer tracking-tight"
                  >
                    Pomodoro Focus Lounge
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveGem('seoguides')}
                    className="hover:text-white transition-colors cursor-pointer tracking-tight"
                  >
                    Study Guides & Library
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
            <p>© {new Date().getFullYear()} STUDY.GEM AI. Powered by Gemini 2.5 Flash.</p>
            <div className="flex items-center space-x-4">
              <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
              <span>•</span>
              <span className="hover:text-gray-400 cursor-pointer">Academic Honor Code</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Firebase Cloud Authentication Modal */}
      <AuthModal />

      {/* Sponsor Ad Modal */}
      <AdModal />

      {/* Universal Quick Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectGem={handleSelectGemMode}
      />

      {/* Floating Hands-Free AI Study Voice Assistant */}
      <StudyVoiceAssistant
        activeGem={activeGem}
        setActiveGem={setActiveGem}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onStartPomodoro={() => {
          setActiveGem('focus');
        }}
      />
    </div>
  );
}
