export const APP_CONFIG = {
  name: 'NeuJobScan',
  description: 'AI-Powered ATS Resume Optimization Platform',
  version: '1.0.0',
  author: 'NeuJobScan Team',
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    profile: '/api/auth/profile',
  },
  resume: {
    upload: '/api/resume/upload',
    parse: '/api/resume/parse',
    analyze: '/api/resume/analyze',
    optimize: '/api/resume/optimize',
  },
  job: {
    create: '/api/job/create',
    parse: '/api/job/parse',
    match: '/api/job/match',
    analyze: '/api/job/analyze',
  },
  ai: {
    match: '/api/ai/match',
    optimize: '/api/ai/optimize',
    suggestions: '/api/ai/suggestions',
    keywords: '/api/ai/keywords',
  },
  analytics: {
    dashboard: '/api/analytics/dashboard',
    reports: '/api/analytics/reports',
    insights: '/api/analytics/insights',
  },
} as const;

export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
} as const;

export const AI_CONFIG = {
  model: 'gpt-4-turbo-preview',
  temperature: 0.3,
  maxTokens: 4000,
  systemPrompt: `You are an expert ATS (Applicant Tracking System) optimizer and career coach with deep knowledge of:
- Resume writing and optimization
- Job description analysis
- Keyword matching and SEO for resumes
- Industry-specific hiring practices
- Modern recruitment technologies

Your goal is to help job seekers optimize their resumes to pass ATS systems and impress human recruiters.`,
} as const;

export const SCORING = {
  excellent: 80,
  good: 60,
  average: 40,
  poor: 0,
} as const;

export const PAGINATION = {
  default: 10,
  max: 100,
} as const;
