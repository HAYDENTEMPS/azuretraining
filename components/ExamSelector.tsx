'use client';

import { useExam, EXAM_CONFIGS, ExamType } from '@/contexts/ExamContext';
import { useState, useRef, useEffect } from 'react';

export default function ExamSelector() {
  const { selectedExam, setSelectedExam, examConfig } = useExam();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleExamChange = (exam: ExamType) => {
    setSelectedExam(exam);
    setIsOpen(false);
    
    // Reload the page to fetch new data
    window.location.reload();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-azure-600 text-white rounded-lg hover:bg-azure-700 
                   transition-colors duration-200 font-medium text-sm
                   dark:bg-azure-700 dark:hover:bg-azure-600"
        aria-label="Select exam"
        aria-expanded={isOpen}
      >
        <span>{examConfig.name}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl 
                      border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="py-1">
            {Object.values(EXAM_CONFIGS).map((exam) => (
              <button
                key={exam.id}
                onClick={() => handleExamChange(exam.id)}
                className={`w-full text-left px-4 py-3 transition-colors duration-150
                  ${selectedExam === exam.id 
                    ? 'bg-azure-50 text-azure-700 dark:bg-azure-900/50 dark:text-azure-300' 
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{exam.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{exam.title}</div>
                  </div>
                  {selectedExam === exam.id && (
                    <svg className="w-5 h-5 text-azure-600 dark:text-azure-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
