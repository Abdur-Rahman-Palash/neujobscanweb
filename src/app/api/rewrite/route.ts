import { NextRequest, NextResponse } from 'next/server';
import { RewriteAgent } from '@/lib/agents/rewriteAgent';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeData, jobData, skillGaps } = body;

    if (!resumeData || !jobData || !skillGaps) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields: resumeData, jobData, skillGaps',
        status: 400,
      }, { status: 400 });
    }

    const rewriteAgent = new RewriteAgent('openai');
    const result = await rewriteAgent.generateRewriteSuggestions(
      resumeData,
      jobData,
      skillGaps
    );

    if (!result.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Resume rewrite suggestions failed: ${result.error}`,
        status: 500,
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result.data,
      message: 'Resume rewrite suggestions generated successfully',
      status: 200,
    });

  } catch (error) {
    console.error('Rewrite API error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during rewrite suggestions',
      status: 500,
    }, { status: 500 });
  }
}
