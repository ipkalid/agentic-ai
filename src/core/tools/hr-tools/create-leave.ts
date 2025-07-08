/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchemaValidator } from '../../utils/schemaValidator';
import { BaseTool } from '../tools';
import type { ToolResult } from '../tools';

/**
 * Leave type enumeration
 */
export enum LeaveType {
    SICK_LEAVE = 'sick_leave',
    NORMAL_LEAVE = 'normal_leave'
}

/**
 * Parameters for the create leave tool
 */
export interface CreateLeaveParams {
    startDate: string;
    endDate: string;
    leaveType: LeaveType;
}

/**
 * Tool for creating leave requests
 * Creates new leave requests in the HR system
 */
export class CreateLeaveTool extends BaseTool<CreateLeaveParams, ToolResult> {
    constructor() {
        super(
            'create_leave',
            'Create Leave',
            'Create a new leave request in the HR system',
            {
                type: 'object',
                properties: {
                    startDate: {
                        type: 'string',
                        description: 'Start date of the leave (YYYY-MM-DD format)'
                    },
                    endDate: {
                        type: 'string',
                        description: 'End date of the leave (YYYY-MM-DD format)'
                    },
                    leaveType: {
                        type: 'string',
                        enum: ['sick_leave', 'normal_leave'],
                        description: 'Type of leave request'
                    }
                },
                required: ['startDate', 'endDate', 'leaveType']
            },
            true, // isOutputMarkdown
            false // canUpdateOutput
        );
    }

    /**
     * Validates the create leave parameters
     */
    override validateToolParams(params: CreateLeaveParams): string | null {
        if (
            this.schema.parameters &&
            !SchemaValidator.validate(
                this.schema.parameters as Record<string, unknown>,
                params,
            )
        ) {
            return 'Parameters failed schema validation.';
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(params.startDate)) {
            return 'Start date must be in YYYY-MM-DD format.';
        }
        if (!dateRegex.test(params.endDate)) {
            return 'End date must be in YYYY-MM-DD format.';
        }

        // Validate date logic
        const startDate = new Date(params.startDate);
        const endDate = new Date(params.endDate);
        if (startDate > endDate) {
            return 'Start date cannot be after end date.';
        }

        return null;
    }

    /**
     * Gets a description of what the create leave operation will do
     */
    override getDescription(params: CreateLeaveParams): string {
        return `Create ${params.leaveType.replace('_', ' ')} request from ${params.startDate} to ${params.endDate}`;
    }

    /**
     * Executes the create leave operation
     */
    async execute(
        params: CreateLeaveParams,
        updateOutput: (output: string) => void = () => { }
    ): Promise<ToolResult> {
        // Validate parameters
        const validationError = this.validateToolParams(params);
        if (validationError) {
            throw new Error(validationError);
        }

        updateOutput(`Creating ${params.leaveType.replace('_', ' ')} request...`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Calculate days
        const startDate = new Date(params.startDate);
        const endDate = new Date(params.endDate);
        const timeDiff = endDate.getTime() - startDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

        // Generate request ID
        const requestId = `LEAVE-${Date.now().toString().slice(-6)}`;

        // Mock response data
        const leaveRequest = {
            request_id: requestId,
            leave_type: params.leaveType,
            start_date: params.startDate,
            end_date: params.endDate,
            days_requested: daysDiff,
            status: 'Pending',
            created_at: new Date().toISOString(),
        };

        updateOutput(`Leave request created successfully with ID: ${requestId}`);

        return {
            llmContent: JSON.stringify(leaveRequest),
            returnDisplay: `Leave request ${requestId} created for ${daysDiff} days (${params.startDate} to ${params.endDate})`
        };
    }
}

/**
 * Factory function to create a new CreateLeaveTool instance
 */
export function createCreateLeaveTool(): CreateLeaveTool {
    return new CreateLeaveTool();
}