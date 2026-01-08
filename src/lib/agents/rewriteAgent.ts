import { BaseLLMProvider, createLLMProvider } from '../llm/provider';
import { ParsedResume } from './resumeParser';
import { ParsedJob } from './jobParser';
import { SkillGapResult } from './gapAnalyzer';

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

export interface AgentResult {
  success: boolean;
  data?: ResumeRewriteResult;
  error?: string;
}

export class RewriteAgent {
  private llmProvider: BaseLLMProvider;

  constructor(llmProvider: 'openai' | 'huggingface' | 'local') {
    this.llmProvider = createLLMProvider(llmProvider, {
      apiKey: process.env.OPENAI_API_KEY,
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
    if (!resumeData.summary) {
      return [];
    }

    try {
      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert resume writer specializing in ATS optimization.
            
            Rewrite this professional summary to be more ATS-friendly and impactful for the target job.
            
            Focus on:
            - Adding relevant keywords from job requirements
            - Using strong action verbs
            - Quantifying achievements with metrics
            - Highlighting relevant experience
            - Maintaining professional tone
            - Keeping it concise (2-3 sentences)
            
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
            content: `Job: ${jobData.title} at ${jobData.company}
            Job Requirements: ${jobData.requirements.join(', ')}
            Required Skills: ${jobData.skills.filter(s => s.required).map(s => s.name).join(', ')}
            
            Current Summary: ${resumeData.summary}`,
          },
        ],
        temperature: 0.3,
        maxTokens: 1500,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions": []}');

      return result.suggestions.map((suggestion: any): RewriteSuggestion => ({
        ...suggestion,
        section: 'summary',
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
        const response = await this.llmProvider.generate({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `You are an expert resume writer specializing in ATS optimization.
              
              Rewrite this experience description to be more ATS-friendly and impactful for the target job.
              
              Focus on:
              - Adding relevant keywords from job requirements
              - Using strong action verbs (managed, developed, implemented, etc.)
              - Quantifying achievements with metrics and numbers
              - Highlighting relevant accomplishments
              - Using industry-standard terminology
              - Maintaining professional tone
              - Bullet point format
              
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
              Job Requirements: ${jobData.requirements.join(', ')}
              Required Skills: ${jobData.skills.filter(s => s.required).map(s => s.name).join(', ')}
              
              Current Experience: ${exp.position} at ${exp.company}
              Description: ${exp.description}`,
            },
          ],
          temperature: 0.3,
          maxTokens: 1500,
          responseFormat: { type: 'json_object' },
        });

        const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions": []}');

        const expSuggestions = result.suggestions.map((suggestion: any): RewriteSuggestion => ({
          ...suggestion,
          section: 'experience',
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
      const missingSkills = skillGapResult.missingSkills
        .filter(s => s.importance === 'critical')
        .map(s => s.skill);

      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert resume writer specializing in ATS optimization.
            
            Rewrite this skills section to be more ATS-friendly and impactful for the target job.
            
            Focus on:
            - Adding missing critical skills naturally
            - Using industry-standard terminology
            - Grouping skills by category (technical, soft skills, tools, languages)
            - Including proficiency levels where appropriate
            - Highlighting most relevant skills for the job
            - Removing outdated or irrelevant skills
            
            Return JSON with:
            {
              "suggestions": [
                {
                  "originalText": "current skills section",
                  "rewrittenText": "improved skills section",
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
            Job Requirements: ${jobData.requirements.join(', ')}
            Required Skills: ${jobData.skills.filter(s => s.required).map(s => s.name).join(', ')}
            Missing Critical Skills: ${missingSkills.join(', ')}
            
            Current Skills: ${resumeData.skills.map(s => s.name).join(', ')}`,
          },
        ],
        temperature: 0.3,
        maxTokens: 1500,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions": []}');

      return result.suggestions.map((suggestion: any): RewriteSuggestion => ({
        ...suggestion,
        section: 'skills',
      }));
    } catch (error) {
      console.error('Skills rewrite failed:', error);
      return [];
    }
  }

  private async rewriteEducation(resumeData: ParsedResume, jobData: ParsedJob): Promise<RewriteSuggestion[]> {
    const suggestions: RewriteSuggestion[] = [];

    for (const edu of resumeData.education) {
      try {
        const response = await this.llmProvider.generate({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `You are an expert resume writer specializing in ATS optimization.
              
              Rewrite this education entry to be more ATS-friendly and impactful for the target job.
              
              Focus on:
              - Adding relevant keywords from job requirements
              - Highlighting relevant coursework or projects
              - Including academic achievements and honors
              - Using industry-standard terminology
              - Emphasizing relevant degree and field of study
              - Including GPA if it's impressive (3.5+)
              
              Return JSON with:
              {
                "suggestions": [
                  {
                    "originalText": "original education entry",
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
              content: `Job: ${jobData.title} at ${jobData.company}
              Job Requirements: ${jobData.requirements.join(', ')}
            
              Current Education: ${edu.degree} in ${edu.field} from ${edu.institution}`,
            },
          ],
          temperature: 0.3,
          maxTokens: 1500,
          responseFormat: { type: 'json_object' },
        });

        const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions": []}');

        const eduSuggestions = result.suggestions.map((suggestion: any): RewriteSuggestion => ({
          ...suggestion,
          section: 'education',
        }));

        suggestions.push(...eduSuggestions);
      } catch (error) {
        console.error(`Education rewrite failed for ${edu.degree}:`, error);
      }
    }

    return suggestions;
  }

  private async rewriteProjects(resumeData: ParsedResume, jobData: ParsedJob): Promise<RewriteSuggestion[]> {
    const suggestions: RewriteSuggestion[] = [];

    for (const proj of resumeData.projects) {
      try {
        const response = await this.llmProvider.generate({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `You are an expert resume writer specializing in ATS optimization.
              
              Rewrite this project description to be more ATS-friendly and impactful for the target job.
              
              Focus on:
              - Adding relevant keywords from job requirements
              - Using strong action verbs (developed, implemented, created, etc.)
              - Quantifying impact and results with metrics
              - Highlighting relevant technologies and tools
              - Emphasizing problem-solving and innovation
              - Connecting project to job requirements
              - Using industry-standard terminology
              
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
              content: `Job: ${jobData.title} at ${jobData.company}
              Job Requirements: ${jobData.requirements.join(', ')}
              Required Technologies: ${jobData.skills.filter(s => s.required).map(s => s.name).join(', ')}
            
              Current Project: ${proj.name}: ${proj.description}
              Technologies: ${proj.technologies.join(', ')}`,
            },
          ],
          temperature: 0.3,
          maxTokens: 1500,
          responseFormat: { type: 'json_object' },
        });

        const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions": []}');

        const projSuggestions = result.suggestions.map((suggestion: any): RewriteSuggestion => ({
          ...suggestion,
          section: 'projects',
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
    
    return sections.reduce((analysis, section) => {
      const sectionSuggestions = suggestions.filter(s => s.section === section);
      const avgScore = sectionSuggestions.length > 0 
        ? sectionSuggestions.reduce((sum, s) => sum + s.atsScore.after, 0) / sectionSuggestions.length
        : 0;

      return {
        ...analysis,
        [section]: {
          score: Math.round(avgScore),
          suggestions: sectionSuggestions.length,
        },
      };
    }, {} as ResumeRewriteResult['sectionAnalysis']);
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
