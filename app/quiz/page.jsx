'use client';

import BottomBackButton from '@/components/BottomBackButton';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * Quiz Page - Interactive quiz with questions and scoring
 */
export default function QuizPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [quizLoading, setQuizLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/quiz/questions?limit=5');
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setQuizLoading(false);
    }
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch questions
  useEffect(() => {
    if (user) {
      fetchQuestions();
    }
  }, [user]);

  const handleAnswerChange = (e) => {
    setUserAnswers({
      ...userAnswers,
      [currentIndex]: e.target.value,
    });
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswers[currentIndex]) {
      alert('Please select an answer');
      return;
    }

    const question = questions[currentIndex];
    try {
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: question.id,
          userAnswer: userAnswers[currentIndex],
        }),
      });

      const data = await response.json();
      if (response.ok) {
        // Move to next question or finish
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setSubmitted(true);
          setResults({
            correct: Object.values(userAnswers).filter((ans, idx) => 
              ans === questions[idx].correctAnswer
            ).length,
            total: questions.length,
            xpEarned: Object.values(userAnswers).filter((ans, idx) => 
              ans === questions[idx].correctAnswer
            ).length * 5,
          });
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (loading || quizLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (submitted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Quiz Complete! 🎉</h1>
            <div className="text-5xl font-bold text-blue-600 mb-4">
              {results.correct} / {results.total}
            </div>
            <p className="text-gray-600 mb-4">
              Correct Answers: {results.correct}/{results.total}
            </p>
            <p className="text-lg font-bold text-green-600 mb-8">
              +{results.xpEarned} XP Earned
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              Back to Dashboard
            </button>
            <BottomBackButton fallbackHref="/learn" />
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 mb-4">No questions available</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              Back to Dashboard
            </button>
            <BottomBackButton fallbackHref="/learn" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Question {currentIndex + 1} of {questions.length}</span>
              <span className="text-blue-600 font-bold">{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>

          <div className="space-y-3 mb-8">
            {currentQuestion.options?.map((option, idx) => (
              <label key={idx} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-blue-50 cursor-pointer">
                <input
                  type="radio"
                  name="answer"
                  value={option}
                  checked={userAnswers[currentIndex] === option}
                  onChange={handleAnswerChange}
                  className="mr-3"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleSubmitAnswer}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg"
          >
            {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>

          <BottomBackButton fallbackHref="/learn" />
        </div>
      </div>
    </div>
  );
}
