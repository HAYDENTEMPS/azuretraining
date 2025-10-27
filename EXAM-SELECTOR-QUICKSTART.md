# Quick Start Guide - Exam Selector Feature

## What's New?
You can now switch between AZ-104, AZ-204, and AZ-500 exams using a dropdown in the header!

## How to Use

### 1. Switch Exams
- Look for the exam dropdown button in the header (shows current exam like "AZ-104")
- Click to open the dropdown menu
- Select your desired exam:
  - **AZ-104** - Azure Administrator
  - **AZ-204** - Azure Developer
  - **AZ-500** - Azure Security Engineer
- Page will reload with new exam content

### 2. Your Selection Persists
- Your exam choice is saved automatically
- It will remain selected even after closing the browser
- Each exam has its own separate progress tracking

### 3. Independent Stats
- Best scores and times are tracked separately per exam
- Your AZ-104 progress won't affect your AZ-204 progress
- View stats for current exam on the home page

## Where to Find It

### Desktop
- Top right corner of the header
- Blue button showing current exam (e.g., "AZ-104")
- Next to the theme toggle button

### Mobile
- Top right corner of the header
- Same blue button, slightly smaller
- Dropdown opens below the button

## Features

✅ **All Pages Updated**
- Home page shows current exam info
- Quiz loads questions for selected exam
- Study guide loads correct documentation
- Study mode syncs both quiz and guide

✅ **Separate Progress Tracking**
- Each exam has its own best scores
- Each exam has its own best times
- Each exam has its own settings

✅ **Clean UI**
- Matches existing Azure theme
- Works with dark mode
- Smooth transitions and animations
- Clear visual feedback for selection

## Data Files Required

Make sure these files exist in `/app/azureQuestions/`:

### JSON Files (Questions)
- `az104.json` - AZ-104 questions
- `az204.json` - AZ-204 questions  
- `az500.json` - AZ-500 questions

### DOCX Files (Study Guides)
- `AZ-104_Cram_Complete_with_Part4.docx`
- `AZ-204_Cram_Complete.docx`
- `AZ-500_Cram_Complete.docx`

## Testing the Feature

1. **Basic Functionality**
   ```
   - Start on home page (default AZ-104)
   - Click exam selector
   - Choose AZ-204
   - Verify page reloads with AZ-204 content
   - Check that header shows "AZ-204"
   ```

2. **Quiz Page**
   ```
   - Go to /quiz
   - Verify questions are for selected exam
   - Switch exam via header dropdown
   - Verify new questions load
   ```

3. **Study Guide**
   ```
   - Go to /guide
   - Verify correct study guide loads
   - Switch exam
   - Verify new study guide loads
   ```

4. **Persistence**
   ```
   - Select AZ-500
   - Close browser
   - Reopen application
   - Verify AZ-500 is still selected
   ```

## Troubleshooting

### Dropdown Not Appearing
- Make sure you're viewing the page after running `npm run dev`
- Check browser console for errors
- Verify ExamContext is properly imported

### Wrong Questions Loading
- Check that correct JSON file exists in `/app/azureQuestions/`
- Verify API route is receiving exam parameter
- Check browser network tab for API calls

### Stats Not Saving Separately
- Clear browser localStorage and test again
- Check that exam is being read from localStorage
- Verify storage keys include exam prefix

### Page Not Reloading After Selection
- This is intentional - reload ensures clean data fetch
- If reload doesn't happen, check browser console
- Verify `window.location.reload()` is called

## Development

### Run Development Server
```bash
npm run dev
```

### Check for Errors
```bash
# Windows
check-all-errors.bat

# Or manually
npx tsc --noEmit
npx eslint . --ext .ts,.tsx
```

### View in Browser
```
http://localhost:3000
```

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all required files exist
3. Clear localStorage and try again
4. Check network tab for API request/response
5. Restart development server

Enjoy your multi-exam quiz experience! 🎉
