#!/usr/bin/env node

/**
 * Setup verification script for AZ-104 Quiz App
 * Run this after npm install to verify all files are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying AZ-104 Quiz App Setup...\n');

const requiredFiles = [
  // Data files (both in azureQuestions folder)
  { path: 'app/azureQuestions/az204.json', description: 'Quiz questions database' },
  { path: 'app/azureQuestions/AZ-204_Cram_Complete.docx', description: 'Study guide document' },
  
  // Configuration
  { path: 'package.json', description: 'Package configuration' },
  { path: 'tsconfig.json', description: 'TypeScript configuration' },
  { path: 'tailwind.config.js', description: 'Tailwind CSS configuration' },
  { path: 'next.config.js', description: 'Next.js configuration' },
  
  // Core app files
  { path: 'app/layout.tsx', description: 'Root layout' },
  { path: 'app/page.tsx', description: 'Home page' },
  { path: 'app/globals.css', description: 'Global styles' },
  
  // Pages
  { path: 'app/quiz/page.tsx', description: 'Quiz interface' },
  { path: 'app/guide/page.tsx', description: 'Study guide' },
  { path: 'app/study/page.tsx', description: 'Study mode' },
  
  // API routes
  { path: 'app/api/questions/route.ts', description: 'Questions API' },
  { path: 'app/api/guide/route.ts', description: 'Guide API' },
  
  // Components
  { path: 'components/Quiz.tsx', description: 'Quiz controller' },
  { path: 'components/QuestionCard.tsx', description: 'Question display' },
  { path: 'components/ProgressBar.tsx', description: 'Progress bar' },
  
  // Hooks and utilities
  { path: 'hooks/useQuiz.ts', description: 'Quiz state management' },
  { path: 'utils/shuffle.ts', description: 'Fisher-Yates shuffle' },
  { path: 'utils/scoring.ts', description: 'Scoring system' },
  { path: 'utils/storage.ts', description: 'localStorage management' },
  { path: 'types/index.ts', description: 'Type definitions' }
];

let missingFiles = [];
let foundFiles = [];

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file.path);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file.path} - ${file.description}`);
    foundFiles.push(file);
  } else {
    console.log(`❌ ${file.path} - ${file.description}`);
    missingFiles.push(file);
  }
});

console.log(`\n📊 Setup Summary:`);
console.log(`✅ Found: ${foundFiles.length} files`);
console.log(`❌ Missing: ${missingFiles.length} files`);

if (missingFiles.length === 0) {
  console.log('\n🎉 All files are present! Ready to run:');
  console.log('   npm install');
  console.log('   npm run dev');
} else {
  console.log('\n⚠️  Some files are missing. Please ensure all required files are in place.');
  console.log('\nMissing files:');
  missingFiles.forEach(file => {
    console.log(`   - ${file.path}`);
  });
}

// Check dependencies
console.log('\n🔍 Checking key dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
  const requiredDeps = ['next', 'react', 'typescript', 'tailwindcss', 'mammoth'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
      console.log(`✅ ${dep} configured`);
    } else {
      console.log(`❌ ${dep} missing from package.json`);
    }
  });
} catch (error) {
  console.log('❌ Could not read package.json');
}

console.log('\n🚀 Next steps:');
console.log('1. Run: npm install');
console.log('2. Start dev server: npm run dev');
console.log('3. Open: http://localhost:3000');
console.log('\nFor issues, check the README.md file.');
