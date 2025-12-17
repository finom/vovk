// WTF https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling toModelOutput

/*
- ToModelOutput.CLAUDE
- req.vovk.fileToResponse(file, opts)
- outputSchema - createTool outputSchema + deriveTools output (TEST?)
- annotations - add to req.vovk.meta({ mcpOutput: ... }) - how to get req?
- x-tool-disable => hidden
- Think of https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling#preliminary-tool-results
- Think of https://ai-sdk.dev/docs/ai-sdk-core/mcp-tools

MAJOR (fork v2 first for repo, docs, examples):
Remove vovk-zod, vovk-dto, vovk-yup with tests (incl pu, and rs), examples and docs
Remove vovk-dto from installation
Support standard schema only everywhere

Docs: 
remove nestjs stuff, simplify validation docs

*/
