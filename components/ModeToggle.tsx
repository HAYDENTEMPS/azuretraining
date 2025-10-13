'use client';

import type { QuizMode } from '@/types';

interface ModeToggleProps {
  currentMode: QuizMode;
  onModeChange: (_mode: QuizMode) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Toggle component for switching between Practice and Exam modes
 * Shows mode-specific features and restrictions
 */
export default function ModeToggle({ currentMode, onModeChange, disabled = false, className = '' }: ModeToggleProps) {
  const modes: { key: QuizMode; label: string; description: string; icon: string }[] = [
    {
      key: 'practice',
      label: 'Practice Mode',
      description: 'Hints enabled, explanations shown, penalties applied',
      icon: '📚'
    },
    {
      key: 'exam',
      label: 'Exam Mode', 
      description: 'No hints, explanations at end only, no penalties',
      icon: '📝'
    }
  ];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modes.map((mode) => (
          <button
            key={mode.key}
            onClick={() => onModeChange(mode.key)}
            disabled={disabled}
            className={`
              p-4 rounded-lg border-2 text-left transition-all duration-200 focus-ring
              ${currentMode === mode.key
                ? 'border-azure-500 bg-azure-100 text-azure-900 dark:border-azure-400 dark:bg-azure-900/50 dark:text-azure-200'
                : 'border-gray-200 hover:border-azure-300 hover:bg-azure-50 dark:border-gray-600 dark:hover:border-azure-400 dark:hover:bg-azure-900/30'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-pressed={currentMode === mode.key}
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl" role="img" aria-label={mode.label}>
                {mode.icon}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base mb-1">
                  {mode.label}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed dark:text-gray-300">
                  {mode.description}
                </p>
              </div>
            </div>
            
            {currentMode === mode.key && (
              <div className="mt-2 flex items-center text-azure-700 dark:text-azure-300">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Active</span>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Mode comparison */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm dark:bg-gray-700">
        <h4 className="font-medium text-gray-900 mb-2 dark:text-gray-100">Mode Features:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-azure-700 mb-1 dark:text-azure-300">Practice Mode</h5>
            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
              <li>• Hints available</li>
              <li>• Immediate explanations</li>
              <li>• Penalty system active</li>
              <li>• Perfect runs tracked</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-azure-700 mb-1 dark:text-azure-300">Exam Mode</h5>
            <ul className="space-y-1 text-gray-600 dark:text-gray-300">
              <li>• No hints allowed</li>
              <li>• End-of-quiz explanations</li>
              <li>• No penalties</li>
              <li>• Simulates real exam</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
