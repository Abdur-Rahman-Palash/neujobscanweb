import OpenAI from 'openai';
import { AgentResult } from '../orchestrator';
import { ParsedResume } from './resume-parsing-agent';
import { ParsedJob } from './job-parsing-agent';
import { ATSScoreResult } from './scoring-agent';

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

export class SkillGapReasoningAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
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
      const resumeSkills = resumeData.skills.map(s => s.name.toLowerCase());
      const requiredSkills = jobData.skills.filter(s => s.required);

      const missing = requiredSkills.filter(jobSkill => 
        !resumeSkills.some(resumeSkill => 
          resumeSkill.includes(jobSkill.name.toLowerCase()) || 
          jobSkill.name.toLowerCase().includes(resumeSkill)
        )
      );

      if (missing.length === 0) {
        return [];
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a career development expert. Analyze missing skills for a job application.
            
            For each missing skill, provide:
            - Importance level (critical/important/nice-to-have)
            - Category (technical/soft/language/tool)
            - Reason why it's needed
            - Learning resources with specific recommendations
            
            Return JSON with:
            {
              "missingSkills": [
                {
                  "skill": "skill name",
                  "importance": "critical|important|nice-to-have",
                  "category": "technical|soft|language|tool", 
                  "reason": "why this skill is needed",
                  "learningResources": [
                    {
                      "type": "course|certification|tutorial|book",
                      "title": "resource title",
                      "provider": "provider name",
                      "url": "resource URL (optional)",
                      "estimatedTime": "time to complete"
                    }
                  ]
                }
              ]
            }`,
          },
          {
            role: 'user',
            content: `Job: ${jobData.title}
            Company: ${jobData.company}
            Missing Skills: ${missing.map(s => s.name).join(', ')}
            Job Requirements: ${jobData.requirements.join('\n')}
            Resume Skills: ${resumeSkills.join(', ')}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"missingSkills": []}');

      return result.missingSkills || [];
    } catch (error) {
      console.error('Missing skills analysis failed:', error);
      return [];
    }
  }

  private async analyzeSkillStrengths(resumeData: ParsedResume, jobData: ParsedJob): Promise<SkillGapResult['skillStrengths']> {
    try {
      const jobKeywords = jobData.keywords.map(k => k.toLowerCase());
      const relevantSkills = resumeData.skills.filter(skill => 
        jobKeywords.some(keyword => 
          skill.name.toLowerCase().includes(keyword) || 
          keyword.includes(skill.name.toLowerCase())
        )
      );

      if (relevantSkills.length === 0) {
        return [];
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Analyze the candidate's strongest skills relevant to this job.
            
            For each skill, provide:
            - Relevance score (0-100) to the job
            - Evidence from experience
            - Current level assessment
            
            Return JSON with:
            {
              "skillStrengths": [
                {
                  "skill": "skill name",
                  "level": "current level",
                  "relevance": 0-100,
                  "evidence": "how this skill is demonstrated"
                }
              ]
            }`,
          },
          {
            role: 'user',
            content: `Job: ${jobData.title}
            Job Requirements: ${jobData.requirements.join('\n')}
            Candidate Skills: ${relevantSkills.map(s => `${s.name} (${s.level})`).join(', ')}
            Experience: ${resumeData.experience.map(exp => `${exp.position} at ${exp.company}: ${exp.description}`).join('\n')}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"skillStrengths": []}');

      return result.skillStrengths || [];
    } catch (error) {
      console.error('Skill strengths analysis failed:', error);
      return [];
    }
  }

  private async identifyImprovementAreas(
    resumeData: ParsedResume,
    jobData: ParsedJob,
    scoreResult: ATSScoreResult
  ): Promise<SkillGapResult['improvementAreas']> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Identify specific areas for improvement based on resume-job match analysis.
            
            Focus on:
            - Skills that need development
            - Experience gaps
            - Education/certification needs
            - Resume presentation issues
            
            Return JSON with:
            {
              "improvementAreas": [
                {
                  "area": "area name",
                  "currentLevel": "current state",
                  "targetLevel": "desired state", 
                  "gap": "description of the gap",
                  "actionItems": ["specific action 1", "specific action 2"]
                }
              ]
            }`,
          },
          {
            role: 'user',
            content: `Job: ${jobData.title}
            Overall Score: ${scoreResult.overallScore}/100
            Scores: Keyword ${scoreResult.keywordScore}/100, Skills ${scoreResult.skillScore}/100, Experience ${scoreResult.experienceScore}/100, Education ${scoreResult.educationScore}/100
            
            Resume Summary: ${resumeData.summary || 'No summary'}
            Skills: ${resumeData.skills.map(s => s.name).join(', ')}
            Experience: ${resumeData.experience.length} positions
            Education: ${resumeData.education.map(e => e.degree).join(', ')}
            
            Job Requirements: ${jobData.requirements.join('\n')}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"improvementAreas": []}');

      return result.improvementAreas || [];
    } catch (error) {
      console.error('Improvement areas analysis failed:', error);
      return [];
    }
  }

  private async generateCareerAdvice(
    resumeData: ParsedResume,
    jobData: ParsedJob,
    missingSkills: SkillGapResult['missingSkills']
  ): Promise<SkillGapResult['careerAdvice']> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Provide strategic career advice based on the job application analysis.
            
            Include:
            - Short-term actions (next 1-3 months)
            - Medium-term goals (3-12 months)  
            - Long-term career planning (1+ years)
            
            Return JSON with:
            {
              "careerAdvice": {
                "shortTerm": ["action 1", "action 2"],
                "mediumTerm": ["goal 1", "goal 2"],
                "longTerm": ["plan 1", "plan 2"]
              }
            }`,
          },
          {
            role: 'user',
            content: `Target Role: ${jobData.title} at ${jobData.company}
            Candidate Experience: ${this.calculateTotalExperience(resumeData)} years
            Current Skills: ${resumeData.skills.map(s => s.name).join(', ')}
            Missing Critical Skills: ${missingSkills.filter(s => s.importance === 'critical').map(s => s.skill).join(', ')}
            
            Job Level: ${jobData.experienceLevel}
            Industry: ${jobData.industry || 'Technology'}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"careerAdvice": {}}');

      return result.careerAdvice || {
        shortTerm: [],
        mediumTerm: [],
        longTerm: [],
      };
    } catch (error) {
      console.error('Career advice generation failed:', error);
      return {
        shortTerm: ['Update resume with missing keywords'],
        mediumTerm: ['Complete relevant certifications'],
        longTerm: ['Gain experience in key areas'],
      };
    }
  }

  private async analyzeMarketAlignment(jobData: ParsedJob): Promise<SkillGapResult['marketAlignment']> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Analyze market demand for this role and skills.
            
            Assess:
            - Demand level in current market
            - Salary impact of having these skills
            - Growth potential for this career path
            
            Return JSON with:
            {
              "marketAlignment": {
                "demandLevel": "high|medium|low",
                "salaryImpact": "high|medium|low", 
                "growthPotential": "high|medium|low"
              }
            }`,
          },
          {
            role: 'user',
            content: `Job Title: ${jobData.title}
            Industry: ${jobData.industry || 'Technology'}
            Required Skills: ${jobData.skills.filter(s => s.required).map(s => s.name).join(', ')}
            Experience Level: ${jobData.experienceLevel}
            Location: ${jobData.location || 'Remote'}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"marketAlignment": {}}');

      return result.marketAlignment || {
        demandLevel: 'medium',
        salaryImpact: 'medium',
        growthPotential: 'medium',
      };
    } catch (error) {
      console.error('Market alignment analysis failed:', error);
      return {
        demandLevel: 'medium',
        salaryImpact: 'medium',
        growthPotential: 'medium',
      };
    }
  }

  private calculateTotalExperience(resumeData: ParsedResume): number {
    let totalMonths = 0;

    resumeData.experience.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.current ? new Date() : new Date(exp.endDate || '');
      const months = (end.getFullYear() - start.getFullYear()) * 12 + 
                   (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    });

    return Math.round(totalMonths / 12 * 10) / 10;
  }
}
