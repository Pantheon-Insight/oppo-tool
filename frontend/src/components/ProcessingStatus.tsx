'use client';

const MESSAGES = [
  'Reading document...',
  'Extracting attacks...',
  'Matching to universes...',
  'Generating results...',
];

interface ProcessingStatusProps {
  progress: number;
}

export function ProcessingStatus({ progress }: ProcessingStatusProps) {
  const messageIndex = Math.floor((progress / 100) * MESSAGES.length);
  const currentMessage = MESSAGES[Math.min(messageIndex, MESSAGES.length - 1)];

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-8">
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                i * 25 <= progress ? 'bg-blue-500 scale-100' : 'bg-slate-600 scale-75'
              }`}
              style={{
                animation: i * 25 <= progress ? 'pulse 0.6s ease-in-out' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <p className="text-xl text-slate-300 mb-4 font-semibold">{currentMessage}</p>

      <div className="w-full max-w-xs bg-slate-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-sm text-slate-400 mt-4">{Math.round(progress)}%</p>
    </div>
  );
}
