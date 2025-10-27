'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Quiz from '@/components/Quiz';
import GuidePane from '@/components/GuidePane';
import type { Question, QuizMode } from '@/types';
import { useExam } from '@/contexts/ExamContext';

/**
 * Study page content component
 */
function StudyPageContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [guideContent, setGuideContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const searchParams = useSearchParams();
  const { selectedExam, examConfig } = useExam();
  
  // Get initial mode from URL params, default to practice for study mode
  const mode = (searchParams.get('mode') as QuizMode) || 'practice';

  useEffect(() => {
    loadData();
  }, [selectedExam]); // Reload when exam changes

  /**
   * Load both questions and guide content
   */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load questions and guide content in parallel for selected exam
      const [questionsResponse, guideResponse] = await Promise.all([
        fetch(`/api/questions?exam=${selectedExam}`),
        fetch(`/api/guide?exam=${selectedExam}`)
      ]);

      // Check questions response
      if (!questionsResponse.ok) {
        throw new Error(`Failed to load questions: ${questionsResponse.statusText}`);
      }

      const questionsData = await questionsResponse.json();
      if (!questionsData.questions || !Array.isArray(questionsData.questions)) {
        throw new Error('Invalid question data format');
      }

      setQuestions(questionsData.questions);

      // Handle guide response - it's okay if guide fails
      if (guideResponse.ok) {
        const guideData = await guideResponse.json();
        setGuideContent(guideData.content || '');
      } else {
        console.warn('Guide content not available, using fallback');
        setGuideContent(`<h1>Study Guide</h1><p>Guide content for ${examConfig.name} is loading...</p>`);
      }

    } catch (err) {
      console.error('Error loading study data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load study materials');
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading Study Mode...</h2>
          <p className="text-gray-600 dark:text-gray-300">Preparing {examConfig.name} quiz questions and study guide</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-azure-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="card space-y-6">
            <div className="text-6xl">🔬</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Study Mode Unavailable
            </h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {error || 'We couldn\'t load the study materials. Please try the individual quiz or guide pages instead.'}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={loadData}
                className="btn-primary w-full"
              >
                🔄 Try Again
              </button>
              
              <div className="flex gap-2">
                <a 
                  href="/quiz"
                  className="btn-secondary flex-1 text-center"
                >
                  📝 Quiz Only
                </a>
                <a 
                  href="/guide"
                  className="btn-secondary flex-1 text-center"
                >
                  📖 Guide Only
                </a>
              </div>
              
              <a 
                href="/"
                className="btn-secondary w-full text-center"
              >
                🏠 Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Study mode interface
  return (
    <div className="min-h-screen bg-white dark:bg-gray-800">
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-4 sm:px-6 py-3 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              🔬 Study Mode - {examConfig.name}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-azure-100 text-azure-800 dark:bg-azure-900/50 dark:text-azure-200">
              {mode === 'practice' ? '📚 Practice' : '📝 Exam'}
            </span>
            {currentDomain && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                📍 {currentDomain}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <a 
              href="/quiz"
              className="btn-secondary text-sm"
            >
              📝 Quiz Only
            </a>
            <a 
              href="/guide"
              className="btn-secondary text-sm"
            >
              📖 Guide Only
            </a>
            <a 
              href="/"
              className="btn-secondary text-sm"
            >
              🏠 Home
            </a>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          💡 Quiz questions automatically sync with relevant guide sections. Use split panes to study efficiently.
        </div>
      </div>

      {/* Split pane layout */}
      <div className="flex h-[calc(100vh-120px)]">
        
        {/* Quiz pane (left side) */}
        <div className="flex-1 min-w-0 border-r border-gray-200 overflow-y-auto dark:border-gray-600 dark:bg-gray-800">
          <div className="p-4">
            <StudyQuizWrapper 
              questions={questions} 
              initialMode={mode}
              onCurrentDomainChange={setCurrentDomain}
            />
          </div>
        </div>

        {/* Guide pane (right side) */}
        <div className="flex-1 min-w-0">
          <GuidePane
            content={guideContent}
            currentDomain={currentDomain as any}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Wrapper component for the quiz that reports current domain changes
 */
function StudyQuizWrapper({ 
  questions, 
  initialMode, 
  onCurrentDomainChange 
}: {
  questions: Question[];
  initialMode: QuizMode;
  onCurrentDomainChange: (_domain: string) => void;
}) {
  const [currentQuestionIndex, _setCurrentQuestionIndex] = useState(0);

  // Update domain when question changes
  useEffect(() => {
    if (questions[currentQuestionIndex]) {
      onCurrentDomainChange(questions[currentQuestionIndex].domain);
    }
  }, [currentQuestionIndex, questions, onCurrentDomainChange]);

  return (
    <div className="space-y-4">
      {/* Study mode specific controls */}
      <div className="bg-azure-50 border border-azure-200 rounded-lg p-4 dark:bg-azure-900/20 dark:border-azure-700/50">
        <div className="flex items-start space-x-2">
          <span className="text-azure-600 text-lg dark:text-azure-400">🔬</span>
          <div>
            <h3 className="font-medium text-azure-800 mb-1 dark:text-azure-300">Study Mode Active</h3>
            <p className="text-azure-700 text-sm dark:text-azure-200">
              The guide pane will automatically navigate to sections related to your current question's domain.
              Use this to study context while practicing questions.
            </p>
          </div>
        </div>
      </div>

      {/* Quiz component */}
      <Quiz 
        questions={questions} 
        initialMode={initialMode}
        className="max-w-none" // Remove max-width constraint for split layout
      />
    </div>
  );
}

/**
 * Loading fallback component
 */
function StudyPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-azure-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-600 dark:border-azure-400 mx-auto"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading Study Mode...</h2>
        <p className="text-gray-600 dark:text-gray-300">Preparing quiz questions and study guide</p>
      </div>
    </div>
  );
}

/**
 * Study mode page with split pane interface
 * Shows quiz on the left and synchronized guide on the right
 */
export default function StudyPage() {
  return (
    <Suspense fallback={<StudyPageLoading />}>
      <StudyPageContent />
    </Suspense>
  );
}
