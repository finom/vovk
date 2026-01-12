import { toModelOutputDefault } from './toModelOutputDefault.js';
import { toModelOutputMCP } from './toModelOutputMCP.js';

/**
 * Collection of functions to convert model outputs into different formats.
 * @see https://vovk.dev/tools
 */
export const ToModelOutput = {
  DEFAULT: toModelOutputDefault,
  MCP: toModelOutputMCP,
} as const;
