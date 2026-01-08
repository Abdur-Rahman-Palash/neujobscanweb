import OpenAI from 'openai';
import { AI_CONFIG } from '@/lib/constants';
import { ParsedResumeData, ParsedJobData, ResumeAnalysis, JobAnalysis, MatchResult, OptimizationSuggestions } from '@/types';

export class ATSAnalyzerAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async analyzeResume(resumeData: ParsedResumeData, content: string): Promise<ResumeAnalysis> {
    const prompt = `
      Analyze this resume for ATS compatibility and provide detailed feedback:
      
      Resume Data: ${JSON.stringify(resumeData, null, 2)}
      Full Content: ${content}
      
      Provide analysis in JSON format with:
      {
        "overallScore": number (0-100),
        "atsScore": number (0-100),
        "keywordScore": number (0-100),
        "structureScore": number (0-100),
        "contentScore": number (0-100),
        "strengths": ["string"],
        "weaknesses": ["string"],
        "recommendations": ["string"],
        "missingKeywords": ["string"],
        "formatIssues": ["string"]
      }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: AI_CONFIG.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        id: Math.random().toString(36).substring(2),
        resumeId: '',
        overallScore: analysis.overallScore || 0,
        atsScore: analysis.atsScore || 0,
        keywordScore: analysis.keywordScore || 0,
        structureScore: analysis.structureScore || 0,
        contentScore: analysis.contentScore || 0,
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        recommendations: analysis.recommendations || [],
        missingKeywords: analysis.missingKeywords || [],
        formatIssues: analysis.formatIssues || [],
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Resume analysis error:', error);
      throw new Error('Failed to analyze resume');
    }
  }

  async analyzeJob(jobData: ParsedJobData): Promise<JobAnalysis> {
    const prompt = `
      Analyze this job description and provide detailed insights:
      
      Job Data: ${JSON.stringify(jobData, null, 2)}
      
      Provide analysis in JSON format with:
      {
        "difficulty": "easy" | "medium" | "hard",
        "seniorityLevel": "entry" | "mid" | "senior" | "lead" | "executive",
        "keyRequirements": ["string"],
        "preferredQualifications": ["string"],
        "companyCulture": "string",
        "growthOpportunities": ["string"],
        "marketCompetitiveness": "low" | "medium" | "high"
      }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: AI_CONFIG.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        id: Math.random().toString(36).substring(2),
        jobId: '',
        difficulty: analysis.difficulty || 'medium',
        seniorityLevel: analysis.seniorityLevel || 'mid',
        keyRequirements: analysis.keyRequirements || [],
        preferredQualifications: analysis.preferredQualifications || [],
        companyCulture: analysis.companyCulture,
        growthOpportunities: analysis.growthOpportunities || [],
        marketCompetitiveness: analysis.marketCompetitiveness || 'medium',
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Job analysis error:', error);
      throw new Error('Failed to analyze job');
    }
  }
}

