'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  Download,
  Calendar,
  Target,
  Users,
  FileText,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  totalResumes: number;
  totalJobs: number;
  totalMatches: number;
  averageMatchScore: number;
  topSkills: string[];
  improvementAreas: string[];
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  trends: Array<{
    period: string;
    matchScores: number[];
    resumeCount: number;
    jobCount: number;
  }>;
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [analytics] = useState<AnalyticsData>({
    totalResumes: 12,
    totalJobs: 45,
    totalMatches: 89,
    averageMatchScore: 78,
    topSkills: ['React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'AWS'],
    improvementAreas: [
      'Add more technical keywords to resume',
      'Quantify achievements with metrics',
      'Include more project details',
      'Improve ATS formatting',
      'Add certifications section'
    ],
    recentActivity: [
      {
        id: '1',
        type: 'resume_upload',
        description: 'Uploaded new resume: Senior Frontend Developer',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        type: 'job_analysis',
        description: 'Analyzed job: Senior React Developer at TechCorp',
        timestamp: '2024-01-15T09:15:00Z'
      },
      {
        id: '3',
        type: 'match_created',
        description: 'Created new match: 92% compatibility',
        timestamp: '2024-01-14T16:45:00Z'
      },
      {
        id: '4',
        type: 'optimization_applied',
        description: 'Applied ATS optimizations to resume',
        timestamp: '2024-01-14T14:20:00Z'
      }
    ],
    trends: [
      {
        period: 'This Week',
        matchScores: [75, 78, 82, 79, 85],
        resumeCount: 3,
        jobCount: 12
      },
      {
        period: 'Last Week',
        matchScores: [72, 74, 76, 78, 80],
        resumeCount: 2,
        jobCount: 8
      },
      {
        period: 'Two Weeks Ago',
        matchScores: [70, 71, 73, 75, 77],
        resumeCount: 4,
        jobCount: 15
      }
    ]
  });

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your analytics.</p>
            <Button asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'resume_upload': return <FileText className="h-5 w-5 text-blue-600" />;
      case 'job_analysis': return <Target className="h-5 w-5 text-green-600" />;
      case 'match_created': return <TrendingUp className="h-5 w-5 text-purple-600" />;
      case 'optimization_applied': return <BarChart3 className="h-5 w-5 text-orange-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Track your job search performance and optimize your strategy
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                <Eye className="h-4 w-4 mr-2" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalResumes}</p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +2 this week
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Jobs Analyzed</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalJobs}</p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +8 this week
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Matches Created</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalMatches}</p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +15 this week
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Match Score</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics.averageMatchScore}%</p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +3% this week
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Skills */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Top Performing Skills</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.topSkills.map((skill, index) => (
                    <div key={skill} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{skill}</span>
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Improvement Areas */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5" />
                  <span>Improvement Areas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.improvementAreas.slice(0, 5).map((area, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-gray-700">{area}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Match Score Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Match Score Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analytics.trends.map((trend) => (
                  <div key={trend.period} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{trend.period}</span>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{trend.resumeCount} resumes</span>
                        <span>{trend.jobCount} jobs</span>
                        <span className={getScoreColor(trend.matchScores[trend.matchScores.length - 1])}>
                          {trend.matchScores[trend.matchScores.length - 1]}% avg
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {trend.matchScores.map((score, index) => (
                        <div
                          key={index}
                          className="flex-1 h-2 rounded-full bg-gray-200 relative overflow-hidden"
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ delay: 0.1 * index, duration: 0.5 }}
                            className={`h-full rounded-full ${
                              score >= 80 ? 'bg-green-500' :
                              score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Recent Activity</span>
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
