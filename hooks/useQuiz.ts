'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Question, QuizState, QuizMode, QuizStats, QuizSummary, MissedQuestion, QuizSettings } from '@/types';
import { shuffleQuestionsWithOptions, reshuffleQuestions } from '@/utils/shuffle';
import { calculateQuizStats } from '@/utils/scoring';
import { getSettings, saveSettings, savePerfectRun } from '@/utils/storage';
import { detectQuestionType, validateAnswerByType } from '@/utils/questionTypes';

/**
 * Custom hook for managing quiz state and logic
 * Handles question flow, answer validation, timing, and mode-specific behavior
 * Now supports dynamic question types: standard, ordering, dropdown-command, case-study, dropdown-single
 */
export function useQuiz(questions: Question[], initialMode: QuizMode = 'practice') {
  // Initialize settings from localStorage
  const [settings, setSettings] = useState<QuizSettings>(() => getSettings());

  // Core quiz state
  const [state, setState] = useState<QuizState>(() => ({
    questions: shuffleQuestionsWithOptions(questions),
    currentQuestionIndex: 0,
    selectedAnswers: [],
    isSubmitted: false,
    isCorrect: null,
    showHint: false,
    hintsUsed: 0,
    wrongAnswers: 0,
    startTime: Date.now(),
    endTime: null,
    mode: initialMode,
    settings
  }));

  // Timer state (in seconds)
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Track missed questions for summary
  const [missedQuestions, setMissedQuestions] = useState<MissedQuestion[]>([]);

  // Update settings when they change
  useEffect(() => {
    setState(prev => ({ ...prev, settings }));
    saveSettings(settings);
  }, [settings]);

  // Timer effect - runs every second when quiz is active
  useEffect(() => {
    if (state.endTime) return; // Quiz finished
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - state.startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.startTime, state.endTime]);

  // Current question
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isQuizComplete = state.currentQuestionIndex >= state.questions.length;
  const progress = ((state.currentQuestionIndex + (state.isSubmitted ? 1 : 0)) / state.questions.length) * 100;

  /**
   * Validate if selected answers match correct answers
   * Enhanced to support different question types with appropriate validation
   */
  const validateAnswers = useCallback((selected: string[], correct: string[], question: any): boolean => {
    const questionType = detectQuestionType(question.question);
    
    // For ordering and dropdown questions, answers come as comma-separated string
    if (questionType === 'ordering' || questionType === 'dropdown-command') {
      // Parse comma-separated answers if needed
      const selectedArray = selected.length === 1 && selected[0].includes(',') 
        ? selected[0].split(',').filter(s => s.trim())
        : selected;
      
      return validateAnswerByType(selectedArray, correct, questionType);
    }
    
    // Use type-aware validation for all question types
    return validateAnswerByType(selected, correct, questionType);
  }, []);

  /**
   * Restart quiz with reshuffled questions
   * Resets all progress and state
   */
  const restartQuiz = useCallback(() => {
    const reshuffled = reshuffleQuestions(questions);
    setState(prev => ({
      ...prev,
      questions: reshuffled,
      currentQuestionIndex: 0,
      selectedAnswers: [],
      isSubmitted: false,
      isCorrect: null,
      showHint: false,
      hintsUsed: 0,
      wrongAnswers: prev.wrongAnswers + 1,
      startTime: Date.now(),
      endTime: null
    }));
    setElapsedTime(0);
    setMissedQuestions([]);
  }, [questions]);

  /**
   * Select/deselect an answer option
   * Enhanced to handle different question types:
   * - Standard: toggle single/multi-select
   * - Ordering: receives comma-separated string of ordered labels
   * - Dropdown: receives comma-separated string of selections
   */
  const selectAnswer = useCallback((option: string) => {
    if (state.isSubmitted || !currentQuestion) return;

    const questionType = detectQuestionType(currentQuestion.question);

    setState(prev => {
      // For ordering and dropdown questions, replace the entire answer
      if (questionType === 'ordering' || questionType === 'dropdown-command' || questionType === 'dropdown-single') {
        // Option contains comma-separated values or single value
        const answers = option.includes(',') ? option.split(',').filter(s => s.trim()) : [option];
        return { ...prev, selectedAnswers: answers };
      }

      // Standard multi-select: toggle option
      if (currentQuestion.multi_select) {
        const newSelected = prev.selectedAnswers.includes(option)
          ? prev.selectedAnswers.filter(a => a !== option)
          : [...prev.selectedAnswers, option];
        return { ...prev, selectedAnswers: newSelected };
      } 
      
      // Standard single-select: replace selection
      return { ...prev, selectedAnswers: [option] };
    });
  }, [state.isSubmitted, currentQuestion]);

  /**
   * Submit current question and check answer
   * No longer auto-advances - user must click Next button
   */
  const submitAnswer = useCallback(() => {
    if (state.isSubmitted || !currentQuestion || state.selectedAnswers.length === 0) return;

    const isCorrect = validateAnswers(state.selectedAnswers, currentQuestion.displayCorrectAnswers, currentQuestion);
    
    setState(prev => ({ ...prev, isSubmitted: true, isCorrect }));

    // If wrong answer, add to missed questions
    if (!isCorrect) {
      setMissedQuestions(prev => [...prev, {
        question: currentQuestion,
        selectedAnswers: state.selectedAnswers,
        correctAnswers: currentQuestion.displayCorrectAnswers
      }]);
    }
  }, [state.isSubmitted, state.selectedAnswers, currentQuestion, validateAnswers]);

  /**
   * Move to next question manually
   * Called when user clicks the Next button
   */
  const nextQuestion = useCallback(() => {
    if (!state.isSubmitted) return;

    if (state.currentQuestionIndex < state.questions.length - 1) {
      // Move to next question
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        selectedAnswers: [],
        isSubmitted: false,
        isCorrect: null,
        showHint: false
      }));
    } else {
      // Quiz complete
      setState(prev => ({ ...prev, endTime: Date.now() }));
    }
  }, [state.isSubmitted, state.currentQuestionIndex, state.questions.length]);

  /**
   * Show hint for current question (if available and allowed by mode)
   * Increments hint usage count for penalty calculation
   */
  const showHint = useCallback(() => {
    if (state.mode === 'exam' || !currentQuestion?.hint || state.showHint) return;
    
    setState(prev => ({
      ...prev,
      showHint: true,
      hintsUsed: prev.hintsUsed + 1
    }));
  }, [state.mode, state.showHint, currentQuestion]);

  /**
   * Change quiz mode (Practice/Exam)
   * Resets quiz state when mode changes
   */
  const setMode = useCallback((mode: QuizMode) => {
    setState(prev => ({ ...prev, mode }));
    restartQuiz();
  }, [restartQuiz]);

  /**
   * Update penalty settings
   */
  const updateSettings = useCallback((newSettings: Partial<QuizSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  /**
   * Calculate final quiz statistics
   */
  const getQuizStats = useCallback((): QuizStats | null => {
    if (!state.endTime) return null;

    const correctCount = state.currentQuestionIndex + 1; // All answered questions were correct
    return calculateQuizStats(
      state.questions.length,
      correctCount,
      correctCount,
      state.hintsUsed,
      state.startTime,
      state.endTime,
      state.settings.penaltyType
    );
  }, [state]);

  /**
   * Get comprehensive quiz summary including missed questions
   */
  const getQuizSummary = useCallback((): QuizSummary | null => {
    const stats = getQuizStats();
    if (!stats) return null;

    // Save perfect run if applicable
    if (stats.isPerfectRun) {
      savePerfectRun(stats.score, stats.totalTime, state.mode);
    }

    return {
      ...stats,
      missedQuestions
    };
  }, [getQuizStats, missedQuestions, state.mode]);

  /**
   * Keyboard shortcuts handler
   * 1-4: Select options A-D (standard questions only)
   * Enter: Submit answer, or next question if correct, or restart if incorrect
   * H: Toggle hint (if available)
   * R: Restart quiz
   * N: Next question (after correct submission only)
   */
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!currentQuestion) return;

    const questionType = detectQuestionType(currentQuestion.question);

    switch (event.key.toLowerCase()) {
      case '1':
      case '2':
      case '3':
      case '4':
        // Only allow number shortcuts for standard questions
        if (questionType === 'standard' || questionType === 'case-study') {
          event.preventDefault();
          const optionIndex = parseInt(event.key) - 1;
          const optionLetter = ['A', 'B', 'C', 'D'][optionIndex];
          selectAnswer(optionLetter);
        }
        break;
      
      case 'enter':
        event.preventDefault();
        if (state.isSubmitted) {
          // After submission: next if correct, restart if incorrect
          if (state.isCorrect) {
            nextQuestion();
          } else {
            restartQuiz();
          }
        } else if (state.selectedAnswers.length > 0) {
          submitAnswer();
        }
        break;
      
      case 'n':
        event.preventDefault();
        if (state.isSubmitted && state.isCorrect) {
          nextQuestion();
        }
        break;
      
      case 'h':
        event.preventDefault();
        showHint();
        break;
      
      case 'r':
        event.preventDefault();
        restartQuiz();
        break;
    }
  }, [currentQuestion, state.selectedAnswers, state.isSubmitted, state.isCorrect, selectAnswer, submitAnswer, nextQuestion, showHint, restartQuiz]);

  // Set up keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return {
    // State
    currentQuestion,
    currentQuestionIndex: state.currentQuestionIndex,
    totalQuestions: state.questions.length,
    selectedAnswers: state.selectedAnswers,
    isSubmitted: state.isSubmitted,
    isCorrect: state.isCorrect,
    showHint: state.showHint,
    hintsUsed: state.hintsUsed,
    wrongAnswers: state.wrongAnswers,
    elapsedTime,
    progress,
    isQuizComplete,
    mode: state.mode,
    settings,

    // Actions
    selectAnswer,
    submitAnswer,
    nextQuestion,
    showHintAction: showHint,
    restartQuiz,
    setMode,
    updateSettings,

    // Stats & Summary
    getQuizStats,
    getQuizSummary
  };
}
