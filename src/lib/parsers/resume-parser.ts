import { ParsedResumeData, WorkExperience, Education, Skill, Certification, Language, Project } from '@/types';

export class ResumeParser {
  static parseText(text: string): ParsedResumeData {
    const lines = text.split('\n').filter(line => line.trim());
    
    return {
      personalInfo: this.extractPersonalInfo(lines),
      summary: this.extractSummary(lines),
      experience: this.extractExperience(lines),
      education: this.extractEducation(lines),
      skills: this.extractSkills(lines),
      certifications: this.extractCertifications(lines),
      languages: this.extractLanguages(lines),
      projects: this.extractProjects(lines),
    };
  }

  private static extractPersonalInfo(lines: string[]): ParsedResumeData['personalInfo'] {
    const personalInfo = {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      github: '',
      portfolio: '',
    };

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /[+]?[(]?[0-9]{1,3}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}/;
    const linkedinRegex = /linkedin\.com\/in\/[\w-]+/i;
    const githubRegex = /github\.com\/[\w-]+/i;

    for (const line of lines) {
      if (!personalInfo.name && line.length < 50 && !line.includes('@') && !phoneRegex.test(line)) {
        personalInfo.name = line.trim();
      }
      
      if (!personalInfo.email) {
        const emailMatch = line.match(emailRegex);
        if (emailMatch) personalInfo.email = emailMatch[0];
      }
      
      if (!personalInfo.phone) {
        const phoneMatch = line.match(phoneRegex);
        if (phoneMatch) personalInfo.phone = phoneMatch[0];
      }
      
      if (!personalInfo.linkedin) {
        const linkedinMatch = line.match(linkedinRegex);
        if (linkedinMatch) personalInfo.linkedin = 'https://' + linkedinMatch[0];
      }
      
      if (!personalInfo.github) {
        const githubMatch = line.match(githubRegex);
        if (githubMatch) personalInfo.github = 'https://' + githubMatch[0];
      }
    }

    return personalInfo;
  }

  private static extractSummary(lines: string[]): string | undefined {
    const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
    let summary = '';
    let collecting = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      
      if (summaryKeywords.some(keyword => line.includes(keyword))) {
        collecting = true;
        continue;
      }
      
      if (collecting) {
        if (line.trim() === '' || this.isSectionHeader(line)) {
          break;
        }
        summary += line + ' ';
      }
    }

