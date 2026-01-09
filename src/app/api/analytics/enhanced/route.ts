import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const timeRange = searchParams.get('timeRange') || '30d';

    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required parameter: userId',
        status: 400,
      }, { status: 400 });
    }

    console.log('=== ENHANCED ANALYTICS ===');
    console.log('User ID:', userId);
    console.log('Time Range:', timeRange);

    // Generate mock analytics data
    const analyticsData = await generateEnhancedAnalytics(userId, timeRange);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: analyticsData,
      message: 'Enhanced analytics retrieved successfully',
      status: 200,
    });

  } catch (error) {
    console.error('Enhanced analytics error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during analytics retrieval',
      status: 500,
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, format = 'pdf' } = await request.json();

    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required parameter: userId',
        status: 400,
      }, { status: 400 });
    }

    console.log('=== ANALYTICS EXPORT ===');
    console.log('User ID:', userId);
    console.log('Format:', format);

    // Generate analytics report
    const reportData = await generateAnalyticsReport(userId, format);

    return new NextResponse(reportData, {
      headers: {
        'Content-Type': format === 'pdf' ? 'application/pdf' : 'text/csv',
        'Content-Disposition': `attachment; filename="analytics-report-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'csv'}"`,
      },
    });

  } catch (error) {
    console.error('Analytics export error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during export',
      status: 500,
    }, { status: 500 });
  }
}

async function generateEnhancedAnalytics(userId: string, timeRange: string): Promise<any> {
  // Mock data generation based on time range
  const days = parseInt(timeRange) || 30;
  
  // Generate interview metrics
  const totalApplications = Math.floor(Math.random() * 50) + 100;
  const interviewsScheduled = Math.floor(totalApplications * 0.3);
  const interviewsCompleted = Math.floor(interviewsScheduled * 0.7);
  const interviewRate = Math.round((interviewsCompleted / interviewsScheduled) * 100);
  const averageResponseTime = Math.floor(Math.random() * 7) + 3;
  const successRate = Math.round((interviewsCompleted / interviewsScheduled) * 85);

  const interviewMetrics = {
    totalApplications,
    interviewsScheduled,
    interviewsCompleted,
    interviewRate,
    averageResponseTime,
    successRate,
  };

  // Generate keyword performance data
  const keywords = [
    { keyword: 'React', usageCount: 45, successRate: 78, averageMatchScore: 85, trend: 'up' },
    { keyword: 'TypeScript', usageCount: 38, successRate: 82, averageMatchScore: 88, trend: 'up' },
    { keyword: 'Node.js', usageCount: 32, successRate: 75, averageMatchScore: 82, trend: 'stable' },
    { keyword: 'Python', usageCount: 28, successRate: 70, averageMatchScore: 78, trend: 'down' },
    { keyword: 'AWS', usageCount: 25, successRate: 85, averageMatchScore: 90, trend: 'up' },
    { keyword: 'Docker', usageCount: 20, successRate: 88, averageMatchScore: 85, trend: 'up' },
    { keyword: 'GraphQL', usageCount: 18, successRate: 80, averageMatchScore: 86, trend: 'up' },
  ];

  // Generate application funnel data
  const applicationFunnel = [
    { stage: 'Applied', count: totalApplications, conversionRate: 100, dropOffReason: 'None' },
    { stage: 'Screened', count: Math.floor(totalApplications * 0.7), conversionRate: 85, dropOffReason: 'Not qualified' },
    { stage: 'Interview Scheduled', count: interviewsScheduled, conversionRate: 90, dropOffReason: 'Pending interview' },
    { stage: 'Interview Completed', count: interviewsCompleted, conversionRate: 75, dropOffReason: 'Rejected' },
    { stage: 'Offer Received', count: Math.floor(interviewsCompleted * 0.4), conversionRate: 60, dropOffReason: 'Declined offer' },
  ];

  // Generate trend data
  const trendData = [
    { period: 'Last 7 days', interviewRate: 65, applicationCount: 15, successRate: 60 },
    { period: 'Last 30 days', interviewRate: 70, applicationCount: 50, successRate: 70 },
    { period: 'Last 90 days', interviewRate: 75, applicationCount: 120, successRate: 72 },
    { period: 'Last 6 months', interviewRate: 80, applicationCount: 300, successRate: 68 },
  ];

  return {
    interviewMetrics,
    keywordPerformance: keywords,
    applicationFunnel,
    trendData,
    generatedAt: new Date(),
  };
}

async function generateAnalyticsReport(userId: string, format: string): Promise<string> {
  const data = await generateEnhancedAnalytics(userId, '30d');
  
  if (format === 'pdf') {
    return generatePDFReport(data);
  } else if (format === 'csv') {
    return generateCSVReport(data);
  } else {
    return JSON.stringify(data, null, 2);
  }
}

function generatePDFReport(data: any): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Analytics Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .metric { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f5f5f5; font-weight: bold; }
        .chart { margin: 20px 0; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>NeuJobScan Analytics Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
    </div>

    <div class="section">
        <h2>Interview Metrics</h2>
        <div class="metric">
            <span>Total Applications:</span>
            <span>${data.interviewMetrics.totalApplications}</span>
        </div>
        <div class="metric">
            <span>Interview Rate:</span>
            <span>${data.interviewMetrics.interviewRate}%</span>
        </div>
        <div class="metric">
            <span>Success Rate:</span>
            <span>${data.interviewMetrics.successRate}%</span>
        </div>
    </div>

    <div class="section">
        <h2>Top Performing Keywords</h2>
        <table>
            <tr>
                <th>Keyword</th>
                <th>Usage Count</th>
                <th>Success Rate</th>
                <th>Trend</th>
            </tr>
            ${data.keywordPerformance.map((keyword: any) => `
                <tr>
                    <td>${keyword.keyword}</td>
                    <td>${keyword.usageCount}</td>
                    <td>${keyword.successRate}%</td>
                    <td>${keyword.averageMatchScore}</td>
                    <td>${keyword.trend === 'up' ? '↑' : keyword.trend === 'down' ? '↓' : '→'}</td>
                </tr>
            `).join('')}
        </table>
    </div>

    <div class="section">
        <h2>Application Funnel</h2>
        <table>
            <tr>
                <th>Stage</th>
                <th>Count</th>
                <th>Conversion Rate</th>
                <th>Drop-off Reason</th>
            </tr>
            ${data.applicationFunnel.map((stage: any) => `
                <tr>
                    <td>${stage.stage}</td>
                    <td>${stage.count}</td>
                    <td>${stage.conversionRate}%</td>
                    <td>${stage.dropOffReason || 'N/A'}</td>
                </tr>
            `).join('')}
        </table>
    </div>

    <div class="section">
        <h2>Performance Trends</h2>
        <table>
            <tr>
                <th>Period</th>
                <th>Interview Rate</th>
                <th>Applications</th>
            </tr>
            ${data.trendData.map((trend: any) => `
                <tr>
                    <td>${trend.period}</td>
                    <td>${trend.interviewRate}%</td>
                    <td>${trend.applicationCount}</td>
                </tr>
            `).join('')}
        </table>
    </div>
</body>
</html>
  `;
}

function generateCSVReport(data: any): string {
  const headers = ['Period', 'Interview Rate', 'Applications', 'Success Rate'];
  const rows = [
    headers.join(','),
    ...data.trendData.map((trend: any) => [trend.period, trend.interviewRate, trend.applicationCount, trend.successRate].join(','))
  ];

  return rows.join('\n');
}
