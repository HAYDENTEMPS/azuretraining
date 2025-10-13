'use client';

import { useState, useEffect, useRef } from 'react';
import type { Domain, SearchResult } from '@/types';
import { getDomainAnchor } from '@/utils/guide/anchors';
import SearchBox from './SearchBox';

interface GuidePaneProps {
  content: string;
  currentDomain?: Domain;
  onContentLoad?: () => void;
  className?: string;
}

/**
 * Guide pane component for displaying study material
 * Includes search functionality and domain-specific navigation
 */
export default function GuidePane({ 
  content, 
  currentDomain, 
  onContentLoad, 
  className = '' 
}: GuidePaneProps) {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [highlightedContent, setHighlightedContent] = useState(content);
  const [isLoading, setIsLoading] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load content and call onContentLoad callback
  useEffect(() => {
    if (content) {
      setHighlightedContent(content);
      setIsLoading(false);
      onContentLoad?.();
    }
  }, [content, onContentLoad]);

  // Navigate to domain section when currentDomain changes
  useEffect(() => {
    if (currentDomain && contentRef.current) {
      const anchor = getDomainAnchor(currentDomain);
      if (anchor) {
        // Try to find the anchor in the content
        const element = contentRef.current.querySelector(`#${anchor.anchor}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Fallback: search for heading text
          const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
          const targetHeading = Array.from(headings).find(h => 
            h.textContent?.toLowerCase().includes(currentDomain.toLowerCase()) ||
            h.textContent?.toLowerCase().includes(anchor.title.toLowerCase())
          );
          if (targetHeading) {
            targetHeading.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    }
  }, [currentDomain]);

  /**
   * Handle search results and highlight matches in content
   */
  const handleSearchResults = (results: SearchResult[]) => {
    setSearchResults(results);

    if (results.length === 0) {
      // No search - show original content
      setHighlightedContent(content);
      return;
    }

    // Highlight search matches in content
    let highlighted = content;
    const uniqueTerms = new Set<string>();

    // Extract search terms from all results
    results.forEach(result => {
      // Simple term extraction - could be improved
      result.text.split(/\s+/).forEach(word => {
        const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
        if (cleanWord.length > 2) {
          uniqueTerms.add(cleanWord);
        }
      });
    });

    // Apply highlights
    uniqueTerms.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<mark class="search-highlight">${term}</mark>`);
    });

    setHighlightedContent(highlighted);

    // Scroll to first result
    if (results.length > 0) {
      setTimeout(() => {
        const firstHighlight = contentRef.current?.querySelector('.search-highlight');
        if (firstHighlight) {
          firstHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  /**
   * Jump to a specific search result
   */
  const jumpToResult = (result: SearchResult) => {
    // Find the text in the content and scroll to it
    if (contentRef.current) {
      const textElements = contentRef.current.querySelectorAll('p, div, span, h1, h2, h3, h4, h5, h6');
      const targetElement = Array.from(textElements).find(el => 
        el.textContent?.includes(result.text.substring(0, 50))
      );
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-azure-600 dark:border-azure-400 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading study guide...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 ${className}`}>
      {/* Search header */}
      <div className="flex-shrink-0 p-4 border-b bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <SearchBox
          content={content}
          onSearchResults={handleSearchResults}
          placeholder="Search guide content..."
          className="mb-3"
        />
        
        {/* Search results summary */}
        {searchResults.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Found {searchResults.length} relevant section{searchResults.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Domain indicator */}
        {currentDomain && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-azure-100 text-azure-800 dark:bg-azure-900/50 dark:text-azure-200">
              📍 {currentDomain} Section
            </span>
          </div>
        )}
      </div>

      {/* Search results (when searching) */}
      {searchResults.length > 0 && (
        <div className="flex-shrink-0 max-h-32 overflow-y-auto border-b bg-blue-50 dark:bg-blue-900/20 dark:border-gray-600">
          <div className="p-3 space-y-2">
            {searchResults.slice(0, 3).map((result, index) => (
              <button
                key={index}
                onClick={() => jumpToResult(result)}
                className="text-left w-full p-2 text-xs bg-white border rounded hover:bg-blue-50 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-blue-900/30"
              >
                <div className="font-medium text-azure-700 mb-1 dark:text-azure-300">
                  Result {index + 1} (Score: {result.score.toFixed(1)})
                </div>
                <div className="text-gray-600 line-clamp-2 dark:text-gray-300">
                  {result.text.substring(0, 120)}...
                </div>
              </button>
            ))}
            {searchResults.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                +{searchResults.length - 3} more results...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Guide content */}
      <div className="flex-1 overflow-y-auto">
        <div 
          ref={contentRef}
          className="guide-content p-6 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: highlightedContent }}
        />
      </div>

      {/* Footer with controls */}
      <div className="flex-shrink-0 p-4 border-t bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600 dark:text-gray-300">
            💡 Use search to find specific topics quickly
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-azure-600 hover:text-azure-700 transition-colors dark:text-azure-400 dark:hover:text-azure-300"
            >
              ⬆️ Top
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
