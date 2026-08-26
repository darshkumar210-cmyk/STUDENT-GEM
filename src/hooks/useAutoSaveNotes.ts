import { useState, useEffect, useRef } from 'react';
import { YouTubeStudyNotes } from '../types';

const STORAGE_KEY = 'studygem_active_notes_draft';
const LAST_SAVED_KEY = 'studygem_notes_last_saved_time';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved';

export function useAutoSaveNotes(
  initialNotes: YouTubeStudyNotes | null,
  onNotesChange?: (notes: YouTubeStudyNotes) => void,
  debounceMs: number = 750
) {
  const [notes, setNotes] = useState<YouTubeStudyNotes | null>(() => {
    // Try restoring from localStorage on mount if initialNotes is null
    if (initialNotes) return initialNotes;
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === 'object' && parsed.title) {
            return parsed as YouTubeStudyNotes;
          }
        }
      } catch (e) {
        console.error('Failed to load saved notes from localStorage:', e);
      }
    }
    return null;
  });

  const [saveStatus, setSaveStatus] = useState<AutoSaveStatus>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LAST_SAVED_KEY) || null;
    }
    return null;
  });

  const isFirstRender = useRef(true);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync when initialNotes changes from parent (e.g., loaded a preset or generated new notes)
  useEffect(() => {
    if (initialNotes) {
      setNotes(initialNotes);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialNotes));
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        localStorage.setItem(LAST_SAVED_KEY, nowStr);
        setLastSavedTime(nowStr);
        setSaveStatus('saved');
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }
    }
  }, [initialNotes]);

  // Debounced auto-save effect whenever notes state changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!notes) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LAST_SAVED_KEY);
      setLastSavedTime(null);
      setSaveStatus('idle');
      return;
    }

    setSaveStatus('saving');

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        localStorage.setItem(LAST_SAVED_KEY, timeString);
        setLastSavedTime(timeString);
        setSaveStatus('saved');
        if (onNotesChange) {
          onNotesChange(notes);
        }
      } catch (err) {
        console.error('AutoSave to localStorage failed:', err);
        setSaveStatus('idle');
      }
    }, debounceMs);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [notes, debounceMs, onNotesChange]);

  const updateNotes = (updater: (prev: YouTubeStudyNotes) => YouTubeStudyNotes) => {
    setNotes((prev) => {
      if (!prev) return null;
      return updater(prev);
    });
  };

  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LAST_SAVED_KEY);
    setNotes(null);
    setLastSavedTime(null);
    setSaveStatus('idle');
  };

  return {
    notes,
    setNotes,
    updateNotes,
    saveStatus,
    lastSavedTime,
    clearDraft,
  };
}