    return summary.trim() || undefined;
  }

  private static extractExperience(lines: string[]): WorkExperience[] {
    const experiences: WorkExperience[] = [];
    const experienceKeywords = ['experience', 'work', 'employment', 'career'];
    let currentExperience: Partial<WorkExperience> | null = null;
    let inExperienceSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (experienceKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        inExperienceSection = true;
        continue;
      }
      
      if (inExperienceSection && this.isSectionHeader(line)) {
        if (currentExperience && currentExperience.company && currentExperience.position) {
          experiences.push({
            id: Math.random().toString(36).substring(2),
            company: currentExperience.company,
            position: currentExperience.position,
            startDate: currentExperience.startDate || '',
            endDate: currentExperience.endDate,
            current: currentExperience.current || false,
            description: currentExperience.description || '',
            achievements: currentExperience.achievements || [],
          });
        }
        currentExperience = null;
        break;
      }
      
      if (inExperienceSection && line.trim()) {
        const dateMatch = line.match(/(\d{1,2}\/\d{4}|\d{4}|\w+ \d{4})\s*[-–]\s*(\d{1,2}\/\d{4}|\d{4}|\w+ \d{4}|present|current)/i);
        
        if (dateMatch && currentExperience) {
          currentExperience.startDate = dateMatch[1];
          currentExperience.endDate = dateMatch[2].toLowerCase() === 'present' || dateMatch[2].toLowerCase() === 'current' 
            ? undefined 
            : dateMatch[2];
          currentExperience.current = dateMatch[2].toLowerCase() === 'present' || dateMatch[2].toLowerCase() === 'current';
        } else if (!currentExperience || (currentExperience.company && currentExperience.position)) {
          if (line.includes(',') || line.includes(' at ')) {
            const parts = line.split(/,|\s+at\s+/);
            currentExperience = {
              position: parts[0]?.trim() || '',
              company: parts[1]?.trim() || '',
              description: '',
              achievements: [],
            };
          }
        } else if (currentExperience) {
          if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
            currentExperience.achievements = currentExperience.achievements || [];
            currentExperience.achievements.push(line.replace(/^[•\-*]\s*/, '').trim());
          } else {
            currentExperience.description = (currentExperience.description || '') + line + ' ';
          }
        }
      }
    }

    if (currentExperience && currentExperience.company && currentExperience.position) {
      experiences.push({
        id: Math.random().toString(36).substring(2),
        company: currentExperience.company,
        position: currentExperience.position,
        startDate: currentExperience.startDate || '',
        endDate: currentExperience.endDate,
        current: currentExperience.current || false,
        description: currentExperience.description || '',
        achievements: currentExperience.achievements || [],
      });
    }

    return experiences;
  }

  private static extractEducation(lines: string[]): Education[] {
    const education: Education[] = [];
    const educationKeywords = ['education', 'academic', 'university', 'college'];
    let currentEducation: Partial<Education> | null = null;
    let inEducationSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (educationKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        inEducationSection = true;
        continue;
      }
      
      if (inEducationSection && this.isSectionHeader(line)) {
        if (currentEducation && currentEducation.institution && currentEducation.degree) {
          education.push({
            id: Math.random().toString(36).substring(2),
            institution: currentEducation.institution,
            degree: currentEducation.degree,
            field: currentEducation.field || '',
            startDate: currentEducation.startDate || '',
            endDate: currentEducation.endDate,
            current: currentEducation.current || false,
            gpa: currentEducation.gpa,
          });
        }
        currentEducation = null;
        break;
      }
      
      if (inEducationSection && line.trim()) {
        const degreeKeywords = ['bachelor', 'master', 'phd', 'doctor', 'associate', 'certificate'];
        const gpaMatch = line.match(/gpa[:\s]*([0-9]\.[0-9]+)/i);
        
        if (gpaMatch && currentEducation) {
          currentEducation.gpa = gpaMatch[1];
        } else if (degreeKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
          if (currentEducation && currentEducation.institution) {
            currentEducation.degree = line.trim();
          } else {
            const parts = line.split(/,|\s+in\s+/);
            currentEducation = {
              degree: parts[0]?.trim() || '',
              field: parts[1]?.trim() || '',
              institution: '',
            };
          }
        } else if (!currentEducation || currentEducation.institution) {
          currentEducation = {
            institution: line.trim(),
            degree: '',
            field: '',
          };
        }
      }
    }

    if (currentEducation && currentEducation.institution && currentEducation.degree) {
      education.push({
        id: Math.random().toString(36).substring(2),
        institution: currentEducation.institution,
        degree: currentEducation.degree,
        field: currentEducation.field || '',
        startDate: currentEducation.startDate || '',
        endDate: currentEducation.endDate,
        current: currentEducation.current || false,
        gpa: currentEducation.gpa,
      });
    }

    return education;
  }

  private static extractSkills(lines: string[]): Skill[] {
    const skills: Skill[] = [];
    const skillKeywords = ['skills', 'technical', 'technologies', 'tools', 'competencies'];
    let inSkillsSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (skillKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        inSkillsSection = true;
        continue;
      }
      
      if (inSkillsSection && this.isSectionHeader(line)) {
        break;
      }
      
      if (inSkillsSection && line.trim()) {
        const skillList = line.split(/[,;|]/).map(s => s.trim()).filter(s => s.length > 0);
        
        skillList.forEach(skill => {
          const levelMatch = skill.match(/\((basic|intermediate|advanced|expert)\)/i);
          const skillName = skill.replace(/\(.*?\)/, '').trim();
          
          if (skillName) {
            skills.push({
              id: Math.random().toString(36).substring(2),
              name: skillName,
              category: this.categorizeSkill(skillName),
              level: (levelMatch?.[1]?.toLowerCase() as any) || 'intermediate',
            });
          }
        });
      }
    }

    return skills;
  }

  private static extractCertifications(lines: string[]): Certification[] {
    const certifications: Certification[] = [];
    const certKeywords = ['certification', 'certificate', 'licensed', 'credential'];
    let inCertSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (certKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        inCertSection = true;
        continue;
      }
      
      if (inCertSection && this.isSectionHeader(line)) {
        break;
      }
      
      if (inCertSection && line.trim()) {
        const dateMatch = line.match(/(\d{4}|\w+ \d{4})/);
        const issuerMatch = line.match(/(aws|google|microsoft|oracle|cisco|compTIA|pmi)/i);
        
        if (dateMatch || issuerMatch) {
          certifications.push({
            id: Math.random().toString(36).substring(2),
            name: line.replace(/\d{4}|\w+ \d{4}/g, '').trim(),
            issuer: issuerMatch?.[1] || 'Unknown',
            date: dateMatch?.[1] || new Date().getFullYear().toString(),
          });
        }
      }
    }

    return certifications;
  }

  private static extractLanguages(lines: string[]): Language[] {
    const languages: Language[] = [];
    const langKeywords = ['languages', 'language'];
    let inLangSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (langKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        inLangSection = true;
        continue;
      }
      
      if (inLangSection && this.isSectionHeader(line)) {
        break;
      }
      
      if (inLangSection && line.trim()) {
        const proficiencyMatch = line.match(/\(?(basic|conversational|professional|native|fluent)\)?/i);
        const langName = line.replace(/\(.*?\)/, '').trim();
        
        if (langName && !langName.toLowerCase().includes('language')) {
          languages.push({
            id: Math.random().toString(36).substring(2),
            name: langName,
            proficiency: (proficiencyMatch?.[1]?.toLowerCase() as any) || 'conversational',
          });
        }
      }
    }

    return languages;
  }

  private static extractProjects(lines: string[]): Project[] {
    const projects: Project[] = [];
    const projectKeywords = ['projects', 'portfolio', 'work'];
    let inProjectSection = false;
    let currentProject: Partial<Project> | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (projectKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
        inProjectSection = true;
        continue;
      }
      
      if (inProjectSection && this.isSectionHeader(line)) {
        if (currentProject && currentProject.name) {
          projects.push({
            id: Math.random().toString(36).substring(2),
            name: currentProject.name,
            description: currentProject.description || '',
            technologies: currentProject.technologies || [],
            url: currentProject.url,
            github: currentProject.github,
            startDate: currentProject.startDate || '',
            endDate: currentProject.endDate,
          });
        }
        currentProject = null;
        break;
      }
      
      if (inProjectSection && line.trim()) {
        const techMatch = line.match(/\[([^\]]+)\]|(\.js|\.py|\.java|\.cpp|\.react|\.vue|\.angular)/gi);
        
        if (techMatch && currentProject) {
          const techs = techMatch.map(tech => tech.replace(/[[\]]/g, ''));
          currentProject.technologies = [...(currentProject.technologies || []), ...techs];
        } else if (!currentProject || currentProject.name) {
          currentProject = {
            name: line.trim(),
            description: '',
            technologies: [],
          };
        } else if (currentProject) {
          currentProject.description = (currentProject.description || '') + line + ' ';
        }
      }
    }

    if (currentProject && currentProject.name) {
      projects.push({
        id: Math.random().toString(36).substring(2),
        name: currentProject.name,
        description: currentProject.description || '',
        technologies: currentProject.technologies || [],
        url: currentProject.url,
        github: currentProject.github,
        startDate: currentProject.startDate || '',
        endDate: currentProject.endDate,
      });
    }

    return projects;
  }

  private static categorizeSkill(skillName: string): Skill['category'] {
    const technicalSkills = [
      'javascript', 'python', 'java', 'c++', 'react', 'node', 'angular', 'vue',
      'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'sql', 'mongodb', 'postgresql',
      'git', 'ci/cd', 'devops', 'machine learning', 'ai', 'data science'
    ];
    
    const softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving', 'critical thinking',
      'time management', 'project management', 'collaboration', 'adaptability'
    ];
    
    const tools = [
      'jira', 'slack', 'trello', 'asana', 'figma', 'sketch', 'photoshop', 'excel',
      'powerpoint', 'word', 'office', 'google workspace'
    ];

    const lowerSkill = skillName.toLowerCase();
    
    if (technicalSkills.some(tech => lowerSkill.includes(tech))) return 'technical';
    if (softSkills.some(soft => lowerSkill.includes(soft))) return 'soft';
    if (tools.some(tool => lowerSkill.includes(tool))) return 'tool';
    
    return 'technical';
  }

  private static isSectionHeader(line: string): boolean {
    const headers = ['experience', 'education', 'skills', 'projects', 'certifications', 'languages', 'summary', 'objective'];
    const lowerLine = line.toLowerCase().trim();
    return headers.some(header => lowerLine === header || lowerLine.includes(header));
  }
}
