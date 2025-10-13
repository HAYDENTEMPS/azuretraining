import type { PenaltyType, QuizStats } from '@/types';

/**
 * Calculate quiz score based on correct answers and penalty settings
 * Base score is percentage of correct answers
 * Penalties are applied based on hint usage
 */
export function calculateScore(
  correctAnswers: number,
  totalQuestions: number,
  hintsUsed: number,
  penaltyType: PenaltyType
): number {
  // Base score as percentage
  const baseScore = (correctAnswers / totalQuestions) * 100;
  
  // Apply penalty based on type
  switch (penaltyType) {
    case 'score':
      // Subtract 2% per hint used
      const scorePenalty = hintsUsed * 2;
      return Math.max(0, baseScore - scorePenalty);
    
    case 'time':
      // Time penalty doesn't affect score calculation
      return baseScore;
    
    case 'none':
    default:
      return baseScore;
  }
}

/**
 * Calculate time penalty in seconds
 * Adds 10 seconds per hint used when penalty type is 'time'
 */
export function calculateTimePenalty(
  actualTimeSeconds: number,
  hintsUsed: number,
  penaltyType: PenaltyType
): number {
  if (penaltyType === 'time') {
    return actualTimeSeconds + (hintsUsed * 10);
  }
  return actualTimeSeconds;
}

/**
 * Format time from seconds to mm:ss format
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate comprehensive quiz statistics
 */
export function calculateQuizStats(
  totalQuestions: number,
  questionsAnswered: number,
  correctAnswers: number,
  hintsUsed: number,
  startTime: number,
  endTime: number,
  penaltyType: PenaltyType
): QuizStats {
  const actualTime = Math.floor((endTime - startTime) / 1000);
  const totalTime = calculateTimePenalty(actualTime, hintsUsed, penaltyType);
  const score = calculateScore(correctAnswers, totalQuestions, hintsUsed, penaltyType);
  const isPerfectRun = correctAnswers === totalQuestions && questionsAnswered === totalQuestions;

  return {
    totalQuestions,
    questionsAnswered,
    correctAnswers,
    hintsUsed,
    totalTime,
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    isPerfectRun
  };
}
