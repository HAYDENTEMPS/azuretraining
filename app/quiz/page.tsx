'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Quiz from '@/components/Quiz';
import type { Question, QuizMode } from '@/types';
import { useEffect, useState } from 'react';
import { useExam } from '@/contexts/ExamContext';

/**
 * Quiz page content component
 */
function QuizPageContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { selectedExam, examConfig } = useExam();
  
  // Get initial mode from URL params
  const mode = (searchParams.get('mode') as QuizMode) || 'practice';

  useEffect(() => {
    loadQuestions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExam]); // Reload when exam changes

  /**
   * Load questions from the API endpoint
   */
  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Loading questions for ${selectedExam}...`);
      const response = await fetch(`/api/questions?exam=${selectedExam}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load questions: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('Invalid question data format');
      }

      if (data.questions.length === 0) {
        throw new Error('No questions found in the dataset');
      }

      setQuestions(data.questions);
      console.log(`Loaded ${data.questions.length} questions for ${selectedExam}`);

    } catch (err) {
      console.error('Error loading questions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-azure-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-600 dark:border-azure-400 mx-auto"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading Quiz...</h2>
          <p className="text-gray-600 dark:text-gray-300">Preparing your {examConfig.name} questions</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-azure-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="card space-y-6">
            <div className="text-6xl">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quiz Unavailable</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We couldn't load the quiz questions. This might be a temporary issue.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left dark:bg-red-900/20 dark:border-red-700/50">
              <h3 className="font-semibold text-red-800 mb-2 dark:text-red-300">Error Details:</h3>
              <p className="text-red-700 text-sm dark:text-red-200">{error}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={loadQuestions}
                className="btn-primary w-full"
              >
                🔄 Try Again
              </button>
              <a 
                href="/guide"
                className="btn-secondary w-full text-center block"
              >
                📖 Study Guide
              </a>
              <a 
                href="/"
                className="btn-secondary w-full text-center block"
              >
                🏠 Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-azure-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {examConfig.name} Quiz
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Test your {examConfig.title} knowledge with practice questions
          </p>
        </div>
        
        <Quiz questions={questions} initialMode={mode} />
      </div>
    </div>
  );
}

/**
 * Loading fallback component
 */
function QuizPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-azure-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-600 dark:border-azure-400 mx-auto"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading Quiz...</h2>
        <p className="text-gray-600 dark:text-gray-300">Preparing your questions</p>
      </div>
    </div>
  );
}

/**
 * Quiz page component with Suspense boundary for useSearchParams
 */
export default function QuizPage() {
  return (
    <Suspense fallback={<QuizPageLoading />}>
      <QuizPageContent />
    </Suspense>
  );
}
