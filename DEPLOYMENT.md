# Deployment Guide

This guide covers deploying the AZ-104 Quiz App to various environments.

## 📦 Production Build

### Local Production Build
```bash
# Build the application
npm run build

# Start production server
npm run start
```

### Build Verification
- Verify all pages load correctly
- Test quiz functionality end-to-end
- Confirm guide content processes properly
- Check localStorage functionality

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Environment Considerations**:
   - Update file paths for serverless environment
   - Consider using environment variables for paths
   - Test mammoth.js compatibility with Vercel's runtime

### Option 2: Netlify
1. **Build Command**: `npm run build`
2. **Publish Directory**: `.next`
3. **Node Version**: 18+

### Option 3: Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Option 4: Traditional VPS/Server
```bash
# Install dependencies
npm ci --production

# Build application
npm run build

# Use PM2 for process management
npm install -g pm2
pm2 start npm --name "az104-quiz" -- start
```

## 🔧 Environment Configuration

### File Paths for Production
Update these files with environment-appropriate paths:

**api/questions/route.ts**:
```typescript
// Instead of absolute Windows path:
const questionsPath = process.env.QUESTIONS_PATH || './az204.json';
```

**api/guide/route.ts**:
```typescript
// Instead of absolute Windows path:
const guidePath = process.env.GUIDE_PATH || './AZ-204_Cram_Complete.docx';
```

### Environment Variables
Create `.env.production`:
```bash
QUESTIONS_PATH=/path/to/az204.json
GUIDE_PATH=/path/to/AZ-204_Cram_Complete.docx
NODE_ENV=production
```

## 🔍 Production Considerations

### Performance Optimization
- **Static Generation**: Consider ISR for guide content
- **Image Optimization**: Use Next.js Image component if adding images
- **Bundle Analysis**: Run `npm run build -- --analyze`
- **CDN**: Serve static assets from CDN

### Security Considerations
- **File Access**: Ensure proper file system permissions
- **Rate Limiting**: Consider API rate limiting for production
- **HTTPS**: Always use HTTPS in production
- **Content Security Policy**: Add CSP headers

### Monitoring & Analytics
- **Error Tracking**: Integrate Sentry or similar
- **Analytics**: Add Google Analytics or similar
- **Performance**: Monitor Core Web Vitals
- **Uptime**: Set up uptime monitoring

## 🧪 Testing in Production

### Pre-Deployment Checklist
- [ ] All quiz modes work correctly
- [ ] Questions load and shuffle properly
- [ ] Study guide processes and displays
- [ ] Search functionality works
- [ ] Keyboard shortcuts respond
- [ ] localStorage saves correctly
- [ ] Mobile responsiveness verified
- [ ] Accessibility tested

### Post-Deployment Verification
- [ ] Site loads correctly
- [ ] API endpoints respond
- [ ] File paths resolve correctly
- [ ] Error handling works
- [ ] Performance is acceptable

## 🐛 Common Deployment Issues

### File Path Issues
**Problem**: Absolute Windows paths don't work in production
**Solution**: Use environment variables or relative paths

### Mammoth.js Issues
**Problem**: .docx processing fails in serverless
**Solution**: Verify mammoth.js compatibility with deployment platform

### Memory Issues
**Problem**: Large .docx files cause memory errors
**Solution**: Implement file streaming or chunk processing

### Build Failures
**Problem**: TypeScript or build errors
**Solution**: Fix all type errors and test build locally first

## 📊 Performance Optimization Tips

### Code Splitting
- Quiz components already lazy-loaded
- Consider further splitting for large study guide

### Caching Strategy
```typescript
// In API routes, add appropriate cache headers
export async function GET() {
  const response = NextResponse.json(data);
  response.headers.set('Cache-Control', 'public, max-age=3600'); // 1 hour
  return response;
}
```

### Bundle Optimization
- Analyze bundle size: `npx @next/bundle-analyzer`
- Consider removing unused Tailwind classes
- Optimize component imports

---

For questions or issues, refer to the main README.md or create an issue in the project repository.
