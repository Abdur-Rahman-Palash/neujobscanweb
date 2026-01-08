import OpenAI from 'openai';
import { AgentResult } from '../orchestrator';

export interface ParsedJob {
  title: string;
  company: string;
  location?: string;
  employmentType?: string;
  experienceLevel?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits?: string[];
  skills: Array<{
    name: string;
    required: boolean;
    level?: 'junior' | 'intermediate' | 'senior' | 'expert';
    category: 'technical' | 'soft' | 'language' | 'tool';
  }>;
  keywords: string[];
  industry?: string;
  department?: string;
}

export class JobParsingAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async parseJob(jobText: string): Promise<AgentResult> {
    try {
      const systemPrompt = `You are an expert job description parser with deep knowledge of recruitment practices and ATS systems.
      Your task is to extract structured information from job description text and format it as JSON.
      
      Extract the following information with high accuracy:
      1. Job Title (main position title)
      2. Company Name
      3. Location (city, state, or remote)
      4. Employment Type (full-time, part-time, contract, etc.)
      5. Experience Level (entry, mid, senior, lead, etc.)
      6. Salary Range (min, max, currency)
      7. Job Description (overall description)
      8. Requirements (must-have qualifications)
      9. Responsibilities (day-to-day duties)
      10. Benefits (if mentioned)
      11. Skills (name, required status, level, category)
      12. Keywords (important terms for ATS)
      13. Industry (if identifiable)
      14. Department (if identifiable)
      
      For skills, categorize as: technical, soft, language, or tool.
      For skill levels, use: junior, intermediate, senior, or expert.
      Mark skills as required or preferred based on context.
      
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
            content: `Parse this job description:\n\n${jobText}`,
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

      let parsedData: ParsedJob;
      
      try {
        parsedData = JSON.parse(parsedContent);
      } catch (parseError) {
        // Fallback parsing if JSON fails
        parsedData = this.fallbackParsing(jobText);
      }

      // Validate and clean the parsed data
      const cleanedData = this.validateAndCleanData(parsedData);

      return {
        success: true,
        data: {
          ...cleanedData,
          metadata: {
            parsedAt: new Date(),
            wordCount: jobText.split(/\s+/).length,
            parsingMethod: 'ai-enhanced',
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Job parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private fallbackParsing(jobText: string): ParsedJob {
    // Basic regex-based fallback parsing
    const lines = jobText.split('\n');
    
    // Look for common patterns
    const titleMatch = jobText.match(/(?:Job Title|Position|Role):\s*(.+)/i);
    const companyMatch = jobText.match(/(?:Company|At):\s*(.+)/i);
    const locationMatch = jobText.match(/(?:Location|Based in):\s*(.+)/i);
    
    return {
      title: titleMatch?.[1]?.trim() || lines[0]?.trim() || '',
      company: companyMatch?.[1]?.trim() || '',
      location: locationMatch?.[1]?.trim(),
      employmentType: '',
      experienceLevel: '',
      description: jobText.substring(0, 500) + '...',
      requirements: [],
      responsibilities: [],
      benefits: [],
      skills: [],
      keywords: [],
      industry: '',
      department: '',
    };
  }

  private validateAndCleanData(data: any): ParsedJob {
    // Ensure all required fields exist and have correct types
    return {
      title: data.title || '',
      company: data.company || '',
      location: data.location || '',
      employmentType: data.employmentType || '',
      experienceLevel: data.experienceLevel || '',
      salary: data.salary || {},
      description: data.description || '',
      requirements: Array.isArray(data.requirements) ? data.requirements.filter(Boolean) : [],
      responsibilities: Array.isArray(data.responsibilities) ? data.responsibilities.filter(Boolean) : [],
      benefits: Array.isArray(data.benefits) ? data.benefits.filter(Boolean) : [],
      skills: Array.isArray(data.skills) ? data.skills.map((skill: any) => ({
        name: skill.name || '',
        required: Boolean(skill.required),
        level: ['junior', 'intermediate', 'senior', 'expert'].includes(skill.level) ? skill.level : 'intermediate',
        category: ['technical', 'soft', 'language', 'tool'].includes(skill.category) ? skill.category : 'technical',
      })) : [],
      keywords: Array.isArray(data.keywords) ? data.keywords.filter(Boolean) : [],
      industry: data.industry || '',
      department: data.department || '',
    };
  }

  async extractKeywords(jobText: string): Promise<AgentResult> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Extract the most important keywords and requirements from this job description. Focus on technical skills, qualifications, and industry-specific terms. Return as a JSON array of strings.',
          },
          {
            role: 'user',
            content: `Extract keywords from: ${jobText}`,
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
        error: `Keyword extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async determineSkillLevel(skillText: string): Promise<AgentResult> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'Analyze this skill requirement and determine the experience level. Return JSON with: { level: "junior|intermediate|senior|expert", confidence: 0-100 }',
          },
          {
            role: 'user',
            content: `Determine skill level for: ${skillText}`,
          },
        ],
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"level": "intermediate", "confidence": 50}');

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: `Skill level determination failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
