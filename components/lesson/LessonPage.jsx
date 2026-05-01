'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import BottomBackButton from '@/components/BottomBackButton';
import LevelSelector from './LevelSelector';
import GrammarSection from './GrammarSection';
import VocabularySection from './VocabularySection';
import ConjugationTable from './ConjugationTable';
import PracticeSection from './PracticeSection';
import { MOCK_LESSONS } from './mockData';
import { enrichLessonPractice } from '@/lib/lesson-practice.js';

const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];
const LESSON_FETCH_TIMEOUT_MS = 12000;

const LEVEL_BADGE_CLASS = {
  beginner: 'lp-badge lp-badge--green',
  intermediate: 'lp-badge lp-badge--yellow',
  advanced: 'lp-badge lp-badge--red',
};

export default function LessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [level, setLevel] = useState('beginner');
  const [lesson, setLesson] = useState(null);
  const [lessonLoading, setLessonLoading] = useState(true);
  const [weakness, setWeakness] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [completionResult, setCompletionResult] = useState(null);
  const [error, setError] = useState(null);
  const lessonTopic = searchParams.get('topic') || '';

  // Fetch lesson content for the selected level
  const fetchLesson = useCallback(async (selectedLevel, selectedTopic = '') => {
    setLessonLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LESSON_FETCH_TIMEOUT_MS);

    try {
      const query = new URLSearchParams({ level: selectedLevel });
      if (selectedTopic) {
        query.set('topic', selectedTopic);
      }

      const res = await fetch(`/api/lesson?${query.toString()}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setLesson(data.lesson ? enrichLessonPractice(data.lesson) : null);
    } catch {
      // Fall back to mock data when API is unavailable
      setLesson(enrichLessonPractice(MOCK_LESSONS[selectedLevel] || MOCK_LESSONS.beginner));
      setError('Using fallback lesson due to network delay.');
    } finally {
      clearTimeout(timeout);
      setLessonLoading(false);
    }
  }, []);

  // Fetch user weakness data for AI personalisation
  const fetchWeakness = useCallback(async () => {
    try {
      const res = await fetch('/api/user/weak-areas');
      if (res.ok) {
        const data = await res.json();
        setWeakness(data);
      }
    } catch {
      // Weakness data is optional – silently ignore
    }
  }, []);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const requestedLevel = searchParams.get('level');
    const safeLevel = VALID_LEVELS.includes(requestedLevel) ? requestedLevel : 'beginner';
    setLevel(safeLevel);
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      fetchLesson(level, lessonTopic);
      fetchWeakness();
    }
  }, [user, level, lessonTopic, fetchLesson, fetchWeakness]);

  const handleLevelChange = (newLevel) => {
    const safe = VALID_LEVELS.includes(newLevel) ? newLevel : 'beginner';
    setLevel(safe);
    setCompletionResult(null);
  };

  const handleCompleteLesson = async () => {
    setCompleting(true);
    const completionLessonId = lesson?.id || `level-${level}`;

    const quizParams = new URLSearchParams();
    if (lesson?.id) {
      quizParams.set('lessonId', lesson.id);
    } else {
      quizParams.set('level', level);
      if (lessonTopic) {
        quizParams.set('topic', lessonTopic);
      }
    }
    const quizHref = `/quiz?${quizParams.toString()}`;

    try {
      const body = { lessonId: completionLessonId };
      const res = await fetch('/api/lessons/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setCompletionResult(data);
        setTimeout(() => router.push(quizHref), 1500);
      }
    } catch {
      // Navigate anyway on network error
      router.push(quizHref);
    } finally {
      setCompleting(false);
    }
  };

  // ── Render states ──────────────────────────────────────────────────────────

  if (authLoading) {
    return <div className="lp-loading" data-testid="auth-loading">Checking session…</div>;
  }

  if (!user) return null;

  const topFocus = weakness?.topWeakness || weakness?.focusArea || null;

  return (
    <div className="lp-root" data-testid="lesson-page">
      <BottomBackButton fallbackHref="/learn" />

      {/* ── Level Selector ─────────────────────────────────────────────────── */}
      <LevelSelector selectedLevel={level} onSelect={handleLevelChange} />

      {/* ── AI Focus Area banner ───────────────────────────────────────────── */}
      {topFocus && (
        <div className="lp-focus-banner" data-testid="focus-banner">
          🧠 <strong>AI Focus Area:</strong> {topFocus}
        </div>
      )}

      {/* ── Loading / Error / Content ──────────────────────────────────────── */}
      {lessonLoading ? (
        <div className="lp-loading" data-testid="lesson-loading">Loading lesson…</div>
      ) : !lesson ? (
        <div className="lp-fallback" data-testid="lesson-fallback">
          <p>No lesson data available. Please try again later.</p>
        </div>
      ) : (
        <div className="lp-content" data-testid="lesson-content">
          {/* ── Header ─────────────────────────────────────────────────────── */}
          <header className="lp-header lp-card">
            <div className="lp-header__meta">
              <span className="lp-header__category">{lesson.category}</span>
              <span className={LEVEL_BADGE_CLASS[level]}>{level}</span>
            </div>
            <h1 className="lp-header__title" data-testid="lesson-title">{lesson.title}</h1>
          </header>

          {/* ── Grammar ────────────────────────────────────────────────────── */}
          <GrammarSection grammar={lesson.grammar} level={level} example={lesson.example} />

          {/* ── Vocabulary ─────────────────────────────────────────────────── */}
          <VocabularySection vocabulary={lesson.vocabulary} />

          {/* ── Conjugation ────────────────────────────────────────────────── */}
          <ConjugationTable conjugation={lesson.conjugation} />

          {/* ── Practice ───────────────────────────────────────────────────── */}
          <PracticeSection practice={lesson.practice} level={level} />

          {/* ── Complete Button ────────────────────────────────────────────── */}
          <div className="lp-complete">
            {completionResult ? (
              <div className="lp-complete__result" data-testid="completion-result">
                <p>+{completionResult.xpAwarded} XP earned! Redirecting to quiz…</p>
              </div>
            ) : (
              <button
                className="lp-complete__btn"
                onClick={handleCompleteLesson}
                disabled={completing}
                data-testid="complete-btn"
              >
                {completing ? 'Saving…' : '✓ Complete Lesson (+10 XP)'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
