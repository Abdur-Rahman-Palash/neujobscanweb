import OpenAI from 'openai';
import { AgentResult } from '../orchestrator';
import { ParsedResume } from './resume-parsing-agent';
import { ParsedJob } from './job-parsing-agent';
import { KeywordMatchResult } from './ats-keyword-matching-agent';

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

export class ScoringAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async calculateATSScore(
    resumeData: ParsedResume,
    jobData: ParsedJob,
    keywordMatches: KeywordMatchResult
  ): Promise<AgentResult> {
    try {
      // Calculate individual scores
      const keywordMatch = this.calculateKeywordScore(keywordMatches);
      const skillAlignment = this.calculateSkillAlignment(resumeData, jobData);
      const experienceRelevance = this.calculateExperienceRelevance(resumeData, jobData);
      const educationMatch = this.calculateEducationMatch(resumeData, jobData);
      const atsCompliance = this.calculateATSCompliance(resumeData);

      // Calculate weighted scores
      const breakdown = {
        keywordMatch,
        skillAlignment,
        experienceRelevance,
        educationMatch,
        atsCompliance,
      };

      const overallScore = this.calculateWeightedScore(breakdown);
      
      // Generate AI-powered insights
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
        formatScore: this.calculateFormatScore(resumeData),
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

  private calculateKeywordScore(keywordMatches: KeywordMatchResult): number {
    return keywordMatches.matchScore;
  }

  private calculateSkillAlignment(resumeData: ParsedResume, jobData: ParsedJob): number {
    const resumeSkills = resumeData.skills.map(s => s.name.toLowerCase());
    const requiredSkills = jobData.skills
      .filter(s => s.required)
      .map(s => s.name.toLowerCase());

    if (requiredSkills.length === 0) return 100;

    const matches = requiredSkills.filter(skill =>
      resumeSkills.some(resumeSkill => resumeSkill.includes(skill) || skill.includes(resumeSkill))
    );

    return Math.round((matches.length / requiredSkills.length) * 100);
  }

  private calculateExperienceRelevance(resumeData: ParsedResume, jobData: ParsedJob): number {
    const jobLevel = jobData.experienceLevel?.toLowerCase() || '';
    const totalExperience = this.calculateTotalExperience(resumeData);

    let score = 50; // Base score

    // Adjust based on experience level
    if (jobLevel.includes('entry') || jobLevel.includes('junior')) {
      score = totalExperience >= 0 ? 80 : 40;
    } else if (jobLevel.includes('mid') || jobLevel.includes('intermediate')) {
      score = totalExperience >= 2 && totalExperience <= 6 ? 90 : 
               totalExperience >= 1 ? 70 : 30;
    } else if (jobLevel.includes('senior') || jobLevel.includes('lead')) {
      score = totalExperience >= 5 ? 90 : 
               totalExperience >= 3 ? 70 : 30;
    } else if (jobLevel.includes('principal') || jobLevel.includes('staff')) {
      score = totalExperience >= 8 ? 90 : 
               totalExperience >= 5 ? 70 : 30;
    }

    // Check for relevant experience
    const relevantExp = resumeData.experience.filter(exp => 
      this.isRelevantExperience(exp, jobData)
    );

    if (relevantExp.length > 0) {
      score = Math.min(100, score + 10);
    }

    return Math.round(score);
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

    return Math.round(totalMonths / 12 * 10) / 10; // Return in years with 1 decimal
  }

  private isRelevantExperience(exp: any, jobData: ParsedJob): boolean {
    const jobTitle = jobData.title.toLowerCase();
    const jobKeywords = jobData.keywords.map(k => k.toLowerCase());
    
    const expText = `${exp.position} ${exp.description}`.toLowerCase();
    
    // Check for relevant keywords
    const relevantKeywords = jobKeywords.filter(keyword => 
      expText.includes(keyword) || keyword.includes(exp.position.toLowerCase())
    );

    return relevantKeywords.length > 0;
  }

  private calculateEducationMatch(resumeData: ParsedResume, jobData: ParsedJob): number {
    const jobRequirements = jobData.requirements.join(' ').toLowerCase();
    let score = 50;

    // Check for degree requirements
    if (jobRequirements.includes('bachelor') || jobRequirements.includes('degree')) {
      const hasBachelor = resumeData.education.some(edu => 
        edu.degree.toLowerCase().includes('bachelor') || 
        edu.degree.toLowerCase().includes('bs')
      );
      if (hasBachelor) score += 30;
    }

    if (jobRequirements.includes('master') || jobRequirements.includes('ms')) {
      const hasMaster = resumeData.education.some(edu => 
        edu.degree.toLowerCase().includes('master') || 
        edu.degree.toLowerCase().includes('ms')
      );
      if (hasMaster) score += 20;
    }

    if (jobRequirements.includes('phd') || jobRequirements.includes('doctorate')) {
      const hasPhD = resumeData.education.some(edu => 
        edu.degree.toLowerCase().includes('phd') || 
        edu.degree.toLowerCase().includes('doctor')
      );
      if (hasPhD) score += 25;
    }

    // Check for relevant field of study
    const relevantField = resumeData.education.some(edu => 
      this.isRelevantField(edu.field, jobData)
    );
    if (relevantField) score += 20;

    return Math.min(100, score);
  }

  private isRelevantField(field: string, jobData: ParsedJob): boolean {
    const jobTitle = jobData.title.toLowerCase();
    const fieldLower = field.toLowerCase();
    
    const techFields = ['computer science', 'software engineering', 'information technology', 'computer engineering'];
    const businessFields = ['business administration', 'management', 'finance', 'marketing'];
    const designFields = ['design', 'graphic design', 'ui', 'ux'];
    
    if (jobTitle.includes('developer') || jobTitle.includes('engineer') || jobTitle.includes('programmer')) {
      return techFields.some(tf => fieldLower.includes(tf));
    }
    
    if (jobTitle.includes('manager') || jobTitle.includes('business') || jobTitle.includes('analyst')) {
      return businessFields.some(bf => fieldLower.includes(bf));
    }
    
    if (jobTitle.includes('designer') || jobTitle.includes('ui') || jobTitle.includes('ux')) {
      return designFields.some(df => fieldLower.includes(df));
    }
    
    return false;
  }

  private calculateATSCompliance(resumeData: ParsedResume): number {
    let score = 100;

    // Check for ATS-friendly format
    if (!resumeData.personalInfo.email) score -= 20;
    if (!resumeData.personalInfo.phone) score -= 10;
    if (resumeData.skills.length === 0) score -= 25;
    if (resumeData.experience.length === 0) score -= 30;
    if (resumeData.education.length === 0) score -= 15;

    // Check for proper section organization
    if (resumeData.skills.length < 5) score -= 10;
    if (resumeData.experience.some(exp => !exp.description)) score -= 15;

    return Math.max(0, score);
  }

  private calculateFormatScore(resumeData: ParsedResume): number {
    let score = 100;

    // Check for proper formatting elements
    if (!resumeData.summary) score -= 10;
    if (resumeData.experience.length < 2) score -= 15;
    if (resumeData.skills.length < 10) score -= 20;
    if (resumeData.certifications.length === 0) score -= 5;

    // Check for achievement-oriented descriptions
    const hasAchievements = resumeData.experience.some(exp => 
      exp.achievements && exp.achievements.length > 0
    );
    if (!hasAchievements) score -= 15;

    return Math.max(0, score);
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

  private async generateScoreInsights(
    resumeData: ParsedResume,
    jobData: ParsedJob,
    breakdown: ATSScoreResult['breakdown'],
    overallScore: number
  ): Promise<{ recommendations: string[]; strengths: string[]; weaknesses: string[] }> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert ATS analyst. Based on the resume-job match scores, provide insights.
            
            Return JSON with:
            {
              "strengths": ["strength 1", "strength 2"],
              "weaknesses": ["weakness 1", "weakness 2"], 
              "recommendations": ["recommendation 1", "recommendation 2"]
            }
            
            Be specific and actionable.`,
          },
          {
            role: 'user',
            content: `Resume-Job Analysis:
            Overall Score: ${overallScore}/100
            Keyword Match: ${breakdown.keywordMatch}/100
            Skill Alignment: ${breakdown.skillAlignment}/100
            Experience Relevance: ${breakdown.experienceRelevance}/100
            Education Match: ${breakdown.educationMatch}/100
            ATS Compliance: ${breakdown.atsCompliance}/100
            
            Job Title: ${jobData.title}
            Required Skills: ${jobData.skills.filter(s => s.required).map(s => s.name).join(', ')}
            
            Resume Skills: ${resumeData.skills.map(s => s.name).join(', ')}
            Experience: ${resumeData.experience.length} positions
            Education: ${resumeData.education.map(e => `${e.degree} in ${e.field}`).join(', ')}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const insights = JSON.parse(response.choices[0]?.message?.content || '{}');

      return {
        strengths: insights.strengths || [],
        weaknesses: insights.weaknesses || [],
        recommendations: insights.recommendations || [],
      };
    } catch (error) {
      // Fallback insights
      return {
        strengths: overallScore >= 70 ? ['Good overall match'] : [],
        weaknesses: overallScore < 50 ? ['Needs improvement'] : [],
        recommendations: ['Add more relevant keywords', 'Quantify achievements'],
      };
    }
  }
}
