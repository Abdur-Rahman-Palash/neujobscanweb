export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { resumeText, jobText, optimizationType = 'full' } = await request.json();

    if (!resumeText?.trim() || !jobText?.trim()) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Resume text and job description are required',
        status: 400,
      }, { status: 400 });
    }

    console.log('=== AI RESUME OPTIMIZATION ===');
    console.log('Optimization type:', optimizationType);
    console.log('Resume length:', resumeText.length);
    console.log('Job length:', jobText.length);

    // Simulate AI optimization (in real implementation, this would call OpenAI)
    const optimizationResult = await optimizeResume(resumeText, jobText, optimizationType);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: optimizationResult,
      message: 'Resume optimized successfully',
      status: 200,
    });

  } catch (error) {
    console.error('Resume optimization error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during optimization',
      status: 500,
    }, { status: 500 });
  }
}

async function optimizeResume(resumeText: string, jobText: string, optimizationType: string) {
  // Extract keywords from job description
  const jobKeywords = extractKeywords(jobText);
  const resumeKeywords = extractKeywords(resumeText);

  // Calculate original scores
  const originalATSScore = calculateATSScore(resumeText);
  const originalKeywordCount = resumeKeywords.length;

  // Generate optimized resume
  const optimizedText = generateOptimizedResume(resumeText, jobText, jobKeywords);
  const optimizedKeywords = extractKeywords(optimizedText);

  // Calculate improvements
  const improvement = {
    atsScore: Math.max(0, calculateATSScore(optimizedText) - originalATSScore),
    keywordCount: Math.max(0, optimizedKeywords.length - originalKeywordCount),
  };

  return {
    optimizedText,
    analysis: {
      atsScore: calculateATSScore(optimizedText),
      keywordScore: calculateKeywordScore(optimizedText, jobText),
      readabilityScore: calculateReadabilityScore(optimizedText),
      originalScores: {
        atsScore: originalATSScore,
        keywordCount: originalKeywordCount,
      },
      improvement,
      powerEdits: generatePowerEdits(resumeText, jobText),
    },
    optimizationType,
    timestamp: new Date(),
  };
}

function extractKeywords(text: string): string[] {
  const technicalSkills = [
    'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'python', 'java', 'c#', 'php',
    'html', 'css', 'sass', 'tailwind', 'bootstrap', 'material-ui', 'ant design',
    'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'firebase', 'supabase',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'github actions',
    'git', 'svn', 'jira', 'confluence', 'slack', 'microsoft teams',
    'agile', 'scrum', 'kanban', 'waterfall', 'devops', 'ci/cd', 'tdd', 'bdd',
    'rest api', 'graphql', 'microservices', 'serverless', 'lambda', 'functions',
    'machine learning', 'ai', 'data science', 'analytics', 'business intelligence',
    'leadership', 'management', 'communication', 'teamwork', 'problem solving',
    'bachelor', 'master', 'phd', 'computer science', 'engineering', 'mba'
  ];

  const words = text.toLowerCase().match(/\b[a-z]{2,}\b/g) || [];
  const foundKeywords = technicalSkills.filter(skill => 
    words.some(word => word.includes(skill) || skill.includes(word))
  );

  return [...new Set(foundKeywords)];
}

function calculateATSScore(text: string): number {
  let score = 100;
  
  // Check for ATS-friendly formatting
  const hasTables = /<table|<td|<tr/i.test(text);
  const hasImages = /<img|<picture|<svg/i.test(text);
  const hasColumns = /\|\s*\|/.test(text);
  
  if (hasTables) score -= 30;
  if (hasImages) score -= 25;
  if (hasColumns) score -= 20;
  
  return Math.max(0, score);
}

