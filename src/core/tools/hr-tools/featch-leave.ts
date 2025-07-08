/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchemaValidator } from '../../utils/schemaValidator';
import { BaseTool } from '../tools';
import type { ToolResult } from '../tools';


/**
 * Parameters for the fetch leave tool
 */
export interface FetchLeaveParams {
}

/**
 * Tool for fetching leave requests
 * Retrieves leave-related requests from the HR system
 */
export class FetchLeaveTool extends BaseTool<FetchLeaveParams, ToolResult> {
    constructor() {
        super(
            'fetch_leave',
            'Fetch Leave',
            'Fetch leave requests from the HR system',
            {},
            true, // isOutputMarkdown
            false // canUpdateOutput
        );
    }

    /**
     * Validates the fetch leave parameters
     */
    override validateToolParams(params: FetchLeaveParams): string | null {

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
     * Gets a description of what the fetch leave operation will do
     */
    override getDescription(params: FetchLeaveParams): string {

        return `Fetch leave requests`;
    }

    /**
     * Executes the fetch leave operation
     */
    async execute(
        params: FetchLeaveParams,
        updateOutput: (output: string) => void = () => { }
    ): Promise<ToolResult> {
        // Validate parameters
        const validationError = this.validateToolParams(params);
        if (validationError) {
            throw new Error(validationError);
        }


        updateOutput(`loading leave requests`)

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock leave response data
        const mockLeaveRequests = {
            leaveRequests: [
                {
                    leave_type: "Annual Leave",
                    request_id: "LEAVE-001",
                    employee_name: "John Doe",
                    start_date: "2024-07-15",
                    end_date: "2024-07-25",
                    status: "Pending",
                    days_requested: 10
                },
                {
                    leave_type: "Sick Leave",
                    request_id: "LEAVE-002",
                    employee_name: "Jane Smith",
                    start_date: "2024-04-20",
                    end_date: "2024-04-22",
                    status: "Approved",
                    days_requested: 3
                },
                {
                    leave_type: "Maternity Leave",
                    request_id: "LEAVE-003",
                    employee_name: "Sarah Johnson",
                    start_date: "2024-06-01",
                    end_date: "2024-09-01",
                    status: "Approved",
                    days_requested: 90
                }
            ]
        };

        updateOutput("Leave requests loaded successfully");

        return {
            llmContent: JSON.stringify(mockLeaveRequests),
            returnDisplay: `found ${mockLeaveRequests.leaveRequests.length} leave requests`
        }




    }
}


/**
 * Factory function to create a new FetchLeaveTool instance
 */
export function createFetchLeaveTool(): FetchLeaveTool {
    return new FetchLeaveTool();
}