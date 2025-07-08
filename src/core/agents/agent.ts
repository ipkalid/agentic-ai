
import { type ClientInterface } from '../core/client';
import type { ChatCompletionCreateParams } from 'openai/resources/chat/completions';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';
import { checkNextSpeaker, type ChatHistoryProvider, type NextSpeakerResponse } from '../utils/nextSpeakerChecker';
import type { Tool } from '../tools/tools';


// Types and interfaces
export interface AgentConfig {
    name: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    maxHistoryTokens?: number;
}

/**
 * BaseAgent serves as the foundation for an AI agent system
 * Handles agent creation, function calling, conversation management, and tool integration
 */
export class BaseAgent implements ChatHistoryProvider {
    private client: ClientInterface;
    private config: AgentConfig;
    private systemPrompt: string;
    private conversationHistory: ChatCompletionMessageParam[];
    private tools: Map<string, Tool>;
    private maxHistoryTokens: number;

    constructor(client: ClientInterface, config: AgentConfig) {
        this.client = client;
        this.config = {
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 8192,
            maxHistoryTokens: 64000,
            ...config
        };
        this.systemPrompt = config.systemPrompt || '';
        this.conversationHistory = [];
        this.tools = new Map();
        this.maxHistoryTokens = this.config.maxHistoryTokens!;

        this.setSystemPrompt(this.systemPrompt);
    }


    // createComplement(complementConfig: Partial<AgentConfig>): BaseAgent {
    //     const complementaryConfig: AgentConfig = {
    //         ...this.config,
    //         ...complementConfig,
    //         name: complementConfig.name || `${this.config.name}-complement`
    //     };

    //     return new BaseAgent(this.client, complementaryConfig);
    // }


    setSystemPrompt(prompt: string): void {
        this.systemPrompt = prompt;
        const now = new Date();
        const timeString = now.toLocaleString();

        if (prompt) {
            prompt = `Current time: ${timeString}\n\n${prompt}`;
        } else {
            prompt = `Current time: ${timeString}`;
        }

        // Update or add system message at the beginning of conversation
        const systemMessageIndex = this.conversationHistory.findIndex(msg => msg.role === 'system');
        const systemMessage: ChatCompletionMessageParam = {
            role: 'system',
            content: prompt,
        };

        if (systemMessageIndex >= 0) {
            this.conversationHistory[systemMessageIndex] = systemMessage;
        } else {
            this.conversationHistory.unshift(systemMessage);
        }
    }


    registerFunction(toolFunction: Tool): void {
        this.tools.set(toolFunction.name, toolFunction);
    }


    registerFunctions<T extends Tool>(toolFunctions: T[]): void {
        toolFunctions.forEach(tool => this.registerFunction(tool));
    }

    /**
     * Get a description of all available tools for this agent
     * @returns A formatted string describing all registered tools
     */
    public getDescription(): string {
        if (this.tools.size === 0) {
            return `${this.config.name} has no tools available.`;
        }

        const toolDescriptions = Array.from(this.tools.values()).map(tool => {
            return ` ${tool.name} `;
        }).join('\n\n');

        return `${this.config.name} and I can use the following tools:\n\n${toolDescriptions}`;
    }


    private getToolsForAPI(): ChatCompletionTool[] {
        return Array.from(this.tools.values()).map(tool => ({
            type: 'function',
            function: tool.schema
        }));
    }


