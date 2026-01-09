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
import { AIResumeOptimizer } from '@/components/ai/resume-optimizer';
import { JobAnalyzer } from '@/components/job/job-analyzer';
import { CoverLetterBuilder } from '@/components/cover-letter/cover-letter-builder';
import { PremiumFeatures } from '@/components/premium/premium-features';
import { 
  FileText, 
  Target, 
  TrendingUp, 
  Plus,
  Upload,
  BarChart3
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signup?next=/dashboard');
    }
  }, [user, loading, router]);

  const [activeTab, setActiveTab] = useState('overview');
  const [uploadedResume, setUploadedResume] = useState<any>(null);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [resumeData, setResumeData] = useState<any>(null);
  const [jobData, setJobData] = useState<any>(null);

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
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-7 gap-2 overflow-x-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="resume-upload">Upload Resume</TabsTrigger>
            <TabsTrigger value="ats-scanner">ATS Scanner</TabsTrigger>
            <TabsTrigger value="ai-optimizer">AI Optimizer</TabsTrigger>
            <TabsTrigger value="job-analyzer">Job Analyzer</TabsTrigger>
            <TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
            <TabsTrigger value="premium-features">Premium</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
                      onClick={() => setActiveTab('resume-upload')}
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

          <TabsContent value="resume-upload" className="space-y-6">
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

          <TabsContent value="ai-optimizer" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AIResumeOptimizer
                initialResumeText={resumeText}
                initialJobText={''}
                onOptimizationComplete={(opt) => {
                  console.log('Optimization complete:', opt);
                  setResumeText(opt);
                }}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="job-analyzer" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <JobAnalyzer
                onAnalysisComplete={(analysis) => {
                  console.log('Job analysis complete:', analysis);
                  setJobData(analysis);
                }}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="cover-letter" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <CoverLetterBuilder 
                onResumeData={(data) => {
                  console.log('Resume data received:', data);
                  setResumeData(data);
                }}
                onJobData={(data) => {
                  console.log('Job data received:', data);
                  setJobData(data);
                }}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="premium-features" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <PremiumFeatures userId={mockUser.id} />
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
