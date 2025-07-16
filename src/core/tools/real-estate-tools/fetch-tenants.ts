/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchemaValidator } from '../../utils/schemaValidator';
import { BaseTool } from '../tools';
import type { ToolResult } from '../tools';


/**
 * Parameters for the fetch tenants tool
 */
export interface FetchTenantsParams {
}

/**
 * Tool for fetching tenant information
 * Retrieves tenant data including lease details and contact information from the real estate management system
 */
export class FetchTenantsTool extends BaseTool<FetchTenantsParams, ToolResult> {
    constructor() {
        super(
            'fetch_tenants',
            'Fetch Tenants',
            'Fetch tenant information including lease details and contact information from the real estate management system',
            {},
            true, // isOutputMarkdown
            false // canUpdateOutput
        );
    }

    /**
     * Validates the fetch tenants parameters
     */
    override validateToolParams(params: FetchTenantsParams): string | null {

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
     * Gets a description of what the fetch tenants operation will do
     */
    override getDescription(params: FetchTenantsParams): string {

        return `Fetch tenant information including lease details and contact information`;
    }

    /**
     * Executes the fetch tenants operation
     */
    async execute(
        params: FetchTenantsParams,
        updateOutput: (output: string) => void = () => { }
    ): Promise<ToolResult> {
        // Validate parameters
        const validationError = this.validateToolParams(params);
        if (validationError) {
            throw new Error(validationError);
        }


        updateOutput(`Loading tenant information`);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock tenants response data
        const mockTenantsData = {
            tenants: [
                {
                    tenant_id: "TENANT-001",
                    name: "Michael Johnson",
                    email: "michael.johnson@email.com",
                    phone: "+1-555-0123",
                    unit_id: "UNIT-001",
                    unit_number: "101",
                    property_name: "Sunset Apartments",
                    lease_start: "2023-09-01",
                    lease_end: "2024-08-31",
                    monthly_rent: 1800,
                    security_deposit: 3600,
                    status: "Active"
                },
                {
                    tenant_id: "TENANT-002",
                    name: "Sarah Williams",
                    email: "sarah.williams@email.com",
                    phone: "+1-555-0456",
                    unit_id: "UNIT-003",
                    unit_number: "301",
                    property_name: "Downtown Plaza",
                    lease_start: "2023-01-15",
                    lease_end: "2024-12-15",
                    monthly_rent: 2800,
                    security_deposit: 5600,
                    status: "Active"
                },
                {
                    tenant_id: "TENANT-003",
                    name: "David Chen",
                    email: "david.chen@email.com",
                    phone: "+1-555-0789",
                    unit_id: "UNIT-004",
                    unit_number: "A5",
                    property_name: "Garden View Complex",
                    lease_start: "2023-06-01",
                    lease_end: "2024-05-31",
                    monthly_rent: 2100,
                    security_deposit: 4200,
                    status: "Notice Given"
                }
            ],
            summary: {
                total_tenants: 3,
                active_leases: 2,
                expiring_soon: 1,
                total_monthly_rent: 6700
            }
        };

        updateOutput("Tenant information loaded successfully");

        return {
            llmContent: JSON.stringify(mockTenantsData),
            returnDisplay: `Found ${mockTenantsData.tenants.length} tenants. Active leases: ${mockTenantsData.summary.active_leases}, Total monthly rent: $${mockTenantsData.summary.total_monthly_rent.toLocaleString()}`
        };
    }
}


/**
 * Factory function to create a new FetchTenantsTool instance
 */
export function createFetchTenantsTool(): FetchTenantsTool {
    return new FetchTenantsTool();
}