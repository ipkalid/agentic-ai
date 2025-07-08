/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchemaValidator } from '../../utils/schemaValidator';
import { BaseTool } from '../tools';
import type { ToolResult } from '../tools';

/**
 * Action enumeration for request approval
 */
export enum ApprovalAction {
    APPROVE = 'approve',
    REJECT = 'reject'
}

/**
 * Parameters for the approve request tool
 */
export interface ApproveRequestParams {
    itemId: string;
    action: ApprovalAction;
}

/**
 * Tool for approving or rejecting requests
 * Processes approval actions for HR requests in the system
 */
export class ApproveRequestTool extends BaseTool<ApproveRequestParams, ToolResult> {
    constructor() {
        super(
            'approve_request',
            'Approve Request',
            'Approve or reject HR requests in the system',
            {
                type: 'object',
                properties: {
                    itemId: {
                        type: 'string',
                        description: 'The ID of the request to approve or reject'
                    },
                    action: {
                        type: 'string',
                        enum: ['approve', 'reject'],
                        description: 'Action to take on the request'
                    }
                },
                required: ['itemId', 'action']
            },
            true, // isOutputMarkdown
            false // canUpdateOutput
        );
    }

    /**
     * Validates the approve request parameters
     */
    override validateToolParams(params: ApproveRequestParams): string | null {
        if (
            this.schema.parameters &&
            !SchemaValidator.validate(
                this.schema.parameters as Record<string, unknown>,
                params,
            )
        ) {
            return 'Parameters failed schema validation.';
        }

        // Validate item ID format
        if (!params.itemId || params.itemId.trim().length === 0) {
            return 'Item ID cannot be empty.';
        }

        // Validate action
        if (!Object.values(ApprovalAction).includes(params.action)) {
            return 'Action must be either "approve" or "reject".';
        }

        return null;
    }

    /**
     * Gets a description of what the approve request operation will do
     */
    override getDescription(params: ApproveRequestParams): string {
        return `${params.action.charAt(0).toUpperCase() + params.action.slice(1)} request ${params.itemId}`;
    }

    /**
     * Executes the approve request operation
     */
    async execute(
        params: ApproveRequestParams,
        updateOutput: (output: string) => void = () => { }
    ): Promise<ToolResult> {
        // Validate parameters
        const validationError = this.validateToolParams(params);
        if (validationError) {
            throw new Error(validationError);
        }

        updateOutput(`Processing ${params.action} action for request ${params.itemId}...`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Mock response data
        const approvalResult = {
            request_id: params.itemId,
            action: params.action,
            status: params.action === ApprovalAction.APPROVE ? 'Approved' : 'Rejected',
            processed_at: new Date().toISOString(),
            processed_by: 'MANAGER-001', // Mock manager ID
            comments: params.action === ApprovalAction.APPROVE
                ? 'Request has been approved successfully'
                : 'Request has been rejected'
        };

        const actionText = params.action === ApprovalAction.APPROVE ? 'approved' : 'rejected';
        updateOutput(`Request ${params.itemId} has been ${actionText} successfully`);

        return {
            llmContent: JSON.stringify(approvalResult),
            returnDisplay: `Request ${params.itemId} has been ${actionText}`
        };
    }
}

/**
 * Factory function to create a new ApproveRequestTool instance
 */
export function createApproveRequestTool(): ApproveRequestTool {
    return new ApproveRequestTool();
}