import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { injectAnchors } from '@/utils/guide/anchors';

/**
 * API route to serve processed guide content
 * GET /api/guide?exam=az104|az204|az500 - Returns HTML content from the specified .docx guide
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

    // Map exam to docx filename
    const docxFiles: Record<string, string> = {
      'az104': 'AZ-104_Cram_Complete_with_Part4.docx',
      'az204': 'AZ-204_Cram_Complete.docx',
      'az500': 'AZ-500_Cram_Complete.docx'
    };

    // Construct path to guide file within app structure
    const guidePath = path.join(process.cwd(), 'app', 'azureQuestions', docxFiles[exam]);
    
    console.log(`Loading guide from API: ${guidePath} (exam: ${exam})`);

    // Check if file exists
    if (!fs.existsSync(guidePath)) {
      console.error('Guide file not found at:', guidePath);
      return NextResponse.json(
        { 
          error: 'Guide file not found', 
          path: guidePath,
          exam,
          content: `<h1>Guide Not Available</h1><p>The study guide for ${exam.toUpperCase()} could not be loaded at this time.</p>`
        },
        { status: 404 }
      );
    }

    // Read the .docx file
    const buffer = fs.readFileSync(guidePath);

    // Convert .docx to HTML using mammoth
    const result = await mammoth.convertToHtml({
      buffer: buffer
    }, {
      // Conversion options for better HTML output
      convertImage: mammoth.images.imgElement((_image) => {
        // Handle images - return placeholder since we can't easily serve images in this setup
        return Promise.resolve({ src: '', alt: 'Image from guide' });
      }),
      styleMap: [
        // Map Word styles to appropriate HTML elements
        "p[style-name='Heading 1'] => h1.guide-heading-1",
        "p[style-name='Heading 2'] => h2.guide-heading-2", 
        "p[style-name='Heading 3'] => h3.guide-heading-3",
        "p[style-name='Heading 4'] => h4.guide-heading-4",
        "p[style-name='Code'] => pre.code-block",
        "p[style-name='List Paragraph'] => li:fresh"
        // Note: span mappings not supported, mammoth will handle inline formatting automatically
      ]
    });

    // Get the HTML content
    let htmlContent = result.value;

    // Log any warnings from mammoth
    if (result.messages && result.messages.length > 0) {
      console.log('Mammoth conversion messages:', result.messages.length, 'items');
    }

    // Inject anchor IDs into headings for navigation
    htmlContent = injectAnchors(htmlContent);

    // Basic HTML cleanup and enhancement
    htmlContent = htmlContent
      // Remove empty paragraphs
      .replace(/<p>\s*<\/p>/g, '')
      // Add proper spacing between elements
      .replace(/<\/p>\s*<p>/g, '</p>\n<p>')
      // Ensure proper heading spacing
      .replace(/<\/h([1-6])>\s*<p>/g, '</h$1>\n\n<p>')
      .replace(/<\/p>\s*<h([1-6])/g, '</p>\n\n<h$1')
      // Clean up list formatting
      .replace(/<\/li>\s*<li>/g, '</li>\n<li>')
      // Add line breaks for readability
      .replace(/(<\/(?:div|section|article)>)/g, '$1\n');

    const wordCount = htmlContent.replace(/<[^>]*>/g, ' ').split(/\s+/).length;
    console.log(`Successfully converted ${exam.toUpperCase()} guide: ${htmlContent.length} characters, ~${wordCount} words`);

    return NextResponse.json({
      content: htmlContent,
      exam,
      meta: {
        wordCount,
        characterCount: htmlContent.length,
        convertedAt: new Date().toISOString(),
        warnings: result.messages?.length || 0
      }
    });

  } catch (error) {
    console.error('Error processing guide:', error);
    
    const exam = new URL(request.url).searchParams.get('exam') || 'az104';
    
    // Return fallback content instead of complete failure
    const fallbackContent = `
      <h1>${exam.toUpperCase()} Study Guide</h1>
      <div class="bg-yellow-100 border border-yellow-400 rounded p-4 mb-4">
        <h2>⚠️ Guide Processing Error</h2>
        <p>The study guide could not be processed at this time. Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
      <h2>Fallback Study Resources</h2>
      <p>While we work to resolve the guide issue, you can:</p>
      <ul>
        <li>Continue with the interactive quiz questions</li>
        <li>Reference the question hints and explanations</li>
        <li>Use the domain-based navigation to focus on specific topics</li>
      </ul>
      <p>We apologize for the inconvenience and are working to restore full guide functionality.</p>
    `;
    
    return NextResponse.json({
      content: fallbackContent,
      exam,
      error: error instanceof Error ? error.message : 'Unknown error',
      meta: {
        wordCount: 0,
        characterCount: fallbackContent.length,
        convertedAt: new Date().toISOString(),
        warnings: 0,
        fallback: true
      }
    });
  }
}

// Disable caching for this API route to ensure fresh content
export const dynamic = 'force-dynamic';
