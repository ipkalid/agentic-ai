import OpenAI from 'openai';
import { Configuration } from './config';
import type { ChatCompletionCreateParams, ChatCompletion, ChatCompletionChunk } from 'openai/resources/chat/completions';
import type { Stream } from 'openai/streaming';

export interface ClientInterface {
    create(params: ChatCompletionCreateParams): Promise<ChatCompletion>;
    createStream(params: ChatCompletionCreateParams): Promise<Stream<ChatCompletionChunk>>;
}

export class Client implements ClientInterface {
    private openai: OpenAI;
    private config: Configuration;

    constructor(config: Configuration) {
        this.config = config;
        this.openai = new OpenAI({ ...config.getOpenAIConfig(), dangerouslyAllowBrowser: true });
    }

    /**
     * Create a chat completion
     */
    async create(params: ChatCompletionCreateParams): Promise<ChatCompletion> {
        try {
            const response = await this.openai.chat.completions.create({
                ...params,
                stream: false
            });
            return response;
        } catch (error) {
            throw new Error(`Failed to create completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create a streaming chat completion
     */
    async createStream(params: ChatCompletionCreateParams): Promise<Stream<ChatCompletionChunk>> {
        try {
            const stream = await this.openai.chat.completions.create({
                ...params,
                stream: true
            });
            return stream;
        } catch (error) {
            throw new Error(`Failed to create streaming completion: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get the current configuration
     */
    getConfig(): Configuration {
        return this.config;
    }
}