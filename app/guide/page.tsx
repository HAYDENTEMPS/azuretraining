'use client';

import { useEffect, useState } from 'react';
import GuideClient from './GuideClient';

/**
 * Guide page component - fully client-side to avoid SSR issues
 * Fetches guide content from API route
 */
export default function GuidePage() {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGuide();
  }, []);

  /**
   * Load guide content from API route
   */
  const loadGuide = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/guide');
      
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
          <p className="text-gray-600 dark:text-gray-300">Processing AZ-104 guide content</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-azure-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card text-center space-y-6">
            <div className="text-6xl">📖</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Study Guide Error</h1>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              We couldn't load the AZ-104 study guide. Please check that the guide file is available.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left dark:bg-red-900/20 dark:border-red-700/50">
              <h3 className="font-semibold text-red-800 mb-2 dark:text-red-300">Error Details:</h3>
              <p className="text-red-700 text-sm font-mono dark:text-red-200">{error}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={loadGuide}
                className="btn-primary"
              >
                🔄 Try Again
              </button>
              <a href="/quiz" className="btn-primary">
                📝 Take Quiz Instead
              </a>
              <a href="/" className="btn-secondary">
                🏠 Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state with guide content
  return (
    <div className="min-h-screen bg-gradient-to-br from-azure-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            📖 AZ-104 Study Guide
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Comprehensive study guide for Azure Administrator certification. 
            Use search to quickly find specific topics or browse through sections.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <a href="/quiz" className="btn-primary">
            📝 Take Quiz
          </a>
          <a href="/study" className="btn-primary">
            🔬 Study Mode
          </a>
          <a href="/" className="btn-secondary">
            🏠 Home
          </a>
        </div>

        {/* Guide Content */}
        <div className="card">
          <GuideClient htmlContent={htmlContent} />
        </div>
      </div>
    </div>
  );
}
