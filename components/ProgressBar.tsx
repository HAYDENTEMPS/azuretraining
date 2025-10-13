'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  progress: number; // percentage 0-100
  className?: string;
}

/**
 * Progress bar component showing quiz progress
 * Displays current question number and visual progress bar
 */
export default function ProgressBar({ current, total, progress, className = '' }: ProgressBarProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Question counter */}
      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
        <span>Question {current} of {total}</span>
        <span>{Math.round(progress)}% complete</span>
      </div>
      
      {/* Visual progress bar */}
      <div className="progress-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <div 
          className="progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}
