'use client';

import { useState, useEffect } from 'react';
import type { SearchResult } from '@/types';
import SearchBox from '@/components/SearchBox';

interface GuideClientProps {
  htmlContent: string;
}

/**
 * Client-side guide component with search and navigation
 * Handles interactivity for the server-rendered guide content
 */
export default function GuideClient({ htmlContent }: GuideClientProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [highlightedContent, setHighlightedContent] = useState(htmlContent);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    setHighlightedContent(htmlContent);
  }, [htmlContent]);

  // Scroll tracking for active section highlighting
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const scrollPosition = window.scrollY + 100;

      let current = '';
      headings.forEach((heading) => {
        const element = heading as HTMLElement;
        if (element.offsetTop <= scrollPosition) {
          current = element.id || '';
        }
      });

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * Handle search results and highlight content
   */
  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);

    if (results.length === 0) {
      setHighlightedContent(htmlContent);
      return;
    }

    // Extract search terms and highlight them
    let highlighted = htmlContent;
    const allTerms = new Set<string>();

    results.forEach(result => {
      // Simple term extraction - split by spaces and filter
      result.text.toLowerCase().split(/\s+/).forEach(word => {
        const clean = word.replace(/[^\w]/g, '');
        if (clean.length > 2) {
          allTerms.add(clean);
        }
      });
    });

    // Apply highlights
    allTerms.forEach(term => {
      const regex = new RegExp(`\\b(${term})\\b`, 'gi');
      highlighted = highlighted.replace(regex, '<mark class="search-highlight">$1</mark>');
    });

    setHighlightedContent(highlighted);

    // Auto-scroll to first result
    setTimeout(() => {
      const firstHighlight = document.querySelector('.search-highlight');
      if (firstHighlight) {
        firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  /**
   * Generate table of contents from headings
   */
  const generateTableOfContents = () => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const headings = tempDiv.querySelectorAll('h1, h2, h3, h4');
    
    return Array.from(headings).map((heading, index) => ({
      id: heading.id || `heading-${index}`,
      text: heading.textContent || '',
      level: parseInt(heading.tagName.charAt(1))
    }));
  };

  const tableOfContents = generateTableOfContents();

  /**
   * Scroll to a specific section
   */
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex">
      
      {/* Sidebar with search and TOC */}
      <div className="hidden lg:block w-80 bg-white border-r border-gray-200 sticky top-16 h-screen overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-6">
          
          {/* Search */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">🔍 Search Guide</h3>
            <SearchBox
              content={htmlContent}
              onSearchResults={handleSearchResults}
              placeholder="Search topics, services, concepts..."
            />
            
            {searchResults.length > 0 && (
              <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                Found {searchResults.length} relevant section{searchResults.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Table of Contents */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">📋 Contents</h3>
            <nav className="space-y-1">
              {tableOfContents.slice(0, 20).map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`
                    block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors
                    ${item.level === 1 ? 'font-semibold' : ''}
                    ${item.level === 2 ? 'ml-2' : ''}
                    ${item.level === 3 ? 'ml-4' : ''}
                    ${item.level === 4 ? 'ml-6' : ''}
                    ${activeSection === item.id 
                      ? 'bg-azure-100 text-azure-800 font-medium dark:bg-azure-900/50 dark:text-azure-200' 
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  {item.text.length > 40 ? item.text.substring(0, 40) + '...' : item.text}
                </button>
              ))}
              
              {tableOfContents.length > 20 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 px-3 py-1">
                  +{tableOfContents.length - 20} more sections...
                </div>
              )}
            </nav>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">⚡ Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
              >
                ⬆️ Back to Top
              </button>
              <button
                onClick={() => window.print()}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-gray-700"
              >
                🖨️ Print Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        
        {/* Mobile search (hidden on desktop) */}
        <div className="lg:hidden bg-white border-b p-4 dark:bg-gray-800 dark:border-gray-700">
          <SearchBox
            content={htmlContent}
            onSearchResults={handleSearchResults}
            placeholder="Search guide..."
          />
          {searchResults.length > 0 && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>

        {/* Guide content */}
        <div className="px-6 py-8 lg:px-12 lg:py-12">
          <div 
            className="guide-content prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
          />
          
          {/* Footer navigation */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-600">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                📚 AZ-104 Microsoft Azure Administrator Study Guide
              </div>
              
              <div className="flex items-center space-x-3">
                <a 
                  href="/quiz"
                  className="btn-primary text-sm"
                >
                  📝 Practice Quiz
                </a>
                <a 
                  href="/study"
                  className="btn-secondary text-sm"
                >
                  🔬 Study Mode
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
