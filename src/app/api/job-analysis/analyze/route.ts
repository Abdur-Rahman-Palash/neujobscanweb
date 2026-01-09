export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { jobText } = await request.json();

    if (!jobText?.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Job description text is required',
        status: 400,
      }, { status: 400 });
    }

    console.log('=== JOB DESCRIPTION ANALYSIS ===');
    console.log('Job text length:', jobText.length);

    // Perform comprehensive job analysis
    const analysis = await analyzeJobDescription(jobText);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: analysis,
      message: 'Job description analyzed successfully',
      status: 200,
    });

  } catch (error) {
    console.error('Job analysis error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during job analysis',
      status: 500,
    }, { status: 500 });
  }
}

async function analyzeJobDescription(jobText: string): Promise<any> {
  // Extract skills
  const skills = extractSkills(jobText);
  
  // Determine experience level
  const experience = determineExperienceLevel(jobText);
  
  // Extract salary information
  const salary = extractSalaryInfo(jobText);
  
  // Analyze requirements
  const requirements = extractRequirements(jobText);
  
  // Analyze company culture
  const culture = analyzeCompanyCulture(jobText);
  
  // Generate insights
  const insights = generateInsights(jobText, skills, experience, salary);

  return {
    title: extractJobTitle(jobText),
    skills,
    experience,
    salary,
    requirements,
    culture,
    insights,
    analysisScore: calculateAnalysisScore(skills, experience, requirements),
    timestamp: new Date(),
  };
}

function extractJobTitle(text: string): string {
  const titlePatterns = [
    /^(.*?)\s*(senior|junior|lead|principal|staff|sr\.|jr\.|mid|middle)\s+(.+)/im,
    /^(.*?)\s*(developer|engineer|manager|analyst|specialist|consultant|coordinator|architect|designer)/im,
    /^(.*?)\s+(.+)/im
  ];

  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return 'Job Title Not Found';
}

function extractSkills(text: string): any {
  const technicalSkills = [
    'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'python', 'java', 'c#', 'php',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'material-ui', 'ant design',
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'firebase', 'supabase',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'github actions',
    'git', 'svn', 'jira', 'confluence', 'slack', 'microsoft teams',
    'agile', 'scrum', 'kanban', 'waterfall', 'devops', 'ci/cd', 'tdd', 'bdd',
    'rest api', 'graphql', 'microservices', 'serverless', 'lambda', 'functions',
    'machine learning', 'ai', 'data science', 'analytics', 'business intelligence',
    'leadership', 'management', 'communication', 'teamwork', 'problem solving'
  ];

  const words = text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
  const foundSkills = technicalSkills.filter(skill => 
    words.some(word => word.includes(skill) || skill.includes(word))
  );

  // Categorize skills
  const required = foundSkills.slice(0, 8).map(skill => ({
    name: skill,
    category: getSkillCategory(skill),
    priority: getSkillPriority(skill, text)
  }));

  const preferred = foundSkills.slice(8, 16).map(skill => ({
    name: skill,
    category: getSkillCategory(skill),
    priority: getSkillPriority(skill, text)
  }));

  return { required, preferred, total: foundSkills.length };
}

function getSkillCategory(skill: string): string {
  const categories = {
    technical: ['javascript', 'typescript', 'react', 'node.js', 'python', 'java', 'aws', 'docker'],
    soft: ['leadership', 'management', 'communication', 'teamwork', 'problem solving'],
    methodology: ['agile', 'scrum', 'kanban', 'devops', 'ci/cd', 'tdd'],
    database: ['mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch'],
    frontend: ['html', 'css', 'sass', 'tailwind', 'bootstrap', 'material-ui'],
    backend: ['rest api', 'graphql', 'microservices', 'serverless', 'lambda']
  };

  for (const [category, skills] of Object.entries(categories)) {
    if (skills.includes(skill)) {
      return category;
    }
  }

  return 'other';
}

function getSkillPriority(skill: string, text: string): 'high' | 'medium' | 'low' {
  const skillLower = skill.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Count occurrences
  const occurrences = (textLower.match(new RegExp(skillLower, 'g')) || []).length;
  
  if (occurrences >= 3) return 'high';
  if (occurrences >= 2) return 'medium';
  return 'low';
}

