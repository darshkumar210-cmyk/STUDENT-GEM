import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle,
  Plus,
  Trash2,
  Coffee,
  CloudRain,
  Radio,
  Music,
} from 'lucide-react';

interface FocusRoomGemProps {
  onTimeUpdate?: (formatted: string, active: boolean) => void;
}

export const FocusRoomGem: React.FC<FocusRoomGemProps> = ({ onTimeUpdate }) => {
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(2);

  // Sound generator state
  const [activeSound, setActiveSound] = useState<'none' | 'rain' | 'binaural' | 'pinkNoise' | 'lofi'>('none');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundNodesRef = useRef<{ source?: any; gain?: GainNode } | null>(null);

  // Study tasks
  const [tasks, setTasks] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'Watch MIT Linear Algebra Lecture 14', done: true },
    { id: '2', text: 'Drill 20 Flashcards on Eigenvalues', done: true },
    { id: '3', text: 'Complete practice exam problem set 3', done: false },
    { id: '4', text: 'Review Cornell Note Summary before bed', done: false },
  ]);
  const [newTaskInput, setNewTaskInput] = useState('');

  // Formatted string
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    if (onTimeUpdate) {
      onTimeUpdate(formatTime(secondsLeft), isActive);
    }
  }, [secondsLeft, isActive, onTimeUpdate]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      if (mode === 'work') {
        setSessionsCompleted((prev) => prev + 1);
        confetti({ particleCount: 100, spread: 70 });
        setMode('shortBreak');
        setSecondsLeft(breakMinutes * 60);
      } else {
        setMode('work');
        setSecondsLeft(workMinutes * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft, mode, breakMinutes, workMinutes]);

  const handleStartTimer = () => setIsActive(true);
  const handlePauseTimer = () => setIsActive(false);
  const handleResetTimer = () => {
    setIsActive(false);
    if (mode === 'work') setSecondsLeft(workMinutes * 60);
    else if (mode === 'shortBreak') setSecondsLeft(breakMinutes * 60);
    else setSecondsLeft(15 * 60);
  };

  const handleModeChange = (newMode: 'work' | 'shortBreak' | 'longBreak') => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === 'work') setSecondsLeft(workMinutes * 60);
    else if (newMode === 'shortBreak') setSecondsLeft(breakMinutes * 60);
    else setSecondsLeft(15 * 60);
  };

  // Synthesized Ambient Sound Generator using Web Audio API
  const stopAmbientSound = () => {
    if (soundNodesRef.current?.source) {
      try {
        soundNodesRef.current.source.stop();
        soundNodesRef.current.source.disconnect();
      } catch {}
      soundNodesRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    setActiveSound('none');
  };

  const playAmbientSound = (soundType: 'rain' | 'binaural' | 'pinkNoise' | 'lofi') => {
    stopAmbientSound();
    setActiveSound(soundType);

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.connect(ctx.destination);

    if (soundType === 'rain' || soundType === 'pinkNoise') {
      // White/Pink noise buffer generator
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        b3 = 0.8665 * b3 + white * 0.3104856;
        b4 = 0.55 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Low pass filter for rain atmosphere
      const filter = ctx.createBiquadFilter();
      filter.type = soundType === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(soundType === 'rain' ? 800 : 500, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      whiteNoise.start();
      soundNodesRef.current = { source: whiteNoise, gain: gainNode };
    } else if (soundType === 'binaural' || soundType === 'lofi') {
      // 40Hz Alpha wave binaural generator
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(soundType === 'binaural' ? 220 : 130.81, ctx.currentTime); // A3 or C3 calm root

      // Gentle LFO tremolo
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(soundType === 'binaural' ? 40 : 4, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.04, ctx.currentTime);
      lfo.connect(lfoGain.gain);

      osc.connect(gainNode);
      osc.start();
      soundNodesRef.current = { source: osc, gain: gainNode };
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: `t-${Date.now()}`, text: newTaskInput.trim(), done: false },
    ]);
    setNewTaskInput('');
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Timer className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Pomodoro Focus Room & Ambient Sound Synthesizer
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            25/5 & 50/10 ultradian focus cycles paired with binaural beats, gentle rain, and session goal tracking.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{sessionsCompleted} Focus Rounds Completed Today</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pomodoro Clock & Modes */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center space-y-6">
            {/* Mode Switcher */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => handleModeChange('work')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'work'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Deep Focus (25m)
              </button>
              <button
                onClick={() => handleModeChange('shortBreak')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'shortBreak'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Short Break (5m)
              </button>
              <button
                onClick={() => handleModeChange('longBreak')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'longBreak'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Long Rest (15m)
              </button>
            </div>

            {/* Giant Timer Display */}
            <div className="py-4">
              <span className="text-6xl sm:text-8xl font-mono font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800 bg-clip-text text-transparent select-none">
                {formatTime(secondsLeft)}
              </span>
              <p className="text-xs font-semibold text-slate-400 mt-2 uppercase tracking-widest">
                {mode === 'work' ? '⚡ Active Concentration Session' : '☕ Relax & Recharge'}
              </p>
            </div>

            {/* Play/Pause Controls */}
            <div className="flex items-center justify-center space-x-3">
              {isActive ? (
                <button
                  onClick={handlePauseTimer}
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause Timer</span>
                </button>
              ) : (
                <button
                  onClick={handleStartTimer}
                  className="flex items-center space-x-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-sm font-bold shadow-md shadow-indigo-200 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Focus Session</span>
                </button>
              )}

              <button
                onClick={handleResetTimer}
                className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Ambient Sound Bar */}
            <div className="pt-6 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
                Built-in Ambient Sound Generator (Web Audio)
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => (activeSound === 'rain' ? stopAmbientSound() : playAmbientSound('rain'))}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeSound === 'rain'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <CloudRain className="w-3.5 h-3.5" />
                  <span>Gentle Rain</span>
                </button>

                <button
                  onClick={() => (activeSound === 'binaural' ? stopAmbientSound() : playAmbientSound('binaural'))}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeSound === 'binaural'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>40Hz Alpha Waves</span>
                </button>

                <button
                  onClick={() => (activeSound === 'pinkNoise' ? stopAmbientSound() : playAmbientSound('pinkNoise'))}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeSound === 'pinkNoise'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Pink Noise</span>
                </button>

                <button
                  onClick={() => (activeSound === 'lofi' ? stopAmbientSound() : playAmbientSound('lofi'))}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeSound === 'lofi'
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Calm Tone</span>
                </button>

                {activeSound !== 'none' && (
                  <button
                    onClick={stopAmbientSound}
                    className="p-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100"
                    title="Mute Ambient Audio"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Study Session Task Goals */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Today's Study Session Goals</span>
            </h3>

            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="flex items-center space-x-2">
              <input
                type="text"
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                placeholder="Add high-yield study task..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:border-indigo-500 outline-hidden"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Tasks list */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    task.done
                      ? 'bg-slate-50/60 border-slate-200 text-slate-400 line-through'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div
                    onClick={() => handleToggleTask(task.id)}
                    className="flex items-center space-x-2.5 cursor-pointer flex-1"
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                        task.done ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {task.done && <span className="text-[10px] font-bold">✓</span>}
                    </div>
                    <span>{task.text}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
