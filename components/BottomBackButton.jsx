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
    <div className="mt-8 flex justify-center">
      <button
        type="button"
        onClick={handleBack}
        className="px-5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      >
        {label}
      </button>
    </div>
  );
}