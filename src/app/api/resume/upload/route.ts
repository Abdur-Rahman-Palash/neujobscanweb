import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { FILE_UPLOAD } from '@/lib/constants';
import { ResumeParser } from '@/lib/parsers/resume-parser';
import { AIAgentOrchestrator } from '@/lib/ai/agents';
import { ApiResponse, ParsedResumeData, ResumeAnalysis } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No file uploaded',
        status: 400
      }, { status: 400 });
    }

    // Validate file type
    if (!FILE_UPLOAD.allowedTypes.includes(file.type as any)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.',
        status: 400
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > FILE_UPLOAD.maxSize) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `File size exceeds ${FILE_UPLOAD.maxSize / (1024 * 1024)}MB limit`,
        status: 400
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'resumes');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name}`;
    const filepath = join(uploadsDir, filename);

    // Save file
    await writeFile(filepath, buffer);

    // Parse resume content
    let content: string;
    let parsedData: ParsedResumeData;

    if (file.type === 'application/pdf') {
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(buffer);
      content = pdfData.text;
    } else if (file.type.includes('word')) {
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      content = result.value;
    } else {
      content = buffer.toString('utf-8');
    }

    // Parse resume data
    parsedData = ResumeParser.parseText(content);

    // Analyze resume with AI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.warn('OpenAI API key not found, skipping AI analysis');
    } else {
      try {
        const orchestrator = new AIAgentOrchestrator(openaiApiKey);
        const analysis = await orchestrator.agents.resumeAnalyzer.analyzeResume(parsedData, content);
        
        return NextResponse.json<ApiResponse>({
          success: true,
          data: {
            filename,
            filepath,
            fileType: file.type,
            fileSize: file.size,
            content,
            parsedData,
            analysis,
          },
          message: 'Resume uploaded and analyzed successfully',
          status: 200
        });
      } catch (error) {
        console.error('AI analysis error:', error);
        // Return parsed data even if AI analysis fails
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        filename,
        filepath,
        fileType: file.type,
        fileSize: file.size,
        content,
        parsedData,
      },
      message: 'Resume uploaded successfully',
      status: 200
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to upload resume',
      status: 500
    }, { status: 500 });
  }
}