function determineExperienceLevel(text: string): any {
  const levelPatterns = [
    { pattern: /\b(senior|sr\.|lead|principal|staff)\b/gi, level: 'senior', minYears: 8 },
    { pattern: /\b(mid|middle)\b/gi, level: 'mid', minYears: 4 },
    { pattern: /\b(junior|jr\.|entry|associate)\b/gi, level: 'junior', minYears: 0 },
    { pattern: /\b(intern|trainee)\b/gi, level: 'entry', minYears: 0 }
  ];

  let detectedLevel = 'mid';
  let maxLevel = 0;
  
  for (const { pattern, level, minYears } of levelPatterns) {
    if (pattern.test(text)) {
      const levelValue: Record<string, number> = { senior: 4, mid: 3, junior: 2, entry: 1 };
      const currentLevel = levelValue[level] || 0;
      if (currentLevel > maxLevel) {
        maxLevel = currentLevel;
        detectedLevel = level;
      }
    }
  }

  // Extract years of experience
  const yearMatches = text.match(/(\d+)\+?\s*(years?|yrs?)/gi);
  const years = yearMatches ? Math.max(...yearMatches.map(m => parseInt(m[1]))) : 0;

  return {
    level: detectedLevel,
    years,
    minYears: { senior: 8, mid: 4, junior: 0, entry: 0 }[detectedLevel],
    detected: years > 0
  };
}

function extractSalaryInfo(text: string): any {
  const salaryPatterns = [
    /\$(\d{1,3}(?:,\d{3})*)\s*[-–]\s*\$(\d{1,3}(?:,\d{3})*)/gi,
    /(\d{1,3}(?:,\d{3})*)\s*[-–]\s*(\d{1,3}(?:,\d{3})*)\s*k\s*\/\s*year/gi,
    /(\d{1,3}(?:,\d{3})*)k\s*[-–]\s*(\d{1,3}(?:,\d{3})*)\s*\/\s*year/gi
  ];

  for (const pattern of salaryPatterns) {
    const match = text.match(pattern);
    if (match) {
      const min = parseInt(match[1].replace(',', ''));
      const max = match[2] ? parseInt(match[2].replace(',', '')) : min;
      return {
        range: `$${min.toLocaleString()}${min !== max ? `-$${max.toLocaleString()}` : ''}k`,
        min,
        max,
        currency: 'USD',
        period: 'yearly'
      };
    }
  }

  return { range: 'Not specified' };
}

function extractRequirements(text: string): any {
  const mustHavePatterns = [
    /\b(required|must have|essential|mandatory)\b.*?(skill|experience|degree|certification)/gi,
    /\b(\d+\+?\s*years?\s*(?:of\s*)?experience)/gi
  ];

  const niceToHavePatterns = [
    /\b(preferred|nice to have|bonus|plus)\b.*?(skill|experience|degree|certification)/gi,
    /\b(master'?s?\s*degree|phd|mba)/gi
  ];

  const mustHave: string[] = [];
  const niceToHave: string[] = [];

  mustHavePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      mustHave.push(matches[0].trim());
    }
  });

  niceToHavePatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      niceToHave.push(matches[0].trim());
    }
  });

  return {
    mustHave: [...new Set(mustHave)].slice(0, 8),
    niceToHave: [...new Set(niceToHave)].slice(0, 8)
  };
}

function analyzeCompanyCulture(text: string): any {
  const cultureIndicators = {
    workEnvironment: {
      remote: /\b(remote|work from home|wfh|telecommute|virtual)/gi,
      hybrid: /\b(hybrid|flexible|partial remote)/gi,
      office: /\b(office|on-site|in-person|collaborative)/gi
    },
    teamSize: {
      startup: /\b(startup|small team|fast-paced|agile)/gi,
      midSize: /\b(medium-sized|mid-size|established)/gi,
      enterprise: /\b(enterprise|large|corporate|fortune)/gi
    },
    growth: {
      high: /\b(rapid growth|fast growing|scaling|expanding)/gi,
      medium: /\b(steady growth|growing|opportunities)/gi,
      low: /\b(stable|established|traditional)/gi
    },
    workLifeBalance: {
      excellent: /\b(flexible|work-life balance|4 day week|generous pto)/gi,
      good: /\b(reasonable|balanced|standard)/gi,
      poor: /\b(demanding|long hours|high pressure)/gi
    }
  };

  const workEnvironment = 
    (cultureIndicators.workEnvironment.remote.test(text) && 'Remote') ||
    (cultureIndicators.workEnvironment.hybrid.test(text) && 'Hybrid') ||
    (cultureIndicators.workEnvironment.office.test(text) && 'Office');

  const teamSize = 
    (cultureIndicators.teamSize.startup.test(text) && 'Startup') ||
    (cultureIndicators.teamSize.midSize.test(text) && 'Medium') ||
    (cultureIndicators.teamSize.enterprise.test(text) && 'Enterprise');

  const growth = 
    (cultureIndicators.growth.high.test(text) && 'High') ||
    (cultureIndicators.growth.medium.test(text) && 'Medium') ||
    (cultureIndicators.growth.low.test(text) && 'Low');

  const workLifeBalance = 
    (cultureIndicators.workLifeBalance.excellent.test(text) && 'Excellent') ||
    (cultureIndicators.workLifeBalance.good.test(text) && 'Good') ||
    (cultureIndicators.workLifeBalance.poor.test(text) && 'Poor');

  const keywords = [
    'innovative', 'collaborative', 'fast-paced', 'dynamic', 'entrepreneurial',
    'team-oriented', 'customer-focused', 'results-driven', 'agile'
  ].filter(keyword => text.toLowerCase().includes(keyword));

  return {
    workEnvironment,
    teamSize,
    growth,
    workLifeBalance,
    keywords
  };
}

