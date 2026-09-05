---
name: context7
description: Retrieve up-to-date, version-specific documentation, code snippets, and API references for libraries, frameworks, SDKs, and APIs using Context7. Use this skill whenever implementing code, choosing libraries, checking syntax, configuring frameworks, or debugging third-party packages.
---

# Context7 Documentation & Context Retrieval

Context7 provides real-time, version-accurate documentation and code examples directly from official package documentation and repositories. It prevents hallucinated APIs, deprecated patterns, and outdated library usage.

## When to Use Context7

**MANDATORY RULE**: Refer to Context7 for **ANY** task involving external libraries, frameworks, APIs, SDKs, or tools (e.g., React, Next.js, Express, Vue, TailwindCSS, Vite, Prisma, LangChain, Supabase, PyTorch, Fastify, etc.).

Always consult Context7:
1. Before writing code that imports or calls third-party library APIs.
2. When configuring tools, frameworks, build systems, or plugins.
3. When verifying whether a function, hook, class, or parameter is deprecated or updated in newer versions.
4. When encountering errors or debugging library-specific behavior.

---

## How to Query Context7

### Method 1: Via Context7 CLI (`ctx7`) (Fastest & Guaranteed)

The `ctx7` CLI is installed globally on the system (`/Users/nihalkumar/.nvm/versions/node/v22.22.0/bin/ctx7`).

1. **Find the exact Library ID**:
   ```bash
   ctx7 library <library-name> "<query-or-topic>"
   # or
   npx -y ctx7 library <library-name> "<query-or-topic>"
   ```
   *Example:*
   ```bash
   ctx7 library express "how to create server"
   # Returns library ID: /expressjs/express
   ```

2. **Fetch Documentation & Code Snippets**:
   ```bash
   ctx7 docs <library-id> "<specific-feature-or-question>"
   # or
   npx -y ctx7 docs <library-id> "<specific-feature-or-question>"
   ```
   *Example:*
   ```bash
   ctx7 docs /expressjs/express "routing middleware error handling"
   ```

### Method 2: Via MCP Server (`context7`)

Context7 is configured in `~/.gemini/config/mcp_config.json`.
When calling MCP tools:
1. Call `resolve-library-id`:
   - `libraryName`: e.g. `"express"`, `"next.js"`, `"react"`
   - `query`: e.g. `"route handlers and middleware"`
2. Call `query-docs`:
   - `libraryId`: the resolved ID (e.g. `"/expressjs/express"`, `"/vercel/next.js"`)
   - `query`: the specific topic or question

---

## Best Practices

1. **Be Specific in Queries**: Rather than querying generic single words like `"auth"`, query `"JWT authentication middleware setup"` or `"useEffect dependency array cleanup"`.
2. **Version Pinning**: If working in a project with a specific version (e.g., React 19 or Next.js 15), check the version returned by `ctx7 library` and query that specific version's docs if available.
3. **Grounding**: Always base the code and API calls on the actual documentation retrieved from Context7 rather than assumptions.
