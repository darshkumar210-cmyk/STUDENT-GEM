import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  FileText,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Printer,
  Sparkles,
  Award,
  ChevronRight,
  BrainCircuit,
  Share2,
  Edit3,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Clock,
  Loader2,
} from 'lucide-react';
import { CornellNotes } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface CornellNotesViewProps {
  cornellNotes: CornellNotes;
  subject?: string;
  title?: string;
  onPrint?: () => void;
  onUpdateCornellNotes?: (updated: CornellNotes) => void;
  autoSaveStatus?: 'idle' | 'saving' | 'saved';
  lastSavedTime?: string | null;
}

export const CornellNotesView: React.FC<CornellNotesViewProps> = ({
  cornellNotes,
  subject = 'Academic Lecture',
  title = 'Cornell Study Notes',
  onPrint,
  onUpdateCornellNotes,
  autoSaveStatus = 'idle',
  lastSavedTime = null,
}) => {
  const [activeRecallMode, setActiveRecallMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [revealedSections, setRevealedSections] = useState<Set<number>>(new Set());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeCueIndex, setActiveCueIndex] = useState<number | null>(null);

  const cues = cornellNotes?.cuesAndQuestions || [];
  const detailedNotes = cornellNotes?.detailedNotes || '';
  const bottomSummary = cornellNotes?.bottomSummary || '';

  const handleUpdateDetailedNotes = (newText: string) => {
    if (onUpdateCornellNotes) {
      onUpdateCornellNotes({
        ...cornellNotes,
        detailedNotes: newText,
      });
    }
  };

  const handleUpdateSummary = (newSummary: string) => {
    if (onUpdateCornellNotes) {
      onUpdateCornellNotes({
        ...cornellNotes,
        bottomSummary: newSummary,
      });
    }
  };

  const handleUpdateCue = (index: number, newCueText: string) => {
    if (onUpdateCornellNotes) {
      const updatedCues = [...cues];
      updatedCues[index] = newCueText;
      onUpdateCornellNotes({
        ...cornellNotes,
        cuesAndQuestions: updatedCues,
      });
    }
  };

  const handleAddCue = () => {
    if (onUpdateCornellNotes) {
      const updatedCues = [...cues, 'New study prompt / recall question'];
      onUpdateCornellNotes({
        ...cornellNotes,
        cuesAndQuestions: updatedCues,
      });
    }
  };

  const handleDeleteCue = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateCornellNotes) {
      const updatedCues = cues.filter((_, i) => i !== index);
      onUpdateCornellNotes({
        ...cornellNotes,
        cuesAndQuestions: updatedCues,
      });
    }
  };

  const handleToggleReveal = (index: number) => {
    setRevealedSections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleCopyAll = () => {
    const text = `# ${title}\nSubject: ${subject}\n\n## Cornell Recall Cues\n${cues.map((c, i) => `${i + 1}. ${c}`).join('\n')}\n\n## Detailed Lecture Notes\n${detailedNotes}\n\n## Summary\n${bottomSummary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeakSummary = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this device.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(bottomSummary || 'No summary available.');
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6 print-card">
      {/* Top Controls & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-black">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-xl bg-indigo-600 text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Cornell Method
              </span>
              <span className="text-xs font-bold text-gray-400">•</span>
              <span className="text-xs font-black uppercase text-gray-500">{subject}</span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-slate-900">
                Structured Lecture Notebook
              </h3>
              {/* Auto-Save indicator */}
              {autoSaveStatus === 'saving' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Auto-saving draft...</span>
                </span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Auto-saved to localStorage {lastSavedTime ? `(${lastSavedTime})` : ''}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          {/* Edit / Done Toggle */}
          {onUpdateCornellNotes && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                isEditing
                  ? 'bg-emerald-500 border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-white border-black text-slate-800 hover:bg-slate-50'
              }`}
              title={isEditing ? 'Finish editing and preview note formatting' : 'Edit notes text, cues, and conclusions'}
            >
              {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5 text-indigo-600" />}
              <span>{isEditing ? 'Done Editing' : 'Edit Notes'}</span>
            </button>
          )}

          {/* Active Recall Mode Toggle */}
          <button
            onClick={() => {
              setActiveRecallMode(!activeRecallMode);
              if (isEditing) setIsEditing(false);
            }}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
              activeRecallMode
                ? 'bg-amber-400 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                : 'bg-white border-black text-slate-700 hover:bg-slate-50'
            }`}
            title="Hide notes to test your memory using only cue questions"
          >
            {activeRecallMode ? <EyeOff className="w-3.5 h-3.5 text-black" /> : <Eye className="w-3.5 h-3.5 text-indigo-600" />}
            <span>{activeRecallMode ? 'Recall Mode: ON' : 'Test Recall'}</span>
          </button>

          {/* Audio Read Summary */}
          <button
            onClick={handleSpeakSummary}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-black transition-all cursor-pointer ${
              isSpeaking ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-800 hover:bg-slate-100'
            }`}
            title="Read summary aloud"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-white" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyAll}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-full border border-black bg-white hover:bg-slate-50 text-slate-800 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            title="Copy all notes"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {onPrint && (
            <button
              onClick={onPrint}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-black hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              title="Print Cornell notes"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          )}
        </div>
      </div>

      {/* Editing Mode Banner */}
      {isEditing && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 border-2 border-indigo-500 text-indigo-950 flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Live Note Editor:</strong> Type anywhere to customize notes or questions. Changes auto-save continuously to your browser localStorage.
            </span>
          </div>
          <button
            onClick={() => setIsEditing(false)}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-black uppercase cursor-pointer"
          >
            Preview Render
          </button>
        </div>
      )}

      {/* Active Recall Instruction Banner */}
      {activeRecallMode && !isEditing && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-center justify-between gap-3 text-xs font-bold shadow-xs">
          <div className="flex items-center space-x-2">
            <BrainCircuit className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <p className="font-black uppercase tracking-wide">Active Recall Practice Activated!</p>
              <p className="text-[11px] text-amber-800 font-medium mt-0.5">
                Look at each recall cue question on the left and try to state the answer in your head before revealing the notes.
              </p>
            </div>
          </div>
          <button
            onClick={() => setRevealedSections(new Set(cues.map((_, i) => i)))}
            className="px-3 py-1 bg-amber-400 hover:bg-amber-500 rounded-lg text-black text-[11px] font-black uppercase whitespace-nowrap cursor-pointer"
          >
            Reveal All
          </button>
        </div>
      )}

      {/* Cornell 2-Column Notebook Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Cue Column (Recall Triggers, Study Questions & Keywords) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#f4f5ff] p-5 rounded-3xl border-2 border-indigo-600 shadow-[4px_4px_0px_0px_rgba(79,70,229,1)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-black text-indigo-900 uppercase tracking-wider">
                  Recall Cues ({cues.length})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {isEditing && (
                  <button
                    onClick={handleAddCue}
                    className="flex items-center space-x-1 text-[10px] font-black uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-md hover:bg-indigo-700 cursor-pointer"
                    title="Add a new recall prompt"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                )}
                <span className="text-[10px] font-black uppercase text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                  Cue Column
                </span>
              </div>
            </div>

            <p className="text-[11px] text-indigo-700 font-semibold leading-relaxed">
              {isEditing ? 'Customize question prompts to match your syllabus:' : 'Formulated by AI to trigger rapid recall during exam revision:'}
            </p>

            <div className="space-y-3">
              {cues.map((cue, idx) => {
                const isRevealed = revealedSections.has(idx);
                const isSelected = activeCueIndex === idx;

                if (isEditing) {
                  return (
                    <div key={idx} className="p-3 bg-white rounded-2xl border-2 border-indigo-300 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-black text-[9px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <button
                          onClick={(e) => handleDeleteCue(idx, e)}
                          className="text-gray-400 hover:text-red-600 p-0.5 cursor-pointer"
                          title="Delete cue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        value={cue}
                        onChange={(e) => handleUpdateCue(idx, e.target.value)}
                        rows={2}
                        className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-lg p-2 focus:border-indigo-600 outline-hidden resize-none"
                      />
                    </div>
                  );
                }

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveCueIndex(idx);
                      if (activeRecallMode) handleToggleReveal(idx);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] scale-[1.02]'
                        : 'bg-white border-indigo-200 hover:border-indigo-500 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs font-black text-slate-900 leading-snug flex-1">
                        {cue}
                      </p>
                    </div>

                    {activeRecallMode && (
                      <div className="mt-2.5 pt-2 border-t border-indigo-100 flex items-center justify-between text-[10px] font-bold text-indigo-600">
                        <span>{isRevealed ? 'Notes Revealed' : 'Click to Reveal Answer'}</span>
                        <ChevronRight className={`w-3.5 h-3.5 transform transition-transform ${isRevealed ? 'rotate-90' : ''}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Lecture & Notes Area */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#fafbff] p-6 sm:p-7 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-black" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  {isEditing ? 'Edit Lecture Notes (Markdown Supported)' : 'Detailed Notes & Formulations'}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase text-gray-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                {isEditing ? 'Editing Mode' : 'Notes Column'}
              </span>
            </div>

            {/* Editing Textarea vs Markdown Rendering */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={detailedNotes}
                  onChange={(e) => handleUpdateDetailedNotes(e.target.value)}
                  rows={14}
                  placeholder="Type your lecture notes, equations, bullet points, or markdown formatting here..."
                  className="w-full text-xs sm:text-sm font-mono text-slate-900 bg-white p-4 rounded-2xl border-2 border-indigo-300 focus:border-indigo-600 outline-hidden leading-relaxed resize-y"
                />
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-bold px-1">
                  <span>Supports **bold**, # headings, bullet points (-), and equations.</span>
                  <span>{detailedNotes.length} characters</span>
                </div>
              </div>
            ) : (
              <div
                className={`transition-all duration-300 ${
                  activeRecallMode && activeCueIndex !== null && !revealedSections.has(activeCueIndex)
                    ? 'filter blur-md select-none opacity-40'
                    : ''
                }`}
              >
                <MarkdownRenderer content={detailedNotes} />
              </div>
            )}

            {/* Overlay if blurred in recall mode */}
            {activeRecallMode && !isEditing && activeCueIndex !== null && !revealedSections.has(activeCueIndex) && (
              <div
                onClick={() => handleToggleReveal(activeCueIndex)}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-xs rounded-3xl cursor-pointer p-6 text-center"
              >
                <div className="p-3 rounded-full bg-amber-400 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-2">
                  <Eye className="w-6 h-6 text-black" />
                </div>
                <h4 className="text-sm font-black uppercase text-slate-900">Click to Reveal Answer for Cue #{activeCueIndex + 1}</h4>
                <p className="text-xs text-slate-600 font-semibold max-w-sm mt-1">
                  Test your self-explanation first before checking the note text.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar (The Cornell Synthesis Section) */}
      <div className="p-6 rounded-3xl bg-black text-white space-y-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(79,70,229,1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest">
              SUMMARY COLUMN
            </span>
            <span className="text-xs font-black uppercase text-indigo-300 tracking-wider">
              Lecture Synthesis for Rapid Review
            </span>
          </div>
          <button
            onClick={handleSpeakSummary}
            className="flex items-center space-x-1 text-xs font-black text-indigo-400 hover:text-white uppercase tracking-wider cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
          </button>
        </div>

        {isEditing ? (
          <textarea
            value={bottomSummary}
            onChange={(e) => handleUpdateSummary(e.target.value)}
            rows={3}
            placeholder="Summarize the core essence of this lecture in 2-3 high yield sentences..."
            className="w-full text-xs sm:text-sm text-slate-100 bg-neutral-900 p-3.5 rounded-xl border border-neutral-700 focus:border-indigo-400 outline-hidden leading-relaxed resize-y font-bold"
          />
        ) : (
          <p className="text-xs sm:text-sm text-slate-200 font-bold leading-relaxed">
            {bottomSummary}
          </p>
        )}
      </div>
    </div>
  );
};

