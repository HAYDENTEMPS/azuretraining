'use client';

import { useEffect, useState } from 'react';
import GuideClient from './GuideClient';
import { useExam } from '@/contexts/ExamContext';

/**
 * Guide page component - fully client-side to avoid SSR issues
 * Fetches guide content from API route
 */
export default function GuidePage() {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedExam, examConfig } = useExam();

  useEffect(() => {
    loadGuide();
  }, [selectedExam]); // Reload when exam changes

  /**
   * Load guide content from API route
   */
  const loadGuide = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`Loading guide for ${selectedExam}...`);
      const response = await fetch(`/api/guide?exam=${selectedExam}`);
      
      if (!response.ok) {
        throw new Error(`Failed to load guide: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setHtmlContent(data.content || '');

    } catch (err) {
      console.error('Error loading guide:', err);
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading Study Guide...</h2>
          <p className="text-gray-600 dark:text-gray-300">Processing {examConfig.name} documentation</p>
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
            <div className="text-6xl">📖</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Guide Unavailable</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We couldn't load the study guide. This might be a temporary issue.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left dark:bg-red-900/20 dark:border-red-700/50">
              <h3 className="font-semibold text-red-800 mb-2 dark:text-red-300">Error Details:</h3>
              <p className="text-red-700 text-sm dark:text-red-200">{error}</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={loadGuide}
                className="btn-primary w-full"
              >
                🔄 Try Again
              </button>
              <a 
                href="/quiz"
                className="btn-secondary w-full text-center block"
              >
                📝 Start Quiz
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

  // Success - render the guide content
  return <GuideClient htmlContent={htmlContent} />;
}
