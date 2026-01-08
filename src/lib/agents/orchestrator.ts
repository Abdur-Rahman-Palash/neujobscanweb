import { ResumeParsingAgent, ParsedResume } from './resumeParser';
import { JobParsingAgent, ParsedJob } from './jobParser';
import { ATSMatcherAgent, KeywordMatchResult } from './atsMatcher';
import { ScorerAgent, ATSScoreResult } from './scorer';
import { GapAnalyzerAgent, SkillGapResult } from './gapAnalyzer';
import { RewriteAgent } from './rewriteAgent';
import { ExplanationAgent } from './explanationAgent';

export interface AgentResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface OrchestratorConfig {
  llmProvider: 'openai' | 'huggingface' | 'local';
  enableCaching?: boolean;
  timeoutMs?: number;
}

export class AIAgentOrchestrator {
  private config: OrchestratorConfig;
  private cache: Map<string, AgentResult> = new Map();

  constructor(config: OrchestratorConfig) {
    this.config = {
      enableCaching: true,
      timeoutMs: 30000,
      ...config,
    };
  }

  async processResume(resumeText: string, fileName: string): Promise<AgentResult> {
    try {
      const cacheKey = `resume-${this.hashText(resumeText)}`;
      
      if (this.config.enableCaching && this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      const resumeParsingAgent = new ResumeParsingAgent(this.config.llmProvider);
      const result = await resumeParsingAgent.parseResume(resumeText, fileName);
      
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Resume parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async processJobDescription(jobText: string): Promise<AgentResult> {
    try {
      const cacheKey = `job-${this.hashText(jobText)}`;
      
      if (this.config.enableCaching && this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey)!;
      }

      const jobParsingAgent = new JobParsingAgent(this.config.llmProvider);
      const result = await jobParsingAgent.parseJob(jobText);
      
      if (this.config.enableCaching) {
        this.cache.set(cacheKey, result);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: `Job parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async performATSScan(resumeData: ParsedResume, jobData: ParsedJob): Promise<AgentResult> {
    try {
      const scanId = this.generateScanId();
      
      // Step 1: ATS Keyword Matching
      const atsMatcherAgent = new ATSMatcherAgent(this.config.llmProvider);
      const keywordResult = await atsMatcherAgent.matchKeywords(resumeData, jobData);
      
      if (!keywordResult.success) {
        return keywordResult;
      }

      // Step 2: Scoring with weighted ATS calculation
      const scorerAgent = new ScorerAgent(this.config.llmProvider);
      const scoringResult = await scorerAgent.calculateATSScore(
        resumeData, 
        jobData, 
        keywordResult.data as KeywordMatchResult
      );
      
      if (!scoringResult.success) {
        return scoringResult;
      }

      // Step 3: Skill Gap Analysis
      const gapAnalyzerAgent = new GapAnalyzerAgent(this.config.llmProvider);
      const skillGapResult = await gapAnalyzerAgent.analyzeSkillGaps(
        resumeData,
        jobData,
        scoringResult.data!
      );
      
      if (!skillGapResult.success) {
        return skillGapResult;
      }

      // Step 4: Generate ATS-friendly rewrite suggestions
      const rewriteAgent = new RewriteAgent(this.config.llmProvider);
      const rewriteResult = await rewriteAgent.generateRewriteSuggestions(
        resumeData,
        jobData,
        skillGapResult.data!
      );
      
      if (!rewriteResult.success) {
        return rewriteResult;
      }

      // Step 5: Create user-friendly explanation
      const explanationAgent = new ExplanationAgent(this.config.llmProvider);
      const explanationResult = await explanationAgent.generateExplanation({
        scanId,
        resumeData,
        jobData,
        keywordMatches: keywordResult.data!,
        scores: scoringResult.data!,
        skillGaps: skillGapResult.data!,
        rewriteSuggestions: rewriteResult.data!,
      });
      
      if (!explanationResult.success) {
        return explanationResult;
      }

      return {
        success: true,
        data: {
          scanId,
          timestamp: new Date(),
          keywordMatches: keywordResult.data!,
          scores: scoringResult.data!,
          skillGaps: skillGapResult.data!,
          rewriteSuggestions: rewriteResult.data!,
          explanation: explanationResult.data!,
        },
        metadata: {
          processingTime: Date.now(),
          agentsUsed: ['keyword-matching', 'scoring', 'skill-gap', 'rewrite', 'explanation'],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `ATS scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async getScanHistory(userId: string): Promise<AgentResult> {
    try {
      // In a real implementation, this would fetch from database
      // For now, return mock data
      const mockHistory = [
        {
          scanId: 'scan_001',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          jobTitle: 'Senior Frontend Developer',
          company: 'TechCorp',
          overallScore: 85,
          status: 'completed',
        },
        {
          scanId: 'scan_002', 
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          jobTitle: 'Full Stack Developer',
          company: 'StartupXYZ',
          overallScore: 72,
          status: 'completed',
        },
      ];

      return {
        success: true,
        data: mockHistory,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to retrieve scan history: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async saveScanResult(userId: string, scanResult: unknown): Promise<AgentResult> {
    try {
      // In a real implementation, this would save to database
      console.log(`Saving scan result for user ${userId}:`, scanResult);
      
      return {
        success: true,
        data: { saved: true, scanId: (scanResult as any).scanId },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to save scan result: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Utility methods
  private hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private generateScanId(): string {
    return `scan_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  // Agent health check
  async checkAgentHealth(): Promise<AgentResult> {
    try {
      const agents = [
        'ResumeParsingAgent',
        'JobParsingAgent', 
        'ATSMatcherAgent',
        'ScorerAgent',
        'GapAnalyzerAgent',
        'RewriteAgent',
        'ExplanationAgent',
      ];

      const healthStatus = await Promise.allSettled(
        agents.map(async (agentName) => {
          try {
            // Simple health check - each agent should respond to a ping
            const startTime = Date.now();
            // This would be a real health check in production
            await new Promise(resolve => setTimeout(resolve, 100));
            const responseTime = Date.now() - startTime;
            
            return {
              agent: agentName,
              status: 'healthy',
              responseTime,
            };
          } catch (error) {
            return {
              agent: agentName,
              status: 'unhealthy',
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        })
      );

      const results = healthStatus.map(result => 
        result.status === 'fulfilled' ? result.value : result.reason
      );

      return {
        success: true,
        data: {
          overall: results.every(r => r.status === 'healthy') ? 'healthy' : 'degraded',
          agents: results,
          timestamp: new Date(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  // Cache management
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}
