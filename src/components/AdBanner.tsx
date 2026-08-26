import React from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

interface AdBannerProps {
  placement?: 'top' | 'sidebar' | 'inline';
  onOpenUpgradeModal?: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement = 'inline' }) => {
  return (
    <div className="no-print w-full bg-[#fdfaf2] border-2 border-black rounded-2xl p-3.5 sm:p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="p-2 rounded-xl bg-amber-400 text-black border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
          </span>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-800 bg-amber-200 px-2 py-0.5 rounded-full border border-amber-400">
                SPONSORED BY GITHUB EDUCATION
              </span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider hidden sm:inline">
                • Student Partner
              </span>
            </div>
            <p className="text-xs sm:text-sm font-black uppercase tracking-tight text-black mt-1">
              GitHub Student Developer Pack & Cloud Credits
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <a
            href="https://education.github.com/pack"
            target="_blank"
            rel="noopener noreferrer"
            className="py-1.5 px-3.5 rounded-full bg-black hover:bg-indigo-600 text-white text-[11px] font-black uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <span>ACCESS STUDENT PACK</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