function calculateKeywordScore(resumeText: string, jobText: string): number {
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(jobText);
  
  if (jobKeywords.length === 0) return 85;
  
  const matchedKeywords = resumeKeywords.filter(keyword => 
    jobKeywords.some(jobKeyword => 
      keyword.toLowerCase().includes(jobKeyword.toLowerCase()) || 
      jobKeyword.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  return Math.min(100, Math.round((matchedKeywords.length / jobKeywords.length) * 100));
}

function calculateReadabilityScore(text: string): number {
  const sentences = text.split(/[.!?]+/).length;
  const words = text.split(/\s+/).length;
  const avgWordsPerSentence = words / Math.max(sentences, 1);
  
  let score = 100;
  
  // Ideal is 15-20 words per sentence
  if (avgWordsPerSentence > 25) score -= 20;
  if (avgWordsPerSentence > 30) score -= 30;
  if (avgWordsPerSentence < 10) score -= 15;
  if (avgWordsPerSentence < 8) score -= 25;
  
  // Check for action verbs
  const actionVerbs = ['led', 'managed', 'developed', 'implemented', 'created', 'improved', 'optimized', 'designed', 'built'];
  const actionVerbCount = actionVerbs.filter(verb => 
    text.toLowerCase().includes(verb)
  ).length;
  
  score += Math.min(20, actionVerbCount * 2);
  
  return Math.max(0, Math.min(100, score));
}

function generateOptimizedResume(resumeText: string, jobText: string, jobKeywords: string[]): string {
  let optimizedText = resumeText;

  // Add missing keywords naturally
  const resumeKeywords = extractKeywords(resumeText);
  const missingKeywords = jobKeywords.filter(keyword => 
    !resumeKeywords.some(resumeKeyword => 
      keyword.toLowerCase().includes(resumeKeyword.toLowerCase()) || 
      resumeKeyword.toLowerCase().includes(keyword.toLowerCase())
    )
  );

  // Optimize summary section
  if (optimizedText.toLowerCase().includes('summary')) {
    const summarySection = extractSection(optimizedText, 'summary');
    const optimizedSummary = generateOptimizedSummary(jobText, missingKeywords);
    optimizedText = optimizedText.replace(summarySection, optimizedSummary);
  }

  // Optimize experience section with quantifiable achievements
  if (optimizedText.toLowerCase().includes('experience')) {
    const experienceSection = extractSection(optimizedText, 'experience');
    const optimizedExperience = addQuantifiableAchievements(experienceSection);
    optimizedText = optimizedText.replace(experienceSection, optimizedExperience);
  }

  // Optimize skills section
  if (optimizedText.toLowerCase().includes('skills')) {
    const skillsSection = extractSection(optimizedText, 'skills');
    const optimizedSkills = generateOptimizedSkillsSection(resumeKeywords, missingKeywords);
    optimizedText = optimizedText.replace(skillsSection, optimizedSkills);
  }

  return optimizedText;
}

function extractSection(text: string, sectionName: string): string {
  const patterns = {
    summary: [/summary[:\s*\n]/i, /professional[:\s*\n]/i, /objective[:\s*\n]/i],
    experience: [/experience[:\s*\n]/i, /work[:\s*\n]/i, /employment[:\s*\n]/i],
    skills: [/skills[:\s*\n]/i, /competencies[:\s*\n]/i, /technologies[:\s*\n]/i],
    education: [/education[:\s*\n]/i, /academic[:\s*\n]/i, /university[:\s*\n]/i]
  };

  const sectionPatterns = patterns[sectionName as keyof typeof patterns] || [];
  
  for (const pattern of sectionPatterns) {
    const match = text.split(pattern);
    if (match.length > 1) {
      return match[1].split('\n').slice(0, 10).join('\n');
    }
  }

  return '';
}

function generateOptimizedSummary(jobText: string, missingKeywords: string[]): string {
  const keywords = missingKeywords.slice(0, 5).join(', ');
  return `Results-driven professional with expertise in ${keywords}. Proven track record of delivering innovative solutions and driving business growth. Seeking to leverage technical skills and leadership experience in a challenging role where I can contribute to team success and company objectives.`;
}

function addQuantifiableAchievements(experienceSection: string): string {
  // Add quantifiable metrics to experience descriptions
  let optimizedSection = experienceSection;
  
  // Replace vague statements with quantified ones
  const replacements = [
    {
      pattern: /responsible for/gi,
      replacement: 'Led team of 5 developers, increasing productivity by 30%'
    },
    {
      pattern: /worked on/gi,
      replacement: 'Successfully delivered 15+ projects, resulting in 25% cost reduction'
    },
    {
      pattern: /helped improve/gi,
      replacement: 'Optimized processes, improving efficiency by 40% and reducing errors by 60%'
    },
    {
      pattern: /participated in/gi,
      replacement: 'Collaborated with cross-functional teams to launch 3 major products'
    }
  ];

  replacements.forEach(({ pattern, replacement }) => {
    optimizedSection = optimizedSection.replace(pattern, replacement);
  });

  return optimizedSection;
}

function generateOptimizedSkillsSection(resumeKeywords: string[], missingKeywords: string[]): string {
  const allSkills = [...new Set([...resumeKeywords, ...missingKeywords])];
  return allSkills.join(', ');
}

function generatePowerEdits(resumeText: string, _jobText: string): any {
  return {
    summary: [
      {
        section: 'Professional Summary',
        originalText: extractSection(resumeText, 'summary'),
        suggestion: 'Results-driven technology professional with 8+ years of experience leading cross-functional teams to deliver innovative solutions that drive business growth and operational excellence.',
        alternativeSuggestion: 'Strategic technology leader with proven track record of scaling teams, optimizing systems, and delivering enterprise-level solutions that increase revenue and reduce costs.',
        reason: 'Add quantifiable achievements and leadership focus',
        improvement: 25
      }
    ],
    experience: [
      {
        section: 'Experience Description',
        originalText: 'Responsible for developing web applications',
        suggestion: 'Led development of 15+ enterprise web applications serving 1M+ users, resulting in 40% increase in user engagement and 25% reduction in support tickets.',
        alternativeSuggestion: 'Spearheaded full-stack development initiatives that delivered scalable solutions handling 10M+ requests daily, improving system performance by 60% and reducing infrastructure costs by 35%.',
        reason: 'Add specific metrics and business impact',
        improvement: 35
      }
    ],
    skills: [
      {
        section: 'Skills Section',
        originalText: 'JavaScript, React, Node.js',
        suggestion: 'JavaScript (ES6+), React.js, Node.js, TypeScript, AWS, Docker, PostgreSQL, REST APIs, GraphQL, Microservices, CI/CD, Agile/Scrum',
        alternativeSuggestion: 'Full-Stack Development: JavaScript/TypeScript, React.js, Node.js, Python; Cloud: AWS, Azure, GCP; Databases: PostgreSQL, MongoDB, Redis; DevOps: Docker, Kubernetes, Jenkins, CI/CD; Methodologies: Agile, Scrum, TDD, Microservices',
        reason: 'Include comprehensive tech stack and methodologies',
        improvement: 20
      }
    ],
    education: [
      {
        section: 'Education Details',
        originalText: 'Bachelor of Science',
        suggestion: 'Bachelor of Science in Computer Science, GPA: 3.8/4.0, Dean\'s List, Relevant Coursework: Data Structures, Algorithms, Software Engineering',
        alternativeSuggestion: 'Bachelor of Science in Computer Science (Honors), GPA: 3.8/4.0, Magna Cum Laude, Thesis: "Machine Learning in Web Applications", Awards: Academic Excellence Scholarship',
        reason: 'Add academic achievements and relevant coursework',
        improvement: 15
      }
    ]
  };
}
