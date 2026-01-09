'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResumeUploader } from '@/components/resume/resume-uploader';
import { MatchScore } from '@/components/dashboard/match-score';
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard';
import { ATSScanner } from '@/components/ats/ats-scanner';
import { 
  FileText, 
  Target, 
  TrendingUp, 
  Plus,
  Upload,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedResume, setUploadedResume] = useState<any>(null);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [resumeText, setResumeText] = useState<string>('');

  const handleResumeUpload = (data: any) => {
    setUploadedResume(data);
    if (data.text) {
      setResumeText(data.text);
    }
    setActiveTab('ats-scanner');
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  // Mock user data since we removed authentication
  const mockUser = {
    name: 'Demo User',
    id: '1'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {mockUser.name}! Optimize your resume for better job matches.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button asChild>
                <Link href="/pricing">
                  <Plus className="h-4 w-4 mr-2" />
                  Upgrade Plan
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resumes Uploaded</p>
                  <p className="text-2xl font-bold text-gray-900">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Job Matches</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Match Score</p>
                  <p className="text-2xl font-bold text-gray-900">78%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Upload Resume</span>
            </TabsTrigger>
            <TabsTrigger value="ats-scanner" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>ATS Scanner</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Uploaded new resume</p>
                          <p className="text-xs text-gray-500">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                        <Target className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">85% match found</p>
                          <p className="text-xs text-gray-500">4 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">Optimizations applied</p>
                          <p className="text-xs text-gray-500">1 day ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={() => setActiveTab('upload')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Resume
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('ats-scanner')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Analyze Job Description
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('analytics')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      View Full Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Resume</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResumeUploader
                    onUploadComplete={handleResumeUpload}
                    onUploadError={handleUploadError}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="ats-scanner" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ATSScanner 
                onResumeUpload={handleResumeUpload}
                initialResumeText={resumeText}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {uploadedResume ? (
                <MatchScore
                  matchResult={{
                    id: '1',
                    resumeId: '1',
                    jobId: '1',
                    overallScore: 85,
                    atsScore: 88,
                    keywordScore: 82,
                    experienceScore: 85,
                    educationScore: 90,
                    skillScore: 80,
                    matchPercentage: 85,
                    strengths: [
                      'Strong technical skills in React and TypeScript',
                      'Relevant work experience',
                      'Good educational background',
                      'Well-structured resume format'
                    ],
                    gaps: [
                      'Missing some key keywords from job description',
                      'Could quantify achievements better',
                      'Limited project descriptions'
                    ],
                    recommendations: [
                      'Add specific metrics to achievements',
                      'Include more technical keywords',
                      'Expand project descriptions',
                      'Add certifications section'
                    ],
                    missingKeywords: ['GraphQL', 'Kubernetes', 'CI/CD', 'Microservices'],
                    createdAt: new Date()
                  }}
                  onViewDetails={() => console.log('View details')}
                  onDownloadReport={() => console.log('Download report')}
                />
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Resume Uploaded Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Upload your resume to get detailed analysis and optimization suggestions.
                    </p>
                    <Button onClick={() => setActiveTab('upload')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Resume
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AnalyticsDashboard userId={mockUser.id} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