function generateInsights(text: string, skills: any, experience: any, salary: any): any {
  const competitiveness = calculateCompetitiveness(text, skills, experience, salary);
  
  return {
    competitiveness,
    careerGrowth: calculateCareerGrowth(text, experience, salary),
    remoteWork: /\b(remote|wfh|telecommute|virtual)/gi.test(text),
    differentiators: extractDifferentiators(text),
    applicationStrategy: generateApplicationStrategy(text, skills, experience)
  };
}

function calculateCompetitiveness(text: string, skills: any, experience: any, salary: any): any {
  let score = 50; // Base score

  // High-demand skills increase competitiveness
  if (skills.required.length > 5) score += 20;
  if (skills.required.some((s: any) => s.category === 'technical')) score += 15;
  
  // Experience level affects competitiveness
  if (experience.level === 'senior') score += 15;
  if (experience.level === 'mid') score += 10;
  
  // Salary information
  if (salary.max && salary.max > 120000) score += 15;
  if (salary.max && salary.max > 80000) score += 10;
  
  // Company culture indicators
  if (/startup|fast-paced|dynamic/i.test(text)) score += 10;
  if (/enterprise|fortune/i.test(text)) score += 5;

  let level = 'Medium';
  if (score >= 80) level = 'High';
  else if (score >= 60) level = 'Medium';
  else level = 'Low';

  return { level, score };
}

function calculateCareerGrowth(text: string, experience: any, salary: any): string {
  if (/growth|opportunity|advancement|career path/i.test(text)) return 'High';
  if (/learn|develop|training|mentorship/i.test(text)) return 'Medium';
  return 'Low';
}

function extractDifferentiators(text: string): string[] {
  const differentiators = [];
  
  if (/innovative|cutting edge|state of the art/i.test(text)) {
    differentiators.push('Innovative technology stack');
  }
  if (/market leader|industry leader|top company/i.test(text)) {
    differentiators.push('Industry leadership position');
  }
  if (/work life balance|flexible|remote options/i.test(text)) {
    differentiators.push('Excellent work-life balance');
  }
  if (/growth opportunity|career advancement|promotion/i.test(text)) {
    differentiators.push('Strong career growth potential');
  }

  return differentiators.slice(0, 3);
}

function generateApplicationStrategy(text: string, skills: any, experience: any): string {
  let strategy = 'Standard application recommended';
  
  if (skills.required.length > 6) {
    strategy = 'Highlight your comprehensive skill set and relevant experience';
  } else if (experience.level === 'senior') {
    strategy = 'Emphasize leadership experience and strategic impact';
  } else if (experience.level === 'junior') {
    strategy = 'Focus on potential, learning ability, and relevant projects';
  }

  if (/urgent|immediate|asap/i.test(text)) {
    strategy += ' - Apply quickly as this appears to be a high-priority position';
  }

  return strategy;
}

function calculateAnalysisScore(skills: any, experience: any, requirements: any): number {
  let score = 50;
  
  // Skills coverage
  if (skills.required.length > 5) score += 20;
  if (skills.required.some((s: any) => s.category === 'technical')) score += 15;
  
  // Experience match
  if (experience.detected) score += 15;
  
  // Requirements clarity
  if (requirements.mustHave.length > 0) score += 10;
  
  return Math.min(100, score);
}
