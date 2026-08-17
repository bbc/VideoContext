/**
 * Shared types for VideoContext node definitions.
 */

declare global {
    interface Window {
        __VIDEOCONTEXT_REFS__?: Record<string, unknown>;
        webkitURL?: typeof URL;
    }
}

export type PropertyValue = number | number[] | HTMLImageElement;

export interface IDefinitionProperty {
    type: string;
    value: PropertyValue;
}

export interface IDefinition {
    title?: string;
    description?: string;
    vertexShader: string;
    fragmentShader: string;
    properties: Record<string, IDefinitionProperty>;
    inputs: string[];
}
