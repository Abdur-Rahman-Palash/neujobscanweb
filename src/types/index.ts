export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'premium';
  subscription?: 'free' | 'premium' | 'enterprise';
  createdAt: Date;
  updatedAt: Date;
}

export interface Resume {
  id: string;
  userId: string;
  title: string;
  content: string;
  fileUrl?: string;
  fileType: string;
  fileSize: number;
  parsedData?: ParsedResumeData;
  analysis?: ResumeAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  certifications?: Certification[];
  languages?: Language[];
  projects?: Project[];
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
}

export interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'tool';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'basic' | 'conversational' | 'professional' | 'native';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  github?: string;
  startDate: string;
  endDate?: string;
}

export interface JobDescription {
  id: string;
  userId: string;
  title: string;
  company: string;
  content: string;
  parsedData?: ParsedJobData;
  analysis?: JobAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedJobData {
  id?: string;
  title: string;
  company: string;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits?: string[];
  skills: JobSkill[];
  keywords: string[];
}

export interface JobSkill {
  name: string;
  required: boolean;
  level?: 'junior' | 'intermediate' | 'senior' | 'expert';
  category: 'technical' | 'soft' | 'language' | 'tool';
}

export interface ResumeAnalysis {
  id: string;
  resumeId: string;
  overallScore: number;
  atsScore: number;
  keywordScore: number;
  structureScore: number;
  contentScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  missingKeywords: string[];
  formatIssues: string[];
  createdAt: Date;
}

export interface JobAnalysis {
  id: string;
  jobId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  seniorityLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  keyRequirements: string[];
  preferredQualifications: string[];
  companyCulture?: string;
  growthOpportunities?: string[];
  marketCompetitiveness: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface MatchResult {
  id: string;
  resumeId: string;
  jobId: string;
  overallScore: number;
  atsScore: number;
  keywordScore: number;
  experienceScore: number;
  educationScore: number;
  skillScore: number;
  matchPercentage: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  missingKeywords: string[];
  createdAt: Date;
}

export interface OptimizationSuggestions {
  id: string;
  resumeId: string;
  jobId?: string;
  type: 'keyword' | 'structure' | 'content' | 'format';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  example?: string;
  impact: number;
  createdAt: Date;
}

export interface Analytics {
  userId: string;
  totalResumes: number;
  totalJobs: number;
  totalMatches: number;
  averageMatchScore: number;
  topSkills: string[];
  improvementAreas: string[];
  recentActivity: Activity[];
  trends: Trend[];
}

export interface Activity {
  id: string;
  type: 'resume_upload' | 'job_analysis' | 'match_created' | 'optimization_applied';
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Trend {
  period: string;
  matchScores: number[];
  resumeCount: number;
  jobCount: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface ATSResponse {
  scanId: string;
  timestamp: Date;
  overallScore: number;
  atsScore: number;
  keywordScore: number;
  experienceScore: number;
  educationScore: number;
  skillScore: number;
  formatScore: number;
  breakdown: {
    keywordMatch: number;
    skillAlignment: number;
    experienceRelevance: number;
    educationMatch: number;
    atsCompliance: number;
  };
  keywordMatches: any;
  skillGaps: any;
  rewriteSuggestions: any;
  explanation: any;
  recommendations: any;
  strengths: any;
  weaknesses: any;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
