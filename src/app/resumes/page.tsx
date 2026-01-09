'use client';

import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  Eye, 
  Download, 
  Trash2,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface Resume {
  id: string;
  name: string;
  uploadDate: string;
  atsScore: number;
  status: 'active' | 'draft' | 'archived';
  matchCount: number;
}

const handleViewResume = (resumeId: string) => {
    console.log('View resume:', resumeId);
    // Navigate to resume detail view or open modal
  };

  const handleDownloadResume = (resumeId: string) => {
    console.log('Download resume:', resumeId);
    // Trigger download functionality
  };

  const handleDeleteResume = (resumeId: string) => {
    console.log('Delete resume:', resumeId);
    // Remove from resumes array after confirmation
  };

export default function ResumesPage() {
  const { user } = useAuth();
  const [resumes] = useState<Resume[]>([
    {
      id: '1',
      name: 'Senior_Frontend_Developer_Resume.pdf',
      uploadDate: '2024-01-15',
      atsScore: 85,
      status: 'active',
      matchCount: 12
    },
    {
      id: '2',
      name: 'Full_Stack_Developer_Resume.docx',
      uploadDate: '2024-01-10',
      atsScore: 78,
      status: 'active',
      matchCount: 8
    },
    {
      id: '3',
      name: 'React_Developer_Resume.pdf',
      uploadDate: '2024-01-05',
      atsScore: 92,
      status: 'draft',
      matchCount: 5
    }
  ]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">Please sign in to view your resumes.</p>
            <Button asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
            <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
            <p className="text-gray-600 mt-1">
              Manage and optimize your resumes for better job matches
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button asChild>
              <Link href="/dashboard">
                <Upload className="h-4 w-4 mr-2" />
                Upload New Resume
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                  <p className="text-2xl font-bold text-gray-900">{resumes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg ATS Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(resumes.reduce((acc, r) => acc + r.atsScore, 0) / resumes.length)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Matches</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {resumes.reduce((acc, r) => acc + r.matchCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Upload</p>
                  <p className="text-2xl font-bold text-gray-900">2d</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resumes List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Your Resumes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {resumes.map((resume, index) => (
                  <motion.div
                    key={resume.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{resume.name}</h3>
                        <p className="text-sm text-gray-500">
                          Uploaded on {new Date(resume.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className={`text-lg font-semibold ${getScoreColor(resume.atsScore)}`}>
                          {resume.atsScore}
                        </p>
                        <p className="text-xs text-gray-500">ATS Score</p>
                      </div>
                      
                      <Badge className={getStatusColor(resume.status)}>
                        {resume.status}
                      </Badge>
                      
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">
                          {resume.matchCount}
                        </p>
                        <p className="text-xs text-gray-500">Matches</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewResume(resume.id)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDownloadResume(resume.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteResume(resume.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
