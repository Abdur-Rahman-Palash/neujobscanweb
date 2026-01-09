import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { content, format = 'pdf' } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Content is required for export',
        status: 400,
      }, { status: 400 });
    }

    console.log('=== COVER LETTER EXPORT ===');
    console.log('Format:', format);
    console.log('Content length:', content.length);

    // Generate appropriate content based on format
    let exportContent = content;
    let contentType = 'text/plain';
    let filename = 'cover-letter.txt';

    if (format === 'pdf') {
      // For PDF, we'll return HTML content that can be converted to PDF
      exportContent = generateHTMLCoverLetter(content);
      contentType = 'text/html';
      filename = 'cover-letter.html';
    } else if (format === 'word') {
      // For Word, we'll format with proper line breaks
      exportContent = content.replace(/\n/g, '\r\n');
      filename = 'cover-letter.doc';
    }

    return new NextResponse(exportContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Cover letter export error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during export',
      status: 500,
    }, { status: 500 });
  }
}

function generateHTMLCoverLetter(content: string): string {
  // Basic HTML template for cover letter
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cover Letter</title>
    <style>
        body {
            font-family: 'Georgia', serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .content {
            white-space: pre-wrap;
            text-align: left;
        }
        .signature {
            margin-top: 50px;
            text-align: right;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Cover Letter</h1>
    </div>
    <div class="content">
        <pre>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
    <div class="signature">
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>
  `;
}
