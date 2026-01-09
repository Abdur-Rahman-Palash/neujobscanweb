export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { AIAgentOrchestrator } from '@/lib/ai/agents';
import { ApiResponse, MatchResult, ParsedResumeData, ParsedJobData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { resumeData, jobData } = await request.json();

    if (!resumeData || !jobData) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Both resume data and job data are required',
        status: 400
      }, { status: 400 });
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'OpenAI API key not configured',
        status: 500
      }, { status: 500 });
    }

    const orchestrator = new AIAgentOrchestrator(openaiApiKey);
    
    try {
      const matchResult: MatchResult = await orchestrator.agents.matchMaker.createMatch(
        resumeData as ParsedResumeData,
        jobData as ParsedJobData
      );

      return NextResponse.json<ApiResponse>({
        success: true,
        data: matchResult,
        message: 'Resume-job match created successfully',
        status: 200
      });
    } catch (error) {
      console.error('Match creation error:', error);
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Failed to create match',
        status: 500
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Match API error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error',
      status: 500
    }, { status: 500 });
  }
}
