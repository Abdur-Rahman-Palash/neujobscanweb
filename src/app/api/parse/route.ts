export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { ResumeParsingAgent } from '@/lib/agents/resumeParser';
import { JobParsingAgent } from '@/lib/agents/jobParser';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, type, fileName } = body;

    if (!text || !type) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields: text, type',
        status: 400,
      }, { status: 400 });
    }

    let result;

    if (type === 'resume') {
      const resumeParser = new ResumeParsingAgent('openai');
      result = await resumeParser.parseResume(text, fileName || 'document.txt');
    } else if (type === 'job') {
      const jobParser = new JobParsingAgent('openai');
      result = await jobParser.parseJob(text);
    } else {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid type. Must be "resume" or "job"',
        status: 400,
      }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: result.error || 'Parsing failed',
        status: 500,
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
      message: `${type === 'resume' ? 'Resume' : 'Job'} parsed successfully`,
      status: 200,
    });

  } catch (error) {
    console.error('Parse API error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during parsing',
      status: 500,
    }, { status: 500 });
  }
}