export class MatchMakerAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async createMatch(resumeData: ParsedResumeData, jobData: ParsedJobData): Promise<MatchResult> {
    const prompt = `
      Analyze the match between this resume and job description:
      
      Resume Data: ${JSON.stringify(resumeData, null, 2)}
      Job Data: ${JSON.stringify(jobData, null, 2)}
      
      Provide detailed match analysis in JSON format:
      {
        "overallScore": number (0-100),
        "atsScore": number (0-100),
        "keywordScore": number (0-100),
        "experienceScore": number (0-100),
        "educationScore": number (0-100),
        "skillScore": number (0-100),
        "strengths": ["string"],
        "gaps": ["string"],
        "recommendations": ["string"],
        "missingKeywords": ["string"]
      }
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: AI_CONFIG.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        response_format: { type: 'json_object' }
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      const matchPercentage = (analysis.overallScore || 0);
      
      return {
        id: Math.random().toString(36).substring(2),
        resumeId: '',
        jobId: '',
        overallScore: analysis.overallScore || 0,
        atsScore: analysis.atsScore || 0,
        keywordScore: analysis.keywordScore || 0,
        experienceScore: analysis.experienceScore || 0,
        educationScore: analysis.educationScore || 0,
        skillScore: analysis.skillScore || 0,
        matchPercentage,
        strengths: analysis.strengths || [],
        gaps: analysis.gaps || [],
        recommendations: analysis.recommendations || [],
        missingKeywords: analysis.missingKeywords || [],
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Match creation error:', error);
      throw new Error('Failed to create match');
    }
  }
}

export class OptimizationAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async generateOptimizations(
    resumeData: ParsedResumeData,
    jobData?: ParsedJobData
  ): Promise<OptimizationSuggestions[]> {
    const context = jobData 
      ? `Resume Data: ${JSON.stringify(resumeData, null, 2)}\nTarget Job Data: ${JSON.stringify(jobData, null, 2)}`
      : `Resume Data: ${JSON.stringify(resumeData, null, 2)}`;

    const prompt = `
      Analyze this resume${jobData ? ' for the target job' : ''} and provide optimization suggestions:
      
      ${context}
      
      Provide suggestions in JSON array format:
      [
        {
          "type": "keyword" | "structure" | "content" | "format",
          "priority": "high" | "medium" | "low",
          "title": "string",
          "description": "string",
          "example": "string (optional)",
          "impact": number (1-10)
        }
      ]
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: AI_CONFIG.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        response_format: { type: 'json_object' }
      });

      const suggestions = JSON.parse(response.choices[0].message.content || '[]');
      
      return suggestions.map((suggestion: any) => ({
        id: Math.random().toString(36).substring(2),
        resumeId: '',
        jobId: jobData?.id || '',
        type: suggestion.type || 'content',
        priority: suggestion.priority || 'medium',
        title: suggestion.title || 'Optimization Suggestion',
        description: suggestion.description || '',
        example: suggestion.example,
        impact: suggestion.impact || 5,
        createdAt: new Date(),
      }));
    } catch (error) {
      console.error('Optimization generation error:', error);
      throw new Error('Failed to generate optimizations');
    }
  }
}

export class KeywordExtractorAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async extractKeywords(text: string, context: 'resume' | 'job' = 'job'): Promise<string[]> {
    const prompt = `
      Extract the most important keywords and skills from this ${context} description:
      
      Text: ${text}
      
      Return a JSON array of keywords that are most relevant for ATS systems and job matching.
      Focus on:
      - Technical skills
      - Soft skills
      - Industry-specific terms
      - Qualifications
      - Tools and technologies
      
      Format: ["keyword1", "keyword2", ...]
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          { role: 'system', content: AI_CONFIG.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result.keywords || [];
    } catch (error) {
      console.error('Keyword extraction error:', error);
      return [];
    }
  }
}

export class AIAgentOrchestrator {
  private resumeAnalyzer: ATSAnalyzerAgent;
  private jobAnalyzer: ATSAnalyzerAgent;
  private matchMaker: MatchMakerAgent;
  private optimizer: OptimizationAgent;
  private keywordExtractor: KeywordExtractorAgent;

  constructor(openaiApiKey: string) {
    this.resumeAnalyzer = new ATSAnalyzerAgent(openaiApiKey);
    this.jobAnalyzer = new ATSAnalyzerAgent(openaiApiKey);
    this.matchMaker = new MatchMakerAgent(openaiApiKey);
    this.optimizer = new OptimizationAgent(openaiApiKey);
    this.keywordExtractor = new KeywordExtractorAgent(openaiApiKey);
  }

  get agents() {
    return {
      resumeAnalyzer: this.resumeAnalyzer,
      jobAnalyzer: this.jobAnalyzer,
      matchMaker: this.matchMaker,
      optimizer: this.optimizer,
      keywordExtractor: this.keywordExtractor,
    };
  }
}
