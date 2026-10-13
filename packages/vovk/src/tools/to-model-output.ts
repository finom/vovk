import { toModelOutputDefault } from './to-model-output-default.js';
import { toModelOutputMCP } from './to-model-output-mcp.js';
import { toModelOutputRaw } from './to-model-output-raw.js';

/**
 * Collection of functions to convert model outputs into different formats.
 * @see https://vovk.dev/tools
 */
export const ToModelOutput = {
  DEFAULT: toModelOutputDefault,
  MCP: toModelOutputMCP,
  RAW: toModelOutputRaw,
} as const;
