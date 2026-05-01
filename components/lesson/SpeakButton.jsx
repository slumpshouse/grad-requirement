'use client';

import { useState } from 'react';

export default function SpeakButton({ text, lang = 'es-ES', className = '' }) {
  const [speaking, setSpeaking] = useState(false);

  function handleSpeak(e) {
    e.stopPropagation();
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.85;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      className={`lp-speak-btn ${speaking ? 'lp-speak-btn--active' : ''} ${className}`}
      onClick={handleSpeak}
      title={`Hear "${text}"`}
      aria-label={`Pronounce ${text}`}
    >
      {speaking ? '🔊' : '🔉'}
    </button>
  );
}
