import BottomBackButton from '@/components/BottomBackButton';
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">🌍 LinguaAI</h1>
          <div className="space-x-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-800">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6 text-gray-900">
          Learn Languages with AI
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Master Spanish with personalized lessons, AI-powered quizzes, and real-time grammar feedback. 
          Track your progress with gamification and learn at your own pace.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition"
        >
          Get Started Free
        </Link>
      </div>

      {/* Features Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold mb-12 text-center">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="text-4xl mb-4">🧠</div>
              <h4 className="text-xl font-bold mb-2">AI-Powered Learning</h4>
              <p className="text-gray-600">
                Personalized lessons adapted to your learning style and pace
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <div className="text-4xl mb-4">🎮</div>
              <h4 className="text-xl font-bold mb-2">Gamification</h4>
              <p className="text-gray-600">
                Earn XP, build streaks, and level up as you progress
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="text-4xl mb-4">💬</div>
              <h4 className="text-xl font-bold mb-2">Social Learning</h4>
              <p className="text-gray-600">
                Practice with language chat rooms and get real-time feedback
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
              <div className="text-4xl mb-4">📊</div>
              <h4 className="text-xl font-bold mb-2">Smart Analytics</h4>
              <p className="text-gray-600">
                Identify weak areas and focus on what you need to improve
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg">
              <div className="text-4xl mb-4">✍️</div>
              <h4 className="text-xl font-bold mb-2">Interactive Quizzes</h4>
              <p className="text-gray-600">
                Test your knowledge with AI-generated quizzes and explanations
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-6 rounded-lg">
              <div className="text-4xl mb-4">🚀</div>
              <h4 className="text-xl font-bold mb-2">Fast Progress</h4>
              <p className="text-gray-600">
                Learn faster with AI-generated content tailored to your level
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to start learning?</h3>
          <p className="text-lg mb-8">Join thousands of learners and master Spanish today</p>
          <Link
            href="/signup"
            className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition"
          >
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2024 LinguaAI. Powered by AI learning technology.</p>
          <BottomBackButton fallbackHref="/" />
        </div>
      </footer>
    </div>
  );
}
