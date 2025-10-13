'use client';

import { useState, useEffect } from 'react';
import type { ShuffledQuestion, QuizMode } from '@/types';
import { getGuideUrl } from '@/utils/guide/anchors';
import { detectQuestionType, parseCommandWithBlanks } from '@/utils/questionTypes';
import dynamic from 'next/dynamic';

// Dynamically import DragDropContext to avoid SSR issues
const DragDropContext = dynamic(
  () => import('@hello-pangea/dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import('@hello-pangea/dnd').then(mod => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import('@hello-pangea/dnd').then(mod => mod.Draggable),
  { ssr: false }
);

interface QuestionCardProps {
  question: ShuffledQuestion;
  selectedAnswers: string[];
  isSubmitted: boolean;
  isCorrect: boolean | null;
  showHint: boolean;
  mode: QuizMode;
  onSelectAnswer: (_option: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  onRestart: () => void;
  onShowHint: () => void;
  className?: string;
}

/**
 * Enhanced Question Card component with dynamic question type detection
 * Supports: standard, ordering, dropdown-command, case-study, dropdown-single
 */
export default function QuestionCard({
  question,
  selectedAnswers,
  isSubmitted,
  isCorrect,
  showHint,
  mode,
  onSelectAnswer,
  onSubmit,
  onNext,
  onRestart,
  onShowHint,
  className = ''
}: QuestionCardProps) {
  const guideUrl = getGuideUrl(question.domain);
  const questionType = detectQuestionType(question.question);
  
  // State for ordering questions
  const [orderedItems, setOrderedItems] = useState<Array<{label: string, text: string}>>([]);
  
  // State for dropdown command questions
  const [dropdownSelections, setDropdownSelections] = useState<string[]>([]);

  // Initialize state based on question type
  useEffect(() => {
    if (questionType === 'ordering') {
      const items = question.shuffledOptions.map(opt => ({
        label: opt.displayLabel,
        text: opt.text
      }));
      setOrderedItems(items);
    } else if (questionType === 'dropdown-command') {
      const optionTexts = question.shuffledOptions.map(opt => opt.text);
      const parsed = parseCommandWithBlanks(question.question, optionTexts);
      setDropdownSelections(new Array(parsed.dropdowns.length).fill(''));
    }
  }, [question, questionType]);

  /**
   * Handle drag end for ordering questions
   */
  const handleDragEnd = (result: any) => {
    if (!result.destination || isSubmitted) return;
    
    const items = Array.from(orderedItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setOrderedItems(items);
    // Update selected answers with the new order (labels only)
    onSelectAnswer(items.map(item => item.label).join(','));
  };

  /**
   * Handle dropdown selection for command questions
   */
  const handleDropdownChange = (index: number, value: string) => {
    const newSelections = [...dropdownSelections];
    newSelections[index] = value;
    setDropdownSelections(newSelections);
    // Store selections as comma-separated labels
    const labels = newSelections.map(text => {
      const option = question.shuffledOptions.find(opt => opt.text === text);
      return option ? option.displayLabel : '';
    });
    onSelectAnswer(labels.join(','));
  };

  /**
   * Handle single dropdown selection
   */
  const handleSingleDropdown = (value: string) => {
    const option = question.shuffledOptions.find(opt => opt.text === value);
    if (option) {
      onSelectAnswer(option.displayLabel);
    }
  };

  /**
   * Get option styling based on state
   */
  const getOptionClassName = (optionLabel: string): string => {
    const isSelected = selectedAnswers.includes(optionLabel);
    const isCorrectOption = question.displayCorrectAnswers.includes(optionLabel);

    if (!isSubmitted) {
      return isSelected ? 'quiz-option-selected' : 'quiz-option-default';
    }

    if (isSelected) {
      return isCorrectOption ? 'quiz-option-correct' : 'quiz-option-incorrect';
    } else if (isCorrectOption) {
      return 'quiz-option-correct';
    }

    return 'quiz-option-disabled';
  };

  /**
   * Get option icon based on state
   */
  const getOptionIcon = (optionLabel: string): string => {
    const isSelected = selectedAnswers.includes(optionLabel);
    const isCorrectOption = question.displayCorrectAnswers.includes(optionLabel);

    if (!isSubmitted) {
      if (question.multi_select) {
        return isSelected ? '☑️' : '☐';
      }
      return isSelected ? '🔘' : '⚪';
    }

    if (isCorrectOption) {
      return '✅';
    } else if (isSelected && !isCorrectOption) {
      return '❌';
    }

    return question.multi_select ? '☐' : '⚪';
  };

  /**
   * Get question type badge text
   */
  const getQuestionTypeBadge = (): string | null => {
    switch (questionType) {
      case 'ordering': return 'Ordering';
      case 'dropdown-command': return 'Command Completion';
      case 'dropdown-single': return 'Dropdown';
      case 'case-study': return 'Case Study';
      default: return null;
    }
  };

  /**
   * Render question UI based on type
   */
  const renderQuestionUI = () => {
    switch (questionType) {
      case 'ordering':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop to arrange in the correct order:
            </p>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="ordering-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {orderedItems.map((item, index) => (
                      <Draggable 
                        key={item.label} 
                        draggableId={item.label} 
                        index={index}
                        isDragDisabled={isSubmitted}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              snapshot.isDragging
                                ? 'border-azure-500 bg-azure-50 dark:bg-azure-900/20 shadow-lg scale-105'
                                : isSubmitted
                                ? question.displayCorrectAnswers[index] === item.label
                                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                  : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-azure-400'
                            } ${isSubmitted ? 'cursor-default' : 'cursor-move'}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full font-semibold text-sm">
                                {index + 1}
                              </span>
                              <span className="flex-grow text-sm">{item.label}) {item.text}</span>
                              {!isSubmitted && (
                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                              )}
                              {isSubmitted && (
                                <span className="text-lg">
                                  {question.displayCorrectAnswers[index] === item.label ? '✅' : '❌'}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        );

      case 'dropdown-command': {
        const optionTexts = question.shuffledOptions.map(opt => opt.text);
        const parsed = parseCommandWithBlanks(question.question, optionTexts);
        
        return (
          <div className="space-y-4">
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              {parsed.parts.map((part, index) => (
                <span key={index}>
                  {part}
                  {index < parsed.dropdowns.length && (
                    <select
                      value={dropdownSelections[index] || ''}
                      onChange={(e) => handleDropdownChange(index, e.target.value)}
                      disabled={isSubmitted}
                      className={`mx-1 px-2 py-1 rounded text-sm ${
                        isSubmitted
                          ? dropdownSelections[index] && question.shuffledOptions.find(opt => opt.text === dropdownSelections[index])?.displayLabel === question.displayCorrectAnswers[index]
                            ? 'bg-green-700 border-green-500'
                            : 'bg-red-700 border-red-500'
                          : 'bg-gray-800 border-gray-600'
                      } border`}
                    >
                      <option value="">--select--</option>
                      {parsed.dropdowns[index].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}
                </span>
              ))}
            </div>
          </div>
        );
      }

      case 'dropdown-single':
        return (
          <div className="space-y-4">
            <select
              value={selectedAnswers[0] ? question.shuffledOptions.find(opt => opt.displayLabel === selectedAnswers[0])?.text || '' : ''}
              onChange={(e) => handleSingleDropdown(e.target.value)}
              disabled={isSubmitted}
              className={`w-full p-3 border-2 rounded-lg text-base ${
                isSubmitted
                  ? isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
              }`}
            >
              <option value="">-- Select an option --</option>
              {question.shuffledOptions.map((option) => (
                <option key={option.displayLabel} value={option.text}>
                  {option.displayLabel}) {option.text}
                </option>
              ))}
            </select>
          </div>
        );

      case 'case-study': {
        // Extract scenario and sub-questions if present
        const sections = question.question.split(/\n\n(?=Question \d+:|Q\d+:)/i);
        const scenario = sections[0];
        const subQuestions = sections.slice(1);
        
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Scenario</h4>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{scenario}</p>
            </div>
            
            {subQuestions.length > 0 && (
              <div className="space-y-4">
                {subQuestions.map((sq, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <p className="font-medium text-sm mb-3">{sq}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Standard options for case study */}
            <div className="space-y-3">
              {question.shuffledOptions.map((shuffledOption) => {
                const optionLabel = shuffledOption.displayLabel;
                const isSelected = selectedAnswers.includes(optionLabel);
                
                return (
                  <button
                    key={optionLabel}
                    type="button"
                    onClick={() => !isSubmitted && onSelectAnswer(optionLabel)}
                    disabled={isSubmitted}
                    className={getOptionClassName(optionLabel)}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {getOptionIcon(optionLabel)}
                      </span>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm text-gray-700 mb-1 dark:text-gray-300">
                          {optionLabel})
                        </div>
                        <div className="text-sm leading-relaxed">
                          {shuffledOption.text}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }

      default:
        // Standard multiple choice
        return (
          <div className="space-y-3">
            {question.shuffledOptions.map((shuffledOption) => {
              const optionLabel = shuffledOption.displayLabel;
              const isSelected = selectedAnswers.includes(optionLabel);
              
              return (
                <button
                  key={optionLabel}
                  type="button"
                  onClick={() => !isSubmitted && onSelectAnswer(optionLabel)}
                  disabled={isSubmitted}
                  className={getOptionClassName(optionLabel)}
                  aria-pressed={isSelected}
                  aria-describedby={`option-${optionLabel}-description`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-lg flex-shrink-0 mt-0.5">
                      {getOptionIcon(optionLabel)}
                    </span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm text-gray-700 mb-1 dark:text-gray-300">
                        {optionLabel})
                      </div>
                      <div id={`option-${optionLabel}-description`} className="text-sm leading-relaxed">
                        {shuffledOption.text}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        );
    }
  };

  return (
    <div className={`card space-y-6 ${className}`}>
      {/* Question header with domain badge */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-azure-100 text-azure-800 dark:bg-azure-900/50 dark:text-azure-200">
                {question.domain}
              </span>
              {question.multi_select && questionType === 'standard' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                  Multiple Select
                </span>
              )}
              {getQuestionTypeBadge() && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
                  {getQuestionTypeBadge()}
                </span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 leading-relaxed dark:text-gray-100">
              {questionType === 'dropdown-command' ? 'Complete the command:' : question.question}
            </h2>
          </div>
          
          {/* Guide link */}
          <a
            href={guideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs whitespace-nowrap no-print"
            title={`Open ${question.domain} section in study guide`}
          >
            📖 Guide
          </a>
        </div>
      </div>

      {/* Question UI */}
      {renderQuestionUI()}

      {/* Hint section */}
      {question.hint && mode === 'practice' && (
        <div className="border-t pt-4">
          {!showHint ? (
            <button
              type="button"
              onClick={onShowHint}
              disabled={isSubmitted}
              className="btn-secondary w-full sm:w-auto"
            >
              💡 Show Hint
            </button>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 dark:bg-amber-900/20 dark:border-amber-700/50">
              <div className="flex items-start space-x-2">
                <span className="text-amber-600 text-lg flex-shrink-0 dark:text-amber-400">💡</span>
                <div>
                  <h4 className="font-medium text-amber-800 mb-1 dark:text-amber-300">Hint:</h4>
                  <p className="text-amber-700 text-sm leading-relaxed dark:text-amber-200">
                    {question.hint}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit section */}
      {!isSubmitted && (
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={onSubmit}
            disabled={selectedAnswers.length === 0}
            className="btn-primary w-full sm:w-auto min-w-[120px]"
          >
            Submit Answer
          </button>
          {selectedAnswers.length === 0 && (
            <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">
              Please {questionType === 'ordering' ? 'arrange the items' : 'select an answer'} to continue
            </p>
          )}
        </div>
      )}

      {/* Feedback section after submission */}
      {isSubmitted && (
        <div className="border-t pt-4 space-y-4">
          {/* Correctness feedback */}
          <div className={`p-4 rounded-lg ${
            isCorrect 
              ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-700/50' 
              : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-700/50'
          }`}>
            <div className="flex items-start space-x-3">
              <span className="text-2xl flex-shrink-0 mt-1">
                {isCorrect ? '✅' : '❌'}
              </span>
              <div className="flex-1 space-y-2">
                <h4 className={`font-semibold text-lg ${
                  isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                }`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </h4>
                
                {!isCorrect && questionType !== 'ordering' && (
                  <div className="space-y-1">
                    <p className="text-sm text-red-700 dark:text-red-300">
                      <span className="font-medium">Correct answer{question.displayCorrectAnswers.length > 1 ? 's' : ''}:</span>{' '}
                      <span className="font-semibold">{question.displayCorrectAnswers.join(', ')}</span>
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      <span className="font-medium">Your answer{selectedAnswers.length > 1 ? 's' : ''}:</span>{' '}
                      {selectedAnswers.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Explanation */}
          {question.explanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/20 dark:border-blue-700/50">
              <div className="flex items-start space-x-3">
                <span className="text-blue-600 text-xl flex-shrink-0 mt-0.5 dark:text-blue-400">💡</span>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2 dark:text-blue-300">Explanation:</h4>
                  <p className="text-blue-700 text-sm leading-relaxed dark:text-blue-200">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-center pt-2">
            {isCorrect ? (
              <button
                type="button"
                onClick={onNext}
                className="btn-primary px-8 py-3 text-lg font-semibold"
              >
                Next Question →
              </button>
            ) : (
              <button
                type="button"
                onClick={onRestart}
                className="btn-danger px-8 py-3 text-lg font-semibold"
              >
                🔄 Restart Quiz
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
