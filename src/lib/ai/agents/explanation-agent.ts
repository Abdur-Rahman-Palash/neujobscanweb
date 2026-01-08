import OpenAI from 'openai';
import { AgentResult } from '../orchestrator';
import { ParsedResume } from './resume-parsing-agent';
import { ParsedJob } from './job-parsing-agent';
import { KeywordMatchResult } from './ats-keyword-matching-agent';
import { ATSScoreResult } from './scoring-agent';
import { SkillGapResult } from './skill-gap-reasoning-agent';
import { ResumeRewriteResult } from './rewrite-agent';

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

export class ExplanationAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
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
      const detailedBreakdown = await this.generateDetailedBreakdown(input.scores, input.jobData);
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
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Explain the ATS score in simple, human-readable terms like Jobscan does.
            
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
            - Keyword Match: ${scores.keywordScore}/100
            - Skill Alignment: ${scores.skillScore}/100  
            - Experience Relevance: ${scores.experienceScore}/100
            - Education Match: ${scores.educationScore}/100
            - ATS Compliance: ${scores.atsScore}/100`,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      return {
        whatItMeans: `Your resume scored ${scores.overallScore}/100 for ATS compatibility.`,
        isGood: scores.overallScore >= 70,
        benchmark: scores.overallScore >= 80 ? 'Top 25% of candidates' : 'Average range',
        nextSteps: scores.overallScore >= 70 ? ['Apply for the position'] : ['Improve keywords', 'Add metrics'],
      };
    }
  }

  private async generateDetailedBreakdown(
    scores: ATSScoreResult,
    jobData: ParsedJob
  ): Promise<ExplanationResult['detailedBreakdown']> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Create a detailed breakdown of each ATS score section.
            
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
                  "recommendations": ["rec 1", "rec 2"]
                }
              ]
            }`,
          },
          {
            role: 'user',
            content: `Job: ${jobData.title} at ${jobData.company}
            
            Scores:
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
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"detailedBreakdown": []}');

      return result.detailedBreakdown || [];
    } catch (error) {
      return [];
    }
  }

  private async analyzeKeywords(keywordMatches: KeywordMatchResult): Promise<ExplanationResult['keywordAnalysis']> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Analyze the keyword matching results and explain their impact.
            
            Explain:
            - Which keywords were matched
            - What's missing and why it matters
            - How keywords affect the overall score
            - What additional keywords were found
            
            Return JSON with:
            {
              "matchedKeywords": ["keyword1", "keyword2"],
              "missingKeywords": ["missing1", "missing2"],
              "additionalKeywords": ["extra1", "extra2"],
              "impactOnScore": "explanation of how keywords affect scoring"
            }`,
          },
          {
            role: 'user',
            content: `Keyword Match Score: ${keywordMatches.matchScore}/100
            Exact Matches: ${keywordMatches.exactMatches.filter(m => m.found).length}/${keywordMatches.exactMatches.length}
            Semantic Matches: ${keywordMatches.semanticMatches.length}
            Missing Keywords: ${keywordMatches.missingKeywords.join(', ')}
            Additional Keywords: ${keywordMatches.additionalKeywords.join(', ')}
            
            Category Scores:
            - Technical: ${keywordMatches.categoryScores.technical}/100
            - Soft Skills: ${keywordMatches.categoryScores.soft}/100
            - Languages: ${keywordMatches.categoryScores.language}/100
            - Tools: ${keywordMatches.categoryScores.tool}/100`,
          },
        ],
        temperature: 0.2,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
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
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Summarize skill gap analysis in an encouraging, actionable way.
            
            Include:
            - Critical gaps that need immediate attention
            - Areas for improvement
            - Existing strengths to highlight
            - Suggested learning path
            
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
            content: `Missing Skills: ${skillGaps.missingSkills.filter(s => s.importance === 'critical').map(s => s.skill).join(', ')}
            Skill Strengths: ${skillGaps.skillStrengths.map(s => s.skill).join(', ')}
            Improvement Areas: ${skillGaps.improvementAreas.map(a => a.area).join(', ')}
            
            Career Advice:
            - Short-term: ${skillGaps.careerAdvice.shortTerm.join(', ')}
            - Medium-term: ${skillGaps.careerAdvice.mediumTerm.join(', ')}
            - Long-term: ${skillGaps.careerAdvice.longTerm.join(', ')}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' },
      });

      return JSON.parse(response.choices[0]?.message?.content || '{}');
    } catch (error) {
      return {
        criticalGaps: skillGaps.missingSkills.filter(s => s.importance === 'critical').map(s => s.skill),
        improvementAreas: skillGaps.improvementAreas.map(a => a.area),
        strengths: skillGaps.skillStrengths.map(s => s.skill),
        learningPath: 'Focus on critical skills first, then expand to related areas.',
      };
    }
  }

  private async generateActionableInsights(input: any): Promise<ExplanationResult['actionableInsights']> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Generate actionable insights based on the complete ATS analysis.
            
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
            Priority Rewrites: ${input.rewriteSuggestions.priorityRewrites.length}
            Quick Wins: ${input.rewriteSuggestions.quickWins.length}
            Critical Missing Skills: ${input.skillGaps.missingSkills.filter((s: any) => s.importance === 'critical').length}
            
            Top Recommendations: ${input.scores.recommendations.slice(0, 3).join(', ')}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"actionableInsights": []}');

      return result.actionableInsights || [];
    } catch (error) {
      return [];
    }
  }

  private async generateNextSteps(input: any): Promise<ExplanationResult['nextSteps']> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Create a timeline of next steps for improving the resume.
            
            Organize by:
            - Immediate actions (today)
            - This week goals
            - This month objectives
            
            Make steps specific, measurable, and achievable.
            
            Return JSON with:
            {
              "nextSteps": {
                "immediate": ["action1", "action2"],
                "thisWeek": ["goal1", "goal2"],
                "thisMonth": ["objective1", "objective2"]
              }
            }`,
          },
          {
            role: 'user',
            content: `Current Score: ${input.scores.overallScore}/100
            Target Score: 85+
            
            Key Issues:
            - Missing Keywords: ${input.keywordMatches.missingKeywords.length}
            - ATS Compliance: ${input.scores.atsScore}/100
            - Experience Relevance: ${input.scores.experienceScore}/100
            
            Available Rewrite Suggestions: ${input.rewriteSuggestions.suggestions.length}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"nextSteps": {}}');

      return result.nextSteps || {
        immediate: [],
        thisWeek: [],
        thisMonth: [],
      };
    } catch (error) {
      return {
        immediate: ['Add missing keywords to skills section'],
        thisWeek: ['Rewrite experience descriptions with metrics'],
        thisMonth: ['Complete online courses for critical skills'],
      };
    }
  }

  private async generateCompetitiveAnalysis(input: any): Promise<ExplanationResult['competitiveAnalysis']> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Provide competitive analysis based on the ATS results.
            
            Explain:
            - How the candidate compares to others
            - Their market position for this role
            - Potential for improvement
            
            Return JSON with:
            {
              "competitiveAnalysis": {
                "howYouCompare": "comparison to other candidates",
                "marketPosition": "position in job market",
                "improvementPotential": "growth opportunities"
              }
            }`,
          },
          {
            role: 'user',
            content: `Score: ${input.scores.overallScore}/100
            Job Level: ${input.jobData.experienceLevel}
            Industry: ${input.jobData.industry || 'Technology'}
            Market Demand: ${input.skillGaps.marketAlignment.demandLevel}
            
            Strengths: ${input.scores.strengths.join(', ')}
            Key Differentiators: ${input.skillGaps.skillStrengths.slice(0, 3).map((s: any) => s.skill).join(', ')}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 600,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"competitiveAnalysis": {}}');

      return result.competitiveAnalysis || {
        howYouCompare: 'Your profile shows potential with some areas for improvement',
        marketPosition: 'Competitive candidate with room to grow',
        improvementPotential: 'High - focused improvements can significantly increase competitiveness',
      };
    } catch (error) {
      return {
        howYouCompare: 'Your resume has good foundations but needs optimization',
        marketPosition: 'Mid-range candidate',
        improvementPotential: 'Significant improvement possible with targeted changes',
      };
    }
  }
}
