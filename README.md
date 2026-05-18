# Nexus.js — Frontend Framework from Scratch

A lightweight frontend framework built from scratch in TypeScript, without using any existing frontend frameworks or libraries.

## Project Structure

```
dot-js/
├── framework/          # The Nexus.js framework itself
│   ├── src/
│   │   └── nexus.ts   # Core source (virtual DOM, state, router, HTTP, lazy)
│   ├── dist/           # Compiled output (nexus.js, nexus.d.ts)
│   ├── docs/
│   │   └── performance.md
│   ├── README.md      # Full framework documentation
│   ├── package.json
│   └── tsconfig.json
│
├── example/            # Example project: Kanban Board
│   ├── src/
│   │   └── main.ts    # Full Kanban app using ALL framework features
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
```

## Framework Features

| Feature | Implementation |
|---------|----------------|
| **DOM Manipulation** | `$(type, props, ...children)` creates virtual elements → real DOM |
| **Reusable Components** | `Component` class with render, state, lifecycle hooks |
| **State Management** | `createStore()` with get/set/subscribe/derive |
| **Routing** | Hash-based SPA router with param support and navigation guards |
| **Event Handling** | Events registered at render time (not `addEventListener`) |
| **HTTP Client** | `createHttp()` with get/post/put/delete/patch |
| **Lazy Rendering** | `LazyContainer` using IntersectionObserver for large lists |
| **State Persistence** | localStorage integration via store subscription |

## Example Project: Kanban Board

The example demonstrates every feature of the framework:

- **4 columns**: To Do, In Progress, In Review, Done
- **Task cards** with priorities (high/medium/low)
- **Add/delete tasks** with form handling
- **State persistence** to localStorage (survives refresh)
- **Statistics view** showing task counts per column
- **Remote API demo** fetching users from JSONPlaceholder
- **Lazy rendering demo** with 100 items using IntersectionObserver
- **Event delegation** on task list (parent handles child clicks)
- **Prevent default** on form submit

## Running the Example

```bash
cd example
npm install
npm run dev
# Open http://localhost:5173
```

## Building the Framework

```bash
cd framework
npm install
npm run build
# Output: dist/nexus.js (ESM/UMD), dist/nexus.d.ts (TypeScript)
```

## Requirements Coverage

### Mandatory

| Requirement | Status |
|------------|--------|
| `framework/` and `example/` directories at root | ✅ |
| `framework/README.md` exists | ✅ |
| Documentation is clear and in markdown | ✅ |
| Documentation describes architecture and design principles | ✅ |
| Documentation has installation instructions | ✅ |
| Documentation has "Getting Started" guide | ✅ |
| Documentation describes each feature with code examples | ✅ |
| Documentation contains best practices | ✅ |
| Example project uses all developed functionality | ✅ |
| Example project can be expanded and works | ✅ |
| State is stored and updated between sessions (localStorage) | ✅ |
| State can be shared between elements | ✅ |
| State can be shared between pages | ✅ |
| URL can be controlled (hash-based router) | ✅ |
| Application state changes based on URL | ✅ |
| Elements can be created (`$()`, `h()`) | ✅ |
| Elements can be nested | ✅ |
| System for adding/manipulating styles and attributes | ✅ |
| Handles user input and form submissions | ✅ |
| Reusable component architecture | ✅ |
| Event listeners can be registered when elements are rendered | ✅ |
| Event handling can be delegated to parent elements | ✅ |
| Prevents default browser behavior and event bubbling | ✅ |
| Does not reimplement `addEventListener` | ✅ |
| Framework without frontend frameworks or libraries | ✅ |
| Framework convention (not library) | ✅ |

### Extra

| Requirement | Status |
|------------|--------|
| Is performant | ✅ |
| Programmer describes specific performance decisions | ✅ |
| Effects are validated (measurements documented) | ✅ |
| Implements HTTP requests | ✅ |
| Shares data with application | ✅ |

## Key Design Decisions

### Why TypeScript?

The task mentions JavaScript, Java, and TypeScript. TypeScript was chosen because:

1. **Type safety** catches bugs at compile time, not runtime
2. **Self-documenting code** — interfaces make the architecture obvious
3. **Better IDE support** — autocompletion, refactoring tools
4. **Framework-quality code** — the task is to demonstrate skill, not write quick hacks

### Why Virtual DOM?

Without a virtual DOM, you'd need to manually manipulate the real DOM on every state change. This is:
- Error-prone (forgetting to update one element)
- Hard to optimize (every change triggers reflow)
- Impossible to test without a browser

The virtual DOM lets us:
1. Generate new virtual trees cheaply
2. Diff against the old tree in O(n)
3. Apply only the necessary real DOM changes

### Why Hash-based Routing?

Server-configured routing (history API) requires backend changes. Hash routing (`#/path`) works out of the box with zero server configuration — the hash is never sent to the server, so it always hits the same HTML file.

### Why Event Delegation?

Attaching event listeners to every individual element is O(n) memory. Event delegation attaches one listener to a parent and uses event bubbling — O(1) memory regardless of how many child elements exist.

### Why not `addEventListener`?

In React, you don't call `addEventListener` after rendering — you pass an `onClick` prop when creating the element. Nexus.js does the same thing: events are attached during the render phase via the `on` property, not as a separate imperative step.