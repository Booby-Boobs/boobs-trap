'use client';

import { useState } from 'react';
import Captcha from '../components/Captcha';

export default function Home() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [phase, setPhase] = useState('landing');

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white">
      <div className="flex-1 flex items-center justify-center">
        <Captcha onTimer={setElapsedTime} onPhase={setPhase} />
      </div>
      {phase === 'challenge' && (
        <div className="fixed bottom-4 right-4 z-[100] pointer-events-none">
          <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded font-mono" style={{ fontSize: '10px' }}>
            Wasted Time: {elapsedTime.toFixed(2)}s
          </div>
        </div>
      )}
    </div>
  );
}