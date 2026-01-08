import { BaseLLMProvider, createLLMProvider } from '../llm/provider';
import { ParsedResume } from './resumeParser';
import { ParsedJob } from './jobParser';

export interface KeywordMatchResult {
  exactMatches: Array<{
    keyword: string;
    found: boolean;
    confidence: number;
  }>;
  semanticMatches: Array<{
    resumeTerm: string;
    jobTerm: string;
    similarity: number;
    category: string;
  }>;
  missingKeywords: string[];
  additionalKeywords: string[];
  matchScore: number;
  categoryScores: {
    technical: number;
    soft: number;
    language: number;
    tool: number;
  };
  suggestions?: Array<{
    keyword: string;
    suggestion: string;
    section: string;
    example: string;
  }>;
  message?: string;
}

export interface AgentResult {
  success: boolean;
  data?: KeywordMatchResult;
  error?: string;
}

export class ATSMatcherAgent {
  private llmProvider: BaseLLMProvider;

  constructor(llmProvider: 'openai' | 'huggingface' | 'local') {
    this.llmProvider = createLLMProvider(llmProvider, {
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async matchKeywords(resumeData: ParsedResume, jobData: ParsedJob): Promise<AgentResult> {
    try {
      // Extract keywords from both resume and job
      const resumeKeywords = this.extractResumeKeywords(resumeData);
      const jobKeywords = jobData.keywords || [];

      // Perform exact matching
      const exactMatches = this.performExactMatching(resumeKeywords, jobKeywords);

      // Perform semantic matching using AI
      const semanticMatches = await this.performSemanticMatching(resumeData, jobData);

      // Calculate category scores
      const resumeCategories = this.groupSkillsByCategory(resumeData.skills);
      const jobCategories = this.groupJobSkillsByCategory(jobData.skills);
      const categoryScores = this.calculateCategoryScores(resumeCategories, jobCategories);

      // Calculate overall match score
      const matchScore = this.calculateOverallMatchScore(exactMatches, semanticMatches, categoryScores);

      // Identify missing keywords
      const missingKeywords = jobKeywords.filter(keyword => 
        !resumeKeywords.some(resumeKeyword => 
          this.normalizeKeyword(resumeKeyword) === this.normalizeKeyword(keyword)
        )
      );

      // Find additional keywords in resume that might be relevant
      const additionalKeywords = resumeKeywords.filter(keyword => 
        !jobKeywords.includes(keyword)
      );

      const result: KeywordMatchResult = {
        exactMatches,
        semanticMatches,
        missingKeywords,
        additionalKeywords,
        matchScore,
        categoryScores,
      };

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: `Keyword matching failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private extractResumeKeywords(resumeData: ParsedResume): string[] {
    const keywords: string[] = [];

    // Extract from skills
    resumeData.skills.forEach(skill => {
      keywords.push(skill.name);
    });

    // Extract from experience descriptions
    resumeData.experience.forEach(exp => {
      const expKeywords = this.extractTextKeywords(exp.description);
      keywords.push(...expKeywords);
    });

    // Extract from projects
    resumeData.projects.forEach(proj => {
      const projKeywords = this.extractTextKeywords(proj.description);
      keywords.push(...projKeywords);
      keywords.push(...proj.technologies);
    });

    // Extract from summary
    if (resumeData.summary) {
      const summaryKeywords = this.extractTextKeywords(resumeData.summary);
      keywords.push(...summaryKeywords);
    }

    // Remove duplicates and normalize
    return [...new Set(keywords.map(k => this.normalizeKeyword(k)))];
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
      .filter(word => word.length > 2);

    return words.filter(word => 
      technicalTerms.includes(word) || 
      word.length > 4 // Keep longer business terms
    );
  }

  private performExactMatching(resumeKeywords: string[], jobKeywords: string[]): KeywordMatchResult['exactMatches'] {
    return jobKeywords.map(keyword => ({
      keyword,
      found: resumeKeywords.some(resumeKeyword => 
        this.normalizeKeyword(resumeKeyword) === this.normalizeKeyword(keyword)
      ),
      confidence: 100,
    }));
  }

  private async performSemanticMatching(resumeData: ParsedResume, jobData: ParsedJob): Promise<KeywordMatchResult['semanticMatches']> {
    try {
      const resumeText = this.createResumeText(resumeData);
      const jobRequirements = jobData.requirements.join(' ');

      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert in semantic matching between resumes and job requirements.
            Compare resume text with job requirements and identify semantic matches.
            
            For each semantic match, provide:
            - resumeTerm: term from resume
            - jobTerm: term from job requirements
            - similarity: 0-100
            - category: technical|soft|language|tool
            
            Return JSON with:
            {
              "semanticMatches": [
                {
                  "resumeTerm": "term from resume",
                  "jobTerm": "term from job requirements", 
                  "similarity": 0-100,
                  "category": "technical|soft|language|tool"
                }
              ]
            }`,
          },
          {
            role: 'user',
            content: `Resume:\n${resumeText}\n\nJob Requirements:\n${jobRequirements}`,
          },
        ],
        temperature: 0.2,
        maxTokens: 2000,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"semanticMatches": []}');

      return result.semanticMatches || [];
    } catch (error) {
      console.error('Semantic matching failed:', error);
      return [];
    }
  }

