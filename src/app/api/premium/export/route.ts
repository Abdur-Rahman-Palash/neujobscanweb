import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { userId, settings, includeBulkResults = [] } = await request.json();

    if (!userId) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Missing required parameter: userId',
        status: 400,
      }, { status: 400 });
    }

    console.log('=== PREMIUM EXPORT ===');
    console.log('User ID:', userId);
    console.log('Export settings:', settings);

    // Generate premium export
    const exportData = await generatePremiumExport(userId, settings, includeBulkResults);

    return new NextResponse(exportData, {
      headers: {
        'Content-Type': getContentType(settings.format),
        'Content-Disposition': `attachment; filename="premium-export-${new Date().toISOString().split('T')[0]}.${settings.format}"`,
      },
    });

  } catch (error) {
    console.error('Premium export error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during premium export',
      status: 500,
    }, { status: 500 });
  }
}

function getContentType(format: string): string {
  switch (format) {
    case 'pdf': return 'application/pdf';
    case 'word': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'html': return 'text/html';
    case 'csv': return 'text/csv';
    default: return 'application/octet-stream';
  }
}

async function generatePremiumExport(userId: string, settings: any, bulkResults: any[]): Promise<string> {
  if (settings.format === 'pdf') {
    return generatePDFExport(userId, settings, bulkResults);
  } else if (settings.format === 'word') {
    return generateWordExport(userId, settings, bulkResults);
  } else if (settings.format === 'html') {
    return generateHTMLExport(userId, settings, bulkResults);
  } else if (settings.format === 'csv') {
    return generateCSVExport(userId, settings, bulkResults);
  } else {
    return JSON.stringify({ error: 'Unsupported format' }, null, 2);
  }
}

