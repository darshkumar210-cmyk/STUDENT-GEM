import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Layers,
  Sparkles,
  RotateCw,
  Plus,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { FlashcardDeck, Flashcard } from '../types';
import { useAuth } from '../context/AuthContext';
import { AdBanner } from './AdBanner';

interface FlashcardGemProps {
  decks: FlashcardDeck[];
  onSaveDeck: (deck: FlashcardDeck) => void;
  isPro: boolean;
  onOpenUpgrade: () => void;
}

export const FlashcardGem: React.FC<FlashcardGemProps> = ({
  decks,
  onSaveDeck,
  isPro,
  onOpenUpgrade,
}) => {
  const { triggerAdProtectedAction } = useAuth();
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck>(
    decks[0] || {
      id: 'default-deck',
      title: 'MCAT & Pre-Med High Yield Terms',
      subject: 'Biology / Medicine',
      createdAt: new Date().toISOString(),
      cards: [
        {
          id: '1',
          front: 'What is the function of the enzyme Helicase during DNA replication?',
          back: 'Helicase unwinds the double helix at the replication fork by breaking hydrogen bonds between base pairs.',
          category: 'Enzymes',
        },
        {
          id: '2',
          front: 'What is the difference between competitive and non-competitive enzyme inhibition?',
          back: 'Competitive inhibitors bind to the active site (Vmax unchanged, Km increases). Non-competitive bind allosterically (Km unchanged, Vmax decreases).',
          category: 'Biochemistry',
        },
        {
          id: '3',
          front: 'State the Frank-Starling Law of the heart.',
          back: 'The stroke volume of the heart increases in response to an increase in the volume of blood in the ventricles before contraction (end-diastolic volume).',
          category: 'Physiology',
        },
        {
          id: '4',
          front: 'Which organelle is responsible for post-translational modification and sorting of proteins?',
          back: 'The Golgi Apparatus (cis face receives vesicles, trans face ships them).',
          category: 'Cell Biology',
        },
      ],
    }
  );

  const [aiTopic, setAiTopic] = useState('');
  const [aiText, setAiText] = useState('');
  const [cardCount, setCardCount] = useState(8);
  const [isGenerating, setIsGenerating] = useState(false);

  // Study Mode State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [box1, setBox1] = useState<number[]>([]); // Review Soon
  const [box2, setBox2] = useState<number[]>([]); // Getting Familiar
  const [box3, setBox3] = useState<number[]>([]); // Mastered

  const currentCard = activeDeck.cards[currentIdx];

  const handleGenerateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    triggerAdProtectedAction('AI Flashcard Deck Generation', async () => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/gemini/flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: aiTopic,
            text: aiText,
            count: cardCount,
          }),
        });
        const result = await res.json();
        if (result.success && result.data?.cards) {
          const newDeck: FlashcardDeck = {
            id: `deck-${Date.now()}`,
            title: result.data.deckTitle || aiTopic,
            subject: result.data.subject || 'General Study',
            cards: result.data.cards,
            createdAt: new Date().toISOString(),
          };
          onSaveDeck(newDeck);
          setActiveDeck(newDeck);
          setCurrentIdx(0);
          setIsFlipped(false);
          setBox1([]);
          setBox2([]);
          setBox3([]);
          confetti({ particleCount: 60, spread: 60 });
        }
      } catch {
        alert('Failed to generate flashcards. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    });
  };

  const handleRateCard = (rating: 'hard' | 'good' | 'mastered') => {
    setIsFlipped(false);
    if (rating === 'hard') {
      setBox1((prev) => Array.from(new Set([...prev, currentIdx])));
      setBox3((prev) => prev.filter((i) => i !== currentIdx));
    } else if (rating === 'good') {
      setBox2((prev) => Array.from(new Set([...prev, currentIdx])));
    } else {
      setBox3((prev) => Array.from(new Set([...prev, currentIdx])));
      setBox1((prev) => prev.filter((i) => i !== currentIdx));
    }

    if (currentIdx + 1 < activeDeck.cards.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      // Completed deck
      confetti({ particleCount: 100, spread: 80 });
    }
  };

  const handleExportAnki = () => {
    const csvContent = activeDeck.cards
      .map((c) => `"${c.front.replace(/"/g, '""')}","${c.back.replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeDeck.title.replace(/[^a-z0-9]/gi, '_')}_anki.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              AI Flashcard Studio & Spaced Repetition
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Active recall cards with Leitner 3-box spaced repetition algorithm for maximum long-term memory.
          </p>
        </div>

        {/* Deck Export */}
        <button
          onClick={handleExportAnki}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span>Export Deck to Anki CSV</span>
        </button>
      </div>

      {/* AI Deck Generator Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Create New AI Flashcard Deck</span>
        </h3>

        <form onSubmit={handleGenerateDeck} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              placeholder="Topic (e.g. Organic Chemistry Functional Groups, AP Psychology, French B1 Vocab)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:border-indigo-500 outline-hidden"
            />
            <select
              value={cardCount}
              onChange={(e) => setCardCount(Number(e.target.value))}
              className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 outline-hidden"
            >
              <option value={6}>6 Cards</option>
              <option value={10}>10 Cards</option>
              <option value={15}>15 Cards</option>
              <option value={20}>20 Cards</option>
            </select>
            <button
              type="submit"
              disabled={isGenerating || !aiTopic.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Building Deck...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Generate Cards</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sponsor Ad Banner for Free Tier */}
      <AdBanner onOpenUpgradeModal={onOpenUpgrade} />

      {/* Main Flashcard Study Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Decks & Leitner Box Stats */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Spaced Repetition Stats
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                <span className="text-lg font-extrabold text-rose-700">{box1.length}</span>
                <p className="text-[11px] font-semibold text-rose-600">Review Soon</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-lg font-extrabold text-amber-700">{box2.length}</span>
                <p className="text-[11px] font-semibold text-amber-600">Learning</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-lg font-extrabold text-emerald-700">{box3.length}</span>
                <p className="text-[11px] font-semibold text-emerald-600">Mastered</p>
              </div>
            </div>

            {/* Deck Title Card */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <h4 className="text-sm font-bold text-slate-800">{activeDeck.title}</h4>
              <p className="text-xs text-slate-500">{activeDeck.subject} • {activeDeck.cards.length} Total Cards</p>
            </div>
          </div>
        </div>

        {/* Right: Active Card Player */}
        <div className="lg:col-span-8 space-y-4">
          {currentCard ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  Card <strong className="text-slate-800">{currentIdx + 1}</strong> of {activeDeck.cards.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                  {currentCard.category || 'General'}
                </span>
              </div>

              {/* 3D Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative h-72 w-full cursor-pointer rounded-2xl select-none"
              >
                <div
                  className={`w-full h-full rounded-2xl p-8 flex flex-col justify-between text-center transition-all duration-300 border-2 shadow-sm ${
                    isFlipped
                      ? 'bg-slate-900 text-white border-slate-800'
                      : 'bg-gradient-to-b from-indigo-50/50 to-white text-slate-900 border-indigo-200'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold uppercase tracking-wider text-slate-400">
                      {isFlipped ? 'Answer' : 'Question'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/50 text-slate-600">
                      Click to Flip
                    </span>
                  </div>

                  <div className="my-auto">
                    <p className="text-lg sm:text-xl font-bold leading-relaxed">
                      {isFlipped ? currentCard.back : currentCard.front}
                    </p>
                  </div>

                  <div className="flex justify-center items-center text-xs text-slate-400">
                    <RotateCw className="w-3.5 h-3.5 mr-1" />
                    <span>Space or Click to flip</span>
                  </div>
                </div>
              </div>

              {/* Leitner Evaluation Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleRateCard('hard')}
                  className="py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-bold transition-all"
                >
                  1. Review Soon
                </button>
                <button
                  onClick={() => handleRateCard('good')}
                  className="py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs sm:text-sm font-bold transition-all"
                >
                  2. Good
                </button>
                <button
                  onClick={() => handleRateCard('mastered')}
                  className="py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-bold transition-all"
                >
                  3. Mastered ✓
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center text-slate-500">
              <p>No cards in this deck.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
