/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchemaValidator } from '../../utils/schemaValidator';
import { BaseTool } from '../tools';
import type { ToolResult } from '../tools';
import { fetchChatCompletion } from '../../utils/perplexity-api';
import z from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod.js';


/**
 * Parameters for the fetch weather tool
 */
export interface FetchWeatherParams {
    location: string;
    date?: string;
}

/**
 * Tool for fetching weather information
 * Retrieves weather data for a specified location and date
 */
export class FetchWeatherTool extends BaseTool<FetchWeatherParams, ToolResult> {
    constructor() {
        super(
            'fetch_weather',
            'Fetch Weather',
            'Fetch weather information for a specified location',
            {
                type: 'object',
                properties: {
                    location: {
                        type: 'string',
                        description: 'Location to get weather for (city)'
                    },
                    date: {
                        type: 'string',
                        description: 'Date for weather forecast (YYYY-MM-DD format, optional)'
                    },
                    units: {
                        type: 'string',
                        enum: ['metric', 'imperial'],
                        description: 'Temperature units (metric for Celsius, imperial for Fahrenheit)'
                    }
                },
                required: ['location']
            },
            true, // isOutputMarkdown
            false // canUpdateOutput
        );
    }

    /**
     * Validates the fetch weather parameters
     */
    override validateToolParams(params: FetchWeatherParams): string | null {
        if (!params.location || params.location.trim() === '') {
            return 'Location is required and cannot be empty.';
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

    /**
     * Gets a description of what the fetch weather operation will do
     */
    override getDescription(params: FetchWeatherParams): string {
        return `Fetch weather information for ${params.location}${params.date ? ` on ${params.date}` : ''}`;
    }

    /**
     * Executes the fetch weather operation
     */
    async execute(
        params: FetchWeatherParams,
        updateOutput: (output: string) => void = () => { }
    ): Promise<ToolResult> {
        // Validate parameters
        const validationError = this.validateToolParams(params);
        if (validationError) {
            throw new Error(validationError);
        }

        const { location, date } = params;

        let prompt = date ? `what is the weather in ${location} on ${date}` : `what is the weather in ${location} today`

        const weatherResponse = z.object({
            temperature: z.number().describe('current temperature'),
            feels_like: z.number().describe('current feels like temperature'),
            condition: z.string().describe('current condition'),
        }).strict(); // strict() ensures no additional properties are allowed

        type ResponseFormatJSONSchema = z.infer<typeof weatherResponse>;
        const RESPONSE_SCHEMA = zodResponseFormat(weatherResponse, "weather_data");
        let data = await fetchChatCompletion<ResponseFormatJSONSchema>(RESPONSE_SCHEMA, prompt)

        updateOutput(`Fetching weather data for ${params.location}...`)
        await new Promise(resolve => setTimeout(resolve, 1000));

        updateOutput("Weather data loaded successfully");

        return {
            llmContent: JSON.stringify(data),
            returnDisplay: `Weather for ${params.location}: ${data.temperature}, ${data.condition}`
        }
    }
}


/**
 * Factory function to create a new FetchWeatherTool instance
 */
export function createFetchWeatherTool(): FetchWeatherTool {
    return new FetchWeatherTool();
}