// Question type detection and validation utilities

export type QuestionType = 
  | 'standard' 
  | 'ordering' 
  | 'dropdown-command' 
  | 'case-study'
  | 'dropdown-single';

export interface ParsedDropdown {
  parts: string[];
  dropdowns: string[][];
}

/**
 * Detects question type from question text using pattern matching
 */
export function detectQuestionType(question: string): QuestionType {
  const lower = question.toLowerCase();
  
  // Order-based questions
  if (
    lower.includes('arrange') ||
    lower.includes('order the') ||
    lower.includes('sequence') ||
    lower.includes('correct order')
  ) {
    return 'ordering';
  }
  
  // Case study (look for scenario indicators)
  if (
    lower.includes('case study') ||
    lower.includes('scenario:') ||
    (lower.includes('company') && lower.length > 300)
  ) {
    return 'case-study';
  }
  
  // Command completion with blanks
  if (
    (lower.includes('complete') || lower.includes('fill')) &&
    (lower.includes('command') || lower.includes('cli') || lower.includes('powershell') || lower.includes('az '))
  ) {
    return 'dropdown-command';
  }
  
  // Single dropdown (command-line or sequence selection)
  if (
    lower.includes('which command') ||
    lower.includes('select the correct') ||
    (lower.includes('___') || lower.includes('[select]'))
  ) {
    return 'dropdown-single';
  }
  
  return 'standard';
}

/**
 * Parse command text with blanks for dropdown rendering
 */
export function parseCommandWithBlanks(
  question: string, 
  options: string[]
): ParsedDropdown {
  const parts: string[] = [];
  const dropdowns: string[][] = [];
  
  // Match patterns like ___, [select], or {blank}
  const regex = /(___|{[^}]+}|\[select\])/gi;
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(question)) !== null) {
    parts.push(question.slice(lastIndex, match.index));
    dropdowns.push(options);
    lastIndex = regex.lastIndex;
  }
  
  parts.push(question.slice(lastIndex));
  
  return { parts, dropdowns };
}

/**
 * Validates user answer against correct answers based on question type
 */
export function validateAnswerByType(
  userAnswer: string[],
  correctAnswers: string[],
  questionType: QuestionType
): boolean {
  if (!userAnswer || userAnswer.length === 0) {
    return false;
  }
  
  switch (questionType) {
    case 'ordering':
      // Must match exact order
      if (userAnswer.length !== correctAnswers.length) return false;
      return userAnswer.every((ans, idx) => ans === correctAnswers[idx]);
    
    case 'dropdown-command':
      // Each dropdown selection must match
      if (userAnswer.length !== correctAnswers.length) return false;
      return userAnswer.every((ans, idx) => ans === correctAnswers[idx]);
    
    case 'standard':
    case 'dropdown-single':
    case 'case-study':
      // Multi-select: all correct answers must be selected, no extras
      if (correctAnswers.length > 1) {
        return (
          userAnswer.length === correctAnswers.length &&
          userAnswer.every(ans => correctAnswers.includes(ans))
        );
      }
      // Single select: must match the one correct answer
      return userAnswer.length === 1 && userAnswer[0] === correctAnswers[0];
    
    default:
      return false;
  }
}

/**
 * Extract the option text from a full option string like "A) Some text"
 */
export function extractOptionText(option: string): string {
  // Remove the letter prefix (A), B), etc.)
  return option.replace(/^[A-D]\)\s*/, '').trim();
}

/**
 * Get the letter label from an option string
 */
export function extractOptionLabel(option: string): string {
  const match = option.match(/^([A-D])\)/);
  return match ? match[1] : '';
}
