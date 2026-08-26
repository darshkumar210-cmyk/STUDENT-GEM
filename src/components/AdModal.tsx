import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, Play, CheckCircle2, ShieldCheck, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SponsorAd {
  id: string;
  brand: string;
  category: string;
  tagline: string;
  description: string;
  ctaText: string;
  link: string;
  badge: string;
  accentColor: string;
  estRevenue: string;
}

const SPONSOR_ADS: SponsorAd[] = [
  {
    id: 'github-student',
    brand: 'GitHub Education',
    category: 'Developer Tools',
    tagline: 'Get $200k+ in Developer Tools & Cloud Credits',
    description: 'Access GitHub Copilot, domains from Namecheap, and DigitalOcean credits with your verified student account.',
    ctaText: 'Access Student Pack',
    link: 'https://education.github.com/pack',
    badge: 'STUDENT TOOLS',
    accentColor: 'bg-emerald-500',
    estRevenue: '$0.08',
  },
  {
    id: 'notion-education',
    brand: 'Notion AI Academic',
    category: 'Note Taking & Second Brain',
    tagline: 'Unlimited Notes, AI Summaries & Team Workspaces',
    description: 'Upgrade to Notion Plus plan with any verified school email. Organize all lecture notes, syllabi, and study schedules in one place.',
    ctaText: 'Get Notion Plus',
    link: 'https://www.notion.so/product/notion-for-education',
    badge: 'ACADEMIC WORKSPACE',
    accentColor: 'bg-indigo-600',
    estRevenue: '$0.06',
  },
  {
    id: 'wolfram-alpha',
    brand: 'Wolfram|Alpha Academic',
    category: 'STEM & Math Engine',
    tagline: 'Step-by-Step Calculus, Physics & Chemistry Solutions',
    description: 'Get deep computational intelligence with guided step-by-step math solver formulas and practice problem generators.',
    ctaText: 'Explore Access',
    link: 'https://www.wolframalpha.com/pro/',
    badge: 'EXAM PREP SPONSOR',
    accentColor: 'bg-rose-500',
    estRevenue: '$0.07',
  },
  {
    id: 'grammarly-edu',
    brand: 'Grammarly Academic',
    category: 'Writing & Citations',
    tagline: 'Instant Grammar, Plagiarism Check & APA/MLA Citations',
    description: 'Polish college essays, lab reports, and dissertations with instant academic tone detection and citation generation.',
    ctaText: 'Try Grammarly',
    link: 'https://www.grammarly.com/edu',
    badge: 'FEATURED SPONSOR',
    accentColor: 'bg-teal-600',
    estRevenue: '$0.05',
  },
];

interface AdModalProps {
  onOpenUpgradeModal?: () => void;
}

export const AdModal: React.FC<AdModalProps> = () => {
  const { isAdModalOpen, adActionName, closeAdModal, onAdCompleted } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  // Pick a random sponsor ad each time modal opens
  useEffect(() => {
    if (isAdModalOpen) {
      setCountdown(5);
      setCanSkip(false);
      setCurrentAdIndex(Math.floor(Math.random() * SPONSOR_ADS.length));
    }
  }, [isAdModalOpen]);

  useEffect(() => {
    if (!isAdModalOpen) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanSkip(true);
    }
  }, [isAdModalOpen, countdown]);

  if (!isAdModalOpen) return null;

  const currentAd = SPONSOR_ADS[currentAdIndex] || SPONSOR_ADS[0];

  const handleContinue = () => {
    onAdCompleted();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in no-print">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-5 relative overflow-hidden">
        
        {/* Top Status Bar */}
        <div className="flex items-center justify-between border-b-2 border-black pb-3">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black uppercase tracking-widest border border-black">
              SPONSORED AD BREAK
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-600 truncate max-w-[200px]">
              {adActionName}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-300 text-slate-800 text-[10px] font-black uppercase">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span>AI Computing</span>
          </div>
        </div>

        {/* Ad Body Card */}
        <div className="rounded-2xl border-2 border-black p-5 bg-[#fafafa] space-y-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-black text-sm border border-black">
                {currentAd.brand[0]}
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-tight text-black">
                  {currentAd.brand}
                </h4>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {currentAd.category}
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[9px] font-black uppercase tracking-wider border border-indigo-300">
              {currentAd.badge}
            </span>
          </div>

          <div>
            <h3 className="text-base font-black text-black uppercase tracking-tight leading-snug">
              {currentAd.tagline}
            </h3>
            <p className="text-xs text-gray-600 font-medium mt-1.5 leading-relaxed">
              {currentAd.description}
            </p>
          </div>

          <a
            href={currentAd.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <span>{currentAd.ctaText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Countdown & Generation Actions */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs font-bold text-gray-600">
            <span>Sponsored by academic partners</span>
            <span className="font-mono font-black text-black">
              {countdown > 0 ? `Ready in ${countdown}s` : 'Ad Finished'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden border border-black">
            <div
              className="h-full bg-indigo-600 transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - countdown) / 5) * 100}%` }}
            />
          </div>

          <button
            onClick={handleContinue}
            disabled={!canSkip}
            className={`w-full py-3.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer border-2 border-black ${
              canSkip
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.01]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canSkip ? (
              <>
                <Play className="w-4 h-4 fill-black" />
                <span>CONTINUE TO GENERATE WITH AI</span>
              </>
            ) : (
              <span>WAITING FOR SPONSOR ({countdown}s)...</span>
            )}
          </button>
        </div>

        <div className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
          Ad revenue supports Gemini AI Study Compute Tokens
        </div>
      </div>
    </div>
  );
};