  private createResumeText(resumeData: ParsedResume): string {
    const sections = [];

    // Add skills section
    if (resumeData.skills.length > 0) {
      sections.push('Skills: ' + resumeData.skills.map(s => s.name).join(', '));
    }

    // Add experience section
    if (resumeData.experience.length > 0) {
      sections.push('Experience: ' + resumeData.experience.map(exp => 
        `${exp.position} at ${exp.company}: ${exp.description}`
      ).join(' | '));
    }

    // Add projects section
    if (resumeData.projects.length > 0) {
      sections.push('Projects: ' + resumeData.projects.map(proj => 
        `${proj.name}: ${proj.description} (${proj.technologies.join(', ')})`
      ).join(' | '));
    }

    // Add summary section
    if (resumeData.summary) {
      sections.push('Summary: ' + resumeData.summary);
    }

    return sections.join('\n\n');
  }

  private calculateCategoryScores(resumeCategories: { technical: string[], soft: string[], language: string[], tool: string[] }, jobCategories: { technical: string[], soft: string[], language: string[], tool: string[] }): KeywordMatchResult['categoryScores'] {
    return {
      technical: this.calculateCategoryMatchScore(resumeCategories.technical, jobCategories.technical),
      soft: this.calculateCategoryMatchScore(resumeCategories.soft, jobCategories.soft),
      language: this.calculateCategoryMatchScore(resumeCategories.language, jobCategories.language),
      tool: this.calculateCategoryMatchScore(resumeCategories.tool, jobCategories.tool),
    };
  }

  private groupSkillsByCategory(skills: ParsedResume['skills']): { technical: string[], soft: string[], language: string[], tool: string[] } {
    const grouped = {
      technical: [] as string[],
      soft: [] as string[],
      language: [] as string[],
      tool: [] as string[],
    };

    skills.forEach(skill => {
      const category = skill.category || 'technical';
      if (grouped[category as keyof typeof grouped]) {
        grouped[category as keyof typeof grouped].push(skill.name);
      }
    });

    return grouped;
  }

  private groupJobSkillsByCategory(skills: ParsedJob['skills']): { technical: string[], soft: string[], language: string[], tool: string[] } {
    const grouped = {
      technical: [] as string[],
      soft: [] as string[],
      language: [] as string[],
      tool: [] as string[],
    };

    skills.forEach(skill => {
      const category = skill.category || 'technical';
      if (grouped[category as keyof typeof grouped]) {
        grouped[category as keyof typeof grouped].push(skill.name);
      }
    });

    return grouped;
  }

  private calculateCategoryMatchScore(resumeSkills: string[], jobSkills: string[]): number {
    if (jobSkills.length === 0) return 100;
    if (resumeSkills.length === 0) return 0;

    const matches = jobSkills.filter(jobSkill =>
      resumeSkills.some(resumeSkill => 
        this.normalizeKeyword(resumeSkill) === this.normalizeKeyword(jobSkill)
      )
    );

    return Math.round((matches.length / jobSkills.length) * 100);
  }

  private calculateOverallMatchScore(
    exactMatches: KeywordMatchResult['exactMatches'],
    semanticMatches: KeywordMatchResult['semanticMatches'],
    categoryScores: KeywordMatchResult['categoryScores']
  ): number {
    // Exact matches (40% weight)
    const exactScore = exactMatches.filter(m => m.found).length / exactMatches.length * 40;

    // Semantic matches (35% weight)
    const semanticScore = semanticMatches.length > 0 
      ? (semanticMatches.reduce((sum, m) => sum + m.similarity, 0) / semanticMatches.length) * 0.35
      : 0;

    // Category scores (25% weight)
    const categoryScore = (
      categoryScores.technical * 0.4 +
      categoryScores.soft * 0.3 +
      categoryScores.language * 0.2 +
      categoryScores.tool * 0.1
    ) * 0.25;

    return Math.min(100, Math.round(exactScore + semanticScore + categoryScore));
  }

  private normalizeKeyword(keyword: string): string {
    return keyword.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async getKeywordSuggestions(resumeData: ParsedResume, jobData: ParsedJob): Promise<AgentResult> {
    try {
      const missingKeywords = jobData.keywords?.filter(keyword => 
        !this.extractResumeKeywords(resumeData).includes(this.normalizeKeyword(keyword))
      ) || [];

      if (missingKeywords.length === 0) {
        return {
          success: true,
          data: { 
            suggestions: [], 
            message: 'All keywords are covered!',
            exactMatches: [],
            semanticMatches: [],
            missingKeywords: [],
            additionalKeywords: [],
            matchScore: 100,
            categoryScores: { technical: 100, soft: 100, language: 100, tool: 100 }
          },
        };
      }

      const response = await this.llmProvider.generate({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert resume optimizer. Based on job requirements and missing keywords, suggest how to incorporate these into the resume naturally.
            
            For each missing keyword, provide:
            - suggestion: how to add it
            - section: where to add it
            - example: example text
            
            Return JSON with:
            {
              "suggestions": [
                {
                  "keyword": "missing keyword",
                  "suggestion": "how to add it",
                  "section": "where to add it",
                  "example": "example text"
                }
              ]
            }`,
          },
          {
            role: 'user',
            content: `Resume skills: ${resumeData.skills.map(s => s.name).join(', ')}\nMissing Keywords: ${missingKeywords.join(', ')}`,
          },
        ],
        temperature: 0.3,
        maxTokens: 2000,
        responseFormat: { type: 'json_object' },
      });

      const result = JSON.parse(response.choices[0]?.message?.content || '{"suggestions": []}');

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: `Keyword suggestion failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
