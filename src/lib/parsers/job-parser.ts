import { ParsedJobData, JobSkill } from '@/types';

export class JobParser {
  static parseText(text: string): ParsedJobData {
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      title: this.extractTitle(lines),
      company: this.extractCompany(lines),
      location: this.extractLocation(lines),
      employmentType: this.extractEmploymentType(lines),
      experienceLevel: this.extractExperienceLevel(lines),
      salary: this.extractSalary(lines),
      description: this.extractDescription(lines),
      requirements: this.extractRequirements(lines),
      responsibilities: this.extractResponsibilities(lines),
      benefits: this.extractBenefits(lines),
      skills: this.extractSkills(lines),
      keywords: this.extractKeywords(text),
    };
  }

  private static extractTitle(lines: string[]): string {
    const titleKeywords = ['job title', 'position', 'role'];
    
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      
      if (line.length > 5 && line.length < 100 && !line.includes('company') && !line.includes('location')) {
        const commonTitles = [
          'engineer', 'developer', 'manager', 'analyst', 'designer', 'consultant',
          'specialist', 'coordinator', 'director', 'lead', 'senior', 'junior',
          'architect', 'administrator', 'assistant', 'associate', 'advisor'
        ];
        
        if (commonTitles.some(title => line.toLowerCase().includes(title))) {
          return line;
        }
      }
    }
    
    return lines[0] || '';
  }

  private static extractCompany(lines: string[]): string {
    const companyKeywords = ['company:', 'at:', 'organization:'];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      for (const keyword of companyKeywords) {
        if (lowerLine.includes(keyword)) {
          return line.split(keyword)[1]?.trim() || '';
        }
      }
      
      if (line.includes(' at ') && line.length < 100) {
        const parts = line.split(' at ');
        if (parts.length > 1) {
          return parts[1].trim();
        }
      }
    }
    
    return '';
  }

  private static extractLocation(lines: string[]): string | undefined {
    const locationKeywords = ['location:', 'based in:', 'office:'];
    const cityStateRegex = /([A-Z][a-z\s]+,\s*[A-Z]{2}|[A-Z][a-z\s]+,\s*[A-Z][a-z\s]+)/;
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      for (const keyword of locationKeywords) {
        if (lowerLine.includes(keyword)) {
          return line.split(keyword)[1]?.trim();
        }
      }
      
      const locationMatch = line.match(cityStateRegex);
      if (locationMatch) {
        return locationMatch[0];
      }
    }
    
    return undefined;
  }

  private static extractEmploymentType(lines: string[]): string | undefined {
    const employmentTypes = [
      'full-time', 'part-time', 'contract', 'temporary', 'internship',
      'freelance', 'remote', 'hybrid', 'onsite'
    ];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      for (const type of employmentTypes) {
        if (lowerLine.includes(type)) {
          return type;
        }
      }
    }
    
    return undefined;
  }

  private static extractExperienceLevel(lines: string[]): string | undefined {
    const experienceLevels = [
      'entry level', 'junior', 'mid level', 'senior', 'lead', 'principal',
      'staff', 'director', 'vp', 'executive', 'manager', 'intern'
    ];
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      for (const level of experienceLevels) {
        if (lowerLine.includes(level)) {
          return level;
        }
      }
    }
    
    return undefined;
  }

  private static extractSalary(lines: string[]): { min?: number; max?: number; currency?: string } | undefined {
    const salaryRegex = /\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*[-–]\s*\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(k|thousand|year|hour|annual)?/i;
    const singleSalaryRegex = /\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(k|thousand|year|hour|annual)?/i;
    
    for (const line of lines) {
      const match = line.match(salaryRegex);
      if (match) {
        const min = parseInt(match[1].replace(/,/g, ''));
        const max = parseInt(match[2].replace(/,/g, ''));
        const multiplier = match[3]?.toLowerCase().includes('k') ? 1000 : 1;
        
        return {
          min: min * multiplier,
          max: max * multiplier,
          currency: 'USD'
        };
      }
      
      const singleMatch = line.match(singleSalaryRegex);
      if (singleMatch) {
        const amount = parseInt(singleMatch[1].replace(/,/g, ''));
        const multiplier = singleMatch[2]?.toLowerCase().includes('k') ? 1000 : 1;
        
        return {
          min: amount * multiplier,
          max: amount * multiplier,
          currency: 'USD'
        };
      }
    }
    
    return undefined;
  }

  private static extractDescription(lines: string[]): string {
    const descriptionKeywords = ['about the role', 'job description', 'overview', 'summary'];
    let description = '';
    let collecting = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      if (descriptionKeywords.some(keyword => lowerLine.includes(keyword))) {
        collecting = true;
        continue;
      }
      
      if (collecting) {
        if (this.isSectionHeader(line)) {
          break;
        }
        description += line + ' ';
      }
    }

    return description.trim();
  }

  private static extractRequirements(lines: string[]): string[] {
    const requirementKeywords = ['requirements', 'qualifications', 'skills needed', 'what you need'];
    const requirements: string[] = [];
    let collecting = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      if (requirementKeywords.some(keyword => lowerLine.includes(keyword))) {
        collecting = true;
        continue;
      }
      
      if (collecting) {
        if (this.isSectionHeader(line)) {
          break;
        }
        
        if (line.match(/^[\w\-\d]+[\.\)]\s+/) || line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
          requirements.push(line.replace(/^[\w\-\d]+[\.\)]\s+|^[•\-\*]\s*/, '').trim());
        }
      }
    }

    return requirements;
  }

  private static extractResponsibilities(lines: string[]): string[] {
    const responsibilityKeywords = ['responsibilities', 'duties', 'what you\'ll do', 'day to day'];
    const responsibilities: string[] = [];
    let collecting = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      if (responsibilityKeywords.some(keyword => lowerLine.includes(keyword))) {
        collecting = true;
        continue;
      }
      
      if (collecting) {
        if (this.isSectionHeader(line)) {
          break;
        }
        
        if (line.match(/^[\w\-\d]+[\.\)]\s+/) || line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
          responsibilities.push(line.replace(/^[\w\-\d]+[\.\)]\s+|^[•\-\*]\s*/, '').trim());
        }
      }
    }

    return responsibilities;
  }

  private static extractBenefits(lines: string[]): string[] | undefined {
    const benefitKeywords = ['benefits', 'perks', 'what we offer', 'compensation'];
    const benefits: string[] = [];
    let collecting = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      if (benefitKeywords.some(keyword => lowerLine.includes(keyword))) {
        collecting = true;
        continue;
      }
      
      if (collecting) {
        if (this.isSectionHeader(line)) {
          break;
        }
        
        if (line.match(/^[\w\-\d]+[\.\)]\s+/) || line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
          benefits.push(line.replace(/^[\w\-\d]+[\.\)]\s+|^[•\-\*]\s*/, '').trim());
        }
      }
    }

    return benefits.length > 0 ? benefits : undefined;
  }

  private static extractSkills(lines: string[]): JobSkill[] {
    const skills: JobSkill[] = [];
    const skillKeywords = ['skills', 'technologies', 'tools', 'tech stack'];
    let collecting = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      if (skillKeywords.some(keyword => lowerLine.includes(keyword))) {
        collecting = true;
        continue;
      }
      
      if (collecting && this.isSectionHeader(line)) {
        break;
      }
      
      if (collecting && line.trim()) {
        const skillList = line.split(/[,;|]/).map(s => s.trim()).filter(s => s.length > 0);
        
        skillList.forEach(skill => {
          const requiredWords = ['required', 'must have', 'essential'];
          const isRequired = requiredWords.some(word => lowerLine.includes(word));
          
          skills.push({
            name: skill,
            required: isRequired,
            category: this.categorizeSkill(skill),
          });
        });
      }
    }

    return skills;
  }

  private static extractKeywords(text: string): string[] {
    const technicalSkills = [
      'javascript', 'python', 'java', 'c++', 'react', 'node', 'angular', 'vue',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'sql', 'mongodb', 'postgresql',
      'git', 'ci/cd', 'devops', 'machine learning', 'ai', 'data science', 'typescript',
      'html', 'css', 'sass', 'webpack', 'babel', 'jest', 'testing', 'agile', 'scrum'
    ];
    
    const softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
      'time management', 'project management', 'collaboration', 'adaptability', 'creativity'
    ];
    
    const businessTerms = [
      'strategy', 'planning', 'analysis', 'reporting', 'presentation', 'negotiation',
      'budget', 'forecasting', 'marketing', 'sales', 'customer service', 'stakeholder'
    ];

    const lowerText = text.toLowerCase();
    const foundKeywords = new Set<string>();

    [...technicalSkills, ...softSkills, ...businessTerms].forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundKeywords.add(keyword);
      }
    });

    return Array.from(foundKeywords);
  }

  private static categorizeSkill(skillName: string): JobSkill['category'] {
    const technicalSkills = [
      'javascript', 'python', 'java', 'c++', 'react', 'node', 'angular', 'vue',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'sql', 'mongodb', 'postgresql',
      'git', 'ci/cd', 'devops', 'machine learning', 'ai', 'data science', 'typescript',
      'html', 'css', 'sass', 'webpack', 'babel', 'jest', 'testing'
    ];
    
    const softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
      'time management', 'project management', 'collaboration', 'adaptability', 'creativity'
    ];
    
    const tools = [
      'jira', 'slack', 'trello', 'asana', 'figma', 'sketch', 'photoshop', 'excel',
      'powerpoint', 'word', 'office', 'google workspace', 'salesforce', 'hubspot'
    ];

    const lowerSkill = skillName.toLowerCase();
    
    if (technicalSkills.some(tech => lowerSkill.includes(tech))) return 'technical';
    if (softSkills.some(soft => lowerSkill.includes(soft))) return 'soft';
    if (tools.some(tool => lowerSkill.includes(tool))) return 'tool';
    
    return 'technical';
  }

  private static isSectionHeader(line: string): boolean {
    const headers = [
      'requirements', 'qualifications', 'responsibilities', 'duties',
      'skills', 'technologies', 'benefits', 'perks', 'about the role',
      'job description', 'company', 'location', 'salary', 'experience'
    ];
    const lowerLine = line.toLowerCase().trim();
    return headers.some(header => lowerLine === header || lowerLine.includes(header));
  }
}
