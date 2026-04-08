import { Suspense } from 'react';
import HomeContent from './HomeContent';

function LoadingFallback() {
  return (
    <div
      className="h-screen w-screen flex items-center justify-center"
      style={{ backgroundColor: '#F7F3E8' }}
    >
      <div className="text-center">
        <div className="inline-block">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600">Loading your workspace...</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeContent />
    </Suspense>
  );
}
