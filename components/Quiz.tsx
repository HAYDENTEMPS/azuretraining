'use client';

import { useState } from 'react';
import type { Question, QuizMode, PenaltyType } from '@/types';
import { useQuiz } from '@/hooks/useQuiz';
import { formatTime } from '@/utils/scoring';
import QuestionCard from './QuestionCard';
import ProgressBar from './ProgressBar';
import ModeToggle from './ModeToggle';

interface QuizProps {
  questions: Question[];
  initialMode?: QuizMode;
  className?: string;
}

/**
 * Main quiz controller component
 * Manages quiz flow, settings, and state transitions
 */
export default function Quiz({ questions, initialMode = 'practice', className = '' }: QuizProps) {
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    selectedAnswers,
    isSubmitted,
    isCorrect,
    showHint,
    hintsUsed,
    wrongAnswers,
    elapsedTime,
    progress,
    isQuizComplete,
    mode,
    settings,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    showHintAction,
    restartQuiz,
    setMode,
    updateSettings,
    getQuizSummary
  } = useQuiz(questions, initialMode);

  const summary = isQuizComplete ? getQuizSummary() : null;

  // Settings panel handlers
  const handlePenaltyTypeChange = (penaltyType: PenaltyType) => {
    updateSettings({ penaltyType });
  };

  // Quiz complete screen
  if (isQuizComplete && summary) {
    return (
      <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
        <div className="card text-center space-y-6">
          <div className="space-y-4">
            <div className="text-6xl">
              {summary.isPerfectRun ? '🏆' : summary.score >= 70 ? '🎉' : '📚'}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {summary.isPerfectRun ? 'Perfect Run!' : 'Quiz Complete!'}
            </h1>
            {summary.isPerfectRun && (
              <p className="text-lg text-green-600 dark:text-green-400 font-semibold">
                New personal best saved! 🌟
              </p>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b dark:border-gray-600">
            <div className="text-center">
              <div className="text-2xl font-bold text-azure-600 dark:text-azure-400">
                {summary.score.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-azure-600 dark:text-azure-400">
                {formatTime(summary.totalTime)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-azure-600 dark:text-azure-400">
                {summary.hintsUsed}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hints Used</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-azure-600 dark:text-azure-400">
                {summary.missedQuestions.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Missed</div>
            </div>
          </div>

          {/* Missed questions (if any) */}
          {summary.missedQuestions.length > 0 && (
            <div className="text-left space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 text-center">
                Review Missed Questions
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {summary.missedQuestions.map((missed, index) => (
                  <div key={missed.question.id} className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-700/50">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-red-800 dark:text-red-300">#{index + 1}:</span>
                        <p className="text-red-900 dark:text-red-200 font-medium leading-relaxed">
                          {missed.question.question}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-red-800 dark:text-red-300">Your answer{missed.selectedAnswers.length > 1 ? 's' : ''}:</span>
                          <div className="text-red-700 dark:text-red-400">
                            {missed.selectedAnswers.join(', ')}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-green-800 dark:text-green-300">Correct answer{missed.correctAnswers.length > 1 ? 's' : ''}:</span>
                          <div className="text-green-700 dark:text-green-400 font-semibold">
                            {missed.correctAnswers.join(', ')}
                          </div>
                        </div>
                      </div>

                      {missed.question.explanation && (
                        <div className="border-t border-red-200 dark:border-red-700/50 pt-3">
                          <span className="font-medium text-red-800 dark:text-red-300 block mb-1">Explanation:</span>
                          <p className="text-red-700 dark:text-red-200 text-sm leading-relaxed">
                            {missed.question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <button 
              onClick={restartQuiz}
              className="btn-primary text-lg px-8 py-3"
            >
              Start New Quiz
            </button>
            <a 
              href="/guide"
              className="btn-secondary text-lg px-8 py-3 text-center"
            >
              📖 Study Guide
            </a>
            <a 
              href="/"
              className="btn-secondary text-lg px-8 py-3 text-center"
            >
              🏠 Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz interface
  return (
    <div className={`max-w-4xl mx-auto space-y-6 ${className}`}>
      {/* Quiz header */}
      <div className="card space-y-4">
        {/* Progress and timer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <ProgressBar 
              current={currentQuestionIndex + 1}
              total={totalQuestions}
              progress={progress}
            />
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            {/* Timer */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 dark:text-gray-400">⏱️</span>
              <span className="font-mono text-lg font-semibold dark:text-gray-100">
                {formatTime(elapsedTime)}
              </span>
            </div>
            
            {/* Hints counter (practice mode only) */}
            {mode === 'practice' && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">💡</span>
                <span className="font-semibold">{hintsUsed}</span>
              </div>
            )}
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-azure-100 text-azure-800">
              {mode === 'practice' ? '📚 Practice' : '📝 Exam'} Mode
            </span>
            {wrongAnswers > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {wrongAnswers} restart{wrongAnswers !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="btn-secondary text-sm"
              aria-expanded={showSettings}
            >
              ⚙️ Settings
            </button>
            <button 
              onClick={restartQuiz}
              className="btn-danger text-sm"
              title="Restart quiz (R key)"
            >
              🔄 Restart
            </button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="border-t pt-4 space-y-4 animate-slide-up">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Quiz Settings</h3>
            
            {/* Mode selector */}
            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Quiz Mode:</h4>
              <ModeToggle 
                currentMode={mode}
                onModeChange={setMode}
              />
            </div>

            {/* Penalty settings (practice mode only) */}
            {mode === 'practice' && (
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Hint Penalty:</h4>
                <div className="space-y-2">
                  {[
                    { key: 'none' as const, label: 'No Penalty', description: 'Hints don\'t affect score or time' },
                    { key: 'score' as const, label: 'Score Penalty', description: '2% deducted per hint used' },
                    { key: 'time' as const, label: 'Time Penalty', description: '10 seconds added per hint used' }
                  ].map(penalty => (
                    <label key={penalty.key} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="penalty"
                        value={penalty.key}
                        checked={settings.penaltyType === penalty.key}
                        onChange={() => handlePenaltyTypeChange(penalty.key)}
                        className="mt-1 text-azure-600 focus:ring-azure-500"
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {penalty.label}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {penalty.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current question */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          selectedAnswers={selectedAnswers}
          isSubmitted={isSubmitted}
          isCorrect={isCorrect}
          showHint={showHint}
          mode={mode}
          onSelectAnswer={selectAnswer}
          onSubmit={submitAnswer}
          onNext={nextQuestion}
          onRestart={restartQuiz}
          onShowHint={showHintAction}
        />
      )}

      {/* Keyboard shortcuts reminder */}
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 no-print">
        💡 Tip: Use <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">1-4</kbd> to select, {' '}
        <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Enter</kbd> to submit/continue, {' '}
        <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">N</kbd> for next (when correct), {' '}
        <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">H</kbd> for hint, {' '}
        <kbd className="bg-gray-100 dark:bg-gray-700 px-1 rounded">R</kbd> to restart
      </div>
    </div>
  );
}
