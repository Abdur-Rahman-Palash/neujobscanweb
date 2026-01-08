import { NextRequest, NextResponse } from 'next/server';
import { AIAgentOrchestrator } from '@/lib/agents/orchestrator';
import { ApiResponse, ATSResponse } from '@/types';
import { ParsedResume } from '@/lib/agents/resumeParser';
import { ParsedJob } from '@/lib/agents/jobParser';

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
      llmProvider: 'openai',
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
      resumeResult.data as ParsedResume,
      jobResult.data as ParsedJob
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

    const result: ATSResponse = {
      scanId: (scanResult.data as any).scanId,
      timestamp: (scanResult.data as any).timestamp,
      overallScore: (scanResult.data as any).scores.overallScore,
      atsScore: (scanResult.data as any).scores.atsScore,
      keywordScore: (scanResult.data as any).scores.keywordScore,
      experienceScore: (scanResult.data as any).scores.experienceScore,
      educationScore: (scanResult.data as any).scores.educationScore,
      skillScore: (scanResult.data as any).scores.skillScore,
      formatScore: (scanResult.data as any).scores.formatScore,
      breakdown: (scanResult.data as any).scores.breakdown,
      keywordMatches: (scanResult.data as any).keywordMatches,
      skillGaps: (scanResult.data as any).skillGaps,
      rewriteSuggestions: (scanResult.data as any).rewriteSuggestions,
      explanation: (scanResult.data as any).explanation,
      recommendations: (scanResult.data as any).scores.recommendations,
      strengths: (scanResult.data as any).scores.strengths,
      weaknesses: (scanResult.data as any).scores.weaknesses,
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: result,
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
      llmProvider: 'openai',
      enableCaching: true,
      timeoutMs: 30000,
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
