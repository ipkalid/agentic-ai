/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchemaValidator } from '../../utils/schemaValidator';
import { BaseTool } from '../tools';
import type { ToolResult } from '../tools';


/**
 * Parameters for the fetch requests tool
 */
export interface FetchRequestsParams {
}

/**
 * Tool for fetching HR requests
 * Retrieves various types of HR requests from the system
 */
export class FetchRequestTool extends BaseTool<FetchRequestsParams, ToolResult> {
    constructor() {
        super(
            'fetch_requests',
            'Fetch Requests',
            'Fetch HR requests from the system',
            {},
            true, // isOutputMarkdown
            false // canUpdateOutput
        );
    }

    /**
     * Validates the fetch requests parameters
     */
    override validateToolParams(params: FetchRequestsParams): string | null {

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
     * Gets a description of what the fetch requests operation will do
     */
    override getDescription(params: FetchRequestsParams): string {

        return `Fetch HR requests`;
    }

    /**
     * Executes the fetch requests operation
     */
    async execute(
        params: FetchRequestsParams,
        updateOutput: (output: string) => void = () => { }
    ): Promise<ToolResult> {
        // Validate parameters
        const validationError = this.validateToolParams(params);
        if (validationError) {
            throw new Error(validationError);
        }


        updateOutput(`loading requests`)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock response data
        const mockRequests = {
            requests: [
                {
                    request_type: "Vacation",
                    request_id: "VAC-001",
                    request_desc: "Annual leave request for summer vacation",
                    dueDate: "2024-07-15"
                },
                {
                    request_type: "Equipment",
                    request_id: "EQP-002",
                    request_desc: "New laptop request",
                    dueDate: "2024-04-30"
                },
                {
                    request_type: "Training",
                    request_id: "TRN-003",
                    request_desc: "Professional development course registration",
                    dueDate: "2024-05-20"
                }
            ]
        };

        updateOutput("Requests loaded successfully");

        return {
            llmContent: JSON.stringify(mockRequests),
            returnDisplay: `found ${mockRequests.requests.length} requests`
        }




    }
}


/**
 * Factory function to create a new FetchRequestTool instance
 */
export function createFetchRequestTool(): FetchRequestTool {
    return new FetchRequestTool();
}