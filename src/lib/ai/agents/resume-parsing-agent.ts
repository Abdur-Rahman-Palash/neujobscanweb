import OpenAI from 'openai';
import { AgentResult } from '../orchestrator';

export interface ParsedResume {
  personalInfo: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    gpa?: string;
  }>;
  skills: Array<{
    name: string;
    category: 'technical' | 'soft' | 'language' | 'tool';
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience?: number;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  languages: Array<{
    name: string;
    proficiency: 'basic' | 'conversational' | 'professional' | 'native';
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    github?: string;
    startDate: string;
    endDate?: string;
  }>;
}

export interface ParseError {
  code: string;
  message: string;
  details?: string;
}

export class ResumeParsingAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async parseResume(resumeText: string, fileName: string): Promise<AgentResult> {
    try {
      const systemPrompt = `You are an expert resume parser with deep knowledge of ATS systems and recruitment practices. 
      Your task is to extract structured information from resume text and format it as JSON.
      
      Extract the following information with high accuracy:
      1. Personal Information (name, email, phone, location, linkedin, github)
      2. Professional Summary (if present)
      3. Work Experience (company, position, dates, description, achievements)
      4. Education (institution, degree, field, dates, GPA)
      5. Skills (name, category, level, years of experience)
      6. Certifications (name, issuer, date, credential ID)
      7. Languages (name, proficiency level)
      8. Projects (name, description, technologies, URLs, dates)
      
      For skills, categorize as: technical, soft, language, or tool.
      For skill levels, use: beginner, intermediate, advanced, or expert.
      
      Return ONLY valid JSON. No explanations or additional text.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Parse this resume text:\n\n${resumeText}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      });

      const parsedContent = response.choices[0]?.message?.content;

      if (!parsedContent) {
        throw new Error('No response from AI parsing');
      }

      let parsedData: ParsedResume;

      try {
        parsedData = JSON.parse(parsedContent);
      } catch (parseError) {
        // Fallback parsing if JSON fails
        parsedData = this.fallbackParsing(resumeText);
      }

      // Validate and clean the parsed data
      const cleanedData = this.validateAndCleanData(parsedData);

      return {
        success: true,
        data: cleanedData,
        metadata: {
          fileName,
          parsedAt: new Date(),
          wordCount: resumeText.split(/\s+/).length,
          parsingMethod: 'ai-enhanced',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `PARSING_ERROR: Resume parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}${error instanceof Error && error.stack ? ` - ${error.stack}` : ''}`,
        metadata: {
          fileName,
          parsedAt: new Date(),
          wordCount: resumeText.split(/\s+/).length,
          parsingMethod: 'regex-basic',
        },
      };
    }
  }

  private fallbackParsing(resumeText: string): ParsedResume {
    // Basic regex-based fallback parsing
    const lines = resumeText.split('\n');

    const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = resumeText.match(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/);

    return {
      personalInfo: {
        name: lines[0]?.trim() || '',
        email: emailMatch?.[0] || '',
        phone: phoneMatch?.[0] || '',
        location: '',
        linkedin: '',
        github: '',
      },
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      languages: [],
      projects: [],
    };
  }

  private validateAndCleanData(data: any): ParsedResume {
    // Ensure all required fields exist and have correct types
    return {
      personalInfo: {
        name: data.personalInfo?.name || '',
        email: data.personalInfo?.email || '',
        phone: data.personalInfo?.phone || '',
        location: data.personalInfo?.location || '',
        linkedin: data.personalInfo?.linkedin || '',
        github: data.personalInfo?.github || '',
      },
      summary: data.summary || '',
      experience: Array.isArray(data.experience) ? data.experience.map((exp: any) => ({
        company: exp.company || '',
        position: exp.position || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate,
        current: exp.current || false,
        description: exp.description || '',
        achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
      })) : [],
      education: Array.isArray(data.education) ? data.education.map((edu: any) => ({
        institution: edu.institution || '',
        degree: edu.degree || '',
        field: edu.field || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate,
        current: edu.current || false,
        gpa: edu.gpa,
      })) : [],
      skills: Array.isArray(data.skills) ? data.skills.map((skill: any) => ({
        name: skill.name || '',
        category: ['technical', 'soft', 'language', 'tool'].includes(skill.category) ? skill.category : 'technical',
        level: ['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level) ? skill.level : 'intermediate',
        yearsOfExperience: skill.yearsOfExperience,
      })) : [],
      certifications: Array.isArray(data.certifications) ? data.certifications.map((cert: any) => ({
        name: cert.name || '',
        issuer: cert.issuer || '',
        date: cert.date || '',
        expiryDate: cert.expiryDate,
        credentialId: cert.credentialId,
      })) : [],
      languages: Array.isArray(data.languages) ? data.languages.map((lang: any) => ({
        name: lang.name || '',
        proficiency: ['basic', 'conversational', 'professional', 'native'].includes(lang.proficiency) ? lang.proficiency : 'conversational',
      })) : [],
      projects: Array.isArray(data.projects) ? data.projects.map((proj: any) => ({
        name: proj.name || '',
        description: proj.description || '',
        technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
        url: proj.url,
        github: proj.github,
        startDate: proj.startDate || '',
        endDate: proj.endDate,
      })) : [],
    };
  }

  async extractKeywords(resumeText: string): Promise<AgentResult> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Extract the most important keywords and skills from this resume. Focus on technical skills, soft skills, and industry-specific terms. Return as a JSON array of strings.',
          },
          {
            role: 'user',
            content: `Extract keywords from: ${resumeText}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
      });

      const keywords = JSON.parse(response.choices[0]?.message?.content || '{"keywords": []}');

      return {
        success: true,
        data: keywords.keywords || [],
      };
    } catch (error) {
      return {
        success: false,
        error: `KEYWORD_EXTRACTION_ERROR: Keyword extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}${error instanceof Error && error.stack ? ` - ${error.stack}` : ''}`,
      };
    }
  }
}
