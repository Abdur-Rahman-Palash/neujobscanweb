export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { jobData, resumeData, template = 'professional' } = await request.json();

    if (!jobData || !resumeData) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Job data and resume data are required',
        status: 400,
      }, { status: 400 });
    }

    console.log('=== COVER LETTER GENERATION ===');
    console.log('Template:', template);
    console.log('Job:', jobData.title);
    console.log('Company:', jobData.company);

    // Generate cover letter
    const coverLetter = await generateCoverLetter(jobData, resumeData, template);

    return NextResponse.json<ApiResponse>({
      success: true,
      data: {
        content: coverLetter,
        template,
        jobTitle: jobData.title,
        company: jobData.company,
        generatedAt: new Date(),
      },
      message: 'Cover letter generated successfully',
      status: 200,
    });

  } catch (error) {
    console.error('Cover letter generation error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during cover letter generation',
      status: 500,
    }, { status: 500 });
  }
}

async function generateCoverLetter(jobData: any, resumeData: any, template: string): Promise<string> {
  const templates = {
    professional: {
      greeting: `Dear ${jobData.hiringManager || 'Hiring Manager'},`,
      introduction: `I am writing to express my strong interest in the ${jobData.title} position at ${jobData.company}.`,
      body: generateProfessionalBody(jobData, resumeData),
      closing: 'Thank you for considering my application. I look forward to discussing how my skills and experience align with your needs.',
      signoff: 'Sincerely,'
    },
    modern: {
      greeting: `Hi ${jobData.hiringManager || 'there'},`,
      introduction: `I was excited to see your opening for a ${jobData.title} at ${jobData.company}!`,
      body: generateModernBody(jobData, resumeData),
      closing: "I'm eager to learn more about this opportunity and discuss how I can contribute to your team.",
      signoff: 'Best regards,'
    },
    creative: {
      greeting: `Hello ${jobData.hiringManager || 'there'},`,
      introduction: `When I came across your ${jobData.title} opportunity at ${jobData.company}, I knew I had to apply!`,
      body: generateCreativeBody(jobData, resumeData),
      closing: "I'd love the chance to discuss how my creative approach could benefit your projects.",
      signoff: 'Cheers,'
    },
    executive: {
      greeting: `Dear ${jobData.hiringManager || 'Hiring Manager'},`,
      introduction: `I am writing to express my strong interest in the ${jobData.title} position at ${jobData.company}.`,
      body: generateExecutiveBody(jobData, resumeData),
      closing: 'I am confident that my leadership experience and strategic vision would make me a valuable asset to your organization.',
      signoff: 'Respectfully,'
    }
  };

  const selectedTemplate = templates[template as keyof typeof templates] || templates.professional;
  
  return `${selectedTemplate.greeting}

${selectedTemplate.introduction}

${selectedTemplate.body}

${selectedTemplate.closing}
${resumeData.name || 'Your Name'}`;
}

function generateProfessionalBody(jobData: any, resumeData: any): string {
  return `
With my ${resumeData.experience || 'extensive experience'} in ${extractSkills(resumeData.skills)} and a proven track record of delivering ${extractAchievements(resumeData.skills)}, I am confident in my ability to contribute effectively to your team.

${jobData.description ? `The opportunity to work with ${jobData.company} particularly appeals to me because ${jobData.description.toLowerCase().includes('innovative') ? 'of your innovative approach' : 'of your excellent reputation'} in the industry.` : ''}

${jobData.requirements ? `I am particularly drawn to this role as it aligns perfectly with my background in ${jobData.requirements}.` : ''}

${resumeData.skills ? `My technical skills include ${resumeData.skills}, which I believe would be immediately valuable to your team.` : ''}`;
}

function generateModernBody(jobData: any, resumeData: any): string {
  return `
As a ${resumeData.experience || 'passionate'} ${extractSkills(resumeData.skills)} with ${resumeData.experience || 'extensive experience'} creating ${extractAchievements(resumeData.skills)}, I'm thrilled about the ${jobData.title} opportunity at ${jobData.company}!

${jobData.description ? `Your focus on ${jobData.description.toLowerCase().includes('innovation') ? 'innovation and cutting-edge technology' : 'excellence and quality'} resonates strongly with my professional values.` : ''}

I've been following ${jobData.company}'s work for some time, and I'm particularly impressed with ${extractImpressivePoints(jobData)}. I believe my ${resumeData.experience || 'hands-on'} experience with ${extractSkills(resumeData.skills)} would allow me to start contributing from day one.

Let's connect to discuss how my ${extractSkills(resumeData.skills)} expertise can help drive ${jobData.company}'s continued success!`;
}

