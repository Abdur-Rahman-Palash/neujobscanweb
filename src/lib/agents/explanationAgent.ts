import { BaseLLMProvider, createLLMProvider } from '../llm/provider';
import { ParsedResume } from './resumeParser';
import { ParsedJob } from './jobParser';
import { KeywordMatchResult } from './atsMatcher';
import { ATSScoreResult } from './scorer';
import { SkillGapResult } from './gapAnalyzer';
import { ResumeRewriteResult } from './rewriteAgent';

export interface ExplanationResult {
  scanId: string;
  overallScore: number;
  scoreExplanation: {
    whatItMeans: string;
    isGood: boolean;
    benchmark: string;
    nextSteps: string[];
  };
  detailedBreakdown: {
    section: string;
    score: number;
    status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
    explanation: string;
    recommendations: string[];
  }[];
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
  actionableInsights: {
    priority: 'high' | 'medium' | 'low';
    category: 'immediate' | 'short-term' | 'long-term';
    action: string;
    expectedImpact: string;
    effort: 'low' | 'medium' | 'high';
  }[];
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
}

export interface AgentResult {
  success: boolean;
  data?: ExplanationResult;
  error?: string;
}

export class ExplanationAgent {
  private llmProvider: BaseLLMProvider;

  constructor(llmProvider: 'openai' | 'huggingface' | 'local') {
    this.llmProvider = createLLMProvider(llmProvider, {
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateExplanation(input: {
    scanId: string;
    resumeData: ParsedResume;
    jobData: ParsedJob;
    keywordMatches: KeywordMatchResult;
    scores: ATSScoreResult;
    skillGaps: SkillGapResult;
    rewriteSuggestions: ResumeRewriteResult;
  }): Promise<AgentResult> {
    try {
      // Generate comprehensive explanation
      const scoreExplanation = await this.explainOverallScore(input.scores);
      const detailedBreakdown = await this.generateDetailedBreakdown(input);
      const keywordAnalysis = await this.analyzeKeywords(input.keywordMatches);
      const skillGapSummary = await this.summarizeSkillGaps(input.skillGaps);
      const actionableInsights = await this.generateActionableInsights(input);
      const nextSteps = await this.generateNextSteps(input);
      const competitiveAnalysis = await this.generateCompetitiveAnalysis(input);

      const result: ExplanationResult = {
        scanId: input.scanId,
        overallScore: input.scores.overallScore,
        scoreExplanation,
        detailedBreakdown,
        keywordAnalysis,
        skillGapSummary,
        actionableInsights,
        nextSteps,
        competitiveAnalysis,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: `Explanation generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async explainOverallScore(scores: ATSScoreResult): Promise<ExplanationResult['scoreExplanation']> {
    try {
      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert ATS analyst. Explain the ATS score in simple, human-readable terms like Jobscan does.
            
            Include:
            - What the score means in practical terms
            - Whether it's good or needs improvement
            - How it compares to benchmarks
            - Clear next steps
            
            Return JSON with:
            {
              "whatItMeans": "clear explanation of the score",
              "isGood": true/false,
              "benchmark": "how this compares to others",
              "nextSteps": ["step 1", "step 2", "step 3"]
            }`,
          },
          {
            role: 'user',
            content: `Overall ATS Score: ${scores.overallScore}/100
            
            Breakdown:
            - Keywords: ${scores.keywordScore}/100
            - Skills: ${scores.skillScore}/100
            - Experience: ${scores.experienceScore}/100
            - Education: ${scores.educationScore}/100
            - ATS Compliance: ${scores.atsScore}/100
            
            Strengths: ${scores.strengths.join(', ')}
            Weaknesses: ${scores.weaknesses.join(', ')}`,
          },
        ],
        temperature: 0.3,
        maxTokens: 800,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');

      return result;
    } catch (error) {
      console.error('Score explanation failed:', error);
      return {
        whatItMeans: `Your resume scored ${scores.overallScore}/100 for ATS compatibility.`,
        isGood: scores.overallScore >= 70,
        benchmark: scores.overallScore >= 80 ? 'Top 25% of candidates' : 'Average range',
        nextSteps: scores.overallScore >= 70 ? ['Apply for the position'] : ['Improve keywords', 'Add metrics'],
      };
    }
  }

  private async generateDetailedBreakdown(input: any): Promise<ExplanationResult['detailedBreakdown']> {
    try {
      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert ATS analyst. Provide detailed breakdown of each ATS score section.
            
            For each section:
            - Explain what was measured
            - Provide status (excellent/good/needs-improvement/critical)
            - Give specific recommendations
            - Make it actionable and easy to understand
            
            Return JSON with:
            {
              "detailedBreakdown": [
                {
                  "section": "section name",
                  "score": 0-100,
                  "status": "excellent|good|needs-improvement|critical",
                  "explanation": "what this score means",
                  "recommendations": ["rec 1", "rec 2", "rec 3"]
                }
              ]
            }`,
          },
          {
            role: 'user',
            content: `Overall Score: ${input.scores.overallScore}/100
            
            Section Scores:
            - Keywords: ${input.scores.keywordScore}/100
            - Skills: ${input.scores.skillScore}/100
            - Experience: ${input.scores.experienceScore}/100
            - Education: ${input.scores.educationScore}/100
            - ATS Compliance: ${input.scores.atsScore}/100
            
            Job: ${input.jobData.title} at ${input.jobData.company}
            
            Current Resume: ${input.resumeData.personalInfo.name}`,
          },
        ],
        temperature: 0.3,
        maxTokens: 1500,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"detailedBreakdown": []}');

      return result.detailedBreakdown || [];
    } catch (error) {
      console.error('Detailed breakdown generation failed:', error);
      return [];
    }
  }

  private async analyzeKeywords(keywordMatches: KeywordMatchResult): Promise<ExplanationResult['keywordAnalysis']> {
    try {
      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert ATS analyst. Analyze keyword matching results and explain their impact.
            
            Include:
            - Which keywords were matched
            - What's missing and why it matters
            - Additional keywords found
            - How this affects the overall score
            
            Return JSON with:
            {
              "matchedKeywords": ["keyword1", "keyword2"],
              "missingKeywords": ["missing1", "missing2"],
              "additionalKeywords": ["extra1", "extra2"],
              "impactOnScore": "explanation of keyword impact"
            }`,
          },
          {
            role: 'user',
            content: `Keyword Match Score: ${keywordMatches.matchScore}/100
            Exact Matches: ${keywordMatches.exactMatches.filter(m => m.found).length}/${keywordMatches.exactMatches.length}
            Semantic Matches: ${keywordMatches.semanticMatches.length}
            Missing Keywords: ${keywordMatches.missingKeywords.join(', ')}
            Additional Keywords: ${keywordMatches.additionalKeywords.join(', ')}`,
          },
        ],
        temperature: 0.2,
        maxTokens: 800,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');

      return result;
    } catch (error) {
      console.error('Keyword analysis failed:', error);
      return {
        matchedKeywords: keywordMatches.exactMatches.filter(m => m.found).map(m => m.keyword),
        missingKeywords: keywordMatches.missingKeywords,
        additionalKeywords: keywordMatches.additionalKeywords,
        impactOnScore: 'Keywords are crucial for ATS systems - they determine if your resume gets past initial screening.',
      };
    }
  }

