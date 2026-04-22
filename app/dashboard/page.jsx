'use client';

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

  const getLevel = () => {
    const xp = user.xp || 0;
    if (xp >= 2000) return 'Advanced';
    if (xp >= 500) return 'Intermediate';
    return 'Beginner';
  };

  const getStarterWords = (language) => {
    const bank = {
      Spanish: [
        { word: 'Hola', meaning: 'Hello' },
        { word: 'Gracias', meaning: 'Thank you' },
        { word: 'Por favor', meaning: 'Please' },
        { word: 'Agua', meaning: 'Water' },
        { word: 'Comer', meaning: 'To eat' },
        { word: 'Casa', meaning: 'House' },
      ],
      French: [
        { word: 'Bonjour', meaning: 'Hello' },
        { word: 'Merci', meaning: 'Thank you' },
        { word: "S'il vous plait", meaning: 'Please' },
        { word: 'Eau', meaning: 'Water' },
        { word: 'Manger', meaning: 'To eat' },
        { word: 'Maison', meaning: 'House' },
      ],
      German: [
        { word: 'Hallo', meaning: 'Hello' },
        { word: 'Danke', meaning: 'Thank you' },
        { word: 'Bitte', meaning: 'Please' },
        { word: 'Wasser', meaning: 'Water' },
        { word: 'Essen', meaning: 'To eat' },
        { word: 'Haus', meaning: 'House' },
      ],
    };

    return bank[language] || bank.Spanish;
  };

  const starterWords = getStarterWords(user.selectedLanguage);
  const learningFoundations = [
    {
      title: '1. Vocabulary (Words)',
      accent: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-100',
      description: 'Learn nouns, verbs, and adjectives so you can recognize the building blocks of the language.',
      points: ['dog, house', 'run, eat', 'big, fast'],
      example: 'apple -> useful only when used in a full thought like: I eat an apple.',
    },
    {
      title: '2. Grammar (Rules of the Language)',
      accent: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-100',
      description: 'Learn the rules engine behind the language so words fit together correctly.',
      points: ['sentence order', 'agreement', 'past, present, future'],
      example: 'English: I eat. Spanish: Yo como.',
    },
    {
      title: '3. Conjugation (Verb Changes)',
      accent: 'text-violet-700',
      bg: 'bg-violet-50 border-violet-100',
      description: 'Learn how verbs change depending on who is speaking and when the action happens.',
      points: ['Yo como', 'Tu comes', 'El come'],
      example: 'This is how you sound natural instead of robotic.',
    },
    {
      title: '4. Sentence Structure (Putting It All Together)',
      accent: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-100',
      description: 'Build complete thoughts by connecting vocabulary, grammar, and conjugation in one sentence.',
      points: ['subject', 'verb', 'object'],
      example: 'Yo como una manzana = Yo (subject) + como (verb) + una manzana (object).',
    },
    {
      title: '5. Culture & Context',
      accent: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-100',
      description: 'Learn when language changes by region, tone, and situation so you can speak naturally.',
      points: ['slang vs formal speech', 'regional differences', 'when to say things'],
      example: 'Spanish in Spain can sound different from Spanish in Latin America.',
    },
  ];

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

        {/* Start learning section with words */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-2xl font-bold">Start Learning</h3>
              <p className="text-gray-600">This section now teaches the full language foundation, not just random words.</p>
            </div>
            <button
              onClick={() => router.push('/learn')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-lg"
            >
              📚 Open Learn Hub
            </button>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-bold mb-3">Words You Start With</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {starterWords.map((item) => (
                <div key={item.word} className="border border-blue-100 bg-blue-50 rounded-lg px-3 py-2">
                  <p className="font-bold text-blue-700">{item.word}</p>
                  <p className="text-sm text-gray-600">{item.meaning}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {learningFoundations.map((item) => (
              <div key={item.title} className={`rounded-xl border p-4 ${item.bg}`}>
                <h4 className={`text-lg font-bold mb-2 ${item.accent}`}>{item.title}</h4>
                <p className="text-gray-700 mb-3">{item.description}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.points.map((point) => (
                    <span
                      key={point}
                      className="px-2 py-1 rounded-full bg-white text-sm text-gray-700 border border-white/80"
                    >
                      {point}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600">Example: {item.example}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">
              Words alone are not enough.
            </div>
            <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">
              Grammar tells you how the language works.
            </div>
            <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">
              Sentence building is where real learning happens.
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
      </div>
    </div>
  );
}
