import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number): string {
  return `${Math.round(score)}%`
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function getScoreVariant(score: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (score >= 80) return 'default'
  if (score >= 60) return 'secondary'
  return 'destructive'
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
  
  const wordCount: Record<string, number> = {}
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20)
    .map(([word]) => word)
}

export function calculateMatchScore(resumeData: any, jobData: any): number {
  let score = 0
  
  // Skills matching (40% weight)
  const resumeSkills = resumeData.skills?.map((s: any) => s.name.toLowerCase()) || []
  const jobSkills = jobData.skills?.map((s: any) => s.name.toLowerCase()) || []
  const skillMatches = resumeSkills.filter((skill: string) => jobSkills.includes(skill))
  const skillScore = jobSkills.length > 0 ? (skillMatches.length / jobSkills.length) * 40 : 0
  
  // Experience matching (30% weight)
  const resumeExp = resumeData.experience?.length || 0
  const requiredExp = jobData.experienceLevel ? parseInt(jobData.experienceLevel) : 0
  const expScore = resumeExp >= requiredExp ? 30 : (resumeExp / requiredExp) * 30
  
  // Education matching (20% weight)
  const resumeEducation = resumeData.education?.length || 0
  const educationScore = resumeEducation > 0 ? 20 : 0
  
  // Keywords matching (10% weight)
  const resumeKeywords = extractKeywords(resumeData.content || '')
  const jobKeywords = jobData.keywords || []
  const keywordMatches = resumeKeywords.filter((keyword: string) => 
    jobKeywords.some((jk: string) => jk.toLowerCase().includes(keyword))
  )
  const keywordScore = jobKeywords.length > 0 ? (keywordMatches.length / jobKeywords.length) * 10 : 0
  
  score = skillScore + expScore + educationScore + keywordScore
  
  return Math.min(100, Math.round(score))
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

export function isValidFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize
}
