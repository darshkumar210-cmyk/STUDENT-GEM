import { GemType } from './types';

export interface SitemapEntry {
  path: string;
  gemType: GemType;
  title: string;
  description: string;
  keywords: string[];
  priority: number;
  changeFreq: 'daily' | 'weekly' | 'monthly';
  icon: string;
  category: 'core' | 'memorization' | 'synthesis' | 'planning' | 'productivity';
}

export const STUDY_SITEMAP: SitemapEntry[] = [
  {
    path: '/',
    gemType: 'home',
    title: 'StudyGem AI - Smart Study Suite & Exam Mastery',
    description: 'Transform lectures, textbooks, and syllabi into Cornell notes, active recall flashcards, and mock exams.',
    keywords: ['study suite', 'ai study tools', 'cornell notes', 'flashcards', 'mock exam'],
    priority: 1.0,
    changeFreq: 'daily',
    icon: 'Sparkles',
    category: 'core',
  },
  {
    path: '/youtube-notes',
    gemType: 'youtube',
    title: 'YouTube Lecture to Cornell Notes',
    description: 'Transform any educational YouTube video or recorded lecture into rich Cornell study notes, summaries, and exam prep.',
    keywords: ['youtube notes', 'lecture to notes', 'video summarizer', 'cornell note maker'],
    priority: 1.0,
    changeFreq: 'daily',
    icon: 'Youtube',
    category: 'core',
  },
  {
    path: '/voice-lecture',
    gemType: 'voice',
    title: 'Live Classroom Voice Transcriber & Note Gem',
    description: 'Record live classroom lectures or microphone audio and automatically extract Cornell notes, formulas, and flashcards.',
    keywords: ['voice notes', 'lecture recorder', 'speech to notes', 'audio study guide'],
    priority: 0.95,
    changeFreq: 'daily',
    icon: 'Mic',
    category: 'core',
  },
  {
    path: '/flashcards',
    gemType: 'flashcards',
    title: 'Active Recall Smart Flashcards',
    description: 'Spaced-repetition study flashcard decks generated instantly by AI for rapid pre-exam memorization.',
    keywords: ['flashcards', 'active recall', 'spaced repetition', 'anki deck generator'],
    priority: 0.9,
    changeFreq: 'daily',
    icon: 'Layers',
    category: 'memorization',
  },
  {
    path: '/quiz',
    gemType: 'quiz',
    title: 'AI Practice Exam & Timed Quizzes',
    description: 'Rigorous mock exams with timed scoring, distractor explanations, and detailed score breakdown.',
    keywords: ['practice test', 'exam simulation', 'quiz maker', 'mock exam'],
    priority: 0.9,
    changeFreq: 'daily',
    icon: 'BrainCircuit',
    category: 'memorization',
  },
  {
    path: '/cheat-sheet',
    gemType: 'cheatsheet',
    title: 'Exam Formula & Concept Cheat Sheet',
    description: 'One-page ultra-high-yield formulas, laws, mnemonics, and top 5 student traps.',
    keywords: ['formula sheet', 'cheat sheet', 'exam review', 'stem formulas'],
    priority: 0.85,
    changeFreq: 'weekly',
    icon: 'FileSpreadsheet',
    category: 'synthesis',
  },
  {
    path: '/study-planner',
    gemType: 'planner',
    title: 'Spaced-Repetition Study Schedule Planner',
    description: 'Custom daily study timetable calibrated to your remaining exam days and syllabus difficulty.',
    keywords: ['study schedule', 'revision planner', 'exam timetable', 'study routine'],
    priority: 0.85,
    changeFreq: 'weekly',
    icon: 'Calendar',
    category: 'planning',
  },
  {
    path: '/essay-helper',
    gemType: 'essay',
    title: 'Academic Essay & Assignment Blueprint',
    description: 'Structure rigorous thesis statements, evidence synthesis, citations, and argumentative outlines.',
    keywords: ['essay outline', 'paper structure', 'thesis generator', 'academic writing'],
    priority: 0.8,
    changeFreq: 'weekly',
    icon: 'FileText',
    category: 'synthesis',
  },
  {
    path: '/focus-room',
    gemType: 'focus',
    title: 'Pomodoro Focus Room & Lo-Fi Study Lounge',
    description: 'Ambient background audio, customizable Pomodoro timer intervals, and deep focus sessions.',
    keywords: ['pomodoro timer', 'study ambiance', 'focus room', 'lofi study'],
    priority: 0.75,
    changeFreq: 'weekly',
    icon: 'Clock',
    category: 'productivity',
  },
  {
    path: '/study-hub',
    gemType: 'seoguides',
    title: 'Curated SEO Academic Study Guides & Cheat Sheets',
    description: 'Browse pre-made study guides for Organic Chemistry, Calculus, Computer Science, and World History.',
    keywords: ['study guides', 'subject cheat sheets', 'student hub', 'free notes'],
    priority: 0.9,
    changeFreq: 'daily',
    icon: 'BookOpen',
    category: 'core',
  },
];

export function getGemTypeFromPath(pathname: string): GemType | null {
  const clean = pathname.toLowerCase().replace(/\/$/, '') || '/';
  if (clean === '/' || clean === '/home') return 'home';
  if (clean === '/youtube-notes' || clean === '/vplink-complete') return 'youtube';
  const entry = STUDY_SITEMAP.find((item) => item.path === clean);
  return entry ? entry.gemType : null;
}

export function getPathFromGemType(gem: GemType): string {
  const entry = STUDY_SITEMAP.find((item) => item.gemType === gem);
  return entry ? entry.path : '/';
}
