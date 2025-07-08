/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */



import z from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod.js';
import { SchemaValidator } from '../utils/schemaValidator';
import { fetchChatCompletion } from '../utils/perplexity-api';
import { BaseTool, ToolResult } from './tools';


/**
 * Parameters for the fetch weather tool
 */
export interface WebSearchParams {
    query: string;
}

/**
 * Tool for fetching weather information
 * Retrieves weather data for a specified location and date
 */
export class WebSearchTool extends BaseTool<WebSearchParams, ToolResult> {
    constructor() {
        super(
            'web_search',
            'Web Search',
            'Performs a web search using Perplexity Search and returns the results. This tool is useful for finding information on the internet based on a query.',
            {
                type: 'object',
                properties: {
                    query: {
                        type: 'string',
                        description: 'The search query to find information on the web.',
                    },
                },
                required: ['query']
            },
            true, // isOutputMarkdown
            false // canUpdateOutput
        );
    }

    /**
     * Validates the fetch weather parameters
     */
    override validateToolParams(params: WebSearchParams): string | null {
        if (!params.query || params.query.trim() === '') {
            return 'Query is required and cannot be empty.';
        }

        if (
            this.schema.parameters &&
            !SchemaValidator.validate(
                this.schema.parameters as Record<string, unknown>,
                params,
            )
        ) {
            return 'Parameters failed schema validation.';
        }

        return null;
    }


    override getDescription(params: WebSearchParams): string {
        return `Searching the web for: "${params.query}"`;
    }

    /**
     * Executes the fetch weather operation
     */
    async execute(
        params: WebSearchParams,
        updateOutput: (output: string) => void = () => { }
    ): Promise<ToolResult> {
        // Validate parameters
        const validationError = this.validateToolParams(params);
        if (validationError) {
            throw new Error(validationError);
        }
        const { query } = params;

        let prompt = query

        updateOutput(`searching for ${query}...`)

        const Sources = z.object({
            name: z.string(),

        });

        const Response = z.object({
            search_data: z.string(),
            sources: z.array(Sources),
        });



        type ResponseFormatJSONSchema = z.infer<typeof Response>;
        const RESPONSE_SCHEMA = zodResponseFormat(Response, "search_data");
        let data = await fetchChatCompletion<ResponseFormatJSONSchema>(RESPONSE_SCHEMA, prompt)

        updateOutput("Search results loaded successfully");

        return {
            llmContent: JSON.stringify(data),
            returnDisplay: `Search results for ${query}: ${data.search_data}`
        }
    }
}


/**
 * Factory function to create a new FetchWeatherTool instance
 */
export function createWebSearchTool(): WebSearchTool {
    return new WebSearchTool();
}