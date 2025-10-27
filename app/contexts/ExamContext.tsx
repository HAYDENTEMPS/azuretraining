'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ExamType = 'az104' | 'az204' | 'az500';

interface ExamConfig {
  id: ExamType;
  name: string;
  title: string;
  jsonFile: string;
  docxFile: string;
}

export const EXAM_CONFIGS: Record<ExamType, ExamConfig> = {
  az104: {
    id: 'az104',
    name: 'AZ-104',
    title: 'Azure Administrator',
    jsonFile: 'az104.json',
    docxFile: 'AZ-104_Cram_Complete_with_Part4.docx'
  },
  az204: {
    id: 'az204',
    name: 'AZ-204',
    title: 'Azure Developer',
    jsonFile: 'az204.json',
    docxFile: 'AZ-204_Cram_Complete.docx'
  },
  az500: {
    id: 'az500',
    name: 'AZ-500',
    title: 'Azure Security Engineer',
    jsonFile: 'az500.json',
    docxFile: 'AZ-500_Cram_Complete.docx'
  }
};

interface ExamContextType {
  selectedExam: ExamType;
  setSelectedExam: (exam: ExamType) => void;
  examConfig: ExamConfig;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const STORAGE_KEY = 'azure-quiz-selected-exam';

export function ExamProvider({ children }: { children: ReactNode }) {
  const [selectedExam, setSelectedExamState] = useState<ExamType>('az104');
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ExamType;
    if (stored && EXAM_CONFIGS[stored]) {
      setSelectedExamState(stored);
    }
    setMounted(true);
  }, []);

  // Save to localStorage when changed
  const setSelectedExam = (exam: ExamType) => {
    setSelectedExamState(exam);
    localStorage.setItem(STORAGE_KEY, exam);
  };

  const examConfig = EXAM_CONFIGS[selectedExam];

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ExamContext.Provider value={{ selectedExam, setSelectedExam, examConfig }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
}
