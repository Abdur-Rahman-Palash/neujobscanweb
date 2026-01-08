'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Briefcase, 
  Target, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  BookOpen,
  Lightbulb
} from 'lucide-react';

interface ATSScannerProps {
  onResumeUpload?: (file: File) => void;
  initialResumeText?: string;
  initialJobText?: string;
}

export function ATSScanner({ onResumeUpload, initialResumeText = '', initialJobText = '' }: ATSScannerProps) {
  const [resumeText, setResumeText] = useState(initialResumeText);
  const [jobText, setJobText] = useState(initialJobText);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!resumeText.trim() || !jobText.trim()) {
      setError('Please provide both resume text and job description');
      return;
    }

    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch('/api/ats/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobText,
          fileName: 'pasted-resume.txt',
          userId: '1', // In real app, get from auth
        }),
      });

      const result = await response.json();

      if (result.success) {
        setScanResult(result.data);
      } else {
        setError(result.error || 'Scan failed');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setIsScanning(false);
    }
  };

  const handleResumeFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onResumeUpload) {
      onResumeUpload(file);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (scanResult) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>ATS Scan Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getScoreBgColor(scanResult.overallScore)} mb-4`}>
                <span className={`text-4xl font-bold ${getScoreColor(scanResult.overallScore)}`}>
                  {scanResult.overallScore}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Overall ATS Score</h3>
              <p className="text-gray-600">{scanResult.explanation?.scoreExplanation?.whatItMeans}</p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{scanResult.keywordScore}</div>
                <div className="text-sm text-gray-600">Keywords</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{scanResult.skillScore}</div>
                <div className="text-sm text-gray-600">Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{scanResult.experienceScore}</div>
                <div className="text-sm text-gray-600">Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{scanResult.educationScore}</div>
                <div className="text-sm text-gray-600">Education</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{scanResult.atsScore}</div>
                <div className="text-sm text-gray-600">ATS Compliance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{scanResult.overallScore}</div>
                <div className="text-sm text-gray-600">Overall</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <Tabs defaultValue="breakdown" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="gaps">Skill Gaps</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="space-y-4">
            {scanResult.explanation?.detailedBreakdown?.map((section: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{section.section}</h4>
                    <Badge variant={section.status === 'excellent' ? 'default' : 'secondary'}>
                      {section.score}/100
                    </Badge>
                  </div>
                  <Progress value={section.score} className="mb-2" />
                  <p className="text-sm text-gray-600 mb-2">{section.explanation}</p>
                  {section.recommendations?.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-sm font-medium">Recommendations:</span>
                      {section.recommendations.map((rec: string, i: number) => (
                        <div key={i} className="text-sm text-gray-600 flex items-start">
                          <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                          {rec}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="keywords" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Matched Keywords</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {scanResult.keywordAnalysis?.matchedKeywords?.map((keyword: string, index: number) => (
                      <Badge key={index} variant="default" className="bg-green-100 text-green-800">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Missing Keywords</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {scanResult.keywordAnalysis?.missingKeywords?.map((keyword: string, index: number) => (
                      <Badge key={index} variant="destructive">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-600">
                    <Lightbulb className="h-4 w-4" />
                    <span>Additional Keywords</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {scanResult.keywordAnalysis?.additionalKeywords?.map((keyword: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gaps" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Skill Gap Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scanResult.skillGapSummary?.criticalGaps?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Critical Gaps</h4>
                      <div className="space-y-2">
                        {scanResult.skillGapSummary.criticalGaps.map((gap: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <span className="text-sm">{gap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {scanResult.skillGapSummary?.strengths?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2">Your Strengths</h4>
                      <div className="space-y-2">
                        {scanResult.skillGapSummary.strengths.map((strength: string, index: number) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-green-50 rounded">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {scanResult.skillGapSummary?.learningPath && (
                    <div>
                      <h4 className="font-semibold text-blue-600 mb-2">Recommended Learning Path</h4>
                      <p className="text-sm text-gray-600 p-3 bg-blue-50 rounded">
                        {scanResult.skillGapSummary.learningPath}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Priority Rewrites</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scanResult.rewriteSuggestions?.priorityRewrites?.slice(0, 3).map((suggestion: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{suggestion.section}</span>
                          <Badge>+{suggestion.atsScore?.improvement}%</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.reason}</p>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Before:</span> {suggestion.originalText?.substring(0, 100)}...
                        </div>
                        <div className="text-xs text-green-600 mt-1">
                          <span className="font-medium">After:</span> {suggestion.rewrittenText?.substring(0, 100)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Quick Wins</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scanResult.rewriteSuggestions?.quickWins?.slice(0, 3).map((suggestion: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{suggestion.section}</span>
                          <Badge variant="secondary">+{suggestion.atsScore?.improvement}%</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{suggestion.reason}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="next-steps" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-red-500" />
                    <span>Immediate</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scanResult.explanation?.nextSteps?.immediate?.map((step: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <span>This Week</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scanResult.explanation?.nextSteps?.thisWeek?.map((step: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    <span>This Month</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scanResult.explanation?.nextSteps?.thisMonth?.map((step: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center">
          <Button onClick={() => setScanResult(null)} variant="outline">
            Run New Scan
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>ATS Resume Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Resume Input */}
          <div className="space-y-2">
            <Label htmlFor="resume">Resume Text</Label>
            <div className="flex space-x-2">
              <Textarea
                id="resume"
                placeholder="Paste your resume text here or upload a file..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="flex-1 min-h-[200px]"
              />
              <div className="flex flex-col space-y-2">
                <Input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={handleResumeFileUpload}
                  className="hidden"
                  id="resume-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('resume-upload')?.click()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
            </div>
          </div>

          {/* Job Description Input */}
          <div className="space-y-2">
            <Label htmlFor="job">Job Description</Label>
            <Textarea
              id="job"
              placeholder="Paste the job description here..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Scan Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleScan}
              disabled={isScanning || !resumeText.trim() || !jobText.trim()}
              className="px-8"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Run ATS Scan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
