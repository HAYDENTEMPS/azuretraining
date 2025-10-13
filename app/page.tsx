import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import type { QuizData } from '@/types';
import UpdateExplanationsButton from './components/UpdateExplanationsButton';

// Home page component with quiz stats and mode selection
export default function HomePage() {
  // Load questions to get count
  let questionsCount = 0;
  try {
    const questionsPath = path.join(process.cwd(), 'app', 'azureQuestions', 'az204.json');
    const questionsFile = fs.readFileSync(questionsPath, 'utf-8');
    const quizData: QuizData = JSON.parse(questionsFile);
    questionsCount = quizData.questions?.length || quizData.meta?.count || 0;
  } catch (error) {
    console.error('Error loading questions:', error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-azure-50 to-blue-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero section */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <div className="text-6xl mb-4">⚡</div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              AZ-104 Quiz Master
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Master the Azure Administrator certification with interactive quizzes, 
              first-class hints, and an integrated study guide.
            </p>
          </div>
          
          {questionsCount > 0 && (
            <div className="inline-flex items-center px-4 py-2 bg-azure-100 text-azure-800 dark:bg-azure-900/50 dark:text-azure-200 rounded-full text-sm font-medium">
              📚 {questionsCount} practice questions available
            </div>
          )}
        </div>

        {/* Quick stats - these will be populated by client-side component */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Best Practice Score</h3>
            <div id="best-practice-score" className="text-2xl font-bold text-azure-600 dark:text-azure-400">
              --
            </div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Best Practice Time</h3>
            <div id="best-practice-time" className="text-2xl font-bold text-azure-600 dark:text-azure-400">
              --:--
            </div>
          </div>
          
          <div className="card text-center">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Best Exam Time</h3>
            <div id="best-exam-time" className="text-2xl font-bold text-azure-600 dark:text-azure-400">
              --:--
            </div>
          </div>
        </div>

        {/* Action cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Practice Mode */}
          <div className="card hover:shadow-xl transition-shadow duration-300">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Practice Mode</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Learn with hints, immediate feedback, and detailed explanations. 
                Perfect for building knowledge and confidence.
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mr-2">✓</span>
                Hints available for challenging questions
              </div>
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mr-2">✓</span>
                Immediate explanations after each answer
              </div>
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mr-2">✓</span>
                Configurable penalty system for hints
              </div>
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <span className="text-green-500 mr-2">✓</span>
                Perfect run tracking and personal bests
              </div>
            </div>
            
            <Link 
              href="/quiz?mode=practice"
              className="btn-primary w-full text-center text-lg py-3 block"
            >
              Start Practice Quiz
            </Link>
          </div>

          {/* Exam Mode */}
          <div className="card hover:shadow-xl transition-shadow duration-300">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">📝</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Exam Mode</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Simulate the real AZ-104 exam experience with no hints, 
                timed challenges, and end-of-quiz explanations.
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <span className="text-azure-500 mr-2">⚡</span>
                No hints or assistance during quiz
              </div>
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <span className="text-azure-500 mr-2">⚡</span>
                Explanations shown only at the end
              </div>
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <span className="text-azure-500 mr-2">⚡</span>
                Real exam simulation experience
              </div>
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <span className="text-azure-500 mr-2">⚡</span>
                Timer tracks your completion speed
              </div>
            </div>
            
            <Link 
              href="/quiz?mode=exam"
              className="btn-primary w-full text-center text-lg py-3 block"
            >
              Start Exam Mode
            </Link>
          </div>
        </div>

        {/* Study resources */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Study Guide */}
          <Link 
            href="/guide" 
            className="card hover:shadow-xl transition-shadow duration-300 block text-center"
          >
            <div className="text-4xl mb-3">📖</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Study Guide</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Complete AZ-104 reference with searchable content and 
              deep-links from quiz questions.
            </p>
            <div className="mt-4 text-azure-600 dark:text-azure-400 font-medium">
              Browse Guide →
            </div>
          </Link>

          {/* Study Mode */}
          <Link 
            href="/study" 
            className="card hover:shadow-xl transition-shadow duration-300 block text-center"
          >
            <div className="text-4xl mb-3">🔬</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Study Mode</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Split-screen interface with quiz questions on the left 
              and synchronized study guide on the right.
            </p>
            <div className="mt-4 text-azure-600 dark:text-azure-400 font-medium">
              Enter Study Mode →
            </div>
          </Link>
        </div>

        {/* Features highlight */}
        <div className="mt-16 card bg-gradient-to-r from-azure-50 to-blue-50 dark:bg-gradient-to-r dark:from-gray-800 dark:to-slate-700">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              🚀 Powerful Features for Efficient Learning
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Smart Shuffling</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Questions are randomized every session with Fisher-Yates algorithm
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-2">⌨️</div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Keyboard Shortcuts</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Use 1-4 to select, Enter to submit, H for hints, R to restart
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl mb-2">🎯</div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Instant Feedback</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Get immediate results with detailed explanations and guidance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Update Explanations Tool */}
        <UpdateExplanationsButton />

      </div>
      
      {/* Client-side script to load stats */}
      <script dangerouslySetInnerHTML={{
        __html: `
          (function() {
            function formatTime(seconds) {
              const minutes = Math.floor(seconds / 60);
              const remainingSeconds = seconds % 60;
              return minutes.toString().padStart(2, '0') + ':' + remainingSeconds.toString().padStart(2, '0');
            }
            
            function loadStats() {
              try {
                // Load practice stats
                const practiceTime = localStorage.getItem('az104-best-practice-time');
                const practiceScore = localStorage.getItem('az104-best-practice-score');
                const examTime = localStorage.getItem('az104-best-exam-time');
                
                if (practiceScore) {
                  const score = JSON.parse(practiceScore);
                  document.getElementById('best-practice-score').textContent = score.score.toFixed(1) + '%';
                }
                
                if (practiceTime) {
                  const time = JSON.parse(practiceTime);
                  document.getElementById('best-practice-time').textContent = formatTime(time.time);
                }
                
                if (examTime) {
                  const time = JSON.parse(examTime);
                  document.getElementById('best-exam-time').textContent = formatTime(time.time);
                }
              } catch (error) {
                console.log('No stored stats yet');
              }
            }
            
            // Load stats when page is ready
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', loadStats);
            } else {
              loadStats();
            }
          })();
        `
      }} />
    </div>
  );
}
