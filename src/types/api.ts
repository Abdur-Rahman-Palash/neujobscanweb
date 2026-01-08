export interface AgentResult {
  success: boolean;
  data?: any;
  error?: string;
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
  keywordMatches: {
    exactMatches: Array<{
      keyword: string;
      found: boolean;
      confidence: number;
    }>;
    semanticMatches: Array<{
      resumeTerm: string;
      jobTerm: string;
      similarity: number;
      category: string;
    }>;
    missingKeywords: string[];
    additionalKeywords: string[];
    matchScore: number;
    categoryScores: {
      technical: number;
      soft: number;
      language: number;
      tool: number;
    };
  };
  skillGaps: {
    missingSkills: Array<{
      skill: string;
      importance: 'critical' | 'important' | 'nice-to-have';
      category: 'technical' | 'soft' | 'language' | 'tool';
      reason: string;
      learningResources: Array<{
        type: 'course' | 'certification' | 'tutorial' | 'book';
        title: string;
        provider: string;
        url?: string;
        estimatedTime: string;
      }>;
    }>;
    skillStrengths: Array<{
      skill: string;
      level: string;
      relevance: number;
      evidence: string;
    }>;
    improvementAreas: Array<{
      area: string;
      currentLevel: string;
      targetLevel: string;
      gap: string;
      actionItems: string[];
    }>;
    careerAdvice: {
      shortTerm: string[];
      mediumTerm: string[];
      longTerm: string[];
    };
    marketAlignment: {
      demandLevel: 'high' | 'medium' | 'low';
      salaryImpact: 'high' | 'medium' | 'low';
      growthPotential: 'high' | 'medium' | 'low';
    };
  };
  rewriteSuggestions: {
    suggestions: Array<{
      section: 'summary' | 'experience' | 'skills' | 'education' | 'projects';
      originalText: string;
      rewrittenText: string;
      reason: string;
      atsScore: {
        before: number;
        after: number;
        improvement: number;
      };
      keywordsAdded: string[];
      actionVerbsAdded: string[];
      metricsAdded: string[];
    }>;
    overallImprovement: {
      atsScore: number;
      readabilityScore: number;
      impactScore: number;
    };
    priorityRewrites: Array<{
      section: 'summary' | 'experience' | 'skills' | 'education' | 'projects';
      originalText: string;
      rewrittenText: string;
      reason: string;
      atsScore: {
        before: number;
        after: number;
        improvement: number;
      };
      keywordsAdded: string[];
      actionVerbsAdded: string[];
      metricsAdded: string[];
    }>;
    quickWins: Array<{
      section: 'summary' | 'experience' | 'skills' | 'education' | 'projects';
      originalText: string;
      rewrittenText: string;
      reason: string;
      atsScore: {
        before: number;
        after: number;
        improvement: number;
      };
      keywordsAdded: string[];
      actionVerbsAdded: string[];
      metricsAdded: string[];
    }>;
    sectionAnalysis: {
      summary: { score: number; suggestions: number };
      experience: { score: number; suggestions: number };
      skills: { score: number; suggestions: number };
      education: { score: number; suggestions: number };
      projects: { score: number; suggestions: number };
    };
  };
  explanation: {
    scanId: string;
    overallScore: number;
    scoreExplanation: {
      whatItMeans: string;
      isGood: boolean;
      benchmark: string;
      nextSteps: string[];
    };
    detailedBreakdown: Array<{
      section: string;
      score: number;
      status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
      explanation: string;
      recommendations: string[];
    }>;
    keywordAnalysis: {
      matchedKeywords: string[];
      missingKeywords: string[];
      additionalKeywords: string[];
      impactOnScore: string;
    };
    skillGapSummary: {
      criticalGaps: string[];
      improvementAreas: string[];
      strengths: string[];
      learningPath: string;
    };
    actionableInsights: Array<{
      priority: 'high' | 'medium' | 'low';
      category: 'immediate' | 'short-term' | 'long-term';
      action: string;
      expectedImpact: string;
      effort: 'low' | 'medium' | 'high';
    }>;
    nextSteps: {
      immediate: string[];
      thisWeek: string[];
      thisMonth: string[];
    };
    competitiveAnalysis: {
      howYouCompare: string;
      marketPosition: string;
      improvementPotential: string;
    };
  };
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}
