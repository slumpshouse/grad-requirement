'use client';

import { useRouter } from 'next/navigation';

export default function BottomBackButton({ fallbackHref = '/', label = 'Back' }) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  };

  return (
    <div className="fixed left-4 top-4 z-50 sm:left-6 sm:top-6">
      <button
        type="button"
        onClick={handleBack}
        className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-gray-700 shadow-sm transition hover:bg-gray-50"
      >
        {label}
      </button>
    </div>
  );
}