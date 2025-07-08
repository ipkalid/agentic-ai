import { BaseAgent, type AgentConfig } from './agent';
import { Client } from '../core/client';
import type { Configuration } from '../core/config';
import { createWebSearchTool } from '../tools/web-search';
import { createCalculationTool } from '../tools/calculation';

/**
 * GeneralAgent is a versatile assistant that can handle a wide range of tasks.
 * It serves as a default agent that can be extended with various tools.
 */
export class GeneralAgent extends BaseAgent {
    constructor(config: Configuration) {
        const defaultConfig: AgentConfig = {
            name: 'General Assistant',
            model: process.env.NEXT_PUBLIC_MODEL || 'gpt-4.1',
            temperature: 0.7,
            maxTokens: 2000,
            systemPrompt: `You are a helpful and friendly General Assistant. Your goal is to assist users with their questions and tasks to the best of your ability.

You should be:
- **Conversational and Engaging**: Interact with users in a natural and friendly manner.
- **Helpful and Informative**: Provide clear, concise, and accurate information.
- **Versatile**: Be ready to handle a wide variety of requests.

When responding to users, always aim to be clear and supportive. If you cannot fulfill a request, explain why in a helpful way.`,
            ...config
        };

        // Initialize the base agent with the client and configuration
        super(new Client(config), defaultConfig);

        // Tools can be registered here in the future
        this.registerTools();
    }


    private registerTools(): void {
        this.registerFunction(createWebSearchTool());
        this.registerFunction(createCalculationTool());
    }

}

/**
 * Factory function to create an instance of the GeneralAgent.
 * @param config - The configuration for the agent.
 * @returns A new instance of GeneralAgent.
 */
export function createGeneralAgent(config: Configuration): GeneralAgent {
    return new GeneralAgent(config);
}

export default GeneralAgent;
