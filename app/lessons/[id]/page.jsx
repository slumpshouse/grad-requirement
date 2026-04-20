'use client';

import BottomBackButton from '@/components/BottomBackButton';
import { useAuth } from '@/lib/useAuth';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [lesson, setLesson] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [completionLoading, setCompletionLoading] = useState(false);

  const fetchLesson = useCallback(async () => {
    if (!params?.id) return;

    setPageLoading(true);
    try {
      const response = await fetch(`/api/lessons/${params.id}`);
      const data = await response.json();
      setLesson(data.lesson || null);
    } catch (error) {
      console.error('Error loading lesson:', error);
      setLesson(null);
    } finally {
      setPageLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      fetchLesson();
    }
  }, [user, fetchLesson]);

  const markComplete = async () => {
    if (!lesson) return;
    setCompletionLoading(true);
    try {
      const response = await fetch('/api/lessons/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: lesson.id }),
      });

      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    } finally {
      setCompletionLoading(false);
    }
  };

  if (loading || pageLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading lesson...</div>;
  }

  if (!user) {
    return null;
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow">
          <p className="mb-4">Lesson not found.</p>
          <button onClick={() => router.push('/lessons')} className="px-4 py-2 bg-blue-600 text-white rounded">
            Back to Lessons
          </button>
          <BottomBackButton fallbackHref="/lessons" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
        <p className="text-gray-600 mb-6">{lesson.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 text-sm">
          <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded">Grammar: {lesson.grammarTopic || 'General'}</span>
          <span className="px-3 py-2 bg-green-100 text-green-800 rounded">Conjugation: {lesson.conjugationTopic || 'General'}</span>
          <span className="px-3 py-2 bg-purple-100 text-purple-800 rounded">Sentence Type: {lesson.sentenceType || 'Declarative'}</span>
        </div>

        <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: lesson.content }} />

        <h2 className="text-xl font-semibold mb-3">Sentence Building Breakdown</h2>
        {lesson.sentences?.length ? (
          <div className="space-y-3 mb-8">
            {lesson.sentences.map((sentence) => (
              <div key={sentence.id} className="p-4 border rounded-lg bg-slate-50">
                <p className="font-medium mb-2">{sentence.text}</p>
                <div className="flex flex-wrap gap-2 text-sm">
                  {Array.isArray(sentence.breakdown) &&
                    sentence.breakdown.map((item, idx) => (
                      <span key={`${sentence.id}-${idx}`} className="px-2 py-1 rounded bg-white border">
                        {item.word} ({item.role})
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-8">No sentence metadata available yet.</p>
        )}

        <div className="flex flex-col md:flex-row gap-3">
          <button
            onClick={() => router.push('/quiz')}
            className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Review This Lesson in Quiz
          </button>
          <button
            onClick={markComplete}
            disabled={completionLoading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400"
          >
            {completionLoading ? 'Completing...' : 'Complete Lesson (+10 XP)'}
          </button>
        </div>

        <BottomBackButton fallbackHref="/lessons" />
      </div>
    </div>
  );
}
