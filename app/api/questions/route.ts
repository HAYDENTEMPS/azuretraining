import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { QuizData } from '@/types';

/**
 * API route to serve quiz questions
 * GET /api/questions?exam=az104|az204|az500 - Returns all quiz questions from specified exam JSON
 */
export async function GET(request: NextRequest) {
  try {
    // Get exam parameter from query string, default to az104
    const searchParams = request.nextUrl.searchParams;
    const exam = searchParams.get('exam') || 'az104';
    
    // Validate exam parameter
    const validExams = ['az104', 'az204', 'az500'];
    if (!validExams.includes(exam)) {
      return NextResponse.json(
        { error: 'Invalid exam parameter. Must be one of: az104, az204, az500' },
        { status: 400 }
      );
    }

    // Construct path to questions file within app structure
    const questionsPath = path.join(process.cwd(), 'app', 'azureQuestions', `${exam}.json`);
    
    // Check if file exists
    if (!fs.existsSync(questionsPath)) {
      console.error('Questions file not found at:', questionsPath);
      return NextResponse.json(
        { error: 'Questions file not found', path: questionsPath, exam },
        { status: 404 }
      );
    }

    // Read and parse questions file
    const fileContent = fs.readFileSync(questionsPath, 'utf-8');
    const quizData: QuizData = JSON.parse(fileContent);

    // Validate data structure
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      console.error('Invalid questions data structure');
      return NextResponse.json(
        { error: 'Invalid questions data structure' },
        { status: 500 }
      );
    }

    // Validate questions format
    const validatedQuestions = quizData.questions.map((question, index) => {
      // Ensure required fields exist
      if (!question.id || !question.question || !question.options || !question.correct_answers || !question.domain) {
        console.warn(`Question ${index} missing required fields:`, question);
      }

      // Ensure options is exactly 4 items
      if (!Array.isArray(question.options) || question.options.length !== 4) {
        console.warn(`Question ${index} should have exactly 4 options:`, question.options);
      }

      // Ensure correct_answers is an array
      if (!Array.isArray(question.correct_answers)) {
        console.warn(`Question ${index} correct_answers should be an array:`, question.correct_answers);
      }

      return {
        id: question.id,
        domain: question.domain,
        question: question.question,
        options: question.options,
        multi_select: question.multi_select || false,
        hint: question.hint || undefined,
        correct_answers: question.correct_answers,
        explanation: question.explanation || undefined
      };
    });

    console.log(`Loaded ${validatedQuestions.length} questions from ${exam}.json`);

    return NextResponse.json({
      meta: quizData.meta || { 
        title: `${exam.toUpperCase()} Questions`,
        count: validatedQuestions.length,
        exam: exam,
        notes: `Loaded from ${exam}.json`
      },
      questions: validatedQuestions
    });

  } catch (error) {
    console.error('Error loading questions:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to load questions',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Disable caching for this API route to ensure fresh data
export const dynamic = 'force-dynamic';
