'use client';

import BottomBackButton from '@/components/BottomBackButton';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Lessons Page - Browse and start lessons
 */
export default function LessonsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchLessons = async () => {
    try {
      let url = '/api/lessons';
      if (filter !== 'all') {
        url += `?level=${filter}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setLessons(data.lessons || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLessonsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchLessons();
    }
  }, [user, filter]);

  if (loading || lessonsLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">📚 Spanish Lessons</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-800"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex gap-2">
          {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize ${
                filter === lvl
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Lessons Grid */}
        {lessons.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No lessons available for this level yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6"
              >
                <h3 className="text-xl font-bold mb-2">{lesson.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{lesson.description}</p>
                
                <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                  <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {lesson.level}
                  </span>
                  <span>{lesson._count?.questions || 0} questions</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">⏱️ {lesson.duration} min</span>
                  <button
                    onClick={() => router.push(`/lessons/${lesson.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Start Lesson
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <BottomBackButton fallbackHref="/learn" />
      </div>
    </div>
  );
}
