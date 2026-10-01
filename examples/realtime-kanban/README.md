<p align="center">
  <a href="https://vovk.dev">
    <picture>
      <source width="300" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/vovk-logo-white.svg">
      <source width="300" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/vovk-logo.svg">
      <img width="300" alt="vovk" src="https://vovk.dev/vovk-logo.svg">
    </picture>
  </a>
  <br>
  <strong>Back-end Framework for Next.js App Router</strong>
  <br />
  <em>One codebase → type-safe clients, OpenAPI, and AI tools</em>
  <br />
  <a href="https://vovk.dev/">Documentation</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/quick-install">Quick Start</a>
  &nbsp;&nbsp;
  <a href="https://vovk.dev/performance">Performance</a>
</p>

---

## realtime-kanban

A proof-of-concept app showing how to build a live-updating UI with Vovk.ts and a grab-bag of AI features — an MCP server, OpenAI function calling, a voice interface, and a Telegram bot.

The project and its idea explained in the series of articles at [Vovk.ts documentation](https://vovk.dev/realtime-ui):

<picture>
  <source width="100%" media="(prefers-color-scheme: dark)" srcset="https://vovk.dev/screenshots/kanban-dark.png">
  <source width="100%" media="(prefers-color-scheme: light)" srcset="https://vovk.dev/screenshots/kanban-light.png">
  <img width="100%" alt="vovk" src="https://vovk.dev/screenshots/kanban-light.png">
</picture>

## See it in action

### AI agent managing the board via MCP

Claude connects to the Kanban board through an [MCP server](https://vovk.dev/realtime-ui/mcp) and creates, moves, and deletes cards autonomously.

<img src="https://raw.githubusercontent.com/finom/realtime-kanban/main/.repo-assets/kanban_mcp.gif" alt="AI agent managing the board via MCP" className='mt-4' />

### Multi-user collaboration with live polling

Multiple users edit the same board simultaneously — changes propagate in real time through [database polling](https://vovk.dev/realtime-ui/polling) and [normalized state](https://vovk.dev/realtime-ui/state).

<img src="https://raw.githubusercontent.com/finom/realtime-kanban/main/.repo-assets/kanban_polling.gif" alt="Multi-user collaboration with live polling" className='mt-4' />

### Chat-driven board updates with function calling

A built-in [text chat interface](https://vovk.dev/realtime-ui/text-ai) lets users manage cards through natural language, powered by OpenAI function calling.

<img src="https://raw.githubusercontent.com/finom/realtime-kanban/main/.repo-assets/kanban_text_chat.gif" alt="Chat-driven board updates with function calling" className='mt-4' />

## More info

- [Overview](https://vovk.dev/realtime-ui/overview)
- [Run with Docker Compose](https://vovk.dev/realtime-ui/run)
- [Deploy](https://vovk.dev/realtime-ui/deploy)
