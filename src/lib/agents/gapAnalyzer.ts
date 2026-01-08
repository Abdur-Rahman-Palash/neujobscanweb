import { BaseLLMProvider, createLLMProvider } from '../llm/provider';
import { ParsedResume } from './resumeParser';
import { ParsedJob } from './jobParser';
import { ATSScoreResult } from './scorer';

export interface SkillGapResult {
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
}

export interface AgentResult {
  success: boolean;
  data?: SkillGapResult;
  error?: string;
}

export class GapAnalyzerAgent {
  private llmProvider: BaseLLMProvider;

  constructor(llmProvider: 'openai' | 'huggingface' | 'local') {
    this.llmProvider = createLLMProvider(llmProvider, {
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeSkillGaps(
    resumeData: ParsedResume,
    jobData: ParsedJob,
    scoreResult: ATSScoreResult
  ): Promise<AgentResult> {
    try {
      // Identify missing skills
      const missingSkills = await this.identifyMissingSkills(resumeData, jobData);
      
      // Analyze existing skill strengths
      const skillStrengths = await this.analyzeSkillStrengths(resumeData, jobData);
      
      // Identify improvement areas
      const improvementAreas = await this.identifyImprovementAreas(resumeData, jobData, scoreResult);
      
      // Generate career advice
      const careerAdvice = await this.generateCareerAdvice(resumeData, jobData, missingSkills);
      
      // Analyze market alignment
      const marketAlignment = await this.analyzeMarketAlignment(jobData);

      const result: SkillGapResult = {
        missingSkills,
        skillStrengths,
        improvementAreas,
        careerAdvice,
        marketAlignment,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: `Skill gap analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async identifyMissingSkills(resumeData: ParsedResume, jobData: ParsedJob): Promise<SkillGapResult['missingSkills']> {
    try {
      const resumeSkills = resumeData.skills.map((skill): string => skill.name.toLowerCase());
      const requiredSkills = jobData.skills
        .filter((skill): boolean => skill.required)
        .map((skill): string => skill.name.toLowerCase());

      const missing = requiredSkills.filter((skill): boolean => 
        resumeSkills.some((resumeSkill): boolean => 
          resumeSkill === skill
        )
      );

      if (missing.length === 0) {
        return [];
      }

      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career development advisor. Analyze missing skills for a job application.\\n\\nFor each missing skill, provide:\\n- Importance level (critical/important/nice-to-have)\\n- Category (technical/soft/language/tool)\\n- Reason why it is needed\\n- Learning resources with specific recommendations\\n\\nReturn JSON with:\\n{\\n  \\"missingSkills\\": [\\n    {\\n      \\"skill\\": \\"skill name\\",\\n      \\"importance\\": \\"critical|important|nice-to-have\\",\\n      \\"category\\": \\"technical|soft|language|tool\\",\\n      \\"reason\\": \\"why this skill is needed\\",\\n      \\"learningResources\\": [\\n        {\\n          \\"type\\": \\"course|certification|tutorial|book\\",\\n          \\"title\\": \\"resource title\\",\\n          \\"provider\\": \\"provider name\\",\\n          \\"url\\": \\"resource URL\\",\\n          \\"estimatedTime\\": \\"time to complete\\"\\n        }\\n      ]\\n    }\\n  ]\\n}',
          },
          {
            role: 'user',
            content: `Resume skills: ${resumeSkills.join(', ')}\\nRequired skills: ${requiredSkills.join(', ')}\\nMissing skills: ${missing.join(', ')}`,
          },
        ],
        temperature: 0.3,
        maxTokens: 2000,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"missingSkills": []}');

      return result.missingSkills || [];
    } catch (error) {
      return [];
    }
  }

  private async analyzeSkillStrengths(resumeData: ParsedResume, jobData: ParsedJob): Promise<SkillGapResult['skillStrengths']> {
    try {
      const resumeSkills = resumeData.skills.map((skill): string => skill.name.toLowerCase());
      const jobKeywords = jobData.keywords || [];
      const jobRequirements = jobData.requirements.join(' ');

      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in skill assessment. Analyze candidate\'s existing skills against job requirements.\\n\\nFor each skill, provide:\\n- Relevance score (0-100)\\n- Current level assessment\\n- Evidence from experience\\n- Market demand level\\n\\nReturn JSON with:\\n{\\n  \\"skillStrengths\\": [\\n    {\\n      \\"skill\\": \\"skill name\\",\\n      \\"level\\": \\"current level assessment\\",\\n      \\"relevance\\": 0-100,\\n      \\"evidence\\": \\"evidence from experience\\",\\n      \\"marketDemand\\": \\"high|medium|low\\"\\n    }\\n  ]\\n}',
          },
          {
            role: 'user',
            content: `Resume skills: ${resumeSkills.join(', ')}\\nJob requirements: ${jobRequirements}`,
          },
        ],
        temperature: 0.2,
        maxTokens: 1500,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"skillStrengths": []}');

      return result.skillStrengths || [];
    } catch (error) {
      return [];
    }
  }

  private async identifyImprovementAreas(
    resumeData: ParsedResume,
    jobData: ParsedJob,
    scoreResult: ATSScoreResult
  ): Promise<SkillGapResult['improvementAreas']> {
    try {
      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career coach. Based on resume-job analysis, identify specific improvement areas.\\n\\nFor each improvement area:\\n- Area name (skills, experience, education, etc.)\\n- Current level assessment\\n- Target level for the role\\n- Gap description\\n- Specific action items to reach target\\n\\nReturn JSON with:\\n{\\n  \\"improvementAreas\\": [\\n    {\\n      \\"area\\": \\"area name\\",\\n      \\"currentLevel\\": \\"current level assessment\\",\\n      \\"targetLevel\\": \\"target level for the role\\",\\n      \\"gap\\": \\"description of the gap\\",\\n      \\"actionItems\\": [\\"action 1\\", \\"action 2\\", \\"action 3\\"]\\n    }\\n  ]\\n}',
          },
          {
            role: 'user',
            content: `Overall Score: ${scoreResult.overallScore}/100\\n\\nJob: ${jobData.title} at ${jobData.company}\\n\\nCurrent scores: Skills ${scoreResult.skillScore}/100, Experience ${scoreResult.experienceScore}/100, Education ${scoreResult.educationScore}/100\\n\\nResume has ${resumeData.skills.length} skills, ${resumeData.experience.length} experience entries\\n\\nJob requires: ${jobData.requirements.length} requirements`,
          },
        ],
        temperature: 0.3,
        maxTokens: 1500,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"improvementAreas": []}');

      return result.improvementAreas || [];
    } catch (error) {
      return [];
    }
  }

  private async generateCareerAdvice(
    resumeData: ParsedResume,
    jobData: ParsedJob,
    missingSkills: SkillGapResult['missingSkills']
  ): Promise<SkillGapResult['careerAdvice']> {
    try {
      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career strategist. Based on skill gaps and job requirements, provide strategic career advice.\\n\\nProvide:\\n- Short-term actions (next 1-3 months)\\n- Medium-term goals (3-12 months)\\n- Long-term objectives (1+ years)\\n\\nReturn JSON with:\\n{\\n  \\"careerAdvice\\": {\\n    \\"shortTerm\\": [\\"action 1\\", \\"action 2\\", \\"action 3\\"],\\n    \\"mediumTerm\\": [\\"goal 1\\", \\"goal 2\\", \\"goal 3\\"],\\n    \\"longTerm\\": [\\"objective 1\\", \\"objective 2\\", \\"objective 3\\"]\\n  }\\n}',
          },
          {
            role: 'user',
            content: `Missing critical skills: ${missingSkills.filter((s): boolean => s.importance === 'critical').map((s): string => s.skill).join(', ')}\\nCurrent experience: ${this.calculateTotalExperience(resumeData)} years\\n\\nJob target: ${jobData.title} at ${jobData.company}`,
          },
        ],
        temperature: 0.3,
        maxTokens: 1500,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"careerAdvice": {}}');

      return result.careerAdvice || {
        shortTerm: ['Focus on learning fundamentals', 'Start with online tutorials'],
        mediumTerm: ['Build specialized expertise', 'Seek mentorship opportunities'],
        longTerm: ['Pursue advanced education', 'Target leadership positions'],
      };
    } catch (error) {
      return {
        shortTerm: ['Focus on learning fundamentals'],
        mediumTerm: ['Build specialized expertise'],
        longTerm: ['Pursue advanced education'],
      };
    }
  }

  private async analyzeMarketAlignment(jobData: ParsedJob): Promise<SkillGapResult['marketAlignment']> {
    try {
      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert market analyst. Analyze job market demand and growth potential.\\n\\nAnalyze:\\n- Demand level for this role/industry\\n- Salary impact of having these skills\\n- Growth potential in this career path\\n- Market competition level\\n\\nReturn JSON with:\\n{\\n  \\"marketAlignment\\": {\\n    \\"demandLevel\\": \\"high|medium|low\\",\\n    \\"salaryImpact\\": \\"high|medium|low\\",\\n    \\"growthPotential\\": \\"high|medium|low\\"\\n  }\\n}',
          },
          {
            role: 'user',
            content: `Job: ${jobData.title} at ${jobData.company}\\nIndustry: ${jobData.industry || 'Technology'}\\nRequired skills: ${jobData.skills.filter((s): boolean => s.required).map((s): string => s.name).join(', ')}`,
          },
        ],
        temperature: 0.2,
        maxTokens: 1000,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"marketAlignment": {}}');

      return result.marketAlignment || {
        demandLevel: 'medium',
        salaryImpact: 'medium',
        growthPotential: 'medium',
      };
    } catch (error) {
      return {
        demandLevel: 'medium',
        salaryImpact: 'medium',
        growthPotential: 'medium',
      };
    }
  }

  private calculateTotalExperience(resumeData: ParsedResume): number {
    let totalMonths = 0;

    resumeData.experience.forEach((exp): void => {
      const start = new Date(exp.startDate);
      const end = exp.current ? new Date() : new Date(exp.endDate || '');
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    });

    return Math.round(totalMonths / 12 * 10) / 10;
  }
}
