import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, Analytics } from '@/types';

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would fetch from your database
    // For now, we'll return mock analytics data
    const analytics: Analytics = {
      userId: '1',
      totalResumes: 12,
      totalJobs: 28,
      totalMatches: 45,
      averageMatchScore: 72.5,
      topSkills: [
        'JavaScript', 'React', 'TypeScript', 'Node.js', 'Python',
        'AWS', 'Docker', 'Git', 'Agile', 'REST APIs'
      ],
      improvementAreas: [
        'Add more technical keywords',
        'Quantify achievements with metrics',
        'Include more project details',
        'Add certifications',
        'Improve skill descriptions'
      ],
      recentActivity: [
        {
          id: '1',
          type: 'resume_upload',
          description: 'Uploaded new resume: Senior Developer Resume',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          metadata: { fileName: 'senior-dev-resume.pdf', fileSize: 245760 }
        },
        {
          id: '2',
          type: 'job_analysis',
          description: 'Analyzed job: Senior Frontend Developer at TechCorp',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          metadata: { company: 'TechCorp', matchScore: 85 }
        },
        {
          id: '3',
          type: 'match_created',
          description: 'Created match: Resume vs Job - 85% match',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          metadata: { matchScore: 85, recommendations: 12 }
        },
        {
          id: '4',
          type: 'optimization_applied',
          description: 'Applied 5 optimization suggestions',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          metadata: { optimizationsApplied: 5, scoreImprovement: 15 }
        },
      ],
      trends: [
        {
          period: '2024-01',
          matchScores: [65, 70, 72, 75, 78, 80, 82, 85],
          resumeCount: 2,
          jobCount: 5
        },
        {
          period: '2024-02',
          matchScores: [68, 72, 74, 76, 79, 81, 83, 86],
          resumeCount: 3,
          jobCount: 7
        },
        {
          period: '2024-03',
          matchScores: [70, 73, 75, 77, 80, 82, 84, 87],
          resumeCount: 4,
          jobCount: 8
        },
      ]
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: analytics,
      message: 'Analytics data retrieved successfully',
      status: 200
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to retrieve analytics data',
      status: 500
    }, { status: 500 });
  }
}
