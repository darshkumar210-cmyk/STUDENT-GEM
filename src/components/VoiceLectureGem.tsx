import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  RotateCw,
  Copy,
  Download,
  Check,
  Loader2,
  FileText,
  Radio,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { AdBanner } from './AdBanner';

interface VoiceLectureGemProps {
  onSendToYouTubeSuite?: (transcript: string, title: string) => void;
  isPro: boolean;
  onOpenUpgrade: () => void;
}

export const VoiceLectureGem: React.FC<VoiceLectureGemProps> = ({
  onSendToYouTubeSuite,
  isPro,
  onOpenUpgrade,
}) => {
  const { triggerAdProtectedAction } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [lectureTitle, setLectureTitle] = useState('In-Class Physics / Biology Lecture');
  const [transcript, setTranscript] = useState(
    'Today we are discussing mitochondrial bioenergetics and the electron transport chain. Remember that Complex I oxidizes NADH while Complex II accepts electrons from succinate through FADH2. The proton gradient established across the inner mitochondrial membrane drives ATP synthase, generating approximately 30 to 32 ATP per molecule of glucose.'
  );
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript + ' ';
        }
        setTranscript(current);
      };

      recognition.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. You can still paste or type text directly!');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch {
        // Already started or busy
      }
    }
  };

  const handleSynthesizeNotes = async () => {
    if (!transcript.trim()) return;

    triggerAdProtectedAction('Live Lecture Note Synthesis', async () => {
      setIsSummarizing(true);
      try {
        const res = await fetch('/api/gemini/youtube-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoTitle: lectureTitle,
            rawTranscript: transcript,
            subject: 'Classroom Lecture',
            targetLevel: 'University',
          }),
        });
        const data = await res.json();
        if (data.success && data.data?.cornellNotes) {
          setSummaryResult(
            `# ${data.data.title}\n\n## Executive Summary\n${data.data.executiveSummary}\n\n## Key Takeaways\n${data.data.keyTakeaways.map((t: string) => `- ${t}`).join('\n')}\n\n## Cornell Notes\n${data.data.cornellNotes.detailedNotes}\n\n### Synthesis\n${data.data.cornellNotes.bottomSummary}`
          );
        }
      } catch {
        alert('Failed to synthesize notes. Please try again.');
      } finally {
        setIsSummarizing(false);
      }
    });
  };

  const handleCopy = () => {
    if (!summaryResult) return;
    navigator.clipboard.writeText(summaryResult);
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
              <Mic className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Live Classroom Voice Transcriber & Note Taker
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Record in-person lectures or audio recordings in real time and automatically turn them into Cornell study notes.
          </p>
        </div>

        {/* Live status badge */}
        {isRecording && (
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold animate-pulse">
            <Radio className="w-4 h-4 text-rose-600" />
            <span>Listening to Live Lecture...</span>
          </div>
        )}
      </div>

      {/* Sponsor Ad Banner for Free Tier */}
      <AdBanner onOpenUpgradeModal={onOpenUpgrade} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recording controls & Live Transcript text */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={lectureTitle}
                onChange={(e) => setLectureTitle(e.target.value)}
                placeholder="Lecture Name (e.g. ECON 101 Lecture 4)"
                className="font-bold text-slate-900 text-sm bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-hidden pb-1 flex-1 mr-2"
              />

              {/* Record Button */}
              <button
                onClick={handleToggleRecording}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isRecording ? 'Stop Recording' : 'Start Mic Recording'}</span>
              </button>
            </div>

            {/* Transcript Textarea */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Live Speech Transcript (Editable)
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Speak into microphone or paste lecture audio text here..."
                rows={10}
                className="w-full p-4 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50/70 focus:border-indigo-500 outline-hidden font-mono leading-relaxed"
              />
            </div>

            <button
              onClick={handleSynthesizeNotes}
              disabled={isSummarizing || !transcript.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSummarizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Cornell Notes with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Convert Transcript to Cornell Notes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Cornell Notes Output */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 min-h-[460px] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Synthesized Study Notes</span>
              </h3>

              {summaryResult && (
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {summaryResult ? (
              <div className="prose prose-slate prose-sm max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed overflow-y-auto max-h-[400px]">
                <Markdown>{summaryResult}</Markdown>
              </div>
            ) : (
              <div className="my-auto text-center p-8 text-slate-400 space-y-2">
                <Mic className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">
                  Record live lecture speech or paste text on the left, then click "Convert Transcript to Cornell Notes".
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
