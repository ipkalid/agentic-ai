import { BaseAgent, type AgentConfig } from './agent';
import { Client } from '../core/client';
import { FetchLeaveTool } from '../tools/hr-tools/featch-leave';
import { FetchRequestTool } from '../tools/hr-tools/featch-requests';
import { CreateLeaveTool } from '../tools/hr-tools/create-leave';
import { ApproveRequestTool } from '../tools/hr-tools/approve-request';
import type { Configuration } from '../core/config';





export class HRAgent extends BaseAgent {
    constructor(config: Configuration) {
        const defaultConfig: AgentConfig = {
            name: 'HR Assistant',
            model: process.env.NEXT_PUBLIC_MODEL || 'gpt-4.1',
            temperature: 0.7,
            maxTokens: 2000,
            systemPrompt: `You are an HR Assistant specialized in helping with human resources tasks. You can:

1. **Fetch Leave Requests**: View and retrieve leave request information
2. **Fetch General Requests**: Access various HR requests and their status
3. **Create Leave Requests**: Help employees submit new leave requests
4. **Approve/Reject Requests**: Process and approve or reject pending requests
5. **Fetch Documents**: View and retrieve documents

You should be professional, helpful, and ensure all HR processes are handled efficiently. Always provide clear information about request statuses, dates, and any required actions.

When helping users:
- Be clear about what information is needed
- Explain the status of requests
- Guide users through the process step by step
- Maintain confidentiality and professionalism
- Provide helpful suggestions for HR-related queries`,
            ...config
        };

        super(new Client(config), defaultConfig);
        this.registerHRTools();
    }


    private registerHRTools(): void {
        this.registerFunction(new FetchLeaveTool());
        this.registerFunction(new FetchRequestTool());

        this.registerFunction(new CreateLeaveTool());
        this.registerFunction(new ApproveRequestTool());
    }

}


export function createHRAgent(config: Configuration): HRAgent {
    return new HRAgent(config);
}


export default HRAgent;