    private async executeFunctionCalls(toolCalls: any[], updateOutput?: (output: string) => void): Promise<ChatCompletionMessageParam[]> {
        const results: ChatCompletionMessageParam[] = [];

        for (const toolCall of toolCalls) {
            if (toolCall.type === 'function') {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);

                const tool = this.tools.get(functionName);
                if (!tool) {
                    results.push({
                        role: 'tool',
                        content: JSON.stringify({ error: `Function ${functionName} not found` }),
                        tool_call_id: toolCall.id
                    });
                    continue;
                }

                try {
                    const result = await tool.execute(functionArgs, (output) => {
                        if (updateOutput) {
                            updateOutput(output)
                        }
                    });
                    results.push({
                        role: 'tool',
                        content: result.llmContent,
                        tool_call_id: toolCall.id
                    });
                } catch (error) {
                    results.push({
                        role: 'tool',
                        content: JSON.stringify({
                            error: error instanceof Error ? error.message : 'Unknown error'
                        }),
                        tool_call_id: toolCall.id
                    });
                }
            }
        }

        return results;
    }

    addMessage(message: ChatCompletionMessageParam): void {

        this.conversationHistory.push(message);
    }

    getHistory(): ChatCompletionMessageParam[] {
        return [...this.conversationHistory];
    }


    getMessages(): ChatCompletionMessageParam[] {
        return this.getHistory();
    }



    clearHistory(keepSystemPrompt: boolean = true): void {
        if (keepSystemPrompt) {
            this.conversationHistory = this.conversationHistory.filter(msg => msg.role === 'system');
        } else {
            this.conversationHistory = [];
        }
    }


    private estimateTokenCount(text: string): number {
        // Rough estimation: 1 token ≈ 4 characters
        return Math.ceil(text.length / 4);
    }


    private calculateHistoryTokens(): number {
        return this.conversationHistory.reduce((total, message) => {
            let s = message.content as string ?? ''
            return total + this.estimateTokenCount(s);
        }, 0);
    }

    async summarizeHistory(): Promise<void> {
        const currentTokens = this.calculateHistoryTokens();

        if (currentTokens <= this.maxHistoryTokens) {
            return;
        }
        const systemMessages = this.conversationHistory.filter(msg => msg.role === 'system');
        const recentMessages = this.conversationHistory.slice(-5); // Keep last 5 messages
        const messagesToSummarize = this.conversationHistory.slice(
            systemMessages.length,
            this.conversationHistory.length - 5
        );

        if (messagesToSummarize.length === 0) {
            return;
        }

        // Create summarization prompt
        const summaryPrompt = `Please summarize the following conversation history, preserving key information, decisions, and context:\n\n${messagesToSummarize.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')}`;

        try {
            const summaryParams: ChatCompletionCreateParams = {
                model: this.config.model!,
                messages: [{ role: 'user', content: summaryPrompt }],
                temperature: 0.3,
                max_tokens: 500
            };

            const response = await this.client.create(summaryParams);
            const summary = response.choices[0]?.message?.content || 'Summary unavailable';

            // Replace old messages with summary
            this.conversationHistory = [
                ...systemMessages,
                {
                    role: 'assistant',
                    content: `[CONVERSATION SUMMARY]: ${summary}`,
                },
                ...recentMessages
            ];
        } catch (error) {
            console.warn('Failed to summarize history:', error);
        }
    }

    /**
     * Determine the next speaker in the conversation
     */
    async pickNextSpeaker(): Promise<NextSpeakerResponse> {
        const lastMessage = this.conversationHistory[this.conversationHistory.length - 1];

        // empty message
        if (!lastMessage) {
            return {
                next_speaker: 'user',
                reasoning: 'No conversation history, waiting for user input'
            };
        }

        // Use intelligent speaker selection for complex scenarios
        try {
            const result = await checkNextSpeaker(this, this.client);
            return {
                next_speaker: result?.next_speaker ?? 'user',
                reasoning: result?.reasoning ?? "",
            };
        } catch (error) {
            console.warn('Failed to use intelligent speaker selection, falling back to simple logic:', error);
        }

        // Fallback to simple logic
        // If last message was from user, model should respond
        if (lastMessage.role === 'user') {
            return {
                next_speaker: 'assistance',
                reasoning: 'User provided input, model should respond'
            };
        }

        // If last message was from assistant with tool calls, model needs to process results
        if (lastMessage.role === 'assistant' && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
            return {
                next_speaker: 'assistance',
                reasoning: 'Model made tool calls, needs to process results'
            };
        }

        // If last message was a tool result, model should respond
        if (lastMessage.role === 'tool') {
            return {
                next_speaker: 'assistance',
                reasoning: 'Tool execution completed, model should respond'
            };
        }

        // If last message was from assistant without tool calls, user should respond
        if (lastMessage.role === 'assistant') {
            return {
                next_speaker: 'user',
                reasoning: 'Model completed response, waiting for user input'
            };
        }

        // Default to user
        return {
            next_speaker: 'user',
            reasoning: 'Default case, waiting for user input'
        };
    }

    /**
     * Generate a response from the model
     */
    async generateResponse(userMessage?: string, updateOutput?: (output: string) => void): Promise<ChatCompletionMessageParam> {
        // Add user message if provided
        if (userMessage) {
            this.addMessage({
                role: 'user',
                content: userMessage,
            });
        }


        await this.summarizeHistory();

        // console.log(JSON.stringify(this.conversationHistory))


        const params: ChatCompletionCreateParams = {
            model: this.config.model!,
            messages: this.conversationHistory,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
            ...(this.tools.size > 0 && { tools: this.getToolsForAPI() })
        };


        try {
            const response = await this.client.create(params);

            // console.log(JSON.stringify(params)

            const assistantMessage = response.choices[0]?.message;

            if (!assistantMessage) {
                throw new Error('No response from model');
            }

            // Create response message
            const responseMessage: ChatCompletionMessageParam = {
                role: 'assistant',
                content: assistantMessage.content || '',
                tool_calls: assistantMessage.tool_calls
            };

            // Add to history
            this.addMessage(responseMessage);

            // Execute tool calls if present
            let tools = assistantMessage.tool_calls
            if (tools && tools.length > 0) {
                let res = await this.executeFunctionCalls(tools, updateOutput)
                for (let r of res) {
                    this.addMessage(r)
                }



                const paramsForTools: ChatCompletionCreateParams = {
                    model: this.config.model!,
                    messages: this.conversationHistory,
                    temperature: this.config.temperature,
                    max_tokens: this.config.maxTokens,
                    ...(this.tools.size > 0 && { tools: this.getToolsForAPI() })
                };
                const toolsResponse = await this.client.create(paramsForTools);
                const assistantMessage = toolsResponse.choices[0]?.message;

                if (!assistantMessage) {
                    throw new Error('No response from model');
                }


                const responseMessage: ChatCompletionMessageParam = {
                    role: 'assistant',
                    content: assistantMessage.content || '',
                    tool_calls: assistantMessage.tool_calls
                };

                this.addMessage(responseMessage);
                let nextSpeaker = await this.pickNextSpeaker()
                if (nextSpeaker.next_speaker === "assistance") {
                    return this.generateResponse(nextSpeaker.reasoning)
                }

                return responseMessage

            }
            let nextSpeaker = await this.pickNextSpeaker()
            if (nextSpeaker.next_speaker === "assistance") {
                return this.generateResponse(nextSpeaker.reasoning)
            }


            return responseMessage;
        } catch (error) {
            throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get agent configuration
     */
    getConfig(): AgentConfig {
        return { ...this.config };
    }

    /**
     * Get registered tools
     */
    getTools(): Tool[] {
        return Array.from(this.tools.values());
    }

    /**
     * Get agent name
     */
    getName(): string {
        return this.config.name;
    }

    /**
     * Update agent configuration
     */
    updateConfig(updates: Partial<AgentConfig>): void {
        this.config = { ...this.config, ...updates };

        if (updates.maxHistoryTokens) {
            this.maxHistoryTokens = updates.maxHistoryTokens;
        }
    }


    async checkWhoShouldSpeakNext(): Promise<NextSpeakerResponse> {
        return await this.pickNextSpeaker();
    }
}