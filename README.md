# AZ-104 Quiz App

A comprehensive Next.js TypeScript application for studying Microsoft Azure AZ-104 certification with interactive quizzes, first-class hints, and an integrated study guide viewer.

## 🚀 Features

### Core Quiz Functionality
- **Fisher-Yates Shuffle**: Questions randomized every session and restart
- **Dual Answer Modes**: Single-select (radio) and multi-select (checkbox) support
- **Auto-Advance**: Correct answers advance automatically after 800ms
- **Smart Restart**: Wrong answers trigger reshuffled question restart
- **Real-time Timer**: Track your progress with mm:ss timing display

### Quiz Modes
- **Practice Mode**: Hints enabled, immediate explanations, configurable penalties
- **Exam Mode**: No hints, explanations at end only, simulates real exam

### Hint System & Penalties
- **First-class Hints**: Collapsible hint cards with penalty tracking
- **Penalty Options**: 
  - Score penalty: -2% per hint used
  - Time penalty: +10 seconds per hint used
  - No penalty: Free hint usage

### Study Guide Integration
- **Server-side .docx Processing**: Mammoth.js converts Word documents to HTML
- **Deep-link Navigation**: Quiz questions link directly to relevant guide sections
- **Fuzzy Search**: Client-side search with highlighting and result ranking
- **Auto-anchoring**: Major headings become navigable anchors

### Study Mode
- **Split-pane Interface**: Quiz on left, synchronized guide on right
- **Domain Syncing**: Guide automatically navigates to current question's domain
- **Seamless Context**: Study theory while practicing questions

### Accessibility & UX
- **Keyboard Shortcuts**: 1-4 select, Enter submit, H hint, R restart
- **ARIA Support**: Screen reader friendly with proper roles and labels
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Progress Tracking**: Visual progress bar and question counter
- **Perfect Run Records**: localStorage tracks best scores and times

## 📁 Project Structure

```
az104/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── questions/route.ts    # Serves quiz questions
│   │   └── guide/route.ts        # Processes and serves guide content
│   ├── quiz/page.tsx            # Quiz interface
│   ├── guide/page.tsx           # Study guide viewer
│   ├── study/page.tsx           # Split-pane study mode
│   ├── layout.tsx               # Root layout with navigation
│   ├── page.tsx                 # Home page with mode selection
│   └── globals.css              # Global styles and components
├── components/                  # React components
│   ├── Quiz.tsx                # Main quiz controller
│   ├── QuestionCard.tsx        # Individual question display
│   ├── ProgressBar.tsx         # Progress visualization
│   ├── ModeToggle.tsx          # Practice/Exam mode selector
│   ├── SearchBox.tsx           # Guide search functionality
│   └── GuidePane.tsx           # Study guide panel
├── hooks/                      # Custom React hooks
│   └── useQuiz.ts             # Quiz state management and logic
├── utils/                     # Utility functions
│   ├── shuffle.ts            # Fisher-Yates implementation
│   ├── scoring.ts            # Score and penalty calculations
│   ├── storage.ts            # localStorage management
│   └── guide/                # Guide-specific utilities
│       └── anchors.ts        # Domain-to-anchor mapping
├── types/                     # TypeScript definitions
│   └── index.ts              # Core type definitions
├── az204.json                # Question database
├── AZ-204_Cram_Complete.docx  # Study guide
└── package.json              # Dependencies and scripts
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- Windows environment (paths are currently Windows-specific)
- The provided `az204.json` questions file
- The provided `AZ-204_Cram_Complete.docx` study guide

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd "C:\Users\templetonh\Transfer\Applications\azure\az104"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify file paths**: Ensure these files exist at the specified locations:
   - `C:\Users\templetonh\Transfer\Applications\azure\az104\az204.json`
   - `C:\Users\templetonh\Transfer\Applications\azure\az104\AZ-204_Cram_Complete.docx`

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**: Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm run start
```

## 📊 Data Schema

### Question Format (az204.json)
```typescript
{
  "meta": {
    "title": "AZ-104 Ultimate Practice",
    "count": 60,
    "notes": "Mixed domains; answers intentionally distributed"
  },
  "questions": [
    {
      "id": number,
      "domain": "Identities" | "Governance" | "Storage" | "Compute" | "Networking" | "Monitoring" | "BackupDR" | "Security" | "Hybrid" | "Cost",
      "question": "string",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "multi_select": boolean,
      "hint": "string (optional)",
      "correct_answers": ["A"] | ["A", "C"],
      "explanation": "string (optional)"
    }
  ]
}
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-4` | Select options A through D |
| `Enter` | Submit current answer |
| `H` | Show/toggle hint (Practice mode only) |
| `R` | Restart quiz with reshuffled questions |

