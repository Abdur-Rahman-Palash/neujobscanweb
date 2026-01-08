'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FILE_UPLOAD } from '@/lib/constants';
import { formatFileSize } from '@/lib/utils';

interface ResumeUploaderProps {
  onUploadComplete: (data: any) => void;
  onUploadError: (error: string) => void;
}

export function ResumeUploader({ onUploadComplete, onUploadError }: ResumeUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file
    if (!FILE_UPLOAD.allowedTypes.includes(file.type as any)) {
      onUploadError('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.');
      setUploadStatus('error');
      return;
    }

    if (file.size > FILE_UPLOAD.maxSize) {
      onUploadError(`File size exceeds ${FILE_UPLOAD.maxSize / (1024 * 1024)}MB limit`);
      setUploadStatus('error');
      return;
    }

    setUploadedFile(file);
    setUploadStatus('uploading');
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (result.success) {
        setUploadStatus('success');
        onUploadComplete(result.data);
      } else {
        setUploadStatus('error');
        onUploadError(result.error || 'Upload failed');
      }
    } catch (error) {
      setUploadStatus('error');
      onUploadError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: FILE_UPLOAD.maxSize,
    multiple: false,
  });

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
    setUploading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {uploadStatus === 'idle' && (
          <motion.div
            key="upload-area"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
              <CardContent className="p-8">
                <div
                  {...getRootProps()}
                  className={`cursor-pointer text-center ${
                    isDragActive ? 'bg-blue-50' : ''
                  } rounded-lg p-8 transition-colors`}
                >
                  <input {...getInputProps()} />
                  <motion.div
                    animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your resume file here, or click to browse
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    {FILE_UPLOAD.allowedExtensions.map((ext) => (
                      <Badge key={ext} variant="secondary" className="text-xs">
                        {ext}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Maximum file size: {formatFileSize(FILE_UPLOAD.maxSize)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {uploadStatus === 'uploading' && uploadedFile && (
          <motion.div
            key="uploading"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading and analyzing...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {uploadStatus === 'success' && uploadedFile && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </motion.div>
                    <div>
                      <p className="font-medium text-green-900">Upload successful!</p>
                      <p className="text-sm text-green-700">
                        {uploadedFile.name} • {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetUpload}
                    className="text-green-600 hover:text-green-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {uploadStatus === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="font-medium text-red-900">Upload failed</p>
                      <p className="text-sm text-red-700">
                        Please check your file and try again
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetUpload}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
