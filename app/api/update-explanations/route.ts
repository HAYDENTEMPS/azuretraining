import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST() {
  try {
    // Define file paths
    const updatedExplanationsPath = path.join(
      process.cwd(),
      'app',
      'azureQuestions',
      'updatedExplantations.json'
    );
    const az204Path = path.join(
      process.cwd(),
      'app',
      'azureQuestions',
      'az204.json'
    );

    // Check if updatedExplantations.json exists
    if (!fs.existsSync(updatedExplanationsPath)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'updatedExplantations.json not found. Please create the file first.' 
        },
        { status: 404 }
      );
    }

    // Read both files
    const updatedExplanationsData = fs.readFileSync(updatedExplanationsPath, 'utf-8');
    const az204Data = fs.readFileSync(az204Path, 'utf-8');

    const updatedExplanations = JSON.parse(updatedExplanationsData);
    const az204 = JSON.parse(az204Data);

    // Create a map of ID to explanation for quick lookup
    const explanationMap = new Map();
    updatedExplanations.forEach((item: { id: number; explanation: string }) => {
      explanationMap.set(item.id, item.explanation);
    });

    // Update explanations in az204.json
    let updatedCount = 0;
    az204.questions.forEach((question: any) => {
      if (explanationMap.has(question.id)) {
        question.explanation = explanationMap.get(question.id);
        updatedCount++;
      }
    });

    // Write updated data back to az204.json
    fs.writeFileSync(az204Path, JSON.stringify(az204, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} explanations in az204.json`,
      updatedCount
    });

  } catch (error) {
    console.error('Error updating explanations:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
