'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Calendar,
  Target,
  Zap,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Filter
} from 'lucide-react';

interface AnalyticsData {
  totalScans: number;
  successfulScans: number;
  averageScore: number;
  interviewsScheduled: number;
  interviewsCompleted: number;
  offerReceived: number;
  keywordPerformance: Record<string, number>;
  scanHistory: Array<{
    id: string;
    date: string;
    score: number;
    type: string;
  }>;
}

export function EnhancedAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalScans: 1247,
    successfulScans: 1098,
    averageScore: 78.5,
    interviewsScheduled: 45,
    interviewsCompleted: 38,
    offerReceived: 12,
    keywordPerformance: {
      'JavaScript': 89,
      'React': 92,
      'Node.js': 85,
      'TypeScript': 88,
      'Python': 76,
      'AWS': 82,
      'Docker': 79,
      'MongoDB': 74,
      'PostgreSQL': 77,
      'GraphQL': 71
    },
    scanHistory: [
      { id: '1', date: '2024-01-15', score: 85, type: 'resume' },
      { id: '2', date: '2024-01-14', score: 92, type: 'resume' },
      { id: '3', date: '2024-01-13', score: 78, type: 'job' },
      { id: '4', date: '2024-01-12', score: 88, type: 'resume' },
      { id: '5', date: '2024-01-11', score: 95, type: 'cover-letter' },
      { id: '6', date: '2024-01-10', score: 82, type: 'resume' },
      { id: '7', date: '2024-01-09', score: 91, type: 'job' },
      { id: '8', date: '2024-01-08', score: 87, type: 'resume' },
      { id: '9', date: '2024-01-07', score: 94, type: 'cover-letter' },
      { id: '10', date: '2024-01-06', score: 79, type: 'resume' }
    ]
  });

  const successRate = ((analyticsData.successfulScans / analyticsData.totalScans) * 100).toFixed(1);
  const interviewRate = ((analyticsData.interviewsCompleted / analyticsData.interviewsScheduled) * 100).toFixed(1);
  const offerRate = ((analyticsData.offerReceived / analyticsData.interviewsCompleted) * 100).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <span>Enhanced Analytics</span>
            <Badge className="ml-2 bg-blue-100 text-blue-800">PRO</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="interviews">Interviews</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Scans</p>
                        <p className="text-2xl font-bold">{analyticsData.totalScans}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Success Rate</p>
                        <p className="text-2xl font-bold text-green-600">{successRate}%</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Score</p>
                        <p className="text-2xl font-bold text-blue-600">{analyticsData.averageScore}</p>
                      </div>
                      <Target className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Interviews</p>
                        <p className="text-2xl font-bold text-purple-600">{analyticsData.interviewsCompleted}</p>
                      </div>
                      <Users className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Interview Funnel</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Scheduled</span>
                        <span className="text-sm font-bold">{analyticsData.interviewsScheduled}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Completed</span>
                        <span className="text-sm font-bold text-green-600">{analyticsData.interviewsCompleted}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Offers</span>
                        <span className="text-sm font-bold text-blue-600">{analyticsData.offerReceived}</span>
                      </div>
                      <div className="mt-4">
                        <div className="text-sm text-gray-600 mb-2">Completion Rate</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${interviewRate}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{interviewRate}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Offer Rate</span>
                        <span className="text-sm font-bold text-blue-600">{offerRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Avg Response Time</span>
                        <span className="text-sm font-bold">2.3 days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Profile Views</span>
                        <span className="text-sm font-bold">1,247</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Recruiter Contacts</span>
                        <span className="text-sm font-bold">89</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="interviews" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-purple-500" />
                    <span>Interview Tracking</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                          <p className="text-2xl font-bold text-purple-600">{analyticsData.interviewsScheduled}</p>
                          <p className="text-sm text-gray-600">Scheduled</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <p className="text-2xl font-bold text-green-600">{analyticsData.interviewsCompleted}</p>
                          <p className="text-sm text-gray-600">Completed</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <Award className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                          <p className="text-2xl font-bold text-blue-600">{analyticsData.offerReceived}</p>
                          <p className="text-sm text-gray-600">Offers Received</p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold mb-3">Upcoming Interviews</h4>
                      <div className="space-y-3">
                        <Card className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">Senior Frontend Developer</h5>
                              <p className="text-sm text-gray-600">TechCorp Inc.</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline">Tomorrow</Badge>
                                <Badge className="bg-purple-100 text-purple-800">Video Call</Badge>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">Full Stack Engineer</h5>
                              <p className="text-sm text-gray-600">StartupXYZ</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline">Friday</Badge>
                                <Badge className="bg-blue-100 text-blue-800">On-site</Badge>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keywords" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span>Keyword Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Top Performing Keywords</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {Object.entries(analyticsData.keywordPerformance)
                              .sort(([,a], [,b]) => b - a)
                              .slice(0, 5)
                              .map(([keyword, score]) => (
                                <div key={keyword} className="flex justify-between items-center">
                                  <span className="text-sm font-medium">{keyword}</span>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div 
                                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${score}%` }}
                                      />
                                    </div>
                                    <span className="text-sm font-bold text-green-600">{score}%</span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Keyword Recommendations</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="p-3 bg-blue-50 rounded">
                              <h5 className="font-medium text-blue-800 mb-1">Add "Machine Learning"</h5>
                              <p className="text-sm text-blue-600">High demand in your target roles</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded">
                              <h5 className="font-medium text-green-800 mb-1">Include "System Design"</h5>
                              <p className="text-sm text-green-600">Critical for senior positions</p>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded">
                              <h5 className="font-medium text-yellow-800 mb-1">Mention "CI/CD"</h5>
                              <p className="text-sm text-yellow-600">Shows modern development practices</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <span>Scan History</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="text-sm border rounded px-3 py-1"
                      >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                      </select>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.scanHistory.map((scan) => (
                      <Card key={scan.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h5 className="font-medium capitalize">{scan.type} Scan</h5>
                            <p className="text-sm text-gray-600">{scan.date}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={
                              scan.score >= 90 ? 'bg-green-100 text-green-800' :
                              scan.score >= 80 ? 'bg-blue-100 text-blue-800' :
                              scan.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {scan.score >= 90 ? 'Excellent' :
                               scan.score >= 80 ? 'Good' :
                               scan.score >= 70 ? 'Average' : 'Needs Work'}
                            </Badge>
                            <span className="text-lg font-bold">{scan.score}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}