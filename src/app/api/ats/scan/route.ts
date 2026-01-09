export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { AIAgentOrchestrator } from '@/lib/ai/orchestrator';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeText, jobText, fileName, userId } = body;

    if (!resumeText || !jobText || !userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required fields: resumeText, jobText, userId',
        status: 400,
      }, { status: 400 });
    }

    // Initialize AI Orchestrator
    const orchestrator = new AIAgentOrchestrator({
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      enableCaching: true,
      timeoutMs: 60000,
    });

    // Step 1: Parse resume
    const resumeResult = await orchestrator.processResume(resumeText, fileName || 'resume.txt');
    
    if (!resumeResult.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Resume parsing failed: ${resumeResult.error}`,
        status: 500,
      }, { status: 500 });
    }

    // Step 2: Parse job description
    const jobResult = await orchestrator.processJobDescription(jobText);
    
    if (!jobResult.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Job parsing failed: ${jobResult.error}`,
        status: 500,
      }, { status: 500 });
    }

    // Step 3: Perform complete ATS scan using multi-agent system
    const scanResult = await orchestrator.performATSScan(
      resumeResult.data,
      jobResult.data
    );

    if (!scanResult.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `ATS scan failed: ${scanResult.error}`,
        status: 500,
      }, { status: 500 });
    }

    // Step 4: Save scan result for history
    const saveResult = await orchestrator.saveScanResult(userId, scanResult.data);

    if (!saveResult.success) {
      console.error('Failed to save scan result:', saveResult.error);
      // Continue even if save fails
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        scanId: scanResult.data.scanId,
        timestamp: scanResult.data.timestamp,
        overallScore: scanResult.data.scores.overallScore,
        atsScore: scanResult.data.scores.atsScore,
        keywordScore: scanResult.data.scores.keywordScore,
        experienceScore: scanResult.data.scores.experienceScore,
        educationScore: scanResult.data.scores.educationScore,
        skillScore: scanResult.data.scores.skillScore,
        breakdown: scanResult.data.scores.breakdown,
        keywordMatches: scanResult.data.keywordMatches,
        skillGaps: scanResult.data.skillGaps,
        rewriteSuggestions: scanResult.data.rewriteSuggestions,
        explanation: scanResult.data.explanation,
        recommendations: scanResult.data.scores.recommendations,
        strengths: scanResult.data.scores.strengths,
        weaknesses: scanResult.data.scores.weaknesses,
      },
      message: 'ATS scan completed successfully',
      status: 200,
    });

  } catch (error) {
    console.error('ATS scan API error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during ATS scan',
      status: 500,
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required parameter: userId',
        status: 400,
      }, { status: 400 });
    }

    // Initialize AI Orchestrator
    const orchestrator = new AIAgentOrchestrator({
      openaiApiKey: process.env.OPENAI_API_KEY || '',
    });

    // Get scan history
    const historyResult = await orchestrator.getScanHistory(userId);

    if (!historyResult.success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Failed to retrieve scan history: ${historyResult.error}`,
        status: 500,
      }, { status: 500 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: historyResult.data,
      message: 'Scan history retrieved successfully',
      status: 200,
    });

  } catch (error) {
    console.error('Scan history API error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error while retrieving scan history',
      status: 500,
    }, { status: 500 });
  }
}
