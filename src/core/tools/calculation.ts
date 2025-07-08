/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { SchemaValidator } from '../utils/schemaValidator';
import { BaseTool } from './tools';
import type { ToolResult } from './tools';


/**
 * Parameters for the calculation tool
 */
export interface CalculationParams {
    a: number
    b: number
    operation: string
}

/**
 * Tool for performing mathematical calculations
 * Supports basic arithmetic operations with proper order of operations
 */
export class CalculationTool extends BaseTool<CalculationParams, ToolResult> {
    constructor() {
        super(
            'calculation',
            'Calculator',
            'Perform basic mathematical calculations',
            {
                type: 'object',
                properties: {
                    a: {
                        type: 'number',
                        description: 'First number'
                    },
                    b: {
                        type: 'number',
                        description: 'Second number'
                    },
                    operation: {
                        type: 'string',
                        enum: ['add', 'subtract', 'multiply', 'divide'],
                        description: 'The mathematical operation to perform'
                    },
                },
                required: ['a', 'b', 'operation']
            },
            true, // isOutputMarkdown
            false // canUpdateOutput
        );
    }

    /**
     * Validates the calculation parameters
     */
    override validateToolParams(params: CalculationParams): string | null {

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
     * Gets a description of what the calculation will do
     */
    override getDescription(params: CalculationParams): string {

        return `Calculate ${params.a} ${params.operation} ${params.b}`;
    }

    /**
     * Executes the calculation
     */
    async execute(
        params: CalculationParams,
        updateOutput: (output: string) => void = () => { }
    ): Promise<ToolResult> {
        // Validate parameters
        const validationError = this.validateToolParams(params);
        if (validationError) {
            throw new Error(validationError);
        }
        let result: number = 0
        const { operation, a, b } = params;

        updateOutput(`calculating ${a} ${operation} ${b} `)

        try {
            switch (operation) {
                case 'add':
                    result = a + b;
                    break;
                case 'subtract':
                    result = a - b;
                    break;
                case 'multiply':
                    result = a * b;
                    break;
                case 'divide':
                    if (b === 0) throw new Error('Division by zero');
                    result = a / b;
                    break;
                default:
                    throw new Error(`Unknown operation: ${operation}`);
            }


            return {
                llmContent: `Calculation result: ${result}`,
                returnDisplay: `## Calculation Result\n\n**Expression:** \`${a} ${operation} ${b}\`\n\n**Result:** ${result}`
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown calculation error';
            const llmContent = `Calculation failed: ${errorMessage}`;
            const displayContent = `## Calculation Error\n\n**Expression:** \`${a} ${operation} ${b}\`\n\n**Error:** ${errorMessage}`;

            return {
                llmContent,
                returnDisplay: displayContent
            };
        }


    }
}


/**
 * Factory function to create a new CalculationTool instance
 */
export function createCalculationTool(): CalculationTool {
    return new CalculationTool();
}