import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Sparkles,
  Search,
  Copy,
  Printer,
  Check,
  Loader2,
  BookOpen,
  FileDown,
} from 'lucide-react';
import { CheatSheetData } from '../types';
import { useAuth } from '../context/AuthContext';
import { AdBanner } from './AdBanner';
import { exportCheatSheetToPDF } from '../utils/pdfExport';

interface CheatSheetGemProps {
  isPro: boolean;
  onOpenUpgrade: () => void;
}

export const CheatSheetGem: React.FC<CheatSheetGemProps> = ({ isPro, onOpenUpgrade }) => {
  const { triggerAdProtectedAction } = useAuth();
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Physics & Engineering');
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const [activeSheet, setActiveSheet] = useState<CheatSheetData>({
    id: 'physics-kinematics',
    title: 'University Physics: Kinematics, Dynamics & Energy Laws',
    subject: 'Physics & Engineering',
    createdAt: new Date().toISOString(),
    sections: [
      {
        sectionName: 'Kinematics in 1D & 2D (Constant Acceleration)',
        items: [
          {
            name: 'Velocity-Time Relation',
            formula: 'v_f = v_i + a * t',
            variables: 'v_f = final velocity (m/s), v_i = initial velocity (m/s), a = acceleration (m/s²), t = time (s)',
            whenToUse: 'When displacement is unknown and acceleration is constant.',
          },
          {
            name: 'Position-Time Relation',
            formula: 'Δx = v_i * t + 0.5 * a * t²',
            variables: 'Δx = displacement (m), v_i = initial velocity, a = acceleration, t = time',
            whenToUse: 'When final velocity v_f is unknown.',
          },
          {
            name: 'Timeless Kinematic Equation',
            formula: 'v_f² = v_i² + 2 * a * Δx',
            variables: 'v_f = final velocity, v_i = initial velocity, a = acceleration, Δx = displacement',
            whenToUse: 'When elapsed time t is unknown in the exam problem.',
          },
        ],
      },
      {
        sectionName: 'Newtonian Dynamics & Friction',
        items: [
          {
            name: "Newton's Second Law",
            formula: 'ΣF = m * a',
            variables: 'ΣF = net force vector (N), m = mass (kg), a = acceleration vector (m/s²)',
            whenToUse: 'Always draw Free Body Diagram (FBD) and split into X/Y axis components.',
          },
          {
            name: 'Static & Kinetic Friction',
            formula: 'f_s ≤ μ_s * F_N  and  f_k = μ_k * F_N',
            variables: 'μ_s, μ_k = coefficients of friction, F_N = normal force (N)',
            whenToUse: 'Determining if an object slips on an inclined ramp.',
          },
        ],
      },
      {
        sectionName: 'Work, Energy & Power Theorems',
        items: [
          {
            name: 'Work-Energy Theorem',
            formula: 'W_net = ΔK = 0.5 * m * (v_f² - v_i²)',
            variables: 'W_net = net work done (Joules), ΔK = change in kinetic energy',
            whenToUse: 'Calculating final speed under variable non-conservative forces.',
          },
        ],
      },
      {
        sectionName: 'Top 3 Exam Traps & Unit Pitfalls',
        items: [
          {
            name: 'Degrees vs Radians in Trigonometry',
            formula: 'Mistake: Calculator in Degree mode when solving angular frequency ωt.',
            variables: 'Check calculator mode before starting Physics/Calculus exams!',
            whenToUse: 'Rotational dynamics and SHM oscillations.',
          },
          {
            name: 'Sign Conventions in Free Fall',
            formula: 'If upward is positive: g = -9.8 m/s² and initial upward velocity is positive.',
            variables: 'Keep a consistent coordinate system for the entire problem.',
            whenToUse: 'Projectile motion apex calculations.',
          },
        ],
      },
    ],
  });

  const handleGenerateSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    triggerAdProtectedAction('AI Cheat Sheet Synthesis', async () => {
      setIsGenerating(true);
      try {
        const res = await fetch('/api/gemini/cheat-sheet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic, subject }),
        });
        const result = await res.json();
        if (result.success && result.data) {
          setActiveSheet({
            id: `sheet-${Date.now()}`,
            title: result.data.title || topic,
            subject: result.data.subject || subject,
            sections: result.data.sections || [],
            createdAt: new Date().toISOString(),
          });
        }
      } catch {
        alert('Failed to generate cheat sheet. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    });
  };

  const handleCopyFormula = (formula: string, id: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredSections = activeSheet.sections.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.variables.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((s) => s.items.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Formula & High-Yield Cheat Sheet Builder
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Condensed, exam-ready formula sheets, crucial theorems, mnemonics, and common trap warnings.
          </p>
        </div>

        <div className="no-print flex items-center gap-2">
          <button
            onClick={() => exportCheatSheetToPDF(activeSheet, isPro)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Download Cheat Sheet as PDF"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Generator Box */}
      <div className="no-print bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Generate New Cheat Sheet</span>
        </h3>

        <form onSubmit={handleGenerateSheet} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Subject Topic (e.g. AP Calculus Derivatives, Organic Chemistry Reactions, Microeconomics)"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 focus:border-indigo-500 outline-hidden"
            />
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-slate-50 outline-hidden"
            >
              <option value="Physics & Engineering">Physics</option>
              <option value="Mathematics & Calculus">Mathematics</option>
              <option value="Chemistry & Organic Chem">Chemistry</option>
              <option value="Biology & Physiology">Biology</option>
              <option value="Computer Science & Data Structures">Computer Science</option>
              <option value="Economics & Finance">Economics</option>
            </select>
            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Build Cheat Sheet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sponsor Ad Banner for Free Tier */}
      <AdBanner onOpenUpgradeModal={onOpenUpgrade} />

      {/* Main Sheet Display */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 print-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              {activeSheet.subject}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{activeSheet.title}</h2>
          </div>

          <div className="no-print relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equations, terms..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:border-indigo-500 outline-hidden"
            />
          </div>
        </div>

        {/* Section Groups */}
        <div className="space-y-6">
          {filteredSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-l-3 border-indigo-600 pl-2.5">
                {section.sectionName}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.items.map((item, itemIdx) => {
                  const itemKey = `${sIdx}-${itemIdx}`;
                  const isCopied = copiedIndex === itemKey;
                  return (
                    <div
                      key={itemIdx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 space-y-2 relative transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                        <button
                          onClick={() => handleCopyFormula(item.formula, itemKey)}
                          className="no-print opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition-opacity"
                          title="Copy Equation"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      {/* Formula display */}
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-bold text-indigo-950 overflow-x-auto">
                        {item.formula}
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1">
                        <p>
                          <strong className="text-slate-700">Variables:</strong> {item.variables}
                        </p>
                        {item.whenToUse && (
                          <p className="text-indigo-700">
                            <strong>Exam Trigger:</strong> {item.whenToUse}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
