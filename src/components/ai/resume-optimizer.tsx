'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  Edit3, 
  CheckCircle, 
  Lightbulb, 
  Copy,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp
} from 'lucide-react';

interface AIResumeOptimizerProps {
  initialResumeText?: string;
  initialJobText?: string;
  onOptimizationComplete?: (optimizedText: string) => void;
}

export function AIResumeOptimizer({ 
  initialResumeText = '', 
  initialJobText = '',
  onOptimizationComplete 
}: AIResumeOptimizerProps) {
  const [resumeText, setResumeText] = useState(initialResumeText);
  const [jobText, setJobText] = useState(initialJobText);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedText, setOptimizedText] = useState('');
  const [optimizationResults, setOptimizationResults] = useState<any>(null);
  const [selectedSection, setSelectedSection] = useState('summary');
  const [powerEditSuggestions, setPowerEditSuggestions] = useState<any[]>([]);

  const handleOneClickOptimize = async () => {
    if (!resumeText.trim() || !jobText.trim()) {
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await fetch('/api/ai/optimize-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText,
          jobText,
          optimizationType: 'full',
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setOptimizedText(result.data.optimizedText);
        setOptimizationResults(result.data.analysis);
        onOptimizationComplete?.(result.data.optimizedText);
      }
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handlePowerEdit = async (section: string, originalText: string) => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/ai/power-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          originalText,
          jobText,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setPowerEditSuggestions(result.data.suggestions);
      }
    } catch (error) {
      console.error('Power edit error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const applySuggestion = (suggestion: string) => {
    const updatedResume = resumeText.replace(selectedSection, suggestion);
    setResumeText(updatedResume);
    setOptimizedText(updatedResume);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (optimizationResults) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Optimization Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5" />
              <span>Optimization Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {optimizationResults.atsScore || 0}%
                </div>
                <div className="text-sm text-gray-600">ATS Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {optimizationResults.keywordScore || 0}%
                </div>
                <div className="text-sm text-gray-600">Keyword Match</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {optimizationResults.readabilityScore || 0}%
                </div>
                <div className="text-sm text-gray-600">Readability</div>
              </div>
            </div>

            {/* Before/After Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Before Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">ATS Score:</span>
                      <span className="text-sm text-red-600">
                        {optimizationResults.originalScores?.atsScore || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Keywords:</span>
                      <span className="text-sm text-red-600">
                        {optimizationResults.originalScores?.keywordCount || 0}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded max-h-40 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap">
                      {resumeText.substring(0, 500)}...
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">After Optimization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">ATS Score:</span>
                      <span className="text-sm text-green-600">
                        +{optimizationResults.improvement?.atsScore || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Keywords:</span>
                      <span className="text-sm text-green-600">
                        +{optimizationResults.improvement?.keywordCount || 0}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded max-h-40 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap">
                      {optimizedText.substring(0, 500)}...
                    </pre>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => copyToClipboard(optimizedText)}
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Optimized
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setOptimizationResults(null)}
                      className="flex-1"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Start Over
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Power Edit Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5" />
              <span>Power Edit Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
              </TabsList>

              {['summary', 'experience', 'skills', 'education'].map((section) => (
                <TabsContent key={section} value={section} className="space-y-4">
                  <div className="space-y-3">
                    {optimizationResults.powerEdits?.[section]?.map((edit: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium capitalize">{edit.section}</span>
                            <Badge className="bg-blue-100 text-blue-800">
                              +{edit.improvement}% ATS Score
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{edit.reason}</p>
                          
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-red-600">Original:</span>
                              <p className="text-sm bg-red-50 p-2 rounded mt-1">
                                {edit.originalText}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-600">Suggestion {index + 1}:</span>
                              <p className="text-sm bg-green-50 p-2 rounded mt-1">
                                {edit.suggestion}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => applySuggestion(edit.suggestion)}
                                className="mt-2"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Apply This
                              </Button>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-green-600">Suggestion {index + 2}:</span>
                              <p className="text-sm bg-green-50 p-2 rounded mt-1">
                                {edit.alternativeSuggestion}
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => applySuggestion(edit.alternativeSuggestion)}
                                className="mt-2"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Apply This
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={() => setOptimizationResults(null)} variant="outline">
            Optimize Another Resume
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
            <Zap className="h-5 w-5" />
            <span>AI Resume Optimizer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Resume</label>
              <Textarea
                placeholder="Paste your current resume here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Job Description</label>
              <Textarea
                placeholder="Paste the job description you're targeting..."
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          </div>

          {/* Optimization Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Optimization Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleOneClickOptimize}
                disabled={isOptimizing || !resumeText.trim() || !jobText.trim()}
                className="w-full"
                size="lg"
              >
                {isOptimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    One-Click Optimize
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handlePowerEdit('summary', resumeText)}
                disabled={isOptimizing}
                className="w-full"
                size="lg"
              >
                {isOptimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Generating Power Edits...
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Power Edit Mode
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Pro Tips
            </h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Use exact keywords from the job description</p>
              <p>• Quantify achievements with numbers and percentages</p>
              <p>• Focus on results and impact rather than responsibilities</p>
              <p>• Use action verbs to start bullet points</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