function generateCreativeBody(jobData: any, resumeData: any): string {
  return `
Guess what? Another amazing opportunity! As a ${resumeData.experience || 'creative'} ${extractSkills(resumeData.skills)} who loves ${extractAchievements(resumeData.skills)}, I couldn't help but get excited about the ${jobData.title} role at ${jobData.company}.

${jobData.description ? `Your ${jobData.description.toLowerCase().includes('innovative') ? 'forward-thinking culture' : 'impressive work'} and focus on ${extractCreativeFocus(jobData)} make this feel like the perfect match for my skills and passion.` : ''}

I bring ${resumeData.experience || 'solid'} experience in ${extractSkills(resumeData.skills)} and a portfolio of ${extractAchievements(resumeData.skills)}. My approach is all about ${extractCreativeApproach(jobData)} while maintaining ${extractProfessionalQualities(jobData)}. Let's make something amazing together!
  `;
}

function generateExecutiveBody(jobData: any, resumeData: any): string {
  return `
As a ${resumeData.experience || 'seasoned'} ${extractSkills(resumeData.skills)} with ${resumeData.experience || 'demonstrated leadership'} and a proven track record of ${extractAchievements(resumeData.skills)}, I am writing to express my strong interest in the ${jobData.title} position at ${jobData.company}.

Throughout my career, I have successfully ${extractLeadershipActions(jobData)} and delivered ${extractBusinessImpact(jobData)}. My strategic approach to ${extractSkills(resumeData.skills)} and ${extractBusinessStrategy(jobData)} has consistently resulted in ${extractQuantifiableResults(jobData)}.

${jobData.description ? `The opportunity to lead your ${extractTeamFocus(jobData)} at ${jobData.company} is particularly compelling, as it aligns perfectly with my leadership philosophy and career objectives.` : ''}

I am confident that my background in ${extractSkills(resumeData.skills)} combined with my ${resumeData.experience || 'extensive'} experience would make me a valuable asset to your executive team. I would welcome the opportunity to discuss how my strategic vision and leadership capabilities can contribute to ${jobData.company}'s continued success and growth.`;
}

// Helper functions
function extractSkills(skills: string): string {
  if (!skills) return 'full-stack development';
  return skills.split(',').map(s => s.trim()).join(' and ');
}

function extractAchievements(_skills: string): string {
  const achievements = [
    'scalable web applications',
    'user engagement improvements',
    'cost reduction initiatives',
    'system performance optimizations',
    'team mentorship programs'
  ];
  
  return achievements.slice(0, 3).join(', ');
}

function extractImpressivePoints(_jobData: any): string {
  const points = [
    'industry leadership',
    'innovative solutions',
    'award-winning products',
    'global reach'
  ];
  
  return points.slice(0, 2).join(' and ');
}

function extractCreativeFocus(_jobData: any): string {
  const focusAreas = [
    'user experience design',
    'creative problem-solving',
    'brand storytelling',
    'visual innovation'
  ];
  
  return focusAreas.slice(0, 2).join(' and ');
}

function extractCreativeApproach(_jobData: any): string {
  const approaches = [
    'thinking outside the box',
    'user-centered design',
    'agile innovation',
    'data-driven creativity'
  ];
  
  return approaches.slice(0, 2).join(' and ');
}

function extractProfessionalQualities(_jobData: any): string {
  const qualities = [
    'attention to detail',
    'collaborative teamwork',
    'continuous learning',
    'reliable delivery'
  ];
  
  return qualities.slice(0, 2).join(' and ');
}

function extractLeadershipActions(_jobData: any): string {
  const actions = [
    'led cross-functional teams',
    'mentored junior developers',
    'drove strategic initiatives',
    'managed multi-million dollar budgets'
  ];
  
  return actions.slice(0, 2).join(' and ');
}

function extractBusinessImpact(_jobData: any): string {
  const impacts = [
    'revenue growth of 40%',
    'cost reduction of 30%',
    'customer satisfaction improvement of 50%',
    'market share expansion'
  ];
  
  return impacts.slice(0, 2).join(' and ');
}

function extractQuantifiableResults(_jobData: any): string {
  const results = [
    'increased user retention by 25%',
    'reduced support tickets by 60%',
    'improved system performance by 45%',
    'delivered projects 20% ahead of schedule'
  ];
  
  return results.slice(0, 2).join(' and ');
}

function extractTeamFocus(_jobData: any): string {
  const focuses = [
    'engineering excellence',
    'product innovation',
    'operational efficiency',
    'customer success'
  ];
  
  return focuses.slice(0, 2).join(' and ');
}

function extractBusinessStrategy(_jobData: any): string {
  const strategies = [
    'digital transformation',
    'market expansion',
    'operational excellence',
    'customer-centric approach'
  ];
  
  return strategies.slice(0, 2).join(' and ');
}
