export interface ClientConfig {
  apiKey: string;
  baseURL?: string;
  customHeaders?: Record<string, string>;
}

export class Configuration {
  public readonly apiKey: string;
  public readonly baseURL?: string;
  public readonly customHeaders?: Record<string, string>;

  constructor(config: ClientConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
    this.customHeaders = config.customHeaders;
  }

  /**
   * Get the complete headers including API key and custom headers
   */
  getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };

    if (this.customHeaders) {
      Object.assign(headers, this.customHeaders);
    }

    return headers;
  }

  /**
   * Get the OpenAI client configuration
   */
  getOpenAIConfig() {
    return {
      apiKey: this.apiKey,
      baseURL: this.baseURL,
      defaultHeaders: this.customHeaders
    };
  }
}