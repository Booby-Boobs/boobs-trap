'use client';

import { useState, useEffect, useRef } from 'react';
import boobsTrapImage from '../app/images/boobs-trap.png';

interface ImageItem {
  src: string;
  despair: boolean;
}

interface CaptchaProps {
  onTimer?: (time: number) => void;
  onPhase?: (phase: string) => void;
}

const images: ImageItem[] = [
  { src: 'https://via.placeholder.com/100/000000/FFFFFF?text=Sad+Office+Worker', despair: true },
  { src: 'https://via.placeholder.com/100/808080/FFFFFF?text=Cold+Coffee', despair: true },
  { src: 'https://via.placeholder.com/100/0000FF/FFFFFF?text=Blue+Screen+of+Death', despair: true },
  { src: 'https://via.placeholder.com/100/FFFF00/FFFFFF?text=Pizza+Time', despair: false },
  { src: 'https://via.placeholder.com/100/FF0000/FFFFFF?text=Netflix+Binge', despair: false },
  { src: 'https://via.placeholder.com/100/00FF00/FFFFFF?text=Cat+Videos', despair: false },
  { src: 'https://via.placeholder.com/100/FFA500/FFFFFF?text=Beer+O%27Clock', despair: false },
  { src: 'https://via.placeholder.com/100/800080/FFFFFF?text=Nap+Time', despair: false },
  { src: 'https://via.placeholder.com/100/FFC0CB/FFFFFF?text=Scroll+Social+Media', despair: false },
  { src: 'https://via.placeholder.com/100/800000/FFFFFF?text=Overwork', despair: true },
  { src: 'https://via.placeholder.com/100/808000/FFFFFF?text=Deadline', despair: true },
  { src: 'https://via.placeholder.com/100/008080/FFFFFF?text=Meeting', despair: true },
  { src: 'https://via.placeholder.com/100/800080/FFFFFF?text=Vacation', despair: false },
  { src: 'https://via.placeholder.com/100/008000/FFFFFF?text=Free+Time', despair: false },
  { src: 'https://via.placeholder.com/100/000080/FFFFFF?text=Sleep', despair: false },
  { src: 'https://via.placeholder.com/100/80/FFFFFF?text=Chill', despair: false },
];

type Phase = 'landing' | 'wait' | 'challenge' | 'result' | 'leaderboard';

