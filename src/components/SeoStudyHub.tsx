import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Sparkles,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { SEO_STUDY_ARTICLES, FREQUENT_QUESTIONS } from '../data/sampleStudyData';
import { SEOArticle } from '../types';

interface SeoStudyHubProps {
  onSelectGem: (gemId: string) => void;
}

export const SeoStudyHub: React.FC<SeoStudyHubProps> = ({ onSelectGem }) => {
  const [selectedArticle, setSelectedArticle] = useState<SEOArticle>(SEO_STUDY_ARTICLES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredArticles = SEO_STUDY_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* SEO Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-md">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Yield Study Science & SEO Learning Library</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Master Cognitive Science: Feynman Technique, Active Recall & Spaced Repetition
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Evidence-based study guides designed to double retention in half the study time. Turn passive YouTube watching and lecture slides into permanent long-term memory.
          </p>
        </div>
      </div>

      {/* Main Grid: Articles + Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Article List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search study guides, methods..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:border-indigo-500 outline-hidden"
              />
            </div>

            <div className="space-y-2">
              {filteredArticles.map((article) => {
                const isSelected = selectedArticle.id === article.id;
                return (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
                      <span className="text-indigo-600">{article.category}</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{article.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1">{article.excerpt}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Full Article Reader */}
        <div className="lg:col-span-7 space-y-6">
          <article className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold">
                  {selectedArticle.category}
                </span>
                <span>•</span>
                <span>{selectedArticle.readTime}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">{selectedArticle.title}</h2>
            </div>

            <div className="prose prose-slate prose-sm max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 italic text-slate-600">
                "{selectedArticle.excerpt}"
              </div>

              <div
                className="space-y-4"
                dangerouslySetInnerHTML={{
                  __html: selectedArticle.content
                    .replace(/\n\n/g, '<p class="my-3 leading-relaxed"></p>')
                    .replace(/### (.*)/g, '<h3 class="text-base font-bold text-slate-900 mt-4 mb-1">$1</h3>')
                    .replace(/## (.*)/g, '<h2 class="text-lg font-bold text-slate-900 mt-6 mb-2">$1</h2>')
                    .replace(/- \*\*(.*?)\*\*/g, '• <strong>$1</strong>'),
                }}
              />
            </div>

            {/* In-article CTA to study tool */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-indigo-950">Ready to put this science into practice?</h4>
                <p className="text-xs text-indigo-700 mt-0.5">Use our automated AI study tools to summarize your next lecture.</p>
              </div>
              <button
                onClick={() => onSelectGem('youtube-notes')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs"
              >
                Launch YouTube Gem →
              </button>
            </div>
          </article>
        </div>
      </div>

      {/* SEO FAQ Accordion with Schema JSON-LD compatibility */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Everything you need to know about StudyGem AI algorithms, Cornell synthesis, and study workflows.
          </p>
        </div>

        <div className="space-y-3">
          {FREQUENT_QUESTIONS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-slate-900 bg-slate-50/50 hover:bg-slate-50"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
