'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Download, 
  Upload, 
  Sparkles,
  Eye,
  Copy,
  RefreshCw,
  CheckCircle,
  Lightbulb,
  Target,
  Zap,
  PenTool,
  Briefcase,
  Crown,
  Users,
  BarChart3,
  Settings,
  FileDown
} from 'lucide-react';

interface PremiumFeaturesProps {
  userId: string;
}

interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  preview: string;
  isPremium: boolean;
}

interface BulkAnalysis {
  id: string;
  name: string;
  type: 'resume' | 'job' | 'cover-letter';
  status: 'pending' | 'processing' | 'completed';
  progress: number;
  result?: any;
}

interface ExportSettings {
  format: 'pdf' | 'word' | 'html' | 'csv';
  includeBranding: boolean;
  includeCharts: boolean;
  includeExecutiveSummary: boolean;
}

export function PremiumFeatures({ userId }: PremiumFeaturesProps) {
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkAnalyses, setBulkAnalyses] = useState<BulkAnalysis[]>([]);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'pdf',
    includeBranding: true,
    includeCharts: true,
    includeExecutiveSummary: true,
  });

  const templates: ResumeTemplate[] = [
    {
      id: 'professional-modern',
      name: 'Professional Modern',
      description: 'Clean, modern design perfect for tech roles',
      category: 'Professional',
      preview: 'John Doe\nSoftware Engineer | john.doe@email.com | (555) 123-4567\n\nEXPERIENCE\nSenior Software Engineer at TechCorp | 2018 - Present\n• Led development of scalable web applications serving 1M+ users\n• Improved system performance by 40% through optimization\n• Mentored team of 5 junior developers\n\nEDUCATION\nBachelor of Science in Computer Science\nUniversity of Technology | 2014 - 2018\n\nSKILLS\nJavaScript, TypeScript, React, Node.js, Python, AWS, Docker',
      isPremium: false
    }
  ];

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleCustomizeTemplate = (templateId: string) => {
    console.log('Customizing template:', templateId);
  };

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setBulkFiles(files);
  };

  const handleBulkAnalysis = async () => {
    if (bulkFiles.length === 0) return;

    const newAnalyses = bulkFiles.map((file, index) => {
      const t = file.name.toLowerCase().includes('resume')
        ? 'resume'
        : file.name.toLowerCase().includes('job')
        ? 'job'
        : 'cover-letter';

      return {
        id: `bulk-${Date.now()}-${index}`,
        name: file.name,
        type: t as 'resume' | 'job' | 'cover-letter',
        status: 'pending' as 'pending' | 'processing' | 'completed',
        progress: 0,
      };
    });

    setBulkAnalyses([...bulkAnalyses, ...newAnalyses]);

    // Simulate processing
    for (let i = 0; i < newAnalyses.length; i++) {
      setTimeout(() => {
        setBulkAnalyses(prev => 
          prev.map(analysis => 
            analysis.id === newAnalyses[i].id 
              ? { ...analysis, status: 'completed', progress: 100, result: generateMockResult(analysis.type) } 
              : analysis
          )
        );
        
        
      }, i * 1000);
    }
  };

  const generateMockResult = (type: string) => {
    switch (type) {
      case 'resume':
        return {
          atsScore: 85,
          keywordScore: 78,
          experienceScore: 82,
          educationScore: 90,
          overallScore: 84,
          recommendations: ['Add more technical keywords', 'Quantify achievements', 'Improve formatting']
        };
      case 'job':
        return {
          complexity: 'medium',
          requiredSkills: ['React', 'Node.js', 'TypeScript'],
          experienceLevel: 'mid-level',
          salary: '$80k-$120k',
          marketDemand: 'high'
        };
      case 'cover-letter':
        return {
          tone: 'professional',
          keywordAlignment: 85,
          personalization: 90,
          atsCompatibility: 95,
          recommendations: ['Add company-specific details', 'Include quantifiable achievements']
        };
      default:
        return {};
    }
  };

  const handlePremiumExport = async () => {
    try {
      const response = await fetch('/api/premium/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          settings: exportSettings,
          includeBulkResults: bulkAnalyses.filter(a => a.status === 'completed'),
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `premium-export-${new Date().toISOString().split('T')[0]}.${exportSettings.format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Premium export error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span>Premium Features</span>
            <Badge className="ml-2 bg-yellow-100 text-yellow-800">PRO</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="bulk-analysis">Bulk Analysis</TabsTrigger>
              <TabsTrigger value="advanced-exports">Advanced Exports</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>{template.name}</span>
                        </span>
                        {template.isPremium && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Crown className="h-3 w-3 mr-1" />
                            PRO
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        
                        <div className="p-3 bg-gray-50 rounded text-xs font-mono max-h-32 overflow-y-auto">
                          <pre className="whitespace-pre-wrap">{template.preview}</pre>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTemplateSelect(template.id)}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCustomizeTemplate(template.id)}
                            className="flex-1"
                            disabled={!template.isPremium}
                          >
                            <PenTool className="h-4 w-4 mr-2" />
                            {template.isPremium ? 'Customize' : 'Upgrade to Customize'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bulk-analysis" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Bulk Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="border-2 border-dashed rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Upload Multiple Files</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Upload up to 10 resumes, job descriptions, or cover letters for simultaneous analysis
                        </p>
                        <Input
                          type="file"
                          multiple
                          accept=".txt,.pdf,.doc,.docx"
                          onChange={handleBulkUpload}
                          className="hidden"
                          id="bulk-upload"
                        />
                        <Button
                          onClick={() => document.getElementById('bulk-upload')?.click()}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Choose Files
                        </Button>
                      </div>
                    </div>

                    {bulkAnalyses.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold mb-3">Analysis Progress</h4>
                        {bulkAnalyses.map((analysis) => (
                          <Card key={analysis.id} className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{analysis.name}</span>
                                <Badge variant={
                                  analysis.status === 'completed' ? 'default' : 
                                  analysis.status === 'processing' ? 'secondary' : 'outline'
                                }>
                                  {analysis.status === 'completed' ? 'Completed' :
                                   analysis.status === 'processing' ? 'Processing' : 'Pending'
                                }
                              </Badge>
                              </div>
                              <span className="text-sm text-gray-500">{analysis.type}</span>
                            </div>
                            
                            {analysis.status === 'processing' && (
                              <div className="w-full">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                  <span>Analyzing...</span>
                                  <span>{analysis.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${analysis.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            
                            {analysis.status === 'completed' && analysis.result && (
                              <div className="mt-3 p-3 bg-green-50 rounded">
                                <h5 className="font-semibold text-green-800 mb-2">Analysis Results</h5>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  {Object.entries(analysis.result).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                                      <span className="text-gray-600">{String(value)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced-exports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileDown className="h-5 w-5" />
                    <span>Advanced Export Options</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Export Format</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Select value={exportSettings.format} onValueChange={(value) => 
                            setExportSettings({...exportSettings, format: value as any})
                          }>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pdf">PDF Document</SelectItem>
                              <SelectItem value="word">Word Document</SelectItem>
                              <SelectItem value="html">HTML Web Page</SelectItem>
                              <SelectItem value="csv">CSV Data</SelectItem>
                            </SelectContent>
                          </Select>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Export Options</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="branding"
                              checked={exportSettings.includeBranding}
                              onChange={(e) => setExportSettings({...exportSettings, includeBranding: e.target.checked})}
                              className="rounded"
                            />
                            <Label htmlFor="branding" className="text-sm font-medium">
                              Include Branding
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="charts"
                              checked={exportSettings.includeCharts}
                              onChange={(e) => setExportSettings({...exportSettings, includeCharts: e.target.checked})}
                              className="rounded"
                            />
                            <Label htmlFor="charts" className="text-sm font-medium">
                              Include Charts & Graphs
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="summary"
                              checked={exportSettings.includeExecutiveSummary}
                              onChange={(e) => setExportSettings({...exportSettings, includeExecutiveSummary: e.target.checked})}
                              className="rounded"
                            />
                            <Label htmlFor="summary" className="text-sm font-medium">
                              Executive Summary
                            </Label>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        onClick={handlePremiumExport}
                        className="px-8"
                        size="lg"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Premium Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Premium Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Account Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Premium Status</span>
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Crown className="h-3 w-3 mr-1" />
                              ACTIVE
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Plan</span>
                            <span className="text-sm font-semibold">Professional</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Renewal Date</span>
                            <span className="text-sm font-semibold">Dec 31, 2024</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">API Credits</span>
                            <span className="text-sm font-semibold">1,250 / 2,000</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Usage Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Templates Used</span>
                              <span className="text-sm font-semibold">247</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Bulk Analyses</span>
                              <span className="text-sm font-semibold">1,823</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">Exports Generated</span>
                              <span className="text-sm font-semibold">456</span>
                            </div>
                          </div>
                          <div className="w-full mt-4">
                            <div className="text-sm text-gray-600 mb-2">Monthly Usage Trend</div>
                            <div className="h-2 bg-gray-200 rounded-full">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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