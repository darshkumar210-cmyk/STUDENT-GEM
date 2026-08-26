import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Youtube,
  Layers,
  HelpCircle,
  FileSpreadsheet,
  PenTool,
  Calendar,
  Mic,
  Timer,
  BookOpen,
  Search,
  Flame,
  Award,
  LogIn,
  LogOut,
  User,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { GemType } from '../types';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeGem: GemType;
  setActiveGem: (gem: GemType) => void;
  onOpenUpgrade?: () => void;
  onOpenAuth?: () => void;
  onOpenCommandPalette: () => void;
  pomodoroActive: boolean;
  pomodoroTime: string;
  onToggleProgress?: () => void;
  showProgress?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeGem,
  setActiveGem,
  onOpenAuth,
  onOpenCommandPalette,
  pomodoroActive,
  pomodoroTime,
  onToggleProgress,
  showProgress,
}) => {
  const { user, logout, openAuthModal, studyProgress } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const gems: { id: GemType; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'home', label: 'Overview', icon: Sparkles },
    { id: 'youtube', label: 'YouTube to Notes', icon: Youtube, badge: 'Popular' },
    { id: 'flashcards', label: 'Flashcard Studio', icon: Layers },
    { id: 'quiz', label: 'Mock Exam & Quiz', icon: HelpCircle },
    { id: 'cheatsheet', label: 'Cheat Sheets', icon: FileSpreadsheet },
    { id: 'essay', label: 'Essay Helper', icon: PenTool },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'voice', label: 'Live Lecture Mic', icon: Mic },
    { id: 'focus', label: 'Focus Room', icon: Timer },
    { id: 'seoguides', label: 'Study Guides', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#eeeeee] shadow-xs no-print">
      {/* Top Brand & Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Slogan */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => setActiveGem('home')}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-xs">
              <span className="text-white font-black text-xl tracking-tighter">G</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-[#1a1a1a]">
                STUDY.GEM
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:inline-block">
                All-In-One Study Suite
              </span>
            </div>
          </div>

          {/* Center Search / Cmd+K Quick Launch */}
          <div className="hidden md:flex items-center">
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center space-x-3 text-xs font-bold text-[#1a1a1a] bg-[#fafafa] hover:bg-slate-100 border-2 border-black rounded-full px-4 py-2 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-64 justify-between cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-indigo-600 stroke-[2.5]" />
                <span className="tracking-tight text-gray-600">Quick launch tools...</span>
              </div>
              <kbd className="bg-black text-white rounded-md px-1.5 py-0.5 text-[10px] font-black font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Action Bar: Level, Pomodoro & Login Profile */}
          <div className="flex items-center space-x-2.5">
            {/* Level & Streak Indicator */}
            {onToggleProgress && (
              <button
                onClick={onToggleProgress}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                  showProgress
                    ? 'bg-emerald-100 text-emerald-950 border-emerald-600 shadow-[2px_2px_0px_0px_rgba(5,150,105,1)]'
                    : 'bg-[#fafafa] text-[#1a1a1a] border-black hover:bg-slate-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                }`}
                title="View Academic Progress & Achievements"
              >
                <Award className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                <span>Lvl {studyProgress.level}</span>
                <span className="text-gray-300">•</span>
                <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                <span className="text-orange-600">{studyProgress.streakDays}d</span>
              </button>
            )}

            {/* Pomodoro Timer Chip */}
            <button
              onClick={() => setActiveGem('focus')}
              className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                pomodoroActive
                  ? 'bg-amber-100 text-amber-950 border-amber-500 shadow-[2px_2px_0px_0px_rgba(245,158,11,1)] animate-pulse'
                  : 'bg-white text-[#1a1a1a] border-black hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
              }`}
              title="Open Focus Room"
            >
              <Timer className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
              <span>{pomodoroTime}</span>
            </button>

            {/* User Login / Profile Section */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white border-2 border-black hover:bg-slate-50 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer text-xs font-black"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs uppercase">
                    {user.displayName ? user.displayName.charAt(0) : 'U'}
                  </div>
                  <span className="hidden sm:inline-block max-w-[100px] truncate text-black">
                    {user.displayName || user.email || 'Student'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-3 z-50 animate-fade-in space-y-2">
                    <div className="px-2 py-1.5 border-b border-gray-100">
                      <p className="text-xs font-black text-black truncate">
                        {user.displayName || 'Student Scholar'}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate font-medium">
                        {user.email || 'Anonymous Guest Session'}
                      </p>
                    </div>

                    <div className="px-2 py-1 flex items-center space-x-1.5 text-[11px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Firestore Sync Connected</span>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black uppercase flex items-center justify-center space-x-1.5 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth || (() => openAuthModal('Sign in to sync your study progress'))}
                className="flex items-center space-x-1.5 py-1.5 px-3 sm:px-4 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all hover:translate-x-[1px] hover:translate-y-[1px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Horizontal Gems Nav Bar */}
      <div className="border-t border-[#eeeeee] bg-[#fafafa] overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 sm:space-x-8 py-2.5">
          {gems.map((gem) => {
            const Icon = gem.icon;
            const isActive = activeGem === gem.id;
            return (
              <button
                key={gem.id}
                id={`nav-${gem.id}`}
                onClick={() => setActiveGem(gem.id)}
                className={`flex items-center space-x-2 py-1 font-black text-xs sm:text-sm tracking-tight uppercase whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-b-2 border-indigo-600 text-black pb-1'
                    : 'text-gray-400 hover:text-black'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-indigo-600 stroke-[2.5]' : 'text-gray-400 stroke-[2]'
                  }`}
                />
                <span>{gem.label}</span>
                {gem.badge && (
                  <span className="ml-1 px-1.5 py-0.2 bg-indigo-600 text-white text-[9px] rounded-full font-black tracking-widest uppercase">
                    {gem.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
