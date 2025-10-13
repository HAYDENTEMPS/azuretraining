import type { Question, ShuffledQuestion, ShuffledOption } from '@/types';

/**
 * Fisher-Yates shuffle algorithm
 * Shuffles array in place and returns a new shuffled copy
 * This ensures we don't mutate the original questions array
 */
export function shuffleArray<T>(array: T[]): T[] {
  // Create a copy to avoid mutating the original
  const shuffled = [...array];
  
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Shuffle the answer options within a question
 * Maps original A,B,C,D to new randomized positions while tracking the mapping
 */
export function shuffleQuestionOptions(question: Question): ShuffledQuestion {
  const originalLabels = ['A', 'B', 'C', 'D'] as const;
  const displayLabels = ['A', 'B', 'C', 'D'] as const;
  
  // Create options with original labels
  const optionsWithLabels = question.options.map((text, index) => ({
    originalLabel: originalLabels[index],
    text: text.replace(/^[A-D]\)\s*/, '') // Remove any existing option prefix
  }));
  
  // Shuffle the options
  const shuffledOptions = shuffleArray(optionsWithLabels);
  
  // Map to new display structure
  const shuffledOptionsWithDisplay: ShuffledOption[] = shuffledOptions.map((option, index) => ({
    originalLabel: option.originalLabel,
    displayLabel: displayLabels[index],
    text: option.text
  }));
  
  // Create mapping from original to display labels
  const labelMapping = new Map<string, string>();
  shuffledOptionsWithDisplay.forEach(option => {
    labelMapping.set(option.originalLabel, option.displayLabel);
  });
  
  // Map correct answers to new display labels
  const displayCorrectAnswers = question.correct_answers.map(
    originalLabel => labelMapping.get(originalLabel) || originalLabel
  );
  
  return {
    ...question,
    shuffledOptions: shuffledOptionsWithDisplay,
    displayCorrectAnswers
  };
}

/**
 * Shuffle questions and their internal options
 * Returns a new array of shuffled questions with randomized answer options
 */
export function shuffleQuestionsWithOptions(questions: Question[]): ShuffledQuestion[] {
  // First shuffle the order of questions
  const shuffledQuestions = shuffleArray(questions);
  
  // Then shuffle options within each question
  return shuffledQuestions.map(question => shuffleQuestionOptions(question));
}

/**
 * Utility to reshuffle questions for quiz restart
 * Used when a wrong answer is given and quiz needs to restart
 */
export function reshuffleQuestions(questions: Question[]): ShuffledQuestion[] {
  return shuffleQuestionsWithOptions(questions);
}
