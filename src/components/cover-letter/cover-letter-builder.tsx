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
  Mail, 
  Download, 
  Sparkles,
  Eye,
  Copy,
  RefreshCw,
  CheckCircle,
  Lightbulb,
  Target,
  Zap,
  PenTool,
  Briefcase
} from 'lucide-react';

interface CoverLetterBuilderProps {
  onResumeData?: (resumeData: any) => void;
  onJobData?: (jobData: any) => void;
}

export function CoverLetterBuilder({ onResumeData, onJobData }: CoverLetterBuilderProps) {
  const [jobData, setJobData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    hiringManager: '',
  });
  
  const [resumeData, setResumeData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    skills: '',
    education: '',
  });

  const [letterContent, setLetterContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetters, setGeneratedLetters] = useState<any[]>([]);

  const templates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean and formal cover letter suitable for corporate positions',
      preview: 'Dear [Hiring Manager Name],\n\nI am writing to express my interest in the [Position] position at [Company Name]...'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary design with a personal touch, great for tech companies',
      preview: 'Hi [Hiring Manager Name],\n\nI was excited to see your opening for a [Position] at [Company Name]...'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Bold and expressive design for creative industries and startups',
      preview: 'Hello [Hiring Manager Name],\n\nWhen I came across your [Position] opportunity at [Company Name]...'
    },
    {
      id: 'executive',
      name: 'Executive',
      description: 'Sophisticated and authoritative tone for senior-level positions',
      preview: 'Dear [Hiring Manager Name],\n\nI am writing to express my strong interest in the [Position] position at [Company Name]...'
    }
  ];

  const handleGenerateLetter = async () => {
    if (!jobData.title || !resumeData.name) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/cover-letter/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobData,
          resumeData,
          template: selectedTemplate,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setLetterContent(result.data.content);
        setGeneratedLetters([...generatedLetters, {
          id: Date.now().toString(),
          content: result.data.content,
          template: selectedTemplate,
          jobTitle: jobData.title,
          company: jobData.company,
          generatedAt: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Cover letter generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLetter = () => {
    if (!letterContent.trim()) return;

    const newLetter = {
      id: Date.now().toString(),
      content: letterContent,
      template: selectedTemplate,
      jobTitle: jobData.title,
      company: jobData.company,
      savedAt: new Date(),
    };

    setGeneratedLetters([...generatedLetters, newLetter]);
  };

  const handleExportPDF = async () => {
    if (!letterContent.trim()) return;

    try {
      const response = await fetch('/api/cover-letter/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: letterContent,
          format: 'pdf',
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cover-letter-${jobData.company || 'company'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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
            <Mail className="h-5 w-5" />
            <span>AI Cover Letter Builder</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g. Senior Frontend Developer"
                    value={jobData.title}
                    onChange={(e) => setJobData({...jobData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="e.g. TechCorp"
                    value={jobData.company}
                    onChange={(e) => setJobData({...jobData, company: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Paste the job description here..."
                    value={jobData.description}
                    onChange={(e) => setJobData({...jobData, description: e.target.value})}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Key Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="e.g. 5+ years React experience, TypeScript required..."
                    value={jobData.requirements}
                    onChange={(e) => setJobData({...jobData, requirements: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hiringManager">Hiring Manager</Label>
                  <Input
                    id="hiringManager"
                    placeholder="e.g. John Smith"
                    value={jobData.hiringManager}
                    onChange={(e) => setJobData({...jobData, hiringManager: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resume Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. John Doe"
                    value={resumeData.name}
                    onChange={(e) => setResumeData({...resumeData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. john.doe@email.com"
                    value={resumeData.email}
                    onChange={(e) => setResumeData({...resumeData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="e.g. (555) 123-4567"
                    value={resumeData.phone}
                    onChange={(e) => setResumeData({...resumeData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Experience Summary</Label>
                  <Textarea
                    id="experience"
                    placeholder="e.g. 5+ years of experience developing web applications..."
                    value={resumeData.experience}
                    onChange={(e) => setResumeData({...resumeData, experience: e.target.value})}
                    className="min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Key Skills</Label>
                  <Textarea
                    id="skills"
                    placeholder="e.g. JavaScript, React, Node.js, Python..."
                    value={resumeData.skills}
                    onChange={(e) => setResumeData({...resumeData, skills: e.target.value})}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Selection */}
          <div className="space-y-4">
            <Label>Select Template Style</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex flex-col items-start space-y-1">
                      <span className="font-medium">{template.name}</span>
                      <span className="text-sm text-gray-500">{template.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateLetter}
            disabled={isGenerating || !jobData.title || !resumeData.name}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Cover Letter...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate AI Cover Letter
              </>
            )}
          </Button>

          {/* Tips */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Pro Tips
            </h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Include specific keywords from the job description</p>
              <p>• Address the hiring manager by name if possible</p>
              <p>• Match your tone to the company culture</p>
              <p>• Keep it concise - ideally 3-4 paragraphs</p>
              <p>• Include a clear call to action</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Letter */}
      {letterContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Generated Cover Letter</span>
              </span>
              <Badge className="bg-green-100 text-green-800">
                {templates.find(t => t.id === selectedTemplate)?.name || 'Custom'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="export">Export</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                <div className="p-6 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap text-gray-800">
                    {letterContent}
                  </pre>
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <Button variant="outline" onClick={() => copyToClipboard(letterContent)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                  <Button onClick={handleSaveLetter}>
                    <Download className="h-4 w-4 mr-2" />
                    Save Letter
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="edit" className="space-y-4">
                <Textarea
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  className="min-h-[400px] font-mono"
                  placeholder="Edit your cover letter here..."
                />
                <div className="flex justify-between mt-4">
                  <span className="text-sm text-gray-500">
                    {letterContent.length} characters
                  </span>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset to Original
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="export" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleExportPDF}
                    className="w-full"
                    variant="default"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const blob = new Blob([letterContent], { type: 'text/plain' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `cover-letter-${jobData.company || 'company'}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export as Word
                  </Button>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Export Options</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>• PDF preserves formatting and is preferred by most ATS systems</p>
                    <p>• Word format allows easy editing and customization</p>
                    <p>• Both formats include proper line breaks and spacing</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Saved Letters */}
      {generatedLetters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Cover Letters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedLetters.slice(0, 5).map((letter: any, index: number) => (
                <div key={letter.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium">{letter.jobTitle}</span>
                      <span className="text-sm text-gray-500"> at {letter.company}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {new Date(letter.generatedAt).toLocaleDateString()}
                      </Badge>
                      <Badge className={templates.find(t => t.id === letter.template) ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                        {templates.find(t => t.id === letter.template)?.name || 'Custom'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {letter.content?.substring(0, 150)}...
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Button size="sm" variant="outline" onClick={() => setLetterContent(letter.content)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(letter.content)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center">
        <Button onClick={() => {
          setLetterContent('');
          setJobData({
            title: '',
            company: '',
            description: '',
            requirements: '',
            hiringManager: '',
          });
        }} variant="outline">
          <PenTool className="h-4 w-4 mr-2" />
          Create New Cover Letter
        </Button>
      </div>
    </motion.div>
  );
}
