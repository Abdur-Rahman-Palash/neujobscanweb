'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Briefcase, 
  Target, 
  TrendingUp,
  DollarSign,
  Users,
  Brain,
  Eye,
  Download,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Clock,
  BarChart3
} from 'lucide-react';

interface JobAnalyzerProps {
  onAnalysisComplete?: (analysis: any) => void;
}

export function JobAnalyzer({ onAnalysisComplete }: JobAnalyzerProps) {
  const [jobText, setJobText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);

  const handleAnalyze = async () => {
    if (!jobText.trim()) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/job-analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobText,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setAnalysis(result.data);
        onAnalysisComplete?.(result.data);
      }
    } catch (error) {
      console.error('Job analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveJob = () => {
    if (!jobText.trim() || !analysis) {
      return;
    }

    const newJob = {
      id: Date.now().toString(),
      text: jobText,
      analysis,
      savedAt: new Date(),
    };

    setSavedJobs([...savedJobs, newJob]);
  };

  const getExperienceColor = (level: string) => {
    switch (level) {
      case 'entry': return 'bg-green-100 text-green-800';
      case 'mid': return 'bg-yellow-100 text-yellow-800';
      case 'senior': return 'bg-orange-100 text-orange-800';
      case 'lead': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompetitivenessColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (analysis) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-5 w-5" />
              <span>Job Analysis Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{analysis.skills?.required?.length || 0}</div>
                <div className="text-sm text-gray-600">Required Skills</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{analysis.experience?.level || 'N/A'}</div>
                <div className="text-sm text-gray-600">Experience Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{analysis.salary?.range || 'N/A'}</div>
                <div className="text-sm text-gray-600">Salary Range</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{analysis.competitiveness?.level || 'N/A'}</div>
                <div className="text-sm text-gray-600">Competitiveness</div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <Tabs defaultValue="skills" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="culture">Culture</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="skills" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-green-600">Required Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.skills?.required?.slice(0, 10).map((skill: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                            <span className="font-medium">{skill.name}</span>
                            <Badge className="bg-green-100 text-green-800">{skill.category}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-blue-600">Preferred Skills</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.skills?.preferred?.slice(0, 10).map((skill: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                            <span className="font-medium">{skill.name}</span>
                            <Badge className="bg-blue-100 text-blue-800">{skill.category}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="requirements" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Must-Have Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.requirements?.mustHave?.slice(0, 8).map((req: any, index: number) => (
                          <div key={index} className="flex items-start space-x-2 p-2 bg-red-50 rounded">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                            <span className="text-sm">{req}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Nice-to-Have Requirements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.requirements?.niceToHave?.slice(0, 8).map((req: any, index: number) => (
                          <div key={index} className="flex items-start space-x-2 p-2 bg-yellow-50 rounded">
                            <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                            <span className="text-sm">{req}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="culture" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Company Culture</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Work Environment</span>
                          <p className="text-lg font-semibold">{analysis.culture?.workEnvironment || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Team Size</span>
                          <p className="text-lg font-semibold">{analysis.culture?.teamSize || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Growth Opportunities</span>
                          <p className="text-lg font-semibold">{analysis.culture?.growthOpportunities || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Work-Life Balance</span>
                          <p className="text-lg font-semibold">{analysis.culture?.workLifeBalance || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <span className="text-sm font-medium text-gray-600">Culture Keywords</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {analysis.culture?.keywords?.slice(0, 8).map((keyword: string, index: number) => (
                            <Badge key={index} variant="secondary">{keyword}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>Market Insights</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Market Demand</span>
                          <Badge className={getCompetitivenessColor(analysis.competitiveness?.level)}>
                            {analysis.competitiveness?.level || 'Medium'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Career Growth</span>
                          <Badge className="bg-green-100 text-green-800">
                            {analysis.insights?.careerGrowth || 'Medium'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Remote Work</span>
                          <Badge className={analysis.insights?.remoteWork ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {analysis.insights?.remoteWork ? 'Available' : 'On-site'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Application Strategy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded">
                          <h4 className="font-semibold text-blue-900 mb-2">Recommended Approach</h4>
                          <p className="text-sm text-blue-800">{analysis.insights?.applicationStrategy || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded">
                          <h4 className="font-semibold text-green-900 mb-2">Key Differentiators</h4>
                          <p className="text-sm text-green-800">{analysis.insights?.differentiators || 'N/A'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div className="flex space-x-4">
                  <Button onClick={handleSaveJob} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Save Analysis
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-2" />
                    View Similar Jobs
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Target className="h-4 w-4 mr-2" />
                    Find Matching Resumes
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Saved Jobs */}
        {savedJobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Saved Job Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {savedJobs.slice(0, 5).map((job: any, index: number) => (
                  <div key={job.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{job.analysis?.title || 'Untitled Job'}</span>
                      <Badge variant="secondary">
                        {new Date(job.savedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{job.text?.substring(0, 100)}...</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center">
          <Button onClick={() => setAnalysis(null)} variant="outline">
            Analyze Another Job
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
            <Brain className="h-5 w-5" />
            <span>Advanced Job Description Analyzer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Description</label>
            <Textarea
              placeholder="Paste the complete job description here..."
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              className="min-h-[300px]"
            />
          </div>

          {/* Analysis Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-3">Analysis Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !jobText.trim()}
                className="w-full"
                size="lg"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing Job...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Job Description
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Browse Job Templates
              </Button>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Analysis Tips
            </h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Look for specific technical requirements and years of experience</p>
              <p>• Identify must-have vs nice-to-have qualifications</p>
              <p>• Pay attention to company culture keywords and values</p>
              <p>• Note salary ranges and compensation structures</p>
              <p>• Look for growth opportunities and career progression</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