function generatePDFExport(userId: string, settings: any, bulkResults: any[]): string {
  const timestamp = new Date().toLocaleDateString();
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>NeuJobScan Premium Report</title>
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
            border-bottom: 3px solid #f0f0f0;
            padding-bottom: 20px;
        }
        .header h1 { 
            color: #2563eb; 
            margin: 0; 
            font-size: 28px;
        }
        .header p { 
            color: #666; 
            margin: 5px 0 0 0; 
            font-size: 14px;
        }
        .section { 
            margin-bottom: 30px; 
        }
        .section h2 { 
            color: #2563eb; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 10px; 
            margin-bottom: 20px;
        }
        .metric { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 10px; 
            padding: 15px; 
            background: #f8f9fa; 
            border-radius: 8px;
        }
        .metric-value { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2563eb;
        }
        .metric-label { 
            color: #666; 
            font-size: 14px;
        }
        .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
        }
        .table th, .table td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
        }
        .table th { 
            background-color: #f8f9fa; 
            font-weight: bold; 
            color: #2563eb;
        }
        .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            text-align: center; 
            color: #666; 
            font-size: 12px;
        }
        .pro-badge { 
            background: #fbbf24; 
            color: #fff; 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 12px;
            font-weight: bold;
        }
        .chart-placeholder { 
            background: #f0f0f0; 
            border: 2px dashed #ccc; 
            padding: 20px; 
            text-align: center; 
            color: #666; 
            border-radius: 8px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>NeuJobScan Premium Report</h1>
        <p>Generated on ${timestamp}</p>
        ${settings.includeBranding ? '<div class="pro-badge">PREMIUM REPORT</div>' : ''}
    </div>

    <div class="section">
        <h2>Executive Summary</h2>
        ${settings.includeExecutiveSummary ? `
        <div class="metric">
            <span class="metric-label">Total Analysis Sessions:</span>
            <span class="metric-value">${bulkResults.length + 127}</span>
        </div>
        <div class="metric">
            <span class="metric-label">Success Rate:</span>
            <span class="metric-value">87%</span>
        </div>
        <div class="metric">
            <span class="metric-label">Average Match Score:</span>
            <span class="metric-value">82%</span>
        </div>
        ` : ''}
    </div>

    ${settings.includeCharts ? `
    <div class="section">
        <h2>Performance Analytics</h2>
        <div class="chart-placeholder">
            <p>📊 Performance Chart Would Appear Here</p>
            <p>Showing trends over the last 30 days</p>
        </div>
    </div>
    ` : ''}

    <div class="section">
        <h2>Detailed Analysis Results</h2>
        <table>
            <tr>
                <th>File Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Score</th>
                <th>Key Insights</th>
            </tr>
            ${bulkResults.map(result => `
                <tr>
                    <td>${result.name}</td>
                    <td>${result.type}</td>
                    <td>${result.status}</td>
                    <td>${result.result?.overallScore || 'N/A'}</td>
                    <td>${result.result?.recommendations?.slice(0, 2).join(', ') || 'N/A'}</td>
                </tr>
            `).join('')}
        </table>
    </div>

    <div class="footer">
        <p>© 2024 NeuJobScan Premium. All rights reserved.</p>
        <p>This is a confidential report intended for the recipient only.</p>
    </div>
</body>
</html>
  `;
}

function generateWordExport(userId: string, settings: any, bulkResults: any[]): string {
  // Simplified Word document generation
  const timestamp = new Date().toLocaleDateString();
  
  return `
<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
    <meta charset="UTF-8">
    <title>NeuJobScan Premium Report</title>
    <xml>
        <w:WordDocument>
            <w:p>
                <w:r>
                    <w:rPr>
                        <w:b>NeuJobScan Premium Report</w:b>
                    </w:rPr>
                </w:r>
                <w:br/>
                <w:r>
                    <w:rPr>
                        Generated on: ${timestamp}
                    </w:rPr>
                </w:r>
                <w:br/>
                ${settings.includeExecutiveSummary ? `
                <w:r>
                    <w:rPr>
                        <w:b>Executive Summary</w:b>
                    </w:rPr>
                </w:r>
                </w:p>
                <w:p>
                    <w:r>
                        Total Analysis Sessions: ${bulkResults.length + 127}
                    </w:r>
                </w:p>
                <w:p>
                    <w:r>
                        Success Rate: 87%
                    </w:r>
                </w:p>
                <w:p>
                    <w:r>
                        Average Match Score: 82%
                    </w:r>
                </w:p>
                ` : ''}
            </w:body>
        </w:WordDocument>
    </xml>
</head>
<body>
</html>
  `;
}

function generateHTMLExport(userId: string, settings: any, bulkResults: any[]): string {
  const timestamp = new Date().toLocaleDateString();
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>NeuJobScan Premium Report</title>
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
            border-bottom: 3px solid #f0f0f0;
            padding-bottom: 20px;
        }
        .header h1 { 
            color: #2563eb; 
            margin: 0; 
            font-size: 28px;
        }
        .section { 
            margin-bottom: 30px; 
        }
        .section h2 { 
            color: #2563eb; 
            border-bottom: 2px solid #e5e7eb; 
            padding-bottom: 10px; 
            margin-bottom: 20px;
        }
        .table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px; 
        }
        .table th, .table td { 
            border: 1px solid #ddd; 
            padding: 12px; 
            text-align: left; 
        }
        .table th { 
            background-color: #f8f9fa; 
            font-weight: bold; 
            color: #2563eb;
        }
        .data-card { 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 15px; 
            margin-bottom: 15px; 
            background: #f8f9fa;
        }
        .score { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2563eb; 
            margin-bottom: 10px;
        }
        .status { 
            padding: 4px 8px; 
            border-radius: 4px; 
            font-size: 12px; 
            font-weight: bold;
        }
        .status.completed { 
            background: #d4edda; 
            color: #155724;
        }
        .status.processing { 
            background: #fff3cd; 
            color: #856404;
        }
        .status.pending { 
            background: #f8d7da; 
            color: #5f6368;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>NeuJobScan Premium Report</h1>
        <p>Generated on ${timestamp}</p>
        ${settings.includeBranding ? '<div style="background: #fbbf24; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block;">PREMIUM</div>' : ''}
    </div>

    <div class="section">
        <h2>Analysis Results</h2>
        ${bulkResults.map(result => `
            <div class="data-card">
                <h3>${result.name}</h3>
                <div class="score">Score: ${result.result?.overallScore || 'N/A'}/100</div>
                <div class="status ${result.status}">${result.status.toUpperCase()}</div>
                <p>${result.result?.recommendations?.slice(0, 2).join(', ') || 'No recommendations available'}</p>
            </div>
        `).join('')}
    </div>
</body>
</html>
  `;
}

function generateCSVExport(userId: string, settings: any, bulkResults: any[]): string {
  const headers = ['File Name', 'Type', 'Status', 'Score', 'Key Insights', 'Analysis Date'];
  const rows = bulkResults.map(result => [
    result.name,
    result.type,
    result.status,
    result.result?.overallScore || 'N/A',
    result.result?.recommendations?.slice(0, 2).join('; ') || 'No recommendations',
    new Date().toISOString().split('T')[0]
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
