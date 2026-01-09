export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { JobParser } from '@/lib/parsers/job-parser';
import { AIAgentOrchestrator } from '@/lib/ai/agents';
import { ApiResponse, ParsedJobData, JobAnalysis } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content || typeof content !== 'string') {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Job description content is required',
        status: 400
      }, { status: 400 });
    }

    // Parse job description
    const parsedData: ParsedJobData = JobParser.parseText(content);

    // Analyze job with AI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.warn('OpenAI API key not found, skipping AI analysis');
      
      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          parsedData,
        },
        message: 'Job description parsed successfully',
        status: 200
      });
    }

    try {
      const orchestrator = new AIAgentOrchestrator(openaiApiKey);
      const analysis = await orchestrator.agents.jobAnalyzer.analyzeJob(parsedData);
      
      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          parsedData,
          analysis,
        },
        message: 'Job description parsed and analyzed successfully',
        status: 200
      });
    } catch (error) {
      console.error('AI analysis error:', error);
      // Return parsed data even if AI analysis fails
      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          parsedData,
        },
        message: 'Job description parsed successfully',
        status: 200
      });
    }

  } catch (error) {
    console.error('Job parsing error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to parse job description',
      status: 500
    }, { status: 500 });
  }
}
