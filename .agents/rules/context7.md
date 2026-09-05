# MANDATORY RULE: Always Consult Context7 for Libraries, Frameworks & APIs

## Core Directive
Whenever working on any task that involves programming libraries, frameworks, SDKs, APIs, build tools, CLI utilities, or third-party packages (such as React, Next.js, Express, TailwindCSS, Node.js, Python packages, etc.):

**YOU MUST ALWAYS REFER TO AND USE CONTEXT7 BEFORE AND DURING CODE WRITING.**

Do NOT rely on assumptions, potentially outdated pre-training knowledge, or memory. Libraries frequently release breaking changes, deprecate APIs, and alter configuration formats. Context7 provides the authoritative, real-time ground truth.

---

## When to Refer to Context7
You MUST query Context7 in all of the following scenarios:
1. **Writing Code**: Before implementing features using any external library, SDK, or framework.
2. **Importing & Calling APIs**: Whenever choosing API methods, hooks, class methods, options, or parameters.
3. **Configuration & Setup**: When creating or editing config files (e.g., `vite.config.*`, `next.config.*`, `tailwind.config.*`, `package.json`, `tsconfig.json`).
4. **Debugging & Errors**: When troubleshooting library-specific errors, unexpected behaviors, or deprecation warnings.
5. **Version Migration**: When upgrading or checking compatibility between library versions.

---

## How to Execute Context7 Reference

### Option A: Context7 CLI (`ctx7`) (Recommended & Direct)
The `ctx7` command-line tool is installed globally and immediately available.

1. **Step 1: Resolve Library ID**
   ```bash
   ctx7 library <library-name> "<what you want to do>"
   ```
   *Example:*
   ```bash
   ctx7 library react "useEffect and custom hooks"
   # Output gives library ID: /reactjs/react.dev
   ```

2. **Step 2: Query Context & Code Snippets**
   ```bash
   ctx7 docs <library-id> "<specific feature or syntax>"
   ```
   *Example:*
   ```bash
   ctx7 docs /reactjs/react.dev "useEffect cleanup function"
   ```

### Option B: Context7 MCP Server
If using MCP tools:
1. Call `resolve-library-id` with `libraryName` and `query`.
2. Call `query-docs` with the resolved `libraryId` and `query`.

---

## Verification & Grounding
- Never guess an API signature when Context7 can provide the exact type definitions and examples.
- When generating code, ground every library import and invocation directly in the snippets retrieved from Context7.
- If a query returns multiple versions, verify against the project's target version.
