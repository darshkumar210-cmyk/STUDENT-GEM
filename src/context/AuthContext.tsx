import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { UserStudyProgress } from '../types';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  firebaseSignOut,
  onAuthStateChanged,
  User,
  db,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from '../lib/firebase';

export interface RegionalPricing {
  currencyCode: string;
  symbol: string;
  name: string;
  flag: string;
  monthly: number;
  monthlyDiscounted: number;
  semester: number;
  semesterDiscounted: number;
}

export const REGIONAL_PRICING: Record<string, RegionalPricing> = {
  USD: {
    currencyCode: 'USD',
    symbol: '$',
    name: 'US Dollar',
    flag: '🇺🇸',
    monthly: 0,
    monthlyDiscounted: 0,
    semester: 0,
    semesterDiscounted: 0,
  },
  INR: {
    currencyCode: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    monthly: 0,
    monthlyDiscounted: 0,
    semester: 0,
    semesterDiscounted: 0,
  },
};

export interface UserProfileData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isPro: boolean;
  proPlan?: 'free';
  currency: string;
  adsWatchedCount: number;
  aiGenerationsCount: number;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfileData;
  studyProgress: UserStudyProgress;
  isLoading: boolean;
  isPro: boolean;
  currency: string;
  pricing: RegionalPricing;
  setCurrency: (currency: string) => void;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  upgradeToPro: (plan?: string) => Promise<void>;
  cancelPro: () => Promise<void>;
  recordAdWatch: () => Promise<void>;
  recordAiGeneration: () => Promise<void>;
  // Study Progress & Tracking
  addStudyMinutes: (mins: number) => void;
  recordFlashcardMastered: (deckTitle: string) => void;
  recordQuizScore: (quizTitle: string, scorePercent: number) => void;
  recordNoteCreated: (noteTitle: string, type?: 'note' | 'cheatsheet' | 'planner' | 'voice') => void;
  recordPomodoroCompleted: (minutes: number) => void;
  // Auth Modal state
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalReason: string;
  openAuthModal: (reason?: string, pendingCb?: () => void) => void;
  closeAuthModal: () => void;
  // Ad Interstitial Manager
  isAdModalOpen: boolean;
  adActionName: string;
  triggerAdProtectedAction: (actionName: string, executeCallback: () => void) => void;
  closeAdModal: () => void;
  onAdCompleted: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEFAULT_STUDY_PROGRESS: UserStudyProgress = {
  totalMinutesStudied: 45,
  pomodoroSessionsCompleted: 2,
  flashcardsMastered: 18,
  quizzesTaken: 3,
  averageQuizScore: 92,
  notesGenerated: 4,
  streakDays: 3,
  lastActiveDate: new Date().toISOString(),
  level: 2,
  xp: 420,
  achievements: ['First Lecture Synthesized', 'Active Recall Prodigy', '3-Day Study Streak'],
  recentActivity: [
    { id: 'act-1', type: 'note', title: 'Calculus: Fundamental Theorem & Integration', timestamp: '2 hours ago', points: 100 },
    { id: 'act-2', type: 'flashcard', title: 'Organic Chemistry: Reaction Mechanisms', timestamp: 'Yesterday', points: 50 },
    { id: 'act-3', type: 'pomodoro', title: 'Deep Work Focus Block (25m)', timestamp: 'Yesterday', points: 40 },
  ],
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [currency] = useState<string>('USD');

  // Auth modal dialog
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalReason, setAuthModalReason] = useState<string>('');
  const [postAuthCallback, setPostAuthCallback] = useState<(() => void) | null>(null);

  const [adsWatchedCount, setAdsWatchedCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('studygem_ads_watched') || 0);
    } catch {
      return 0;
    }
  });

  const [aiGenerationsCount, setAiGenerationsCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('studygem_ai_generations') || 0);
    } catch {
      return 0;
    }
  });

  // Interstitial Ad Management State
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [adActionName, setAdActionName] = useState('AI Generation');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Persistent User Study Progress
  const [studyProgress, setStudyProgress] = useState<UserStudyProgress>(() => {
    try {
      const saved = localStorage.getItem('studygem_study_progress');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_STUDY_PROGRESS;
  });

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);

      if (user) {
        // Sync progress from Firestore if available
        try {
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            const data = snap.data();
            if (data.studyProgress) {
              setStudyProgress(data.studyProgress);
            }
          } else {
            // First time user registration in Firestore
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || 'Student Scholar',
              photoURL: user.photoURL,
              createdAt: new Date().toISOString(),
              studyProgress: studyProgress,
            });
          }
        } catch (e) {
          console.warn('Firestore sync notice:', e);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const saveProgress = async (newProg: UserStudyProgress) => {
    setStudyProgress(newProg);
    try {
      localStorage.setItem('studygem_study_progress', JSON.stringify(newProg));
      if (currentUser) {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { studyProgress: newProg }).catch(() => {});
      }
    } catch {}
  };

  const addStudyMinutes = (mins: number) => {
    setStudyProgress((prev) => {
      const updated = {
        ...prev,
        totalMinutesStudied: prev.totalMinutesStudied + mins,
        xp: prev.xp + mins * 2,
        level: Math.floor((prev.xp + mins * 2) / 250) + 1,
      };
      saveProgress(updated);
      return updated;
    });
  };

  const recordFlashcardMastered = (deckTitle: string) => {
    setStudyProgress((prev) => {
      const updated: UserStudyProgress = {
        ...prev,
        flashcardsMastered: prev.flashcardsMastered + 1,
        xp: prev.xp + 15,
        level: Math.floor((prev.xp + 15) / 250) + 1,
        recentActivity: [
          {
            id: `act-${Date.now()}`,
            type: 'flashcard',
            title: `Mastered card in ${deckTitle}`,
            timestamp: 'Just now',
            points: 15,
          },
          ...prev.recentActivity.slice(0, 9),
        ],
      };
      saveProgress(updated);
      return updated;
    });
  };

  const recordQuizScore = (quizTitle: string, scorePercent: number) => {
    setStudyProgress((prev) => {
      const totalQuizzes = prev.quizzesTaken + 1;
      const newAvg = Math.round((prev.averageQuizScore * prev.quizzesTaken + scorePercent) / totalQuizzes);
      const earnedXp = Math.round(scorePercent * 1.5);
      const updated: UserStudyProgress = {
        ...prev,
        quizzesTaken: totalQuizzes,
        averageQuizScore: newAvg,
        xp: prev.xp + earnedXp,
        level: Math.floor((prev.xp + earnedXp) / 250) + 1,
        recentActivity: [
          {
            id: `act-${Date.now()}`,
            type: 'quiz',
            title: `Completed ${quizTitle} (${scorePercent}%)`,
            timestamp: 'Just now',
            points: earnedXp,
          },
          ...prev.recentActivity.slice(0, 9),
        ],
      };
      saveProgress(updated);
      return updated;
    });
  };

  const recordNoteCreated = (noteTitle: string, type: 'note' | 'cheatsheet' | 'planner' | 'voice' = 'note') => {
    setStudyProgress((prev) => {
      const updated: UserStudyProgress = {
        ...prev,
        notesGenerated: prev.notesGenerated + 1,
        xp: prev.xp + 100,
        level: Math.floor((prev.xp + 100) / 250) + 1,
        recentActivity: [
          {
            id: `act-${Date.now()}`,
            type: type,
            title: `Generated ${noteTitle}`,
            timestamp: 'Just now',
            points: 100,
          },
          ...prev.recentActivity.slice(0, 9),
        ],
      };
      saveProgress(updated);
      return updated;
    });
  };

  const recordPomodoroCompleted = (minutes: number) => {
    setStudyProgress((prev) => {
      const updated: UserStudyProgress = {
        ...prev,
        pomodoroSessionsCompleted: prev.pomodoroSessionsCompleted + 1,
        totalMinutesStudied: prev.totalMinutesStudied + minutes,
        xp: prev.xp + 50,
        level: Math.floor((prev.xp + 50) / 250) + 1,
        recentActivity: [
          {
            id: `act-${Date.now()}`,
            type: 'pomodoro',
            title: `Completed Deep Work Session (${minutes}m)`,
            timestamp: 'Just now',
            points: 50,
          },
          ...prev.recentActivity.slice(0, 9),
        ],
      };
      saveProgress(updated);
      return updated;
    });
  };

  const pricing = useMemo(() => REGIONAL_PRICING.USD, []);

  const userProfile: UserProfileData = {
    uid: currentUser?.uid || 'guest_student',
    email: currentUser?.email || null,
    displayName: currentUser?.displayName || (currentUser?.isAnonymous ? 'Guest Scholar' : 'Student Scholar'),
    photoURL: currentUser?.photoURL || null,
    isPro: false,
    proPlan: 'free',
    currency: 'USD',
    adsWatchedCount,
    aiGenerationsCount,
  };

  const signInWithGoogle = async () => {
    const res = await signInWithPopup(auth, googleProvider);
    if (res?.user && postAuthCallback) {
      postAuthCallback();
      setPostAuthCallback(null);
    }
  };

  const signInAsGuest = async () => {
    const res = await signInAnonymously(auth);
    if (res?.user && postAuthCallback) {
      postAuthCallback();
      setPostAuthCallback(null);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    if (res?.user && postAuthCallback) {
      postAuthCallback();
      setPostAuthCallback(null);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res?.user) {
      if (name) {
        await updateProfile(res.user, { displayName: name }).catch(() => {});
      }
      if (postAuthCallback) {
        postAuthCallback();
        setPostAuthCallback(null);
      }
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const openAuthModal = (reason?: string, pendingCb?: () => void) => {
    if (reason) setAuthModalReason(reason);
    if (pendingCb) setPostAuthCallback(() => pendingCb);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason('');
  };

  const recordAdWatch = async () => {
    const next = adsWatchedCount + 1;
    setAdsWatchedCount(next);
    try {
      localStorage.setItem('studygem_ads_watched', String(next));
    } catch {}
  };

  const recordAiGeneration = async () => {
    const next = aiGenerationsCount + 1;
    setAiGenerationsCount(next);
    try {
      localStorage.setItem('studygem_ai_generations', String(next));
    } catch {}
  };

  // Purely Ad-Supported AI Action Trigger
  const triggerAdProtectedAction = (actionName: string, executeCallback: () => void) => {
    setAdActionName(actionName);
    setPendingAction(() => executeCallback);
    setIsAdModalOpen(true);
  };

  const closeAdModal = () => {
    setIsAdModalOpen(false);
    setPendingAction(null);
  };

  const onAdCompleted = () => {
    setIsAdModalOpen(false);
    recordAdWatch();
    recordAiGeneration();
    if (pendingAction) {
      const act = pendingAction;
      setPendingAction(null);
      act();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        userProfile,
        studyProgress,
        isLoading: authLoading,
        isPro: false,
        currency,
        pricing,
        setCurrency: () => {},
        signInWithGoogle,
        signInAsGuest,
        signInWithEmail,
        signUpWithEmail,
        logout,
        upgradeToPro: async () => {},
        cancelPro: async () => {},
        recordAdWatch,
        recordAiGeneration,
        addStudyMinutes,
        recordFlashcardMastered,
        recordQuizScore,
        recordNoteCreated,
        recordPomodoroCompleted,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalReason,
        openAuthModal,
        closeAuthModal,
        isAdModalOpen,
        adActionName,
        triggerAdProtectedAction,
        closeAdModal,
        onAdCompleted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
