# Dynamic Question Types Implementation - Complete Guide

## 🎉 Changes Made

Your AZ-104 quiz app now supports **5 dynamic question types** that are automatically detected from the question text!

### New Question Types Supported:
1. **Standard** (existing) - Radio buttons or checkboxes
2. **Ordering** - Drag-and-drop sequence questions
3. **Dropdown Command** - CLI command completion with dropdowns
4. **Dropdown Single** - Single dropdown selection
5. **Case Study** - Scenario-based questions with context

---

## 📦 Files Modified

### 1. **NEW FILE: `utils/questionTypes.ts`**
   - Question type detection logic
   - Type-aware answer validation
   - Command parsing utilities

### 2. **UPDATED: `components/QuestionCard.tsx`**
   - Dynamic UI rendering based on question type
   - Drag-and-drop support for ordering questions
   - Dropdown interfaces for command completion
   - Enhanced styling and feedback

### 3. **UPDATED: `hooks/useQuiz.ts`**
   - Enhanced answer handling for all question types
   - Comma-separated answer format for ordering/dropdowns
   - Type-aware validation

### 4. **UPDATED: `package.json`**
   - Added `@hello-pangea/dnd` dependency for drag-and-drop

### 5. **BACKUP CREATED: `components/QuestionCard.BACKUP.tsx`**
   - Your original QuestionCard saved for reference

---

## 🚀 Installation Steps

### Step 1: Install Dependencies
Open your terminal in the project directory and run:

```bash
npm install
```

This will install the new `@hello-pangea/dnd` package.

### Step 2: Test the Application
```bash
npm run dev
```

Visit `http://localhost:3000` and test the quiz!

### Step 3: Check for Build Errors (Optional)
```bash
npm run check-all
```

This runs TypeScript and ESLint checks.

---

## 📝 How Questions Are Detected

The app automatically detects question types based on text patterns:

### **Ordering Questions** 🔄
**Triggers:** Question contains:
- "arrange"
- "order the"
- "sequence"
- "correct order"

**Example:**
```json
{
  "id": 101,
  "domain": "Compute",
  "question": "Arrange the following steps to deploy an Azure Function in the correct order:",
  "options": [
    "A) Create Function App",
    "B) Write function code",
    "C) Create App Service Plan",
    "D) Deploy to Azure"
  ],
  "correct_answers": ["C", "A", "B", "D"]
}
```

**UI:** Draggable cards with numbered positions

---

### **Dropdown Command** ⌨️
**Triggers:** Question contains:
- ("complete" OR "fill") AND ("command" OR "cli" OR "powershell" OR "az ")
- Has blank placeholders: `___`, `[select]`, or `{blank}`

**Example:**
```json
{
  "id": 102,
  "domain": "Storage",
  "question": "Complete the command to create a storage account:\naz storage account create --name ___ --resource-group ___ --location ___",
  "options": [
    "A) mystorageacct",
    "B) myResourceGroup",
    "C) eastus",
    "D) westus"
  ],
  "correct_answers": ["A", "B", "C"]
}
```

**UI:** Terminal-style display with dropdown selects

---

### **Dropdown Single** 📋
**Triggers:** Question contains:
- "which command"
- "select the correct"
- Has `___` or `[select]` placeholder

**Example:**
```json
{
  "id": 103,
  "domain": "Networking",
  "question": "Which command creates a virtual network?",
  "options": [
    "A) az network vnet create",
    "B) az vm create",
    "C) az network nsg create",
    "D) az network route-table create"
  ],
  "correct_answers": ["A"]
}
```

**UI:** Single dropdown selector

---

### **Case Study** 📖
**Triggers:** Question contains:
- "case study"
- "scenario:"
- "company" AND length > 300 characters

**Example:**
```json
{
  "id": 104,
  "domain": "Architecture",
  "question": "Case Study: Contoso Corporation\n\nScenario:\nContoso needs to deploy a globally distributed web application...\n\nQuestion: Which Azure service provides the best global load balancing?",
  "options": [
    "A) Azure Traffic Manager",
    "B) Azure Front Door",
    "C) Azure Load Balancer",
    "D) Application Gateway"
  ],
  "correct_answers": ["B"]
}
```

**UI:** Scenario box + standard options

---

### **Standard** (Default) ✅
**All other questions** use the existing radio button or checkbox interface.

---

## ✨ Key Features

### 🎯 No JSON Changes Required
Your existing question files work exactly as-is! The app detects question types from the text.

### 🎨 Visual Feedback
- **Ordering:** Green border for correct position, red for incorrect
- **Dropdowns:** Terminal-style interface with syntax highlighting
- **All Types:** Clear correct/incorrect indicators after submission

### ⌨️ Keyboard Shortcuts
- **1-4:** Quick select (standard questions only)
- **Enter:** Submit answer / Next question
- **H:** Show hint
- **R:** Restart quiz
- **N:** Next question (after correct answer)

