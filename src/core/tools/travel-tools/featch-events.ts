/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { SchemaValidator } from '../../utils/schemaValidator';
import { BaseTool } from '../tools';
import type { ToolResult } from '../tools';
import { zodResponseFormat } from 'openai/helpers/zod.js';
import { fetchChatCompletion } from '../../utils/perplexity-api';


/**
 * Parameters for the fetch events tool
 */
export interface FetchEventsParams {
    location: string;
    date?: string;
    category?: string;
}

/**
 * Tool for fetching events
 * Retrieves events from various sources based on location, date, and category
 */
export class FetchEventsTool extends BaseTool<FetchEventsParams, ToolResult> {
    constructor() {
        super(
            'fetch_things',
            'Fetch Things',
            'Fetch things to do based on location, date, and category',
            {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description: 'Location to search for events'
                    },
                    date: {
                        type: 'string',
                        description: 'Date to search for events (YYYY-MM-DD format)'
                    },
                    category: {
                        type: 'string',
                        description: 'Category of events (e.g., music, sports, arts)'
                    }
                },
                required: ['location']
            },
            true, // isOutputMarkdown
            false // canUpdateOutput
        );
    }

    /**
     * Validates the fetch events parameters
     */
    override validateToolParams(params: FetchEventsParams): string | null {

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

    /**
     * Gets a description of what the fetch events operation will do
     */
    override getDescription(params: FetchEventsParams): string {
        const location = params.location || 'any location';
        const date = params.date || 'any date';
        const category = params.category || 'any category';
        return `Fetch events in ${location} on ${date} for ${category}`;
    }

    /**
     * Executes the fetch events operation
     */
    async execute(
        params: FetchEventsParams,
        updateOutput: (output: string) => void = () => { }
    ): Promise<ToolResult> {
        // Validate parameters
        const validationError = this.validateToolParams(params);
        if (validationError) {
            throw new Error(validationError);
        }

        const { location, date } = params;

        // Build the base prompt for events query
        let basePrompt = `Find events`;

        basePrompt += ` in ${location}`;


        // Add date if specified
        if (date) {
            basePrompt += ` on ${date}`;
        } else {
            basePrompt += ` today`;
        }

        // Add category if specified
        if (params.category) {
            basePrompt += ` in the ${params.category} category`;
        }

        // Add specific requirements for the events
        basePrompt += `. For each event, provide the name, time, venue, and a brief description. Please format the response as structured data.`;

        const Events = z.object({
            name: z.string(),
            time: z.string(),
            venue: z.string(),
            description: z.string(),
        });

        const EventsResponse = z.object({
            events: z.array(Events),
        });


        updateOutput(`Fetching events for ${params.location}...`)


        type ResponseFormatJSONSchema = z.infer<typeof EventsResponse>;
        const RESPONSE_SCHEMA = zodResponseFormat(EventsResponse, "events");
        let data = await fetchChatCompletion<ResponseFormatJSONSchema>(RESPONSE_SCHEMA, basePrompt)



        updateOutput("Events data loaded successfully");

        return {
            llmContent: JSON.stringify(data),
            returnDisplay: `We found ${data.events.length} events for ${params.location} `
        }
    }
}


/**
 * Factory function to create a new FetchEventsTool instance
 */
export function createFetchEventsTool(): FetchEventsTool {
    return new FetchEventsTool();
}