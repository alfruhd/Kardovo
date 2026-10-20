'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { AudioConfig } from '@/lib/schema';

interface AudioManagerContextType {
  isPlaying: boolean;
  isMuted: boolean;
  hasUserGesture: boolean;
  togglePlay: () => void;
  toggleMute: () => void;
  registerUserGesture: () => void;
}

const AudioManagerContext = createContext<AudioManagerContextType | null>(null);

const STORAGE_KEY_MUTED = 'kardovo_invitation_muted';

export function AudioManagerProvider({
  config,
  children,
}: {
  config?: AudioConfig;
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUserGesture, setHasUserGesture] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Restore remembered mute preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedMuted = localStorage.getItem(STORAGE_KEY_MUTED);
      if (storedMuted !== null) {
        setIsMuted(storedMuted === 'true');
      }
    }
  }, []);

  // Initialize and manage audio element
  useEffect(() => {
    if (!config?.enabled || !config.url) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    const audio = new Audio(config.url);
    audio.loop = config.loop ?? true;
    audio.volume = config.volume ?? 0.7;
    audio.muted = isMuted;
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.pause();
      audioRef.current = null;
    };
  }, [config?.enabled, config?.url, config?.loop, config?.volume, isMuted]);

  // Sync mute state to audio element and remember in localStorage
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MUTED, String(isMuted));
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const registerUserGesture = useCallback(() => {
    setHasUserGesture(true);
    if (audioRef.current && config?.autoplayOnGesture && !isPlaying) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Handled gracefully if browser blocks audio
        });
    }
  }, [config?.autoplayOnGesture, isPlaying]);

  const togglePlay = useCallback(() => {
    setHasUserGesture(true);
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying]);

  return (
    <AudioManagerContext.Provider
      value={{
        isPlaying,
        isMuted,
        hasUserGesture,
        togglePlay,
        toggleMute,
        registerUserGesture,
      }}
    >
      {children}

      {/* Floating Audio Player */}
      {config?.enabled && config.url && config.showFloatingPlayer && (
        <div
          id="floating-audio-player"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-2 rounded-full border border-brand-border bg-white/80 backdrop-blur-md shadow-lg transition-transform hover:scale-105"
        >
          <button
            id="btn-audio-toggle-play"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause soundtrack' : 'Play soundtrack'}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-primary text-white shadow-sm transition-all active:scale-95"
          >
            <Music
              className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '4s' }}
            />
          </button>

          <button
            id="btn-audio-toggle-mute"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute music' : 'Mute music'}
            className="w-8 h-8 rounded-full flex items-center justify-center text-brand-text hover:bg-black/5"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {config?.enabled && config.url && (
        <audio
          id="bg-audio"
          ref={audioRef}
          src={config.url}
          loop={config.loop ?? true}
          preload="none"
          className="hidden"
        />
      )}
    </AudioManagerContext.Provider>
  );
}

export function useAudioManager() {
  const ctx = useContext(AudioManagerContext);
  if (!ctx) {
    throw new Error('useAudioManager must be used within an AudioManagerProvider');
  }
  return ctx;
}