## 🎯 Usage Guide

### Taking a Quiz
1. **Choose Mode**: Select Practice (with hints) or Exam (simulation) mode
2. **Answer Questions**: Click options or use keyboard shortcuts
3. **Get Feedback**: See immediate results and explanations
4. **Perfect Runs**: Complete all questions correctly to set personal bests

### Using Hints (Practice Mode)
- Click "💡 Show Hint" button when available
- Hints count towards penalty calculation based on settings
- Configure penalty type: Score reduction, time addition, or none

### Study Guide Features
- **Search**: Use the search box to find specific Azure topics
- **Navigation**: Click headings in table of contents to jump to sections
- **Cross-reference**: Click "📖 Guide" links in quiz questions

### Study Mode
- **Split Interface**: Quiz on left, guide on right
- **Auto-sync**: Guide navigates to current question's domain automatically
- **Efficient Learning**: Study context while practicing questions

## 🏆 Scoring System

### Base Score Calculation
- **Base Score**: (Correct Answers / Total Questions) × 100%
- **Perfect Run**: All questions answered correctly in one session

### Penalty System (Practice Mode)
- **Score Penalty**: -2% per hint used (from final score)
- **Time Penalty**: +10 seconds per hint used (from completion time)
- **No Penalty**: Hints don't affect score or time

### Records Tracking
- **Best Practice Score**: Highest score achieved in practice mode
- **Best Practice Time**: Fastest completion in practice mode  
- **Best Exam Time**: Fastest completion in exam mode
- **Persistent Storage**: Records saved in browser localStorage

## 🔧 Technical Implementation

### Key Technologies
- **Next.js 14+**: App Router with server and client components
- **TypeScript**: Full type safety throughout application
- **Tailwind CSS**: Responsive utility-first styling
- **Mammoth.js**: Server-side .docx to HTML conversion
- **Fuse.js**: Client-side fuzzy search functionality

### Performance Features
- **Server Components**: Guide processing happens server-side
- **Client Hydration**: Interactive features load progressively
- **Efficient Shuffling**: Fisher-Yates algorithm for true randomization
- **Smart Caching**: API responses optimized for performance

### Accessibility Features
- **ARIA Labels**: Proper roles and descriptions for screen readers
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Focus Management**: Clear focus indicators and logical tab order
- **Color Contrast**: WCAG compliant color schemes
- **Reduced Motion**: Respects prefers-reduced-motion settings

## 🐛 Troubleshooting

### Common Issues

**Questions not loading**:
- Verify `az204.json` exists at the specified path
- Check browser console for API errors
- Ensure file has valid JSON format

**Study guide not displaying**:
- Confirm `.docx` file exists at specified location
- Check API endpoint `/api/guide` for conversion errors
- Mammoth.js requires valid Word document format

**Keyboard shortcuts not working**:
- Ensure quiz component has focus
- Check browser console for JavaScript errors
- Verify shortcuts aren't conflicting with browser shortcuts

**localStorage issues**:
- Check if browser allows localStorage (not in private/incognito mode)
- Clear browser storage and refresh page
- Verify localStorage quota isn't exceeded

### File Path Issues (Windows)
The application currently uses absolute Windows paths. To adapt for other systems:
1. Update paths in `/api/questions/route.ts`
2. Update paths in `/api/guide/route.ts` 
3. Consider using environment variables for deployment flexibility

## 🚀 Development Notes

### Adding Questions
1. Edit `az204.json` following the schema
2. Ensure all required fields are present
3. Test multi-select questions have multiple correct answers
4. Verify domain names match the anchor mapping

### Extending Guide Integration
1. Update `utils/guide/anchors.ts` for new domains
2. Add corresponding sections to the study guide
3. Test deep-linking from quiz questions

### Customizing Penalties
1. Modify penalty calculations in `utils/scoring.ts`
2. Update settings interface in components
3. Test with various hint usage patterns

---

Built for efficient AZ-104 Azure Administrator certification preparation. Good luck with your exam! 🏆⚡
