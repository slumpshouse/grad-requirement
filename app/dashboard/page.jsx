'use client';

import BottomBackButton from '@/components/BottomBackButton';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * User Dashboard - shows stats, weak areas, and navigation to lessons
 */
export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Calculate level based on XP
  const getLevelThresholds = () => {
    return {
      beginner: 0,
      intermediate: 500,
      advanced: 2000,
    };
  };

  const getLevel = () => {
    const xp = user.xp || 0;
    if (xp >= 2000) return 'Advanced';
    if (xp >= 500) return 'Intermediate';
    return 'Beginner';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">LinguaAI</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
          <p className="text-gray-600">Keep practicing {user.selectedLanguage} to improve your language skills.</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Level Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Level</p>
                <p className="text-4xl font-bold text-blue-600">{getLevel()}</p>
              </div>
              <div className="text-5xl">🎯</div>
            </div>
          </div>

          {/* XP Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Experience</p>
                <p className="text-4xl font-bold text-green-600">{user.xp}</p>
              </div>
              <div className="text-5xl">⭐</div>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${Math.min((user.xp % 500) / 5, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Streak Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Streak</p>
                <p className="text-4xl font-bold text-orange-600">{user.streak}</p>
              </div>
              <div className="text-5xl">🔥</div>
            </div>
          </div>

          {/* Language Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Learning</p>
                <p className="text-3xl font-bold text-purple-600">{user.selectedLanguage}</p>
              </div>
              <div className="text-5xl">🌍</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => router.push('/learn')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition"
          >
            📚 Start Learning
          </button>
          <button
            onClick={() => router.push('/quiz')}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition"
          >
            ✍️ Take Quiz
          </button>
          <button
            onClick={() => router.push('/chat')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition"
          >
            💬 Chat Room
          </button>
        </div>

        {/* Placeholder for weak areas section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">📊 Your Weak Areas</h3>
          <p className="text-gray-600">Complete quizzes to identify areas where you need more practice.</p>
        </div>

        <BottomBackButton fallbackHref="/" />
      </div>
    </div>
  );
}