  private async summarizeSkillGaps(skillGaps: SkillGapResult): Promise<ExplanationResult['skillGapSummary']> {
    try {
      const criticalGaps = skillGaps.missingSkills
        .filter(s => s.importance === 'critical')
        .map(s => s.skill);

      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert career development advisor. Summarize skill gap analysis in an encouraging, actionable way.
            
            Include:
            - Critical gaps that need immediate attention
            - Areas for improvement
            - Existing strengths to highlight
            - Recommended learning path
            
            Return JSON with:
            {
              "criticalGaps": ["gap1", "gap2"],
              "improvementAreas": ["area1", "area2"],
              "strengths": ["strength1", "strength2"],
              "learningPath": "recommended learning approach"
            }`,
          },
          {
            role: 'user',
            content: `Critical Missing Skills: ${criticalGaps.join(', ')}
            Skill Strengths: ${skillGaps.skillStrengths.map(s => s.skill).join(', ')}
            Market Demand: ${skillGaps.marketAlignment.demandLevel}`,
          },
        ],
        temperature: 0.3,
        maxTokens: 1000,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');

      return result;
    } catch (error) {
      const criticalGaps: string[] = [];

      return {
        criticalGaps,
        improvementAreas: ['Focus on technical skills', 'Gain relevant experience'],
        strengths: skillGaps.skillStrengths.map((s): string => s.skill),
        learningPath: 'Start with online courses, then gain practical experience',
      };
    }
  }

  private async generateActionableInsights(input: any): Promise<ExplanationResult['actionableInsights']> {
    try {
      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert career coach. Based on the complete ATS analysis, provide actionable insights.
            
            For each insight:
            - Assign priority (high/medium/low)
            - Categorize by timeframe (immediate/short-term/long-term)
            - Provide specific action
            - Explain expected impact
            - Estimate effort required
            
            Return JSON with:
            {
              "actionableInsights": [
                {
                  "priority": "high|medium|low",
                  "category": "immediate|short-term|long-term",
                  "action": "specific action to take",
                  "expectedImpact": "what this will achieve",
                  "effort": "low|medium|high"
                }
              ]
            }`,
          },
          {
            role: 'user',
            content: `Overall Score: ${input.scores.overallScore}/100
            Priority Issues: ${input.scores.weaknesses.join(', ')}
            Quick Wins: ${input.rewriteSuggestions.quickWins.length} opportunities`,
          },
        ],
        temperature: 0.3,
        maxTokens: 1200,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"actionableInsights": []}');

      return result.actionableInsights || [];
    } catch (error) {
      console.error('Actionable insights generation failed:', error);
      return [];
    }
  }

  private async generateNextSteps(input: any): Promise<ExplanationResult['nextSteps']> {
    try {
      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert career advisor. Based on the ATS analysis, create a timeline of next steps.
            
            Organize by:
            - Immediate actions (today)
            - This week goals
            - This month objectives
            
            Make steps specific, measurable, and achievable.
            
            Return JSON with:
            {
              "nextSteps": {
                "immediate": ["action 1", "action 2"],
                "thisWeek": ["goal 1", "goal 2"],
                "thisMonth": ["objective 1", "objective 2"]
              }
            }`,
          },
          {
            role: 'user',
            content: `Current Score: ${input.scores.overallScore}/100
            Target Score: 85+
            
            Key Issues: ${input.scores.weaknesses.slice(0, 3).join(', ')}
            Available Resources: ${input.rewriteSuggestions.priorityRewrites.length} priority suggestions`,
          },
        ],
        temperature: 0.3,
        maxTokens: 800,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"nextSteps": {}}');

      return result.nextSteps || {
        immediate: ['Update resume with missing keywords', 'Add metrics to achievements'],
        thisWeek: ['Complete online courses for critical skills', 'Rewrite experience descriptions'],
        thisMonth: ['Apply for target positions', 'Network with industry professionals'],
      };
    } catch (error) {
      console.error('Next steps generation failed:', error);
      return {
        immediate: ['Focus on learning fundamentals'],
        thisWeek: ['Start with online tutorials'],
        thisMonth: ['Build specialized expertise'],
      };
    }
  }

  private async generateCompetitiveAnalysis(input: any): Promise<ExplanationResult['competitiveAnalysis']> {
    try {
      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert market analyst. Analyze the candidate's competitive position.
            
            Include:
            - How candidate compares to others
            - Current market position
            - Improvement potential
            - Realistic assessment
            
            Return JSON with:
            {
              "competitiveAnalysis": {
                "howYouCompare": "comparison to other candidates",
                "marketPosition": "current standing in job market",
                "improvementPotential": "growth opportunities"
              }
            }`,
          },
          {
            role: 'user',
            content: `Overall Score: ${input.scores.overallScore}/100
            Job: ${input.jobData.title} at ${input.jobData.company}
            Industry: ${input.jobData.industry || 'Technology'}
            
            Strengths: ${input.scores.strengths.join(', ')}
            Market Demand: ${input.skillGaps.marketAlignment.demandLevel}`,
          },
        ],
        temperature: 0.2,
        maxTokens: 800,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"competitiveAnalysis": {}}');

      return result.competitiveAnalysis || {
        howYouCompare: 'Your profile shows potential with some areas for improvement.',
        marketPosition: 'Mid-range candidate with room to grow',
        improvementPotential: 'Significant improvement possible with targeted development',
      };
    } catch (error) {
      console.error('Competitive analysis failed:', error);
      return {
        howYouCompare: 'Your profile has good foundations for improvement.',
        marketPosition: 'Competitive candidate with development potential',
        improvementPotential: 'High growth potential with focused skill development',
      };
    }
  }
}
