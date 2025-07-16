/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchemaValidator } from '../../utils/schemaValidator';
import { BaseTool } from '../tools';
import type { ToolResult } from '../tools';


/**
 * Parameters for the fetch units tool
 */
export interface FetchUnitsParams {
}

/**
 * Tool for fetching unit information
 * Retrieves unit data including availability, details, and status from the real estate management system
 */
export class FetchUnitsTool extends BaseTool<FetchUnitsParams, ToolResult> {
    constructor() {
        super(
            'fetch_units',
            'Fetch Units',
            'Fetch unit information including availability, details, and status from the real estate management system',
            {},
            true, // isOutputMarkdown
            false // canUpdateOutput
        );
    }

    /**
     * Validates the fetch units parameters
     */
    override validateToolParams(params: FetchUnitsParams): string | null {

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
     * Gets a description of what the fetch units operation will do
     */
    override getDescription(params: FetchUnitsParams): string {

        return `Fetch unit information including availability and details`;
    }

    /**
     * Executes the fetch units operation
     */
    async execute(
        params: FetchUnitsParams,
        updateOutput: (output: string) => void = () => { }
    ): Promise<ToolResult> {
        // Validate parameters
        const validationError = this.validateToolParams(params);
        if (validationError) {
            throw new Error(validationError);
        }


        updateOutput(`Loading unit information`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock units response data
        const mockUnitsData = {
            units: [
                {
                    unit_id: "UNIT-001",
                    property_id: "PROP-001",
                    property_name: "Sunset Apartments",
                    unit_number: "101",
                    bedrooms: 2,
                    bathrooms: 1,
                    square_feet: 850,
                    rent: 1800,
                    status: "Occupied",
                    lease_end_date: "2024-08-31"
                },
                {
                    unit_id: "UNIT-002",
                    property_id: "PROP-001",
                    property_name: "Sunset Apartments",
                    unit_number: "102",
                    bedrooms: 1,
                    bathrooms: 1,
                    square_feet: 650,
                    rent: 1400,
                    status: "Available",
                    lease_end_date: null
                },
                {
                    unit_id: "UNIT-003",
                    property_id: "PROP-002",
                    property_name: "Downtown Plaza",
                    unit_number: "301",
                    bedrooms: 3,
                    bathrooms: 2,
                    square_feet: 1200,
                    rent: 2800,
                    status: "Occupied",
                    lease_end_date: "2024-12-15"
                },
                {
                    unit_id: "UNIT-004",
                    property_id: "PROP-003",
                    property_name: "Garden View Complex",
                    unit_number: "A5",
                    bedrooms: 2,
                    bathrooms: 2,
                    square_feet: 950,
                    rent: 2100,
                    status: "Maintenance",
                    lease_end_date: null
                }
            ],
            summary: {
                total_units: 4,
                occupied: 2,
                available: 1,
                maintenance: 1
            }
        };

        updateOutput("Unit information loaded successfully");

        return {
            llmContent: JSON.stringify(mockUnitsData),
            returnDisplay: `Found ${mockUnitsData.units.length} units. Available: ${mockUnitsData.summary.available}, Occupied: ${mockUnitsData.summary.occupied}, Maintenance: ${mockUnitsData.summary.maintenance}`
        };
    }
}


/**
 * Factory function to create a new FetchUnitsTool instance
 */
export function createFetchUnitsTool(): FetchUnitsTool {
    return new FetchUnitsTool();
}