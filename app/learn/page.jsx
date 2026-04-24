'use client';

import BottomBackButton from '@/components/BottomBackButton';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LearnHubPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [selectedLayer, setSelectedLayer] = useState('all');
  const [generatingTopicId, setGeneratingTopicId] = useState(null);

  const getStarterWords = (language) => {
    const bank = {
      Spanish: ['hola', 'gracias', 'por favor', 'agua', 'comer', 'amigo'],
      French: ['bonjour', 'merci', "s'il vous plait", 'eau', 'manger', 'ami'],
      German: ['hallo', 'danke', 'bitte', 'wasser', 'essen', 'freund'],
    };

    return bank[language] || bank.Spanish;
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const handleGenerateTopicLesson = async ({ topic, sentenceType = 'declarative', tense = 'present' }) => {
    setGeneratingTopicId(topic);
    try {
      const response = await fetch('/api/learning/lesson/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, sentenceType, tense }),
      });

      const data = await response.json();
      if (response.ok && data?.lesson?.id) {
        router.push(`/lessons/${data.lesson.id}`);
      }
    } catch (error) {
      console.error('Error generating lesson:', error);
    } finally {
      setGeneratingTopicId(null);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const starterWords = getStarterWords(user.selectedLanguage);
  const curriculumTopics = [
    {
      id: 'vocabulary',
      title: `Vocabulary in ${user.selectedLanguage}`,
      color: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-100',
      overview: 'Learn the words you need first: nouns, verbs, and adjectives.',
      lessonConfig: { topic: 'vocabulary', sentenceType: 'declarative', tense: 'present' },
      layers: {
        beginner: {
          focus: 'Core everyday words',
          bullets: ['greetings', 'food', 'people', 'places'],
          example: 'hola, agua, casa, amigo',
        },
        intermediate: {
          focus: 'Descriptive and situational vocabulary',
          bullets: ['travel', 'work', 'opinions', 'daily routines'],
          example: 'necesito ayuda, voy al mercado',
        },
        advanced: {
          focus: 'Nuance, precision, and register',
          bullets: ['abstract terms', 'idiomatic use', 'tone differences', 'topic-specific words'],
          example: 'formal vs casual word choice',
        },
      },
    },
    {
      id: 'grammar',
      title: 'Grammar Rules',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-100',
      overview: 'Learn the rules engine behind the language so words fit together correctly.',
      lessonConfig: { topic: 'grammar', sentenceType: 'declarative', tense: 'present' },
      layers: {
        beginner: {
          focus: 'Basic sentence rules',
          bullets: ['subject + verb + object', 'gender agreement', 'singular vs plural'],
          example: 'Yo como pan',
        },
        intermediate: {
          focus: 'Expanded tense and agreement control',
          bullets: ['past vs present', 'comparisons', 'question forms', 'negation'],
          example: 'Ayer comi pan, hoy como fruta',
        },
        advanced: {
          focus: 'Complex grammar and nuance',
          bullets: ['subtle tense choice', 'conditional meaning', 'style and precision'],
          example: 'choosing the right structure for tone and accuracy',
        },
      },
    },
    {
      id: 'conjugation',
      title: 'Conjugation',
      color: 'text-violet-700',
      bg: 'bg-violet-50 border-violet-100',
      overview: 'Learn how verbs change depending on person and time.',
      lessonConfig: { topic: 'conjugation', sentenceType: 'declarative', tense: 'present' },
      layers: {
        beginner: {
          focus: 'Present tense essentials',
          bullets: ['yo como', 'tu comes', 'el come'],
          example: 'regular present tense patterns',
        },
        intermediate: {
          focus: 'Past and future control',
          bullets: ['past forms', 'future forms', 'common irregulars'],
          example: 'yo comi, yo comere',
        },
        advanced: {
          focus: 'Irregular mastery and fluency',
          bullets: ['less common forms', 'fast recognition', 'natural production'],
          example: 'switching tense naturally in conversation',
        },
      },
    },
    {
      id: 'sentence_structure',
      title: 'Sentence Structure',
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-100',
      overview: 'Put vocabulary, grammar, and conjugation together into real thoughts.',
      lessonConfig: { topic: 'sentence_structure', sentenceType: 'declarative', tense: 'present' },
      layers: {
        beginner: {
          focus: 'Build simple complete thoughts',
          bullets: ['subject', 'verb', 'object'],
          example: 'Yo como una manzana',
        },
        intermediate: {
          focus: 'Combine ideas in longer sentences',
          bullets: ['because clauses', 'time markers', 'descriptions'],
          example: 'Yo como una manzana porque tengo hambre',
        },
        advanced: {
          focus: 'Flexible and natural expression',
          bullets: ['variation', 'emphasis', 'flow', 'complex ideas'],
          example: 'sounding natural instead of translated',
        },
      },
    },
    {
      id: 'culture_context',
      title: 'Culture & Context',
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-100',
      overview: 'Learn when language changes by region, tone, and situation.',
      lessonConfig: null,
      layers: {
        beginner: {
          focus: 'Polite vs casual basics',
          bullets: ['hello forms', 'thank you', 'formal vs informal'],
          example: 'basic respectful phrases',
        },
        intermediate: {
          focus: 'Regional and social context',
          bullets: ['Spain vs Latin America', 'daily expressions', 'common slang'],
          example: 'the same idea can be said differently by region',
        },
        advanced: {
          focus: 'Tone, nuance, and style',
          bullets: ['register shifts', 'idiomatic meaning', 'social expectations'],
          example: 'choosing what sounds natural in the moment',
        },
      },
    },
  ];

  const visibleLayers = selectedLayer === 'all' ? ['beginner', 'intermediate', 'advanced'] : [selectedLayer];

  const layerButtonClass = (layer) => `px-4 py-2 rounded-lg font-semibold capitalize ${
    selectedLayer === layer
      ? 'bg-blue-600 text-white'
      : 'bg-white text-gray-700 border border-gray-300'
  }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-cyan-100 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">Learn Hub</h1>
          <p className="text-gray-600">This is your curriculum screen for {user.selectedLanguage}. Learn the language in layers instead of random isolated exercises.</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">Start Learning Words</h2>
          <p className="text-gray-600 mb-4">These words are your first memory targets:</p>
          <div className="flex flex-wrap gap-2">
            {starterWords.map((word) => (
              <span
                key={word}
                className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">What You Should Learn In {user.selectedLanguage}</h2>
          <p className="text-gray-600 mb-5">
            Start Learning now goes over the full language system: vocabulary, grammar, conjugation, sentence structure, and culture/context.
          </p>

          <div className="mb-5 flex flex-wrap gap-2">
            {['all', 'beginner', 'intermediate', 'advanced'].map((layer) => (
              <button
                key={layer}
                onClick={() => setSelectedLayer(layer)}
                className={layerButtonClass(layer)}
              >
                {layer}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {curriculumTopics.map((topic) => (
              <div key={topic.id} className={`rounded-xl border p-5 ${topic.bg}`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className={`text-xl font-bold ${topic.color}`}>{topic.title}</h3>
                    <p className="text-gray-700 mt-2">{topic.overview}</p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Topic</span>
                </div>

                <div className="space-y-3 mb-4">
                  {visibleLayers.map((layer) => {
                    const content = topic.layers[layer];
                    return (
                      <div key={`${topic.id}-${layer}`} className="rounded-lg bg-white/80 border border-white px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold capitalize text-gray-900">{layer}</p>
                          <span className="text-xs text-gray-500">{content.focus}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {content.bullets.map((bullet) => (
                            <span
                              key={bullet}
                              className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs"
                            >
                              {bullet}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">Example: {content.example}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {topic.lessonConfig ? (
                    <button
                      onClick={() => handleGenerateTopicLesson(topic.lessonConfig)}
                      disabled={generatingTopicId === topic.lessonConfig.topic}
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-400"
                    >
                      {generatingTopicId === topic.lessonConfig.topic ? 'Preparing...' : `Start ${topic.title}`}
                    </button>
                  ) : (
                    <button
                      onClick={() => router.push('/chat')}
                      className="px-4 py-2 rounded bg-rose-600 text-white hover:bg-rose-700"
                    >
                      Explore Context in Chat
                    </button>
                  )}


                </div>
              </div>
            ))}
          </div>
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