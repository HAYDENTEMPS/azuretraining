import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeToggle from '@/components/ThemeToggle';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AZ-104 Quiz App',
  description: 'Interactive Azure AZ-104 certification quiz with integrated study guide',
  keywords: ['Azure', 'AZ-104', 'Microsoft', 'Certification', 'Quiz', 'Study'],
  authors: [{ name: 'Azure Study Team' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                  document.documentElement.classList.add('dark');
                }
              }
            })();
          `
        }} />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-full">
          {/* Navigation header */}
          <nav className="bg-white shadow-sm border-b border-gray-100 dark:bg-gray-800 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl font-bold text-azure-700 dark:text-azure-300">
                    AZ-104 Quiz App
                  </h1>
                </div>
                
                <div className="hidden sm:flex items-center space-x-4">
                  <a 
                    href="/" 
                    className="text-gray-600 hover:text-azure-700 px-3 py-2 rounded-md text-sm font-medium transition-colors
                             dark:text-gray-300 dark:hover:text-azure-300"
                  >
                    Home
                  </a>
                  <a 
                    href="/quiz" 
                    className="text-gray-600 hover:text-azure-700 px-3 py-2 rounded-md text-sm font-medium transition-colors
                             dark:text-gray-300 dark:hover:text-azure-300"
                  >
                    Quiz
                  </a>
                  <a 
                    href="/guide" 
                    className="text-gray-600 hover:text-azure-700 px-3 py-2 rounded-md text-sm font-medium transition-colors
                             dark:text-gray-300 dark:hover:text-azure-300"
                  >
                    Study Guide
                  </a>
                  <a 
                    href="/study" 
                    className="text-gray-600 hover:text-azure-700 px-3 py-2 rounded-md text-sm font-medium transition-colors
                             dark:text-gray-300 dark:hover:text-azure-300"
                  >
                    Study Mode
                  </a>
                  <ThemeToggle />
                </div>

                {/* Mobile menu button - simplified for now */}
                <div className="sm:hidden flex items-center space-x-2">
                  <ThemeToggle />
                  <button
                    type="button"
                    className="text-gray-600 hover:text-azure-700 p-2 rounded-md
                             dark:text-gray-300 dark:hover:text-azure-300"
                    aria-label="Open menu"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-gray-50 border-t border-gray-200 mt-auto dark:bg-gray-800 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>AZ-104 Microsoft Azure Administrator Certification Quiz</p>
                <p className="mt-1">
                  Use keyboard shortcuts: <span className="font-mono bg-gray-100 px-1 rounded dark:bg-gray-700">1-4</span> select, {' '}
                  <span className="font-mono bg-gray-100 px-1 rounded dark:bg-gray-700">Enter</span> submit, {' '}
                  <span className="font-mono bg-gray-100 px-1 rounded dark:bg-gray-700">H</span> hint, {' '}
                  <span className="font-mono bg-gray-100 px-1 rounded dark:bg-gray-700">R</span> restart
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
