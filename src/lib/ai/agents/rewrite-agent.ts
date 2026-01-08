import OpenAI from 'openai';
import { AgentResult } from '../orchestrator';
import { ParsedResume } from './resume-parsing-agent';
import { ParsedJob } from './job-parsing-agent';
import { SkillGapResult } from './skill-gap-reasoning-agent';

export interface RewriteSuggestion {
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
}

export interface ResumeRewriteResult {
  suggestions: RewriteSuggestion[];
  overallImprovement: {
    atsScore: number;
    readabilityScore: number;
    impactScore: number;
  };
  priorityRewrites: RewriteSuggestion[];
  quickWins: RewriteSuggestion[];
  sectionAnalysis: {
    summary: { score: number; suggestions: number };
    experience: { score: number; suggestions: number };
    skills: { score: number; suggestions: number };
    education: { score: number; suggestions: number };
    projects: { score: number; suggestions: number };
  };
}

export class RewriteAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async generateRewriteSuggestions(
    resumeData: ParsedResume,
    jobData: ParsedJob,
    skillGapResult: SkillGapResult
  ): Promise<AgentResult> {
    try {
      // Generate suggestions for each section
      const summarySuggestions = await this.rewriteSummary(resumeData, jobData);
      const experienceSuggestions = await this.rewriteExperience(resumeData, jobData);
      const skillsSuggestions = await this.rewriteSkills(resumeData, jobData, skillGapResult);
      const educationSuggestions = await this.rewriteEducation(resumeData, jobData);
      const projectsSuggestions = await this.rewriteProjects(resumeData, jobData);

      const allSuggestions = [
        ...summarySuggestions,
        ...experienceSuggestions,
        ...skillsSuggestions,
        ...educationSuggestions,
        ...projectsSuggestions,
      ];

      // Analyze and categorize suggestions
      const priorityRewrites = this.identifyPriorityRewrites(allSuggestions);
      const quickWins = this.identifyQuickWins(allSuggestions);
      const sectionAnalysis = this.analyzeSections(allSuggestions);

      // Calculate overall improvement potential
      const overallImprovement = this.calculateOverallImprovement(allSuggestions);

      const result: ResumeRewriteResult = {
        suggestions: allSuggestions,
        overallImprovement,
        priorityRewrites,
        quickWins,
        sectionAnalysis,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: `Resume rewrite suggestions failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async rewriteSummary(resumeData: ParsedResume, jobData: ParsedJob): Promise<RewriteSuggestion[]> {
    if (!resumeData.summary) return [];

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert resume writer specializing in ATS optimization.
            
            Rewrite the professional summary to:
            - Include key job requirements and keywords
            - Start with strong action verbs
            - Quantify achievements where possible
            - Maintain professional tone
            - Keep it concise (2-3 sentences)
            
            Return JSON with:
            {
              "suggestions": [
                {
                  "originalText": "original summary",
                  "rewrittenText": "improved summary",
                  "reason": "why this is better",
                  "atsScore": {"before": 0-100, "after": 0-100, "improvement": 0-100},
                  "keywordsAdded": ["keyword1", "keyword2"],
                  "actionVerbsAdded": ["verb1", "verb2"],
                  "metricsAdded": ["metric1", "metric2"]
                }
              ]
            }`,
          },
          {
            role: 'user',
            content: `Job Title: ${jobData.title}
            Company: ${jobData.company}
            Key Requirements: ${jobData.requirements.slice(0, 5).join(', ')}
            Required Skills: ${jobData.skills.filter(s => s.required).map(s => s.name).join(', ')}
            
            Current Summary: ${resumeData.summary}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions": []}');

      return result.suggestions.map((s: any) => ({
        ...s,
        section: 'summary' as const,
      }));
    } catch (error) {
      console.error('Summary rewrite failed:', error);
      return [];
    }
  }

  private async rewriteExperience(resumeData: ParsedResume, jobData: ParsedJob): Promise<RewriteSuggestion[]> {
    const suggestions: RewriteSuggestion[] = [];

    for (const exp of resumeData.experience) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `Rewrite this experience description to be more ATS-friendly and impactful.
              
              Focus on:
              - Adding relevant keywords from job requirements
              - Using strong action verbs
              - Quantifying achievements with metrics
              - Highlighting relevant accomplishments
              - Maintaining truthfulness
              
              Return JSON with:
              {
                "suggestions": [
                  {
                    "originalText": "original description",
                    "rewrittenText": "improved description",
                    "reason": "why this is better",
                    "atsScore": {"before": 0-100, "after": 0-100, "improvement": 0-100},
                    "keywordsAdded": ["keyword1", "keyword2"],
                    "actionVerbsAdded": ["verb1", "verb2"],
                    "metricsAdded": ["metric1", "metric2"]
                  }
                ]
              }`,
            },
            {
              role: 'user',
              content: `Job: ${jobData.title} at ${jobData.company}
              Job Requirements: ${jobData.requirements.slice(0, 3).join(', ')}
              Required Skills: ${jobData.skills.filter(s => s.required).slice(0, 5).map(s => s.name).join(', ')}
              
              Position: ${exp.position} at ${exp.company}
              Current Description: ${exp.description}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        });

        const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions": []}');

        const expSuggestions = result.suggestions.map((s: any) => ({
          ...s,
          section: 'experience' as const,
        }));

        suggestions.push(...expSuggestions);
      } catch (error) {
        console.error(`Experience rewrite failed for ${exp.position}:`, error);
      }
    }

    return suggestions;
  }

  private async rewriteSkills(
    resumeData: ParsedResume,
    jobData: ParsedJob,
    skillGapResult: SkillGapResult
  ): Promise<RewriteSuggestion[]> {
    try {
      const missingSkills = skillGapResult.missingSkills.filter(s => s.importance === 'critical');
      const currentSkills = resumeData.skills.map(s => s.name);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Optimize the skills section for ATS compatibility.
            
            - Add missing critical skills if they can be reasonably included
            - Group skills by category (Technical, Soft Skills, Tools, etc.)
            - Use industry-standard terminology
            - Remove outdated or irrelevant skills
            - Ensure proper formatting for ATS parsing
            
            Return JSON with:
            {
              "suggestions": [
                {
                  "originalText": "current skills section",
                  "rewrittenText": "optimized skills section",
                  "reason": "why this is better",
                  "atsScore": {"before": 0-100, "after": 0-100, "improvement": 0-100},
                  "keywordsAdded": ["keyword1", "keyword2"],
                  "actionVerbsAdded": ["verb1", "verb2"],
                  "metricsAdded": ["metric1", "metric2"]
                }
              ]
            }`,
          },
          {
            role: 'user',
            content: `Job: ${jobData.title}
            Required Skills: ${jobData.skills.filter(s => s.required).map(s => s.name).join(', ')}
            Missing Critical Skills: ${missingSkills.map(s => s.skill).join(', ')}
            
            Current Skills: ${currentSkills.join(', ')}
            Current Categories: ${resumeData.skills.map(s => s.category).join(', ')}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions": []}');

      return result.suggestions.map((s: any) => ({
        ...s,
        section: 'skills' as const,
      }));
    } catch (error) {
      console.error('Skills rewrite failed:', error);
      return [];
    }
  }

  private async rewriteEducation(resumeData: ParsedResume, jobData: ParsedJob): Promise<RewriteSuggestion[]> {
    if (resumeData.education.length === 0) return [];

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `Optimize the education section for ATS and job relevance.
            
            - Highlight relevant coursework and projects
            - Add certifications or special training
            - Emphasize achievements (GPA, honors, etc.)
            - Format consistently for ATS parsing
            - Include graduation dates properly
            
            Return JSON with:
            {
              "suggestions": [
                {
                  "originalText": "current education entry",
                  "rewrittenText": "improved education entry",
                  "reason": "why this is better",
                  "atsScore": {"before": 0-100, "after": 0-100, "improvement": 0-100},
                  "keywordsAdded": ["keyword1", "keyword2"],
                  "actionVerbsAdded": ["verb1", "verb2"],
                  "metricsAdded": ["metric1", "metric2"]
                }
              ]
            }`,
          },
          {
            role: 'user',
            content: `Job: ${jobData.title}
            Education Requirements: ${jobData.requirements.filter(r => r.toLowerCase().includes('degree') || r.toLowerCase().includes('education')).join(', ')}
            
            Current Education: ${resumeData.education.map(edu => `${edu.degree} in ${edu.field} from ${edu.institution}`).join(', ')}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions": []}');

      return result.suggestions.map((s: any) => ({
        ...s,
        section: 'education' as const,
      }));
    } catch (error) {
      console.error('Education rewrite failed:', error);
      return [];
    }
  }

  private async rewriteProjects(resumeData: ParsedResume, jobData: ParsedJob): Promise<RewriteSuggestion[]> {
    if (resumeData.projects.length === 0) return [];

    const suggestions: RewriteSuggestion[] = [];

    for (const proj of resumeData.projects) {
      try {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `Rewrite this project description to be more impactful and ATS-friendly.
              
              - Add relevant keywords from job requirements
              - Quantify impact and results
              - Highlight technical skills used
              - Emphasize problem-solving and achievements
              - Use strong action verbs
              
              Return JSON with:
              {
                "suggestions": [
                  {
                    "originalText": "original project description",
                    "rewrittenText": "improved project description",
                    "reason": "why this is better",
                    "atsScore": {"before": 0-100, "after": 0-100, "improvement": 0-100},
                    "keywordsAdded": ["keyword1", "keyword2"],
                    "actionVerbsAdded": ["verb1", "verb2"],
                    "metricsAdded": ["metric1", "metric2"]
                  }
                ]
              }`,
            },
            {
              role: 'user',
              content: `Job: ${jobData.title}
              Required Technologies: ${jobData.skills.filter(s => s.required).map(s => s.name).join(', ')}
              
              Project: ${proj.name}
              Current Description: ${proj.description}
              Technologies Used: ${proj.technologies.join(', ')}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
          response_format: { type: 'json_object' },
        });

        const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions": []}');

        const projSuggestions = result.suggestions.map((s: any) => ({
          ...s,
          section: 'projects' as const,
        }));

        suggestions.push(...projSuggestions);
      } catch (error) {
        console.error(`Project rewrite failed for ${proj.name}:`, error);
      }
    }

    return suggestions;
  }

  private identifyPriorityRewrites(suggestions: RewriteSuggestion[]): RewriteSuggestion[] {
    return suggestions
      .filter(s => s.atsScore.improvement >= 20)
      .sort((a, b) => b.atsScore.improvement - a.atsScore.improvement)
      .slice(0, 3);
  }

  private identifyQuickWins(suggestions: RewriteSuggestion[]): RewriteSuggestion[] {
    return suggestions
      .filter(s => s.atsScore.improvement >= 10 && s.atsScore.improvement < 20)
      .sort((a, b) => b.atsScore.improvement - a.atsScore.improvement)
      .slice(0, 5);
  }

  private analyzeSections(suggestions: RewriteSuggestion[]): ResumeRewriteResult['sectionAnalysis'] {
    const sections = ['summary', 'experience', 'skills', 'education', 'projects'] as const;
    
    const analysis = {} as ResumeRewriteResult['sectionAnalysis'];
    
    sections.forEach(section => {
      const sectionSuggestions = suggestions.filter(s => s.section === section);
      const avgScore = sectionSuggestions.length > 0 
        ? sectionSuggestions.reduce((sum, s) => sum + s.atsScore.after, 0) / sectionSuggestions.length
        : 0;
        
      analysis[section] = {
        score: Math.round(avgScore),
        suggestions: sectionSuggestions.length,
      };
    });

    return analysis;
  }

  private calculateOverallImprovement(suggestions: RewriteSuggestion[]): ResumeRewriteResult['overallImprovement'] {
    if (suggestions.length === 0) {
      return {
        atsScore: 0,
        readabilityScore: 0,
        impactScore: 0,
      };
    }

    const avgATSScore = suggestions.reduce((sum, s) => sum + s.atsScore.improvement, 0) / suggestions.length;
    const avgReadability = suggestions.filter(s => s.actionVerbsAdded.length > 0).length / suggestions.length * 100;
    const avgImpact = suggestions.filter(s => s.metricsAdded.length > 0).length / suggestions.length * 100;

    return {
      atsScore: Math.round(avgATSScore),
      readabilityScore: Math.round(avgReadability),
      impactScore: Math.round(avgImpact),
    };
  }
}
