# Agentic AI Framework Documentation

This document provides comprehensive guidance on creating custom agents and tools within the Agentic AI framework.

## Table of Contents

- [Framework Overview](#framework-overview)
- [Creating Custom Agents](#creating-custom-agents)
- [Creating Custom Tools](#creating-custom-tools)
- [Agent Configuration](#agent-configuration)
- [Tool Integration](#tool-integration)
- [Best Practices](#best-practices)
- [Examples](#examples)

## Framework Overview

The Agentic AI framework is built on a modular architecture that separates concerns between agents (AI personalities) and tools (functional capabilities). This design allows for:

- **Reusable Components**: Tools can be shared across multiple agents
- **Type Safety**: Full TypeScript support with proper interfaces
- **Extensibility**: Easy to add new agents and tools
- **Maintainability**: Clear separation of concerns

### Core Components

- **BaseAgent**: Foundation class for all AI agents
- **BaseTool**: Foundation class for all tools
- **Client**: OpenAI API client wrapper
- **Configuration**: Centralized configuration management

## Creating Custom Agents

### Basic Agent Structure

All agents extend the `BaseAgent` class and follow this pattern:

```typescript
import { BaseAgent, type AgentConfig } from './agent';
import { Client } from '../core/client';
import type { Configuration } from '../core/config';

export class CustomAgent extends BaseAgent {
    constructor(config: Configuration) {
        const defaultConfig: AgentConfig = {
            name: 'Custom Agent',
            model: 'gpt-4',
            temperature: 0.7,
            maxTokens: 2000,
            systemPrompt: `Your custom system prompt here...`,
            ...config
        };

        super(new Client(config), defaultConfig);
        this.registerTools();
    }

    private registerTools(): void {
        // Register tools specific to this agent
    }
}
```

### Agent Configuration Options

```typescript
interface AgentConfig {
    name: string;                    // Agent display name
    model?: string;                  // OpenAI model (default: 'gpt-4')
    temperature?: number;            // Creativity level (0-1)
    maxTokens?: number;              // Response length limit
    systemPrompt?: string;           // Agent personality/instructions
    maxHistoryTokens?: number;       // Conversation history limit
}
```

### System Prompt Guidelines

A good system prompt should:
- Define the agent's role and personality
- Specify behavioral guidelines
- Include relevant context or constraints
- Be clear and concise

Example:
```typescript
systemPrompt: `You are a helpful Customer Support Agent. Your goal is to assist customers with their inquiries professionally and efficiently.

You should be:
- **Professional and Courteous**: Always maintain a respectful tone
- **Solution-Oriented**: Focus on resolving customer issues
- **Knowledgeable**: Provide accurate information about products/services

When you cannot resolve an issue, escalate appropriately and explain next steps.`
```

## Creating Custom Tools

### Basic Tool Structure

All tools extend the `BaseTool` class:

```typescript
import { BaseTool } from './tools';
import type { ToolResult } from './tools';

interface CustomToolParams {
    // Define your tool's input parameters
    input: string;
    options?: string[];
}

export class CustomTool extends BaseTool<CustomToolParams, ToolResult> {
    constructor() {
        super(
            'custom_tool',                    // Internal name
            'Custom Tool',                    // Display name
            'Description of what this tool does', // Description
            {                                 // JSON Schema for parameters
                type: 'object',
                properties: {
                    input: {
                        type: 'string',
                        description: 'Input description'
                    },
                    options: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Optional parameters'
                    }
                },
                required: ['input']
            },
            true,  // isOutputMarkdown
            false  // canUpdateOutput
        );
    }

    async execute(
        params: CustomToolParams,
        updateOutput?: (output: string) => void
    ): Promise<ToolResult> {
        // Implement your tool logic here
        
        return {
            llmContent: 'Content for the LLM',
            returnDisplay: 'Content for user display'
        };
    }
}
```

### Tool Parameter Schema

Use JSON Schema to define tool parameters:

```typescript
{
    type: 'object',
    properties: {
        query: {
            type: 'string',
            description: 'Search query'
        },
        limit: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            description: 'Maximum number of results'
        },
        category: {
            type: 'string',
            enum: ['web', 'news', 'images'],
            description: 'Search category'
        }
    },
    required: ['query']
}
```

### Tool Validation

Implement parameter validation:

```typescript
override validateToolParams(params: CustomToolParams): string | null {
    if (!params.input || params.input.trim().length === 0) {
        return 'Input parameter is required and cannot be empty';
    }
    
    if (params.options && params.options.length > 10) {
        return 'Maximum 10 options allowed';
    }
    
    return null; // No validation errors
}
```

### Tool Output

Tools return a `ToolResult` with two components:

- **llmContent**: Information for the AI model to process
- **returnDisplay**: Formatted content for user display (supports Markdown)

```typescript
return {
    llmContent: `Found ${results.length} items matching "${params.query}"`,
    returnDisplay: `## Search Results\n\n${results.map(r => `- ${r.title}`).join('\n')}`
};
```

## Agent Configuration

### Environment Variables

Configure your agents using environment variables:

```env
# Model Configuration
NEXT_PUBLIC_MODEL=gpt-4
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1

# Tool-specific Configuration
OPENWEATHER_API_KEY=your_weather_api_key
```

### Dynamic Configuration

```typescript
const agentConfig: AgentConfig = {
    name: 'Dynamic Agent',
    model: process.env.NEXT_PUBLIC_MODEL || 'gpt-4',
    temperature: parseFloat(process.env.AGENT_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.MAX_TOKENS || '2000'),
    systemPrompt: getSystemPromptFromConfig()
};
```

## Tool Integration

### Registering Tools with Agents

```typescript
private registerTools(): void {
    // Register individual tools
    this.registerFunction(createWebSearchTool());
    this.registerFunction(createCalculationTool());
    
    // Register multiple tools at once
    this.registerFunctions([
        createCustomTool1(),
        createCustomTool2(),
        createCustomTool3()
    ]);
}
```

### Tool Factory Functions

Create factory functions for tool instantiation:

```typescript
export function createCustomTool(config?: CustomToolConfig): CustomTool {
    return new CustomTool(config);
}
```

### Conditional Tool Registration

```typescript
private registerTools(): void {
    // Always available tools
    this.registerFunction(createCalculationTool());
    
    // Conditional tools based on environment
    if (process.env.OPENWEATHER_API_KEY) {
        this.registerFunction(createWeatherTool());
    }
    
    if (process.env.ENABLE_WEB_SEARCH === 'true') {
        this.registerFunction(createWebSearchTool());
    }
}
```

## Best Practices

### Agent Design

1. **Single Responsibility**: Each agent should have a clear, focused purpose
2. **Descriptive Names**: Use clear, descriptive names for agents and their capabilities
3. **Appropriate Tools**: Only register tools relevant to the agent's domain
4. **System Prompts**: Write clear, specific system prompts that guide behavior

### Tool Design

1. **Input Validation**: Always validate tool parameters
2. **Error Handling**: Provide meaningful error messages
3. **Documentation**: Include clear descriptions and parameter documentation
4. **Performance**: Consider async operations and timeout handling
5. **Security**: Validate inputs to prevent injection attacks

### Code Organization

```
src/core/
├── agents/
│   ├── agent.ts              # Base agent class
│   ├── general-agent.ts      # General purpose agent
│   ├── domain-agent.ts       # Domain-specific agents
│   └── index.ts              # Export all agents
├── tools/
│   ├── tools.ts              # Base tool class
│   ├── category-tools/       # Grouped tools by category
│   │   ├── tool1.ts
│   │   └── tool2.ts
│   └── index.ts              # Export all tools
└── utils/
    ├── validation.ts         # Shared validation utilities
    └── helpers.ts            # Common helper functions
```

## Examples

### Example: Customer Support Agent

```typescript
export class CustomerSupportAgent extends BaseAgent {
    constructor(config: Configuration) {
        const defaultConfig: AgentConfig = {
            name: 'Customer Support',
            model: 'gpt-4',
            temperature: 0.3, // Lower temperature for consistency
            systemPrompt: `You are a professional Customer Support Agent...`
        };
        
        super(new Client(config), defaultConfig);
        this.registerTools();
    }
    
    private registerTools(): void {
        this.registerFunctions([
            createTicketSearchTool(),
            createKnowledgeBaseTool(),
            createEscalationTool()
        ]);
    }
}
```

### Example: Data Analysis Tool

```typescript
export class DataAnalysisTool extends BaseTool<DataAnalysisParams, ToolResult> {
    constructor() {
        super(
            'data_analysis',
            'Data Analyzer',
            'Analyze datasets and generate insights',
            {
                type: 'object',
                properties: {
                    data: {
                        type: 'array',
                        description: 'Dataset to analyze'
                    },
                    analysisType: {
                        type: 'string',
                        enum: ['summary', 'correlation', 'trend'],
                        description: 'Type of analysis to perform'
                    }
                },
                required: ['data', 'analysisType']
            },
            true,
            true // Supports streaming updates
        );
    }
    
    async execute(
        params: DataAnalysisParams,
        updateOutput?: (output: string) => void
    ): Promise<ToolResult> {
        updateOutput?.('Starting data analysis...');
        
        // Perform analysis
        const results = await this.analyzeData(params.data, params.analysisType);
        
        updateOutput?.('Analysis complete!');
        
        return {
            llmContent: `Analysis completed: ${results.summary}`,
            returnDisplay: this.formatResults(results)
        };
    }
}
```

## Advanced Features

### Multi-Agent Conversations

The framework supports multi-agent conversations through the `NextSpeakerChecker` utility:

```typescript
import { checkNextSpeaker } from '../utils/nextSpeakerChecker';

// Determine which agent should respond next
const nextSpeaker = await checkNextSpeaker(
    conversationHistory,
    availableAgents,
    client
);
```

### Streaming Tool Updates

Tools can provide real-time updates during execution:

```typescript
async execute(
    params: ToolParams,
    updateOutput?: (output: string) => void
): Promise<ToolResult> {
    updateOutput?.('Step 1: Initializing...');
    await step1();
    
    updateOutput?.('Step 2: Processing data...');
    await step2();
    
    updateOutput?.('Step 3: Generating results...');
    const results = await step3();
    
    return results;
}
```

### Custom Validation

Implement sophisticated parameter validation:

```typescript
override validateToolParams(params: ToolParams): string | null {
    // Use the schema validator
    if (!SchemaValidator.validate(this.schema.parameters, params)) {
        return 'Parameters failed schema validation';
    }
    
    // Custom business logic validation
    if (params.startDate > params.endDate) {
        return 'Start date must be before end date';
    }
    
    return null;
}
```

This framework provides a solid foundation for building sophisticated AI agents with extensible tool capabilities. Follow these patterns and best practices to create maintainable, scalable agent systems.