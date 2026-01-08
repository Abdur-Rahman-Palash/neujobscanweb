export type LLMProvider = 'openai' | 'huggingface' | 'local';

export interface LLMResponse {
  choices: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export interface LLMRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: {
    type: 'json_object';
  };
}

export abstract class BaseLLMProvider {
  protected provider: LLMProvider;

  constructor(provider: LLMProvider) {
    this.provider = provider;
  }

  abstract generate(request: LLMRequest): Promise<LLMResponse>;
}

export class OpenAIProvider extends BaseLLMProvider {
  private apiKey: string;
  private client: any;

  constructor(provider: LLMProvider, apiKey: string) {
    super(provider);
    this.apiKey = apiKey;
    this.initializeClient();
  }

  private initializeClient(): void {
    // Dynamic import to avoid bundling issues
    import('openai').then((OpenAI) => {
      this.client = new OpenAI.default({
        apiKey: this.apiKey,
      });
    });
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    if (!this.client) {
      throw new Error('OpenAI client not initialized');
    }

    try {
      const response = await this.client.chat.completions.create({
        model: request.model,
        messages: request.messages,
        temperature: request.temperature || 0.1,
        max_tokens: request.maxTokens || 4000,
        response_format: request.responseFormat,
      });

      return {
        choices: response.choices,
      };
    } catch (error) {
      throw new Error(`OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export class HuggingFaceProvider extends BaseLLMProvider {
  private apiKey: string;

  constructor(provider: LLMProvider, apiKey: string) {
    super(provider);
    this.apiKey = apiKey;
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    // Implementation for HuggingFace provider
    throw new Error('HuggingFace provider not implemented yet');
  }
}

export class LocalProvider extends BaseLLMProvider {
  private endpoint: string;

  constructor(provider: LLMProvider, endpoint: string) {
    super(provider);
    this.endpoint = endpoint;
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    // Implementation for local LLM provider
    throw new Error('Local provider not implemented yet');
  }
}

export function createLLMProvider(provider: LLMProvider, config: { apiKey?: string; endpoint?: string }): BaseLLMProvider {
  switch (provider) {
    case 'openai':
      if (!config.apiKey) {
        throw new Error('OpenAI API key is required');
      }
      return new OpenAIProvider(provider, config.apiKey);
    
    case 'huggingface':
      if (!config.apiKey) {
        throw new Error('HuggingFace API key is required');
      }
      return new HuggingFaceProvider(provider, config.apiKey);
    
    case 'local':
      if (!config.endpoint) {
        throw new Error('Local endpoint is required');
      }
      return new LocalProvider(provider, config.endpoint);
    
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}
