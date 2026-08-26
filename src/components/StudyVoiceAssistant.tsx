import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  X,
  CheckCircle2,
  AlertCircle,
  Compass,
  Headphones,
} from 'lucide-react';
import { GemType } from '../types';

interface StudyVoiceAssistantProps {
  activeGem: GemType;
  setActiveGem: (gem: GemType) => void;
  onOpenUpgrade?: () => void;
  onOpenCommandPalette?: () => void;
  onStartPomodoro?: () => void;
}

export const StudyVoiceAssistant: React.FC<StudyVoiceAssistantProps> = ({
  activeGem,
  setActiveGem,
  onOpenCommandPalette,
  onStartPomodoro,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<string>('Listening for commands... Try "Open Flashcards" or "Start Pomodoro"');
  const [feedbackType, setFeedbackType] = useState<'info' | 'success' | 'warning'>('info');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [voiceVolumeLevel, setVoiceVolumeLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(typeof window !== 'undefined' ? window.speechSynthesis : null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          setVoiceVolumeLevel(Math.min(100, currentTranscript.length * 10));

          // If final result
          if (event.results[event.results.length - 1].isFinal) {
            handleVoiceCommand(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          if (event.error !== 'no-speech') {
            setFeedbackType('warning');
            setFeedback(`Microphone notice: ${event.error}. Click mic to retry.`);
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setVoiceVolumeLevel(0);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const speakText = (text: string) => {
    if (!audioEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synthRef.current.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setFeedbackType('warning');
      setFeedback('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      setIsOpen(true);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setIsOpen(true);
        setFeedbackType('info');
        setFeedback('Listening... Speak a study command');
        setTranscript('');
      } catch (e) {
        console.warn('Recognition start exception:', e);
      }
    }
  };

  const handleVoiceCommand = async (commandText: string) => {
    const text = commandText.toLowerCase().trim();

    // 1. YouTube & Lecture Notes
    if (text.includes('youtube') || text.includes('video note') || text.includes('lecture note') || text.includes('cornell')) {
      setActiveGem('youtube');
      setFeedbackType('success');
      setFeedback('Switching to YouTube Lecture to Cornell Notes Gem');
      speakText('Switching to YouTube Lecture Notes');
      return;
    }

    // 2. Voice Lecture Recording
    if (text.includes('voice lecture') || text.includes('record lecture') || text.includes('live lecture') || text.includes('transcribe')) {
      setActiveGem('voice');
      setFeedbackType('success');
      setFeedback('Opened Live Classroom Voice Transcriber');
      speakText('Opening Live Classroom Voice Transcriber');
      return;
    }

    // 3. Flashcards
    if (text.includes('flashcard') || text.includes('flash cards') || text.includes('deck') || text.includes('active recall')) {
      setActiveGem('flashcards');
      setFeedbackType('success');
      setFeedback('Opened Smart Active Recall Flashcards');
      speakText('Opening Active Recall Flashcards');
      return;
    }

    // 4. Practice Quiz / Exam
    if (text.includes('quiz') || text.includes('test') || text.includes('mock exam') || text.includes('practice exam')) {
      setActiveGem('quiz');
      setFeedbackType('success');
      setFeedback('Switched to AI Practice Exam & Timed Quiz');
      speakText('Opening Practice Exam Quiz mode');
      return;
    }

    // 5. Cheat Sheet / Formulas
    if (text.includes('cheat sheet') || text.includes('formula') || text.includes('equation') || text.includes('mnemonics')) {
      setActiveGem('cheatsheet');
      setFeedbackType('success');
      setFeedback('Opened Exam Formula & Concept Cheat Sheet');
      speakText('Opening Exam Formula Cheat Sheet');
      return;
    }

    // 6. Study Planner & Schedule
    if (text.includes('planner') || text.includes('schedule') || text.includes('timetable') || text.includes('spaced repetition')) {
      setActiveGem('planner');
      setFeedbackType('success');
      setFeedback('Opened Spaced-Repetition Study Schedule Planner');
      speakText('Opening your Study Schedule Planner');
      return;
    }

    // 7. Essay & Paper Helper
    if (text.includes('essay') || text.includes('paper') || text.includes('thesis') || text.includes('outline')) {
      setActiveGem('essay');
      setFeedbackType('success');
      setFeedback('Opened Academic Essay & Assignment Outline Assistant');
      speakText('Opening Essay Blueprint Assistant');
      return;
    }

    // 8. Focus Room / Pomodoro
    if (text.includes('pomodoro') || text.includes('focus') || text.includes('timer') || text.includes('lofi') || text.includes('deep work')) {
      setActiveGem('focus');
      if (onStartPomodoro) {
        onStartPomodoro();
      }
      setFeedbackType('success');
      setFeedback('Focus Room activated! Pomodoro timer is ready.');
      speakText('Focus Room activated. Starting your deep study session.');
      return;
    }

    // 9. Study Hub & SEO Guides
    if (text.includes('study hub') || text.includes('guide') || text.includes('browse') || text.includes('curated')) {
      setActiveGem('seoguides');
      setFeedbackType('success');
      setFeedback('Opened Curated Academic Study Hub & Cheat Sheets');
      speakText('Opening Academic Study Hub');
      return;
    }

    // 10. Access Information
    if (text.includes('pro') || text.includes('upgrade') || text.includes('pricing') || text.includes('subscription') || text.includes('cost') || text.includes('free')) {
      setFeedbackType('success');
      setFeedback('StudyGem AI provides complete access across all tools!');
      speakText('All study tools and note synthesizers are accessible!');
      return;
    }

    // 11. Command Palette / Search
    if (text.includes('search') || text.includes('command') || text.includes('palette') || text.includes('quick switch')) {
      if (onOpenCommandPalette) onOpenCommandPalette();
      setFeedbackType('success');
      setFeedback('Opening Universal Quick Command Palette');
      speakText('Opening Command Palette');
      return;
    }

    // 12. General AI Tutor Question (Voice Q&A)
    if (text.startsWith('ask') || text.startsWith('explain') || text.startsWith('what is') || text.startsWith('how to') || text.startsWith('tell me')) {
      setFeedbackType('info');
      setFeedback(`Asking AI Tutor: "${commandText}"...`);
      try {
        const res = await fetch('/api/gemini/chat-notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: commandText, contextNotes: 'Student asked via StudyGem Voice Assistant' }),
        });
        const data = await res.json();
        if (data.answer) {
          const shortAnswer = data.answer.replace(/[#*`_]/g, '').slice(0, 240);
          setFeedbackType('success');
          setFeedback(data.answer);
          speakText(shortAnswer);
        }
      } catch (err) {
        setFeedbackType('warning');
        setFeedback('Could not fetch AI Tutor answer right now.');
      }
      return;
    }

    // Unrecognized fallback
    setFeedbackType('info');
    setFeedback(`Heard: "${commandText}". Try saying "Open Flashcards", "Start Pomodoro", or "Open Cheat Sheet".`);
  };

  const sampleCommands = [
    { label: 'Open Flashcards', cmd: 'Open flashcards' },
    { label: 'Start Pomodoro', cmd: 'Start pomodoro' },
    { label: 'Open YouTube Notes', cmd: 'Open youtube notes' },
    { label: 'Formula Cheat Sheet', cmd: 'Open formula cheat sheet' },
    { label: 'AI Practice Quiz', cmd: 'Open practice quiz' },
    { label: 'Study Planner', cmd: 'Open study planner' },
    { label: 'Explain Quantum Physics', cmd: 'Explain Quantum Physics simply' },
  ];

  return (
    <>
      {/* Floating Voice Command Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2 no-print">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              id="study-voice-fab"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                setIsOpen(true);
                toggleListening();
              }}
              className={`relative flex items-center gap-2.5 px-4 py-3 rounded-full shadow-xl border text-sm font-medium transition-all no-print ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-400 shadow-rose-500/30 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/40 shadow-emerald-600/30'
              }`}
              title="Activate Study Voice Commands"
            >
              <div className="relative">
                {isListening ? <Mic className="w-5 h-5 animate-bounce" /> : <Mic className="w-5 h-5" />}
                {isListening && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <span className="hidden sm:inline font-semibold">Voice Commands</span>
              <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] uppercase font-bold tracking-wider">AI</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Voice Command Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[92vw] max-w-md bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden text-zinc-100 no-print"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800 bg-zinc-950/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    Study Voice Assistant
                    {isListening && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                        Live
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-zinc-400">Hands-free navigation & AI tutor</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    audioEnabled ? 'text-emerald-400 hover:bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-800'
                  }`}
                  title={audioEnabled ? 'Voice Responses Enabled' : 'Voice Responses Muted'}
                >
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    if (isListening && recognitionRef.current) {
                      recognitionRef.current.stop();
                      setIsListening(false);
                    }
                    setIsOpen(false);
                  }}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Listening Visualizer Bar */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-center py-3">
                <button
                  onClick={toggleListening}
                  className={`relative p-4 rounded-full transition-all duration-300 ${
                    isListening
                      ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 ring-4 ring-rose-500/20 animate-pulse scale-110'
                      : 'bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-white shadow-md'
                  }`}
                >
                  {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                  {isListening && (
                    <div className="absolute -inset-1 rounded-full border border-rose-400/50 animate-ping" />
                  )}
                </button>
              </div>

              {/* Dynamic Transcript & Feedback */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 min-h-[64px] flex flex-col justify-center">
                {transcript ? (
                  <p className="text-xs text-amber-300 font-mono italic">
                    "{transcript}"
                  </p>
                ) : null}

                <div className="flex items-start gap-2 mt-1">
                  {feedbackType === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  {feedbackType === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                  {feedbackType === 'info' && <Compass className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                  <p className="text-xs text-zinc-300 leading-relaxed">{feedback}</p>
                </div>
              </div>

              {/* Sample Commands Quick Chips */}
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 text-emerald-400" /> Tap or Speak Quick Actions
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {sampleCommands.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleVoiceCommand(item.cmd)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-zinc-800/80 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-700/50 border border-zinc-700/60 text-zinc-300 transition-all font-medium"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-zinc-950/90 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                Speech Synthesis Active
              </span>
              <span>Say "What is [topic]" to ask tutor</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
