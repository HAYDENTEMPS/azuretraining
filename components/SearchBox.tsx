'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SearchResult } from '@/types';

interface SearchBoxProps {
  content: string;
  onSearchResults: (_results: SearchResult[]) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Fuzzy search component for guide content
 * Searches through HTML content and highlights matches
 */
export default function SearchBox({ 
  content, 
  onSearchResults, 
  placeholder = 'Search guide content...', 
  className = '' 
}: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  /**
   * Strip HTML tags from text for searching
   */
  const stripHtml = useCallback((html: string): string => {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }, []);

  /**
   * Perform fuzzy search on content
   * Returns matches with context and scoring
   */
  const performSearch = useCallback((searchQuery: string): SearchResult[] => {
    if (!searchQuery.trim()) return [];

    const plainContent = stripHtml(content);
    const words = searchQuery.toLowerCase().split(/\s+/);
    const results: SearchResult[] = [];

    // Split content into paragraphs for context
    const paragraphs = plainContent.split(/\n\s*\n/);

    paragraphs.forEach((paragraph, index) => {
      const lowerParagraph = paragraph.toLowerCase();
      let score = 0;
      let matchCount = 0;

      // Check for exact phrase match (higher score)
      if (lowerParagraph.includes(searchQuery.toLowerCase())) {
        score += 10;
        matchCount++;
      }

      // Check for individual word matches
      words.forEach(word => {
        if (word.length > 2 && lowerParagraph.includes(word)) {
          score += 5;
          matchCount++;
        }
      });

      // Fuzzy matching - check for partial matches
      words.forEach(word => {
        if (word.length > 3) {
          // Check for word variants (simple fuzzy matching)
          const variations = [
            word.slice(0, -1), // Remove last character
            word.slice(1),     // Remove first character  
            word + 's',        // Add plural
            word.slice(0, -1) + (word.slice(-1) === 's' ? '' : 's'), // Toggle plural
          ];
          
          variations.forEach(variation => {
            if (variation.length > 2 && lowerParagraph.includes(variation)) {
              score += 2;
              matchCount++;
            }
          });
        }
      });

      // Only include results with matches
      if (matchCount > 0 && paragraph.trim().length > 20) {
        results.push({
          text: paragraph.trim(),
          index,
          score: score / matchCount // Normalize by match count
        });
      }
    });

    // Sort by score (descending) and take top 10 results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [content, stripHtml]);

  /**
   * Debounced search function
   */
  useEffect(() => {
    if (!query.trim()) {
      onSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      const results = performSearch(query);
      onSearchResults(results);
      setIsSearching(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, onSearchResults, performSearch]);

  /**
   * Clear search
   */
  const clearSearch = () => {
    setQuery('');
    onSearchResults([]);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400 dark:text-gray-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Search input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-azure-500 focus:border-azure-500 
            transition-colors duration-200
            dark:bg-gray-600 dark:border-gray-500 dark:text-gray-100 
            dark:placeholder-gray-300 dark:focus:ring-azure-400 dark:focus:border-azure-400
          "
          aria-label="Search guide content"
        />

        {/* Loading indicator or clear button */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isSearching ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-azure-600 dark:border-azure-400"></div>
          ) : query.trim() ? (
            <button
              onClick={clearSearch}
              className="text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-300 dark:hover:text-gray-100"
              aria-label="Clear search"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Search tips */}
      {query.trim() === '' && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          💡 Search for Azure services, concepts, or topics to find relevant sections
        </div>
      )}
    </div>
  );
}
