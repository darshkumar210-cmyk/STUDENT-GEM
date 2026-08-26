import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  Copy,
  Download,
  Check,
  Loader2,
  BookOpen,
  Quote,
} from 'lucide-react';
import { EssayOutlineData } from '../types';
import { useAuth } from '../context/AuthContext';
import { AdBanner } from './AdBanner';

interface EssayHelperGemProps {
  isPro: boolean;
  onOpenUpgrade: () => void;
}

export const EssayHelperGem: React.FC<EssayHelperGemProps> = ({ isPro, onOpenUpgrade }) => {
  const { triggerAdProtectedAction } = useAuth();
  const [promptInput, setPromptInput] = useState('');
  const [paperType, setPaperType] = useState('Argumentative Essay');
  const [targetWords, setTargetWords] = useState('1500 words');
  const [citationStyle, setCitationStyle] = useState('APA 7th Edition');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [activeOutline, setActiveOutline] = useState<EssayOutlineData>({
    id: 'demo-essay',
    paperTitle: 'Algorithmic Cognition: The Impact of Generative AI on University Pedagogy and Critical Thinking',
    thesisStatement:
      'Although generative artificial intelligence presents acute risks of academic dishonesty, universities should integrate AI as a mandatory pedagogical tool because structured AI interaction fosters higher-order metacognitive critique, personalized diagnostic feedback, and workforce-aligned digital literacy.',
    counterArgument:
      'Critics argue that automated text and code generation atrophy students’ fundamental reasoning and writing skills. However, when assignments pivot from rote recall to comparative critique and iterative prompt refinement, students demonstrate deeper analytical synthesis.',
    introduction: {
      hook: 'In the spring of 2023, universities worldwide scrambled to ban automated language models, echoing 1970s anxieties over classroom pocket calculators.',
      background: 'The rapid proliferation of Large Language Models has fundamentally disrupted traditional take-home essays and standardized assessment models in higher education.',
      thesisPlacement: 'Transition from historical technology panic to defensible pedagogical integration thesis.',
    },
    bodyParagraphs: [
      {
        paragraphNumber: 1,
        topicSentence: 'Traditional essay assessments often reward formulaic syntax over genuine metacognitive insight, making them vulnerable to superficial AI duplication.',
        evidenceSuggestions: [
          'Bloom’s Taxonomy revision studies (Anderson & Krathwohl, 2001)',
          'Empirical data on take-home essay grading variance across humanities courses',
        ],
        analysisGuidance: 'Explain why legacy recall assignments fail to engage deep learning, creating an artificial incentive for automated shortcuts.',
        transition: 'Recognizing this structural weakness allows educators to re-engineer assignments toward active Socratic dialogue.',
      },
      {
        paragraphNumber: 2,
        topicSentence: 'Interactive AI coaching provides real-time, low-stakes diagnostic feedback that traditional lecture halls cannot scale.',
        evidenceSuggestions: [
          'Benjamin Bloom’s "Two Sigma Problem" on 1-on-1 mastery tutoring',
          'Recent Stanford HCI studies on AI-guided writing revisions',
        ],
        analysisGuidance: 'Demonstrate how iterative prompt refinement acts as a modern Socratic interlocutor for students working late at night.',
        transition: 'Beyond individual tutoring, AI fluency represents a vital baseline for 21st-century professional scholarship.',
      },
    ],
    conclusion: {
      restatedThesis: 'Rather than eroding intellectual rigor, mandatory and transparent AI curriculum integration elevates academic standards by centering synthesis and critical judgment over passive memorization.',
      synthesis: 'By shifting focus from policing inputs to cultivating evaluative output analysis, universities fulfill their core mission of preparing adaptable scholars.',
      finalTakeaway: 'The future of higher education belongs not to institutions that build digital walls, but to those that teach students to master the tools reshaping human thought.',
    },
    recommendedSources: [
      {
        title: 'Bloom, B. S. (1984). The 2 Sigma Problem: The Search for Methods of Group Instruction as Effective as One-to-One Tutoring.',
        type: 'Foundational Educational Research',
        sampleCitation: 'Bloom, B. S. (1984). The 2 sigma problem. Educational Researcher, 13(6), 4–16.',
      },
      {
        title: 'Mollick, E. R., & Mollick, L. (2023). Assigning AI: Seven Approaches for Students with Prompts.',
        type: 'Wharton School Pedagogical Working Paper',
        sampleCitation: 'Mollick, E. R., & Mollick, L. (2023). Assigning AI. SSRN Electronic Journal.',
      },
    ],
    createdAt: new Date().toISOString(),
  });

  const handleGenerateOutline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    triggerAdProtectedAction('AI Essay Outline Generation', async () => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/gemini/essay-helper', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            essayPrompt: promptInput,
            paperType,
            wordCountTarget: targetWords,
            citationStyle,
          }),
        });
        const result = await res.json();
        if (result.success && result.data) {
          setActiveOutline({
            id: `essay-${Date.now()}`,
            paperTitle: result.data.paperTitle || promptInput,
            thesisStatement: result.data.thesisStatement || '',
            counterArgument: result.data.counterArgument || '',
            introduction: result.data.introduction || { hook: '', background: '', thesisPlacement: '' },
            bodyParagraphs: result.data.bodyParagraphs || [],
            conclusion: result.data.conclusion || { restatedThesis: '', synthesis: '', finalTakeaway: '' },
            recommendedSources: result.data.recommendedSources || [],
            createdAt: new Date().toISOString(),
          });
        }
      } catch {
        alert('Failed to generate outline. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    });
  };

  const handleCopyOutline = () => {
    const text = `# ${activeOutline.paperTitle}\n\n## Thesis Statement\n${activeOutline.thesisStatement}\n\n## Counter-Argument Refutation\n${activeOutline.counterArgument}\n\n## Introduction Blueprint\n- **Hook:** ${activeOutline.introduction.hook}\n- **Context:** ${activeOutline.introduction.background}\n\n## Body Paragraphs\n${activeOutline.bodyParagraphs
      .map(
        (p) =>
          `### Paragraph ${p.paragraphNumber}: ${p.topicSentence}\n- **Evidence to Cite:** ${p.evidenceSuggestions.join(
            ', '
          )}\n- **Analysis Strategy:** ${p.analysisGuidance}\n- **Transition:** ${p.transition}`
      )
      .join('\n\n')}\n\n## Conclusion\n- **Restated Thesis:** ${activeOutline.conclusion.restatedThesis}\n- **Final Takeaway:** ${activeOutline.conclusion.finalTakeaway}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <PenTool className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Academic Essay & Assignment Blueprint Assistant
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Craft defensible thesis statements, paragraph-by-paragraph arguments, counter-argument refutations, and APA/MLA citations.
          </p>
        </div>

        <button
          onClick={handleCopyOutline}
          className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
          <span>{copied ? 'Copied Outline!' : 'Copy Full Blueprint'}</span>
        </button>
      </div>

      {/* Generator Box */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Generate Essay Structure</span>
        </h3>

        <form onSubmit={handleGenerateOutline} className="space-y-3">
          <textarea
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Paste your professor's essay prompt or term paper topic (e.g. Discuss the social and economic consequences of the Industrial Revolution on European urbanization)..."
            rows={3}
            className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:border-indigo-500 outline-hidden"
          />

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={paperType}
              onChange={(e) => setPaperType(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 outline-hidden"
            >
              <option value="Argumentative Essay">Argumentative Essay</option>
              <option value="Research Paper / Literature Review">Research Paper</option>
              <option value="Compare & Contrast Analysis">Compare & Contrast</option>
              <option value="Analytical Explication">Analytical Explication</option>
            </select>

            <select
              value={targetWords}
              onChange={(e) => setTargetWords(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 outline-hidden"
            >
              <option value="750 words (3-4 pages)">750 Words (Short)</option>
              <option value="1500 words (5-6 pages)">1500 Words (Standard)</option>
              <option value="3000 words (10-12 pages)">3000 Words (Term Paper)</option>
            </select>

            <select
              value={citationStyle}
              onChange={(e) => setCitationStyle(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-slate-50 outline-hidden"
            >
              <option value="APA 7th Edition">APA 7th</option>
              <option value="MLA 9th Edition">MLA 9th</option>
              <option value="Chicago Notes & Bib">Chicago / Turabian</option>
              <option value="Harvard Referencing">Harvard</option>
            </select>

            <button
              type="submit"
              disabled={isGenerating || !promptInput.trim()}
              className="ml-auto px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center space-x-1.5 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Outlining Paper...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Blueprint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sponsor Ad Banner for Free Tier */}
      <AdBanner onOpenUpgradeModal={onOpenUpgrade} />

      {/* Main Blueprint Display */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Academic Blueprint
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{activeOutline.paperTitle}</h2>
        </div>

        {/* Thesis Statement Spotlight Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white space-y-2 shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Quote className="w-4 h-4" />
            <span>Master Thesis Statement</span>
          </div>
          <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed">
            "{activeOutline.thesisStatement}"
          </p>
        </div>

        {/* Counterargument Refutation */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 text-xs sm:text-sm text-slate-800">
          <span className="font-bold uppercase tracking-wider text-amber-900 text-[11px]">
            Counter-Argument & Rebuttal:
          </span>
          <p className="text-slate-700">{activeOutline.counterArgument}</p>
        </div>

        {/* Paragraph by Paragraph Roadmap */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Body Paragraph Blueprint & Evidence Strategy
          </h3>

          <div className="space-y-4">
            {activeOutline.bodyParagraphs.map((p, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-xs">
                    Paragraph {p.paragraphNumber}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{p.topicSentence}</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700">Evidence / Sources to Cite:</span>
                    <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                      {p.evidenceSuggestions.map((ev, eIdx) => (
                        <li key={eIdx}>{ev}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-700">Analysis & Thesis Link:</span>
                    <p className="text-slate-600">{p.analysisGuidance}</p>
                  </div>
                </div>

                {p.transition && (
                  <p className="text-[11px] text-indigo-700 italic">
                    <strong>Transition:</strong> {p.transition}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Conclusion Strategy */}
        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-2 text-xs sm:text-sm">
          <span className="font-bold uppercase tracking-wider text-slate-800 text-[11px]">
            Conclusion & Final Takeaway
          </span>
          <p className="text-slate-700">
            <strong className="text-slate-900">Restated Claim:</strong> {activeOutline.conclusion.restatedThesis}
          </p>
          <p className="text-slate-600">{activeOutline.conclusion.finalTakeaway}</p>
        </div>
      </div>
    </div>
  );
};