### 🌙 Dark Mode Support
All new question types fully support dark mode.

### ♿ Accessibility
- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader compatible

---

## 🧪 Testing Different Question Types

To test, simply add questions to your `az204.json` file using the patterns above. Here's a complete test question for each type:

### Test Question Set

```json
{
  "questions": [
    {
      "id": 901,
      "domain": "Test",
      "question": "Arrange these deployment steps in the correct order:",
      "options": [
        "A) Configure settings",
        "B) Create resource",
        "C) Test deployment",
        "D) Deploy code"
      ],
      "multi_select": false,
      "correct_answers": ["B", "A", "D", "C"],
      "explanation": "First create the resource, then configure it, deploy code, and finally test."
    },
    {
      "id": 902,
      "domain": "Test",
      "question": "Complete the Azure CLI command:\naz ___ create --name myapp --resource-group ___",
      "options": [
        "A) webapp",
        "B) myRG",
        "C) function",
        "D) testRG"
      ],
      "multi_select": false,
      "correct_answers": ["A", "B"],
      "explanation": "Use 'az webapp create' with the resource group name."
    },
    {
      "id": 903,
      "domain": "Test",
      "question": "Which command lists all resource groups?",
      "options": [
        "A) az group list",
        "B) az vm list",
        "C) az resource list",
        "D) az account list"
      ],
      "multi_select": false,
      "correct_answers": ["A"],
      "explanation": "az group list shows all resource groups in the subscription."
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Drag-and-Drop Not Working
**Issue:** Items won't drag
**Solution:** 
1. Make sure you ran `npm install`
2. Check browser console for errors
3. Try refreshing the page

### Questions Not Detecting Type
**Issue:** All questions show as "Standard"
**Solution:**
- Check that question text includes trigger keywords
- Keywords are case-insensitive
- Review the detection patterns in `utils/questionTypes.ts`

### Build Errors
**Issue:** TypeScript or build errors
**Solution:**
```bash
npm run check-all
```
This shows all errors at once. Common issues:
- Missing imports
- Type mismatches
- Check the console output for specifics

### Answers Not Validating Correctly
**Issue:** Correct answers marked as incorrect
**Solution:**
- Ordering questions: Check `correct_answers` array order
- Dropdown commands: Ensure correct number of blanks matches answers
- Standard questions: Works as before

---

## 🎨 Customization

### Adding New Question Types

Edit `utils/questionTypes.ts`:

```typescript
export function detectQuestionType(question: string): QuestionType {
  const lower = question.toLowerCase();
  
  // Add your new type detection
  if (lower.includes('your-pattern')) {
    return 'your-new-type';
  }
  
  // ... existing logic
}
```

Then add rendering logic in `QuestionCard.tsx` in the `renderQuestionUI()` switch statement.

### Styling Changes

All styles use Tailwind classes. Key areas:
- **Drag items:** `.border-azure-500` classes
- **Terminal display:** `.bg-gray-900 .text-green-400`
- **Dropdowns:** `.border-gray-300 dark:border-gray-600`

---

## 📊 What's Next?

### Recommended Enhancements:
1. **Hotspot Questions** - Click areas on diagrams
2. **True/False Statements** - Multiple yes/no questions
3. **Fill-in-the-Blank** - Text input fields
4. **Matching** - Connect related items
5. **Performance Graphs** - Track scores over time

### Migration Path:
1. Test with a few questions of each type
2. Gradually add more advanced questions
3. Monitor user feedback
4. Expand question bank with diverse types

---

## 🆘 Need Help?

### Quick Reference:
- **Question not recognized?** Check trigger keywords in question text
- **Drag-and-drop broken?** Verify `@hello-pangea/dnd` is installed
- **Validation failing?** Review `correct_answers` array format
- **Build errors?** Run `npm run check-all` for detailed output

### File Locations:
```
src/
├── components/
│   ├── QuestionCard.tsx           ← Main UI component
│   └── QuestionCard.BACKUP.tsx    ← Original backup
├── hooks/
│   └── useQuiz.ts                 ← Quiz logic
├── utils/
│   └── questionTypes.ts           ← NEW: Type detection
└── types/
    └── index.ts                   ← Type definitions
```

---

## ✅ Success Checklist

- [ ] Ran `npm install` successfully
- [ ] App starts with `npm run dev`
- [ ] Standard questions work as before
- [ ] Ordering questions show drag-and-drop UI
- [ ] Dropdown commands show terminal interface
- [ ] Case studies display scenario box
- [ ] Answers validate correctly
- [ ] Dark mode works on all question types
- [ ] Keyboard shortcuts functional

---

## 🎉 You're All Set!

Your quiz app now dynamically detects and renders 5 different question types automatically, with no changes needed to your existing JSON data structure. Test it out with your AZ-204 questions and enjoy the enhanced learning experience!

**Happy studying! 📚✨**
