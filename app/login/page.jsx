'use client';

import BottomBackButton from '@/components/BottomBackButton';
import LoginForm from '@/components/LoginForm';

/**
 * Login page for user authentication
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <LoginForm />
      </div>
      <BottomBackButton fallbackHref="/" />
    </div>
  );
}
