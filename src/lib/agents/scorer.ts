import { BaseLLMProvider, createLLMProvider } from '../llm/provider';
import { ParsedResume } from './resumeParser';
import { ParsedJob } from './jobParser';
import { KeywordMatchResult } from './atsMatcher';

export interface ATSScoreResult {
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
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface AgentResult {
  success: boolean;
  data?: ATSScoreResult;
  error?: string;
}

export class ScorerAgent {
  private llmProvider: BaseLLMProvider;

  constructor(llmProvider: 'openai' | 'huggingface' | 'local') {
    this.llmProvider = createLLMProvider(llmProvider, {
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async calculateATSScore(
    resumeData: ParsedResume,
    jobData: ParsedJob,
    keywordMatches: KeywordMatchResult
  ): Promise<AgentResult> {
    try {
      // Calculate individual scores
      const keywordMatch = this.calculateKeywordScore(resumeData, jobData);
      const skillAlignment = this.calculateSkillAlignment(resumeData, jobData);
      const experienceRelevance = this.calculateExperienceRelevance(resumeData, jobData);
      const educationMatch = this.calculateEducationMatch(resumeData, jobData);
      const atsCompliance = this.calculateATSCompliance(resumeData);
      const formatScore = this.calculateFormatScore(resumeData);

      // Calculate weighted scores
      const breakdown = {
        keywordMatch,
        skillAlignment,
        experienceRelevance,
        educationMatch,
        atsCompliance,
      };

      const overallScore = this.calculateWeightedScore(breakdown);

      // Generate insights
      const insights = await this.generateScoreInsights(
        resumeData,
        jobData,
        breakdown,
        overallScore
      );

      const result: ATSScoreResult = {
        overallScore,
        atsScore: atsCompliance,
        keywordScore: keywordMatch,
        experienceScore: experienceRelevance,
        educationScore: educationMatch,
        skillScore: skillAlignment,
        formatScore,
        breakdown,
        recommendations: insights.recommendations,
        strengths: insights.strengths,
        weaknesses: insights.weaknesses,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: `ATS scoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private calculateKeywordScore(resumeData: ParsedResume, jobData: ParsedJob): number {
    const resumeSkills = resumeData.skills.map(s => s.name.toLowerCase());
    const requiredSkills = jobData.skills
      .filter((skill): boolean => skill.required)
      .map((skill): string => skill.name.toLowerCase());

    if (requiredSkills.length === 0) return 100;

    const matches = requiredSkills.filter((skill): boolean => 
      resumeSkills.includes(skill)
    );

    return Math.round((matches.length / requiredSkills.length) * 100);
  }

  private calculateSkillAlignment(resumeData: ParsedResume, jobData: ParsedJob): number {
    const resumeSkills = resumeData.skills.map((skill): string => skill.name.toLowerCase());
    const jobSkills = jobData.skills.map((skill): string => skill.name.toLowerCase());

    if (jobSkills.length === 0) return 100;

    const matches = jobSkills.filter((skill): boolean => 
      resumeSkills.includes(skill)
    );

    return Math.round((matches.length / jobSkills.length) * 100);
  }

  private calculateExperienceRelevance(resumeData: ParsedResume, jobData: ParsedJob): number {
    const jobLevel = jobData.experienceLevel?.toLowerCase() || '';
    const totalExperience = this.calculateTotalExperience(resumeData);

    let score = 50; // Base score

    // Adjust based on experience level
    if (jobLevel.includes('entry') || jobLevel.includes('junior')) {
      score = totalExperience >= 0 && totalExperience <= 2 ? 80 : 
               totalExperience >= 1 && totalExperience <= 6 ? 70 : 40;
    } else if (jobLevel.includes('mid') || jobLevel.includes('intermediate')) {
      score = totalExperience >= 2 && totalExperience <= 6 ? 90 : 
               totalExperience >= 1 && totalExperience <= 10 ? 80 : 
               totalExperience >= 0 ? 60 : 40;
    } else if (jobLevel.includes('senior') || jobLevel.includes('lead')) {
      score = totalExperience >= 5 && totalExperience <= 15 ? 90 : 
               totalExperience >= 3 && totalExperience <= 20 ? 80 : 
               totalExperience >= 1 && totalExperience <= 25 ? 70 : 40;
    } else if (jobLevel.includes('principal') || jobLevel.includes('staff')) {
      score = totalExperience >= 8 && totalExperience <= 25 ? 90 : 
               totalExperience >= 5 && totalExperience <= 30 ? 80 : 
               totalExperience >= 1 && totalExperience <= 35 ? 70 : 40;
    }

    // Check for relevant experience
    const relevantExp = resumeData.experience.filter((exp): boolean => 
      this.isRelevantExperience(exp, jobData)
    );

    if (relevantExp.length > 0) {
      score = Math.min(100, score + 10);
    }

    return score;
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

  private isRelevantExperience(exp: ParsedResume['experience'][0], jobData: ParsedJob): boolean {
    const jobTitle = jobData.title.toLowerCase();
    const jobKeywords = jobData.keywords || [];
    const expText = `${exp.position} ${exp.description}`.toLowerCase();
    const jobRequirements = jobData.requirements.join(' ').toLowerCase();

    // Check for title match
    if (jobTitle.includes(exp.position.toLowerCase())) {
      return true;
    }

    // Check for keyword matches
    const expKeywords = this.extractTextKeywords(exp.description);
    const matchingKeywords = expKeywords.filter((keyword): boolean => 
      jobKeywords.includes(keyword)
    );

    return matchingKeywords.length > 0;
  }

  private calculateEducationMatch(resumeData: ParsedResume, jobData: ParsedJob): number {
    const jobRequirements = jobData.requirements.join(' ').toLowerCase();
    let score = 50; // Base score

    // Check for degree requirements
    if (jobRequirements.includes('bachelor') || jobRequirements.includes('degree')) {
      const hasBachelor = resumeData.education.some((edu): boolean => 
        edu.degree.toLowerCase().includes('bachelor') || 
        edu.degree.toLowerCase().includes('bs')
      );
      if (hasBachelor) score += 30;
    }

    if (jobRequirements.includes('master') || jobRequirements.includes('ms')) {
      const hasMaster = resumeData.education.some((edu): boolean => 
        edu.degree.toLowerCase().includes('master') || 
        edu.degree.toLowerCase().includes('ms')
      );
      if (hasMaster) score += 20;
    }

    if (jobRequirements.includes('phd') || jobRequirements.includes('doctorate')) {
      const hasPhD = resumeData.education.some((edu): boolean => 
        edu.degree.toLowerCase().includes('phd') || 
        edu.degree.toLowerCase().includes('doctorate')
      );
      if (hasPhD) score += 25;
    }

    // Check for relevant field of study
    const relevantFields = ['computer science', 'software engineering', 'information technology', 'data science'];
    const hasRelevantField = resumeData.education.some((edu): boolean => 
      relevantFields.some((field): boolean => 
        edu.field.toLowerCase().includes(field)
      )
    );

    if (hasRelevantField) {
      score = Math.min(100, score + 15);
    }

    return score;
  }

  private calculateATSCompliance(resumeData: ParsedResume): number {
    let score = 100; // Start with perfect score

    // Check for essential sections
    if (!resumeData.personalInfo.email) score -= 20;
    if (!resumeData.personalInfo.phone) score -= 10;
    if (resumeData.skills.length === 0) score -= 25;
    if (resumeData.experience.length === 0) score -= 30;
    if (resumeData.education.length === 0) score -= 15;

    // Check for proper formatting
    if (resumeData.skills.length < 5) score -= 10;
    if (resumeData.experience.some(exp => !exp.description)) score -= 15;
    if (resumeData.experience.some(exp => exp.achievements.length === 0)) score -= 10;

    return Math.max(0, score);
  }

  private calculateFormatScore(resumeData: ParsedResume): number {
    let score = 100; // Start with perfect score

    // Check for professional structure
    if (resumeData.summary) score += 10;
    if (resumeData.projects.length > 0) score += 10;
    if (resumeData.certifications.length > 0) score += 5;

    // Check for achievement-oriented descriptions
    const hasAchievements = resumeData.experience.some((exp): boolean => 
      exp.achievements && exp.achievements.length > 0
    );
    if (hasAchievements) score += 10;

    return Math.min(100, score);
  }

  private calculateWeightedScore(breakdown: ATSScoreResult['breakdown']): number {
    const weights = {
      keywordMatch: 0.30,
      skillAlignment: 0.25,
      experienceRelevance: 0.20,
      educationMatch: 0.15,
      atsCompliance: 0.10,
    };

    const weightedScore = 
      breakdown.keywordMatch * weights.keywordMatch +
      breakdown.skillAlignment * weights.skillAlignment +
      breakdown.experienceRelevance * weights.experienceRelevance +
      breakdown.educationMatch * weights.educationMatch +
      breakdown.atsCompliance * weights.atsCompliance;

    return Math.round(weightedScore);
  }

  private extractTextKeywords(text: string): string[] {
    // Extract technical terms, skills, and qualifications
    const technicalTerms = [
      'javascript', 'typescript', 'react', 'node', 'python', 'java', 'aws', 'docker',
      'kubernetes', 'mongodb', 'postgresql', 'mysql', 'git', 'ci/cd', 'agile',
      'scrum', 'rest', 'graphql', 'api', 'microservices', 'devops', 'linux',
      'html', 'css', 'sass', 'webpack', 'babel', 'jest', 'testing'
    ];

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word): boolean => word.length > 2);

    return words.filter((word): boolean => 
      (technicalTerms.includes(word) || 
      word.length > 4) // Keep longer business terms
    );
  }

  private async generateScoreInsights(
    resumeData: ParsedResume,
    jobData: ParsedJob,
    breakdown: ATSScoreResult['breakdown'],
    overallScore: number
  ): Promise<{ recommendations: string[]; strengths: string[]; weaknesses: string[] }> {
    try {
      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert ATS analyst. Based on resume-job match analysis, provide actionable insights.
            
            Provide:
            - 3 specific recommendations for improvement
            - 3 key strengths to highlight
            - 2 main weaknesses to address
            
            Return JSON with:
            {
              "recommendations": ["rec 1", "rec 2", "rec 3"],
              "strengths": ["strength 1", "strength 2", "strength 3"],
              "weaknesses": ["weakness 1", "weakness 2"]
            }`,
          },
          {
            role: 'user',
            content: `Overall Score: ${overallScore}/100
            
            Job: ${jobData.title} at ${jobData.company}
            Scores: Keywords ${breakdown.keywordMatch}/100, Skills ${breakdown.skillAlignment}/100, Experience ${breakdown.experienceRelevance}/100, Education ${breakdown.educationMatch}/100, ATS ${breakdown.atsCompliance}/100
            
            Resume has ${resumeData.skills.length} skills, ${resumeData.experience.length} experience entries, ${resumeData.education.length} education entries
            
            Job requires: ${jobData.requirements.length} requirements`,
          },
        ],
        temperature: 0.3,
        maxTokens: 1000,
        responseFormat: { type: 'json_object' },
      });

      const insights = JSON.parse(response.choices[0]?.message?.content || '{"recommendations": [], "strengths": [], "weaknesses": []}');

      return insights;
    } catch (error) {
      return {
        recommendations: ['Add more relevant keywords', 'Quantify achievements', 'Improve formatting'],
        strengths: ['Strong technical foundation', 'Relevant experience'],
        weaknesses: ['Missing key requirements', 'Limited keyword optimization'],
      };
    }
  }
}
