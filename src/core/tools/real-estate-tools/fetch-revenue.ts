/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchemaValidator } from '../../utils/schemaValidator';
import { BaseTool } from '../tools';
import type { ToolResult } from '../tools';


/**
 * Parameters for the fetch revenue tool
 */
export interface FetchRevenueParams {
}

/**
 * Tool for fetching revenue information
 * Retrieves revenue data from properties in the real estate management system
 */
export class FetchRevenueTool extends BaseTool<FetchRevenueParams, ToolResult> {
    constructor() {
        super(
            'fetch_revenue',
            'Fetch Revenue',
            'Fetch revenue information from properties in the real estate management system',
            {},
            true, // isOutputMarkdown
            false // canUpdateOutput
        );
    }

    /**
     * Validates the fetch revenue parameters
     */
    override validateToolParams(params: FetchRevenueParams): string | null {

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
     * Gets a description of what the fetch revenue operation will do
     */
    override getDescription(params: FetchRevenueParams): string {

        return `Fetch revenue information from properties`;
    }

    /**
     * Executes the fetch revenue operation
     */
    async execute(
        params: FetchRevenueParams,
        updateOutput: (output: string) => void = () => { }
    ): Promise<ToolResult> {
        // Validate parameters
        const validationError = this.validateToolParams(params);
        if (validationError) {
            throw new Error(validationError);
        }


        updateOutput(`Loading revenue data`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock revenue response data
        const mockRevenueData = {
            revenueData: [
                {
                    property_id: "PROP-001",
                    property_name: "Sunset Apartments",
                    monthly_revenue: 45000,
                    yearly_revenue: 540000,
                    occupancy_rate: 95,
                    last_updated: "2024-01-15"
                },
                {
                    property_id: "PROP-002",
                    property_name: "Downtown Plaza",
                    monthly_revenue: 78000,
                    yearly_revenue: 936000,
                    occupancy_rate: 88,
                    last_updated: "2024-01-15"
                },
                {
                    property_id: "PROP-003",
                    property_name: "Garden View Complex",
                    monthly_revenue: 32000,
                    yearly_revenue: 384000,
                    occupancy_rate: 92,
                    last_updated: "2024-01-15"
                }
            ],
            totalRevenue: {
                monthly: 155000,
                yearly: 1860000
            }
        };

        updateOutput("Revenue data loaded successfully");

        return {
            llmContent: JSON.stringify(mockRevenueData),
            returnDisplay: `Found revenue data for ${mockRevenueData.revenueData.length} properties. Total monthly revenue: $${mockRevenueData.totalRevenue.monthly.toLocaleString()}`
        };
    }
}


/**
 * Factory function to create a new FetchRevenueTool instance
 */
export function createFetchRevenueTool(): FetchRevenueTool {
    return new FetchRevenueTool();
}