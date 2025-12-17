// WTF https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling toModelOutput

/*
ToModelOutput.MCP DONE
ToModelOutput.CLAUDE
ToModelOutput.DEFAULT DONE

MCP additions:

- structuredContent DONE
- image/audio via Response
- req.vovk.fileToResponse(file, opts)
- resource/resource_link ??? NO
- outputSchema - createLLMTool outputSchema + deriveLLMTools output
- annotations - add to req.vovk.meta({ mcpOutput: ... }) - how to get req?
- isError: boolean
- create createLLMTool fabric
- remove mcp option from tool
- x-tool-disable => hidden
- rename createLLMTool to createTool
- rename deriveLLMTools to deriveTools
- Rename VovkLLMTool to VovkTool
- Think of https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#preliminary-tool-results
- Think of https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools

MAJOR (fork v2 first for repo, docs, examples):
Remove vovk-zod, vovk-dto, vovk-yup with tests (incl pu, and rs), examples and docs
Remove vovk-dto from installation
Support standard schema only everywhere

Docs: 
remove nestjs stuff, simplify validation docs

*/
