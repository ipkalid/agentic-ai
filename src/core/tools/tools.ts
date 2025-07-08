/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { FunctionDefinition, FunctionParameters } from "openai/resources";




export interface Tool<
    TParams = unknown,
    TResult extends ToolResult = ToolResult,
> {

    name: string;


    displayName: string;


    description: string;


    schema: FunctionDefinition;


    isOutputMarkdown: boolean;


    canUpdateOutput: boolean;


    validateToolParams(params: TParams): string | null;


    getDescription(params: TParams): string;


    shouldConfirmExecute(
        params: TParams,
    ): Promise<ToolCallConfirmationDetails | false>;


    execute(
        params: TParams,
        updateOutput?: (output: string) => void,
    ): Promise<TResult>;
}

/**
 * Base implementation for tools with common functionality
 */
export abstract class BaseTool<
    TParams = unknown,
    TResult extends ToolResult = ToolResult,
> implements Tool<TParams, TResult> {
    /**
     * Creates a new instance of BaseTool
     * @param name Internal name of the tool (used for API calls)
     * @param displayName User-friendly display name of the tool
     * @param description Description of what the tool does
     * @param isOutputMarkdown Whether the tool's output should be rendered as markdown
     * @param canUpdateOutput Whether the tool supports live (streaming) output
     * @param parameterSchema JSON Schema defining the parameters
     */
    constructor(
        readonly name: string,
        readonly displayName: string,
        readonly description: string,
        readonly parameterSchema: Record<string, unknown>,
        readonly isOutputMarkdown: boolean = true,
        readonly canUpdateOutput: boolean = false,
    ) { }

    /**
     * Function declaration schema computed from name, description, and parameterSchema
     */
    get schema(): FunctionDefinition {
        return {
            name: this.name,
            description: this.description,
            parameters: this.parameterSchema as FunctionParameters,
        };
    }



    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validateToolParams(params: TParams): string | null {
        // Implementation would typically use a JSON Schema validator
        // This is a placeholder that should be implemented by derived classes
        return null;
    }


    getDescription(params: TParams): string {
        return JSON.stringify(params);
    }


    shouldConfirmExecute(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        params: TParams,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ): Promise<ToolCallConfirmationDetails | false> {
        return Promise.resolve(false);
    }


    abstract execute(
        params: TParams,
        updateOutput?: (output: string) => void,
    ): Promise<TResult>;
}

export interface ToolResult {

    llmContent: string;


    returnDisplay: string;
}



export interface ToolCallConfirmationDetails {
    type: 'exec';
    title: string;
    onConfirm: (outcome: ToolConfirmationOutcome) => Promise<void>;
    command: string;
    rootCommand: string;
}


export enum ToolConfirmationOutcome {
    Proceed = 'proceed',
    Cancel = 'cancel',
}
