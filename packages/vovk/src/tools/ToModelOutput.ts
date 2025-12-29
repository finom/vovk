import { toModelOutputDefault } from './toModelOutputDefault';
import { toModelOutputMCP } from './toModelOutputMCP';

/**
 * Collection of functions to convert model outputs into different formats.
 * @see https://vovk.dev/tools
 */
export const ToModelOutput = {
  DEFAULT: toModelOutputDefault,
  MCP: toModelOutputMCP,
} as const;
