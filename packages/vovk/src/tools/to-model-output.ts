import { toModelOutputDefault } from './to-model-output-default.js';
import { toModelOutputMCP } from './to-model-output-mcp.js';

/**
 * Collection of functions to convert model outputs into different formats.
 * @see https://vovk.dev/tools
 */
export const ToModelOutput = {
  DEFAULT: toModelOutputDefault,
  MCP: toModelOutputMCP,
} as const;
