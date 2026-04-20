'use client';

import BottomBackButton from '@/components/BottomBackButton';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LearnHubPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [generatingLesson, setGeneratingLesson] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const handleGenerateLesson = async () => {
    setGeneratingLesson(true);
    try {
      const response = await fetch('/api/learning/lesson/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (response.ok && data?.lesson?.id) {
        router.push(`/lessons/${data.lesson.id}`);
      }
    } catch (error) {
      console.error('Error generating lesson:', error);
    } finally {
      setGeneratingLesson(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-100 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">Learn Hub</h1>
          <p className="text-gray-600">Choose how you want to learn, then repeat to remember.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => router.push('/lessons')}
            className="text-left bg-white rounded-xl shadow p-5 hover:shadow-md transition"
          >
            <p className="text-sm text-blue-600 font-semibold mb-1">Study</p>
            <h2 className="text-xl font-bold mb-2">Lessons Library</h2>
            <p className="text-gray-600">Browse all lessons by level and topic.</p>
          </button>

          <button
            onClick={handleGenerateLesson}
            disabled={generatingLesson}
            className="text-left bg-white rounded-xl shadow p-5 hover:shadow-md transition disabled:opacity-60"
          >
            <p className="text-sm text-green-600 font-semibold mb-1">Adaptive</p>
            <h2 className="text-xl font-bold mb-2">Generate My Next Lesson</h2>
            <p className="text-gray-600">Create a personalized lesson based on weak areas.</p>
            <p className="text-sm text-gray-500 mt-2">{generatingLesson ? 'Generating...' : 'Tap to start'}</p>
          </button>

          <button
            onClick={() => router.push('/quiz')}
            className="text-left bg-white rounded-xl shadow p-5 hover:shadow-md transition"
          >
            <p className="text-sm text-purple-600 font-semibold mb-1">Recall</p>
            <h2 className="text-xl font-bold mb-2">Adaptive Quiz Practice</h2>
            <p className="text-gray-600">Test what you learned and get feedback.</p>
          </button>

          <button
            onClick={() => router.push('/chat')}
            className="text-left bg-white rounded-xl shadow p-5 hover:shadow-md transition"
          >
            <p className="text-sm text-orange-600 font-semibold mb-1">Apply</p>
            <h2 className="text-xl font-bold mb-2">Conversation Chat</h2>
            <p className="text-gray-600">Use the language in real messages and get corrections.</p>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-2xl font-bold mb-4">Repeat to Remember</h3>
          <p className="text-gray-600 mb-4">Use this short repetition loop after every lesson:</p>
          <ol className="list-decimal pl-5 space-y-2 text-gray-700 mb-6">
            <li>Study one lesson.</li>
            <li>Take one quiz to recall the idea without notes.</li>
            <li>Use the same idea in chat right away.</li>
            <li>Repeat the loop once more for stronger memory.</li>
          </ol>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/lessons')}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              1. Study Lesson
            </button>
            <button
              onClick={() => router.push('/quiz')}
              className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
            >
              2. Recall in Quiz
            </button>
            <button
              onClick={() => router.push('/chat')}
              className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700"
            >
              3. Apply in Chat
            </button>
          </div>

          <BottomBackButton fallbackHref="/dashboard" />
        </div>
      </div>
    </div>
  );
}