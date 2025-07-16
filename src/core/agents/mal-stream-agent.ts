import { BaseAgent, type AgentConfig } from './agent';
import { Client } from '../core/client';
import { FetchRevenueTool } from '../tools/real-estate-tools/fetch-revenue';
import { FetchUnitsTool } from '../tools/real-estate-tools/fetch-units';
import { FetchTenantsTool } from '../tools/real-estate-tools/fetch-tenants';
import type { Configuration } from '../core/config';





export class MalStreamAgent extends BaseAgent {
    constructor(config: Configuration) {
        const defaultConfig: AgentConfig = {
            name: 'Real Estate Agent',
            model: process.env.NEXT_PUBLIC_MODEL || 'gpt-4.1',
            temperature: 0.7,
            maxTokens: 2000,
            systemPrompt: `You are a Mal-Stream Real Estate Management Assistant specialized in helping with real estate management tasks. You can:

1. **Fetch Revenue**: View and retrieve revenue information from properties
2. **Fetch Units**: Access property unit information including availability, details, and status
3. **Fetch Tenants**: Retrieve tenant information, lease details, and contact information

You should be professional, helpful, and ensure all real estate management processes are handled efficiently. Always provide clear information about property statuses, financial data, and tenant details.

When helping users:
- Be clear about what information is needed
- Explain property and tenant statuses clearly
- Guide users through real estate management processes
- Maintain confidentiality and professionalism
- Provide helpful insights for property management decisions`,
            ...config
        };

        super(new Client(config), defaultConfig);
        this.registerRealEstateTools();
    }


    private registerRealEstateTools(): void {
        this.registerFunction(new FetchRevenueTool());
        this.registerFunction(new FetchUnitsTool());
        this.registerFunction(new FetchTenantsTool());
    }

}


export function createMalStreamAgent(config: Configuration): MalStreamAgent {
    return new MalStreamAgent(config);
}


export default MalStreamAgent;