export default function Captcha({ onTimer, onPhase }: CaptchaProps) {
  const [phase, setPhase] = useState<Phase>('landing');
  const [selected, setSelected] = useState<number[]>([]);
  const [verifyEnabled, setVerifyEnabled] = useState(false);
  const [challengeStart, setChallengeStart] = useState(0);
  const [passed, setPassed] = useState(false);
  const [error, setError] = useState('');
  const [waitStartTime, setWaitStartTime] = useState(0);
  const currentTimeRef = useRef(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [scoreSaved, setScoreSaved] = useState(false);

  const handleCheckbox = () => {
    setWaitStartTime(Date.now());
    setPhase('wait');
    onPhase?.('wait');
    setTimeout(() => {
      setPhase('challenge');
      onPhase?.('challenge');
      setSelected([]);
      setVerifyEnabled(false);
      setError('');
      currentTimeRef.current = 0;
      onTimer?.(0);
      setTimerRunning(true);
      setChallengeStart(Date.now());
    }, 7000);
  };

  // Timer effect - updates every 0.1 seconds
  useEffect(() => {
    if (timerRunning) {
      const interval = setInterval(() => {
        currentTimeRef.current += 0.01;
        onTimer?.(currentTimeRef.current);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [timerRunning, onTimer]);

  useEffect(() => {
    if (phase === 'challenge') {
      setChallengeStart(Date.now());
      const timer = setTimeout(() => setVerifyEnabled(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Prevent rushing during wait phase - block all interactions
  useEffect(() => {
    if (phase === 'wait') {
      // Prevent any clicks, keyboard events, or other interactions
      const preventInteraction = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      };
      
      const events = ['click', 'mousedown', 'mouseup', 'keydown', 'keyup', 'touchstart', 'touchend'];
      events.forEach(event => {
        document.addEventListener(event, preventInteraction, { capture: true, passive: false });
      });
      
      return () => {
        events.forEach(event => {
          document.removeEventListener(event, preventInteraction, { capture: true });
        });
      };
    }
  }, [phase, waitStartTime]);

  const toggleSelect = (index: number) => {
    setSelected(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const handleSkip = () => {
    // Reset challenge and start a new one
    setSelected([]);
    setVerifyEnabled(false);
    setError('');

    setChallengeStart(Date.now());
    // Re-enable verify after 5 seconds
    setTimeout(() => setVerifyEnabled(true), 5000);
  };

  const handleVerify = () => {
    if (!verifyEnabled) return;
    const now = Date.now();
    if (now - challengeStart < 5500) {
      setError('Robot reaction time detected.');
      setPassed(false);
      setTimerRunning(false);
      setPhase('result');
      onPhase?.('result');
      return;
    }

    // Get all despair indices
    const despairIndices = images
      .map((img, idx) => img.despair ? idx : -1)
      .filter(idx => idx !== -1);

    // Check if selected exactly matches all despair images
    const selectedSet = new Set(selected);
    const despairSet = new Set(despairIndices);

    // Must select exactly all despair images and nothing else
    const allDespairSelected = despairIndices.every(idx => selectedSet.has(idx));
    const noExtraSelected = selected.length === despairIndices.length;

    setTimerRunning(false);
    if (allDespairSelected && noExtraSelected) {
      setFinalTime(currentTimeRef.current);
      setPassed(true);
      setError('');
      // Load leaderboard
      loadLeaderboard();
    } else {
      setError('Verification Failed. You must select ALL and ONLY the squares with DESPAIR.');
      setPassed(false);
    }
    setPhase('result');
  };

  const loadLeaderboard = async () => {
    const data = await getLeaderboard(10);
    setLeaderboard(data);
  };

  const handleSaveScore = async () => {
    if (!playerName.trim() || scoreSaved) return;
    
    const saved = await saveScore(playerName.trim(), finalTime);
    if (saved) {
      setScoreSaved(true);
      loadLeaderboard();
    }
  };

  const handleViewLeaderboard = () => {
    setPhase('leaderboard');
    loadLeaderboard();
  };



  if (phase === 'landing') {
    return (
      <div className="text-center px-4">
        <img src={boobsTrapImage.src} alt="Boobs Trap" className="mb-4 mx-auto max-w-full h-auto" />
        <label className="flex items-center justify-center cursor-pointer select-none mb-2">
          <input
            type="checkbox"
            onChange={handleCheckbox}
            className="w-5 h-5 mr-3 cursor-pointer accent-blue-600"
          />
          <span className="text-sm text-gray-700">I am a waste of space</span>
        </label>
        <a
          href="/how-to-use"
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          How to use
        </a>
      </div>
    );
  }

  if (phase === 'wait') {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 pointer-events-auto"
        onClick={(e) => {
          // Prevent clicking through the overlay
          if (e.target === e.currentTarget) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-[90%] max-w-[400px] text-center mx-4">
          <svg width="48" height="48" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4">
            <g>
              <rect x="11" y="1" width="2" height="5" opacity=".14"/>
              <rect x="11" y="1" width="2" height="5" transform="rotate(30 12 12)" opacity=".29"/>
              <rect x="11" y="1" width="2" height="5" transform="rotate(60 12 12)" opacity=".43"/>
              <rect x="11" y="1" width="2" height="5" transform="rotate(90 12 12)" opacity=".57"/>
              <rect x="11" y="1" width="2" height="5" transform="rotate(120 12 12)" opacity=".71"/>
              <rect x="11" y="1" width="2" height="5" transform="rotate(150 12 12)" opacity=".86"/>
              <rect x="11" y="1" width="2" height="5" transform="rotate(180 12 12)"/>
              <animateTransform attributeName="transform" type="rotate" calcMode="discrete" dur="0.75s" values="0 12 12;30 12 12;60 12 12;90 12 12;120 12 12;150 12 12;180 12 12;210 12 12;240 12 12;270 12 12;300 12 12;330 12 12;360 12 12" repeatCount="indefinite"/>
            </g>
          </svg>
          <p className="text-sm text-gray-700 font-medium">Please wait...</p>
          <p className="text-xs text-gray-500 mt-1">Loading challenge...</p>
          <p className="text-xs text-gray-400 mt-3 italic">Are you in a hurry? Too bad.</p>
        </div>
      </div>
    );
  }

  if (phase === 'challenge') {
    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = (seconds % 60).toFixed(1);
      return mins > 0 ? `${mins}:${secs.padStart(4, '0')}` : `${secs}s`;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 pointer-events-auto p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-[400px]">
           <div className="bg-[#4285f4]" style={{ marginBottom: '5px' }}>
             <div className="text-white text-left leading-tight" style={{ padding: '10px 16px' }}>
               <div style={{ fontSize: '12px', color: 'white' }} className="sm:text-sm">Select all squares with</div>
               <div style={{ fontSize: '18px', color: 'white', fontWeight: 'bold' }} className="sm:text-xl">DESPAIR</div>
               <div style={{ fontSize: '12px', color: 'white' }} className="sm:text-sm">If there are none, click skip</div>
             </div>
           </div>
           <div className="p-2 sm:p-3">
             <div className="grid grid-cols-4 gap-0.5 sm:gap-1 mb-2">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`relative aspect-square transition-colors ${
                    selected.includes(i) 
                      ? 'border-2 border-blue-600 border-opacity-80' 
                      : 'border-0'
                  } cursor-pointer bg-white`}
                  onClick={() => toggleSelect(i)}
                >
                  <img 
                    src={img.src} 
                    alt={`Image ${i + 1}`} 
                    className="w-full h-full object-cover pointer-events-none" 
                    draggable={false}
                  />
                  {selected.includes(i) && (
                    <div className="absolute inset-0 bg-blue-600 bg-opacity-60 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end pt-2 pr-1 sm:pr-0">
              <button
                onClick={handleSkip}
                type="button"
                className="bg-[#4285f4] hover:bg-[#3367d6] text-white font-medium rounded cursor-pointer transition-colors"
                style={{ 
                  fontSize: '18px',
                  padding: '10px 20px',
                  backgroundColor: '#4285f4',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  lineHeight: '1.3'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#3367d6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4285f4';
                }}
              >
                Skip
              </button>
             </div>
           </div>
         </div>
       </div>
    );
  }

  if (phase === 'result') {
    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = (seconds % 60).toFixed(1);
      return mins > 0 ? `${mins}:${secs.padStart(4, '0')}` : `${secs}s`;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 pointer-events-auto p-4">
        <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-[400px] text-center">
          {passed ? (
            <div>
              <div className="w-14 h-14 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-800 mb-2">Verification Success</h2>
              <p className="text-lg font-mono text-gray-800 mb-4">Time: {formatTime(finalTime)}</p>
              
              {!scoreSaved ? (
                <div className="mb-4">
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="px-3 py-2 border border-gray-300 rounded mb-3 w-full text-sm"
                    maxLength={20}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && playerName.trim()) {
                        handleSaveScore();
                      }
                    }}
                  />
                  <button
                    onClick={handleSaveScore}
                    disabled={!playerName.trim()}
                    className="bg-[#4285f4] hover:bg-[#3367d6] text-white px-6 py-2 rounded text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Save Score
                  </button>
                </div>
              ) : (
                <p className="text-sm text-green-600 mb-4">Score saved!</p>
              )}
              
              <button
                onClick={handleViewLeaderboard}
                className="text-[#4285f4] hover:text-[#3367d6] hover:underline text-sm font-medium mb-4 block"
              >
                View Leaderboard
              </button>
              
              <a 
                href="https://booby.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-[#4285f4] hover:text-[#3367d6] hover:underline text-sm font-medium"
              >
                Enter the rot →
              </a>
            </div>
          ) : (
            <div>
              <div className="w-14 h-14 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-gray-800 mb-2">Verification Failed</h2>
              <p className="text-sm text-gray-600 mb-1">You are too efficient.</p>
              {error && (
                <p className="text-xs text-red-600 mb-4 mt-2 italic">{error}</p>
              )}
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-[#4285f4] hover:text-[#3367d6] hover:underline text-sm font-medium mt-4"
              >
                Improve yourself →
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'leaderboard') {
    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = (seconds % 60).toFixed(1);
      return mins > 0 ? `${mins}:${secs.padStart(4, '0')}` : `${secs}s`;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 pointer-events-auto p-4">
        <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-[500px] max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Leaderboard</h2>
          <div className="space-y-2">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-600 w-8">#{entry.rank}</span>
                    <span className="font-medium text-gray-800">{entry.name}</span>
                  </div>
                  <span className="font-mono text-gray-600">{formatTime(entry.time)}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No scores yet. Be the first!</p>
            )}
          </div>
          <button
            onClick={() => setPhase('landing')}
            className="mt-6 w-full bg-[#4285f4] hover:bg-[#3367d6] text-white px-6 py-2 rounded text-sm font-medium"
          >
            Back to Start
          </button>
        </div>
      </div>
    );
  }

  return null;
}