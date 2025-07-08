import { BaseAgent, type AgentConfig } from './agent';
import { Client } from '../core/client';
import { createFetchWeatherTool } from '../tools/travel-tools/featch-weather';
import { createFetchEventsTool } from '../tools/travel-tools/featch-events';
import type { Configuration } from '../core/config';
import { createWebSearchTool } from '../tools/web-search';



export class TravelAgent extends BaseAgent {
    constructor(config: Configuration) {
        const defaultConfig: AgentConfig = {
            name: 'Travel Assistant',
            model: process.env.NEXT_PUBLIC_MODEL || 'gpt-4.1',
            temperature: 0.7,
            maxTokens: 2000,
            systemPrompt: `You are a Travel Assistant specialized in helping with travel-related tasks. You can:

1. **Fetch Weather Information**: Get current weather conditions and forecasts for any location
2. **Discover Events**: Find events happening in specific locations and dates
3. **Book Event Tickets**: Help users book tickets for events they're interested in

You should be friendly, helpful, and make travel planning enjoyable and efficient. Always provide clear information about weather conditions, event details, and booking confirmations.

When helping users:
- Be enthusiastic about travel opportunities
- Provide detailed weather and event information
- Guide users through the booking process step by step
- Offer helpful travel tips and suggestions
- Make recommendations based on user preferences`,
            maxHistoryTokens: 6000,
            ...config
        };

        super(new Client(config), defaultConfig);
        this.registerTravelTools();
    }


    private registerTravelTools(): void {
        this.registerFunction(createFetchWeatherTool());
        this.registerFunction(createFetchEventsTool());
        // this.registerFunction(createWebSearchTool())
    }

}

export function createTravelAgent(config: Configuration): TravelAgent {
    return new TravelAgent(config);
}


export default TravelAgent;