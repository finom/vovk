import { toModelOutputDefault } from './toModelOutputDefault';
import { toModelOutputMCP } from './toModelOutputMCP';

export const ToModelOutput = {
  DEFAULT: toModelOutputDefault,
  MCP: toModelOutputMCP,
} as const;
