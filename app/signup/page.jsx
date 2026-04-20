'use client';

import BottomBackButton from '@/components/BottomBackButton';
import SignupForm from '@/components/SignupForm';

/**
 * Signup page for new user registration
 */
export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <SignupForm />
      </div>
      <BottomBackButton fallbackHref="/" />
    </div>
  );
}
