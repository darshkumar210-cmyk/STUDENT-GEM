export type GemType =
  | 'home'
  | 'youtube'
  | 'flashcards'
  | 'quiz'
  | 'cheatsheet'
  | 'essay'
  | 'planner'
  | 'voice'
  | 'focus'
  | 'seoguides';

export type GemMode =
  | 'home'
  | 'youtube'
  | 'flashcards'
  | 'quiz'
  | 'cheatsheet'
  | 'essay'
  | 'planner'
  | 'voice'
  | 'focus'
  | 'seoguides'
  | 'youtube-notes'
  | 'cheat-sheet'
  | 'essay-helper'
  | 'study-planner'
  | 'voice-lecture'
  | 'focus-room'
  | 'seo-hub';

export type NoteSummary = YouTubeStudyNotes;
export interface SEOArticle {
  id: string;
  slug?: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string;
}

export interface FrequentQuestion {
  question: string;
  answer: string;
}

export interface TimestampSection {
  timestamp: string;
  topic: string;
  summary: string;
  keyTerms?: string[];
}

export interface CornellNotes {
  cuesAndQuestions: string[];
  detailedNotes: string;
  bottomSummary: string;
}

export interface KeyDefinition {
  term: string;
  definition: string;
  exampleOrMnemonic?: string;
}

export interface Flashcard {
  id?: string;
  front: string;
  back: string;
  category?: string;
  hint?: string;
  state?: 'new' | 'learning' | 'mastered';
}

export interface QuizQuestion {
  id?: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topicTag?: string;
}

export interface MindmapNode {
  mainBranch: string;
  subNodes: string[];
}

export interface YouTubeStudyNotes {
  id: string;
  title: string;
  videoUrl?: string;
  videoId?: string;
  subject: string;
  difficulty: string;
  estimatedReadTime: string;
  executiveSummary: string;
  keyTakeaways: string[];
  timestampedSections: TimestampSection[];
  cornellNotes: CornellNotes;
  keyDefinitions: KeyDefinition[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  mindmap: MindmapNode[];
  actionChecklist: string[];
  createdAt: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: string;
  cards: Flashcard[];
  createdAt: string;
}

export interface CheatSheetSection {
  sectionName: string;
  items: {
    name: string;
    formula: string;
    variables: string;
    whenToUse: string;
  }[];
}

export interface CheatSheetData {
  id: string;
  title: string;
  subject: string;
  sections: CheatSheetSection[];
  createdAt: string;
}

export interface EssayOutlineData {
  id: string;
  paperTitle: string;
  thesisStatement: string;
  counterArgument: string;
  introduction: {
    hook: string;
    background: string;
    thesisPlacement: string;
  };
  bodyParagraphs: {
    paragraphNumber: number;
    topicSentence: string;
    evidenceSuggestions: string[];
    analysisGuidance: string;
    transition: string;
  }[];
  conclusion: {
    restatedThesis: string;
    synthesis: string;
    finalTakeaway: string;
  };
  recommendedSources: {
    title: string;
    type: string;
    sampleCitation: string;
  }[];
  createdAt: string;
}

export interface StudyPlanDay {
  dayNumber: number;
  phase: string;
  dayTitle: string;
  sessions: {
    duration: string;
    task: string;
    technique: string;
  }[];
  milestone: string;
}

export interface StudyPlanData {
  id: string;
  planTitle: string;
  totalStudyHours: number;
  dailyTargetMinutes: number;
  strategyOverview: string;
  schedule: StudyPlanDay[];
  proTips: string[];
  createdAt: string;
}

export interface UserStudyProgress {
  totalMinutesStudied: number;
  pomodoroSessionsCompleted: number;
  flashcardsMastered: number;
  quizzesTaken: number;
  averageQuizScore: number;
  notesGenerated: number;
  streakDays: number;
  lastActiveDate: string;
  level: number;
  xp: number;
  achievements: string[];
  recentActivity: {
    id: string;
    type: 'note' | 'flashcard' | 'quiz' | 'pomodoro' | 'cheatsheet' | 'planner' | 'voice';
    title: string;
    timestamp: string;
    points: number;
  }[];
}

export interface UserSubscription {
  tier: 'free' | 'pro' | 'semester';
  creditsLeft: number;
  maxCredits: number;
  expiryDate?: string;
  isPro: boolean;
}

export interface SeoGuideArticle {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  metaDesc: string;
  keyTopics: string[];
  summary: string;
  contentMarkdown: string;
  relatedGem: GemType;
  samplePrompt: string;
}

export interface AffiliateDeal {
  id: string;
  partnerName: string;
  category: string;
  discountBadge: string;
  description: string;
  couponCode?: string;
  ctaText: string;
  affiliateUrl: string;
  logoIcon: string;
}
