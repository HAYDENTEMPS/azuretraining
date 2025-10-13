// Core type definitions for AZ-104 Quiz App

export type Domain = 
  | "Identities" 
  | "Governance" 
  | "Storage" 
  | "Compute" 
  | "Networking" 
  | "Monitoring" 
  | "BackupDR" 
  | "Security" 
  | "Hybrid" 
  | "Cost";

export interface Question {
  id: number;
  domain: Domain;
  question: string;
  options: [string, string, string, string]; // Always 4 options A-D
  multi_select: boolean;
  hint?: string;
  correct_answers: string[]; // e.g., ["A"] or ["A", "C"]
  explanation?: string;
}

export interface ShuffledOption {
  originalLabel: string; // Original A, B, C, or D
  displayLabel: string; // New A, B, C, or D after shuffling
  text: string; // The actual option text
}

export interface ShuffledQuestion extends Omit<Question, 'options'> {
  shuffledOptions: ShuffledOption[];
  displayCorrectAnswers: string[]; // The correct answers in terms of display labels
}

export interface QuizData {
  meta: {
    title: string;
    count: number;
    notes: string;
  };
  questions: Question[];
}

export type QuizMode = "practice" | "exam";

export type PenaltyType = "score" | "time" | "none";

export interface QuizSettings {
  penaltyType: PenaltyType;
}

export interface QuizState {
  questions: ShuffledQuestion[];
  currentQuestionIndex: number;
  selectedAnswers: string[];
  isSubmitted: boolean;
  isCorrect: boolean | null;
  showHint: boolean;
  hintsUsed: number;
  wrongAnswers: number;
  startTime: number;
  endTime: number | null;
  mode: QuizMode;
  settings: QuizSettings;
}

export interface QuizStats {
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  hintsUsed: number;
  totalTime: number;
  score: number;
  isPerfectRun: boolean;
}

export interface PerfectRunRecord {
  score: number;
  time: number; // in seconds
  date: string;
  mode: QuizMode;
}

export interface MissedQuestion {
  question: ShuffledQuestion;
  selectedAnswers: string[];
  correctAnswers: string[];
}

export interface QuizSummary extends QuizStats {
  missedQuestions: MissedQuestion[];
}

// Guide-related types
export interface GuideAnchor {
  domain: Domain;
  anchor: string;
  title: string;
}

export interface SearchResult {
  text: string;
  index: number;
  score: number;
}
