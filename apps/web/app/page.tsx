'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    __TAURI__?: unknown;
  }
}

export default function HomePage() {
  const [isClient, setIsClient] = useState(false);
  const [platform, setPlatform] = useState<string>('');

  useEffect(() => {
    setIsClient(true);
    // Check if running in Tauri
    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
      setPlatform('Tauri Desktop');
    } else {
      setPlatform('Web Browser');
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to VayBooks
        </h1>
        
        <div className="text-center space-y-4">
          <p className="text-xl text-gray-600">
            Business Management Software
          </p>
          
          {isClient && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-500">
                Platform: {platform}
              </p>
              <p className="text-sm text-gray-500">
                Version: 1.0.0
              </p>
            </div>
          )}
          
          <div className="mt-12">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
