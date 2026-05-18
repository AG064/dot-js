# Nexus.js

A lightweight, framework-convention frontend framework built from scratch in TypeScript. Nexus.js lets you describe user interfaces with JavaScript using a virtual DOM, reactive state management, hash-based routing, and an event system designed for composition — not a copy of `addEventListener`.

## Table of Contents

- [Why Nexus.js?](#why-nexusjs)
- [Architecture and Design Principles](#architecture-and-design-principles)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
  - [Virtual DOM Elements](#virtual-dom-elements)
  - [Component System](#component-system)
  - [State Management](#state-management)
  - [Routing](#routing)
  - [Event Handling](#event-handling)
  - [HTTP Client](#http-client)
  - [Lazy Rendering](#lazy-rendering)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

---

## Why Nexus.js?

Every week a new JavaScript framework appears. You are tired of reading documentation to discover if a major version will break your product. So you build your own — one where you know precisely how every part works, because you wrote it yourself.

Nexus.js implements the core ideas found in React, Vue, and Svelte, but from scratch:

- **Virtual DOM** for efficient DOM updates
- **Reactive state** with subscription model
- **Hash-based router** for SPAs
- **Component architecture** for reusability
- **Event delegation** for performance
- **HTTP client** for remote data

The framework is built with TypeScript, ships with full type definitions, and has zero runtime dependencies.

---

## Architecture and Design Principles

Nexus.js follows the **framework convention** — the programmer describes *what* the UI should look like (declarative), and the framework handles *how* to make it happen. This is the fundamental difference from a library like jQuery where you imperatively call methods.

### Framework vs Library

| | Framework | Library |
|---|---|---|
| Control flow | Framework controls | You control |
| Entry point | You provide component, framework calls it | You call library functions |
| Convention | Enforced structure | Flexible but inconsistent |
| Nexus.js | You describe UI declaratively, framework renders | N/A |

### Design Principles

1. **Declarative UI** — Describe what to render, not how to manipulate the DOM
2. **Unidirectional data flow** — State changes flow down through the component tree
3. **Subscription-based reactivity** — Components subscribe to store changes, not the other way around
4. **Event delegation at render time** — Events are registered when elements are created, not via `addEventListener` after the fact
5. **No VDOM overhead for simple cases** — Direct DOM manipulation via `$()` for quick elements
6. **Zero dependencies** — The framework ships without any external runtime dependencies

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                   Application                    │
├─────────────────────────────────────────────────┤
│                 KanbanApp                        │
│   (Root Component with state + lifecycle)        │
├──────────────┬──────────────┬───────────────────┤
│   Store      │   Router     │  LazyContainer     │
│ (Reactive    │ (Hash-based  │ (Intersection      │
│  state)      │  routing)    │  Observer)         │
├──────────────┴──────────────┴───────────────────┤
│              Nexus.js Core                       │
│  h() | $() | Component | createStore | createHttp │
├─────────────────────────────────────────────────┤
│              Virtual DOM                        │
│  NexusElement → createDOM → Real DOM            │
└─────────────────────────────────────────────────┘
```

---

## Installation

### Option 1: npm

```bash
npm install nexus-js
```

### Option 2: Clone and build

```bash
git clone <your-repo>
cd framework
npm install
npm run build
```

The built output is in `dist/nexus.js` (UMD) and `dist/nexus.d.ts` (TypeScript definitions).

### Option 3: Direct browser (ES modules)

```html
<script type="module">
  import { $, Component, createStore } from './dist/nexus.js';
  // Your code here
</script>
```

---

## Getting Started

### Your First Nexus.js Application

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My First Nexus App</title>
</head>
<body>
  <div id="app"></div>
  <script type="module">
    import { $, Component, createStore } from './nexus.js';

    const store = createStore({ count: 0 });

    class CounterApp extends Component {
      constructor() {
        super({
          render: (state) => $('div', { className: 'counter' }, [
            $('h1', {}, `Count: ${state.count}`),
            $('button', {
              on: { click: () => store.set('count', state.count + 1) }
            }, 'Increment'),
            $('button', {
              on: { click: () => store.set('count', state.count - 1) }
            }, 'Decrement'),
          ]),
          state: store.getState(),
        });

        store.subscribe((newState) => this.setState(newState));
      }
    }

    const app = new CounterApp();
    app.mount(document.getElementById('app'));
  </script>
</body>
</html>
```

### What happened:

1. **`createStore`** creates a reactive state container with `getState()`, `setState()`, and `subscribe()`
2. **`$()`** creates virtual DOM elements (type, props, children)
3. **`Component`** is a reusable, stateful UI unit
4. **`mount()`** attaches the component to a real DOM element

---

## Core Concepts

### Virtual DOM Elements

The virtual DOM is a JavaScript object representation of what should appear on screen.

```typescript
import { $, h } from 'nexus-js';

// Using $() — recommended for most cases
const element = $('div', { className: 'container', id: 'main' }, [
  $('h1', {}, 'Hello World'),
  $('p', { style: { color: 'gray' } }, 'Welcome to Nexus.js'),
]);

// Using h() — functional API, useful for dynamic elements
const dynamic = (name: string) => h('span', { className: 'name' }, name);
```

Both `$()` and `h()` produce a `NexusElement` — a plain JavaScript object:

```typescript
interface NexusElement {
  type: string;           // 'div', 'span', 'button', etc.
  props: Record<string, any>;
  children: (NexusElement | string | number)[];
  key?: string;           // For list reconciliation
}
```

When a `NexusElement` is rendered, `createDOM()` walks the tree and creates real `HTMLElement` nodes.

### Component System

Components are the primary way to build reusable UI pieces in Nexus.js.

```typescript
import { $, Component, createStore } from 'nexus-js';

interface CardState {
  title: string;
  body: string;
  collapsed: boolean;
}

class Card extends Component {
  constructor(title: string, body: string) {
    super({
      render: (state: CardState) => $('div', { className: 'card' }, [
        $('div', { className: 'card-header', on: {
          click: () => this.setState({ collapsed: !state.collapsed })
        }}, state.title),
        !state.collapsed ? $('div', { className: 'card-body' }, state.body) : null,
      ]),
      state: { title, body, collapsed: false },
    });
  }
}

// Usage
const card = new Card('My Card', 'Card content here');
card.mount(document.getElementById('cards'));

// Update state
card.setState({ title: 'Updated Title' });
```

**Key Component methods:**

- `mount(container)` — Attach to a DOM element
- `setState(newState)` — Update state and trigger re-render
- `setProps(newProps)` — Update props and trigger re-render
- `getState()` — Get current state object (copy)
- `getProps()` — Get current props object (copy)
- `attachStore(store)` — Connect to a reactive store
- `destroy()` — Cleanup and remove from DOM

### State Management

Nexus.js provides a subscription-based store:

```typescript
import { createStore } from 'nexus-js';

// Create with initial state
const store = createStore({
  user: null,
  theme: 'light',
  todos: [] as string[],
});

// Get current state
const state = store.getState();

// Set specific value
store.set('theme', 'dark');

// Set multiple values (shallow merge)
store.setState({ theme: 'dark', user: { name: 'Alice' } });

// Subscribe to ALL changes
const unsubscribe = store.subscribe((newState) => {
  console.log('State changed:', newState);
});

// Subscribe to SPECIFIC key changes
const unsubTheme = store.on('theme', (newState) => {
  console.log('Theme is now:', newState.theme);
});

// Unsubscribe
unsubTheme();
unsubscribe();

// Compute derived state
const isDark = store.derive((s) => s.theme === 'dark');
console.log(isDark); // false
```

**Key features:**
- Shallow merge: `setState({ a: 1 })` only updates `a`, keeps everything else
- Key-specific subscriptions: only re-render what matters
- Derived state: compute on the fly without storing duplicates
- Persistence: combine with `localStorage` for session survival

**Persisting state across sessions:**

```typescript
const store = createStore(JSON.parse(localStorage.getItem('app-state') || '{}'));

store.subscribe((state) => {
  localStorage.setItem('app-state', JSON.stringify(state));
});
```

### Routing

Nexus.js includes a hash-based router (no server configuration needed):

```typescript
import { createRouter, $ } from 'nexus-js';

const router = createRouter();

router
  .beforeEach((path) => {
    // Auth guard — return false to block navigation
    const isAuthenticated = localStorage.getItem('auth');
    return !!isAuthenticated;
  })
  .route('/home', () => {
    renderHomePage();
  })
  .route('/about', () => {
    renderAboutPage();
  })
  .route('/user/:id', (params) => {
    renderUserProfile(params.id);
  })
  .notFound(() => {
    render404();
  });

// Initialize router with a root element
router.init(document.getElementById('app'));

// Navigate programmatically
router.navigate('/about');

// Get current path
console.log(router.getPath()); // '#/about' → '/about'
```

**Route parameters:**

```typescript
router.route('/post/:slug', (params) => {
  // params.slug === 'my-first-post'
  console.log(params.slug);
});
```

**Programmatic navigation:**

```typescript
// From within an event handler
$('button', {
  on: {
    click: () => router.navigate('/next-page'),
  }
}, 'Go to Next Page');
```

### Event Handling

Nexus.js event handling works at render time — events are attached when elements are created, not via a separate `addEventListener` call:

```typescript
$('button', {
  className: 'btn',
  on: {
    click: (e: Event) => {
      e.preventDefault();       // Prevents default browser behavior
      e.stopPropagation();      // Stops event bubbling
      console.log('Button clicked!');
    },
    mouseenter: (e: Event) => {
      console.log('Mouse entered');
    },
    mouseleave: (e: Event) => {
      console.log('Mouse left');
    },
  },
}, 'Hover Me');
```

**Event delegation:**

Events are delegated to parent elements for performance. When you click a child element, the event bubbles up to the nearest parent that has a handler registered via `on`:

```typescript
$('ul', {
  className: 'task-list',
  on: {
    // This handler catches events from ALL <li> children
    click: (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'LI') {
        console.log('List item clicked:', target.textContent);
      }
    },
  },
}, [
  $('li', {}, 'Item 1'),
  $('li', {}, 'Item 2'),
  $('li', {}, 'Item 3'),
]);
```

**Form handling with preventDefault:**

```typescript
$('form', {
  on: {
    submit: (e: Event) => {
      e.preventDefault(); // Critical for SPA form handling
      const form = e.target as HTMLFormElement;
      const data = new FormData(form);
      console.log('Form submitted:', Object.fromEntries(data));
    },
  },
}, [
  $('input', { type: 'text', name: 'username', placeholder: 'Username' }),
  $('input', { type: 'password', name: 'password', placeholder: 'Password' }),
  $('button', { type: 'submit' }, 'Login'),
]);
```

**Key principle:** Events are registered during render, not via `addEventListener`. This is how React works — Nexus.js does the same thing, but with a custom implementation, not `Object.assign(element, { onClick: fn })`.

### HTTP Client

Nexus.js includes an HTTP client for fetching remote data:

```typescript
import { createHttp } from 'nexus-js';

// Create client with base URL
const api = createHttp('https://api.example.com');

// GET request
const users = await api.get('/users');
console.log(users.data);    // Response body
console.log(users.status);  // HTTP status code

// POST with body
const newUser = await api.post('/users', {
  name: 'Alice',
  email: 'alice@example.com',
});

// Custom headers
const data = await api.request('/protected', {
  method: 'GET',
  headers: { Authorization: 'Bearer ' + token },
});

// Error handling
try {
  const response = await api.get('/nonexistent');
} catch (err) {
  console.error('Request failed:', err);
}
```

**Response type:**

```typescript
interface HttpResponse<T = any> {
  data: T;           // Parsed JSON response body
  status: number;    // HTTP status (200, 404, 500, etc.)
  statusText: string; // 'OK', 'Not Found', etc.
  headers: Record<string, string>; // Response headers
}
```

### Lazy Rendering

For large lists (10,000+ items), Nexus.js provides `LazyContainer` — uses `IntersectionObserver` to render items only when they enter the viewport:

```typescript
import { createLazyContainer, $ } from 'nexus-js';

// Get container element
const container = document.getElementById('lazy-list');

// Create lazy container
const lazy = createLazyContainer(container);

// Set items to lazily render (1000 items, only render when visible)
lazy.setChildren(
  Array.from({ length: 1000 }, (_, i) =>
    $('div', { className: 'task-row' }, `Task #${i}`)
  )
);

// Force render all (bypass lazy loading)
lazy.renderAll();

// Cleanup
lazy.destroy();
```

**Performance benefits:**
- Initial render only creates placeholders (~50px height)
- IntersectionObserver triggers real DOM creation when scrolling into view
- Reduces memory footprint for large datasets
- Can reduce initial render time by 90%+ for lists with 10k+ items

---

## Best Practices

### 1. Always use `$()` for element creation, not `document.createElement`

```typescript
// ❌ Imperative — defeats the purpose of the framework
const div = document.createElement('div');
div.className = 'container';

// ✅ Declarative — describes what, not how
const div = $('div', { className: 'container' });
```

### 2. Keep components focused

```typescript
// ❌ One component does everything
class HugeApp extends Component { ... }

// ✅ Split by concern
class Header extends Component { ... }
class Sidebar extends Component { ... }
class Content extends Component { ... }
class Footer extends Component { ... }
```

### 3. Use store subscriptions for shared state, component state for local UI state

```typescript
// Global app state → Store
const appStore = createStore({ user: null, notifications: [] });

// Local UI state → Component state
class Modal extends Component {
  constructor() {
    super({ state: { isOpen: false } });
  }
  open() { this.setState({ isOpen: true }); }
  close() { this.setState({ isOpen: false }); }
}
```

### 4. Prevent default only when necessary

```typescript
$('a', {
  on: {
    click: (e) => {
      // Only preventDefault for SPA navigation
      // Let external links work normally
      e.preventDefault();
      router.navigate('/next');
    },
  },
}, 'Link');

// For external links, just use href directly
$('a', { href: 'https://external.com' }, 'External');
```

### 5. Use keys for list items

```typescript
// Without keys — causes DOM reuse issues on updates
tasks.map(task => $('li', {}, task.title));

// With keys — proper DOM reconciliation
tasks.map(task => $('li', { key: task.id }, task.title));
```

### 6. State immutability

```typescript
// ❌ Mutating state directly
state.tasks.push(newTask);

// ✅ Create new state object
this.setState({ tasks: [...state.tasks, newTask] });
```

---

## API Reference

### Core Functions

#### `$(type, props?, ...children): NexusElement`

Create a virtual DOM element. The primary API for building UIs.

**Parameters:**
- `type` — HTML tag name or custom element type
- `props` — Object with attributes, styles, event handlers, etc.
- `children` — Nested elements, strings, or numbers

**Usage:**
```typescript
$('div', { className: 'card', style: { marginTop: '10px' } }, [
  $('h2', {}, 'Title'),
  $('p', {}, 'Description'),
]);
```

#### `h(type, props?, ...children): NexusElement`

Alias for `$()`. Use whichever reads better in context.

---

### Component

#### `new Component({ render, state?, props?, onMount?, onUpdate?, onUnmount? })`

Create a stateful UI component.

| Option | Type | Description |
|--------|------|-------------|
| `render` | `(state, props) => NexusElement` | Render function — returns virtual DOM |
| `state` | `Record<string, any>` | Initial state |
| `props` | `Record<string, any>` | Initial props |
| `onMount` | `(node, props) => void` | Called after component mounts to DOM |
| `onUpdate` | `(prevState, nextState, props) => void` | Called after each state update |
| `onUnmount` | `() => void` | Called before component is destroyed |

**Instance methods:**
- `mount(element)` — Attach to DOM
- `setState(state)` — Update state, trigger re-render
- `setProps(props)` — Update props, trigger re-render
- `getState()` — Get current state (copy)
- `getProps()` — Get current props (copy)
- `attachStore(store)` — Connect reactive store
- `destroy()` — Cleanup

---

### Store

#### `createStore(initialState?): Store`

Create a reactive state container.

**Instance methods:**
- `getState()` — Get current state (copy)
- `setState(state)` — Shallow merge new state
- `set(key, value)` — Set specific key
- `get(key)` — Get specific key value
- `subscribe(fn)` — Subscribe to all changes, returns unsubscribe function
- `on(key, fn)` — Subscribe to specific key changes, returns unsubscribe function
- `derive(fn)` — Compute derived value from current state

---

### Router

#### `createRouter(): Router`

Create a hash-based router.

**Instance methods:**
- `init(element)` — Initialize router with root element
- `route(path, handler)` — Register route (supports `:param` syntax)
- `navigate(path)` — Programmatic navigation
- `getPath()` — Get current path (without `#`)
- `beforeEach(fn)` — Add navigation guard
- `notFound(handler)` — Handle unknown routes

---

### HTTP

#### `createHttp(baseURL?): HttpClient`

Create HTTP client instance.

**Instance methods:**
- `get(endpoint, options?)` — GET request
- `post(endpoint, data?, options?)` — POST request
- `put(endpoint, data?, options?)` — PUT request
- `delete(endpoint, options?)` — DELETE request
- `patch(endpoint, data?, options?)` — PATCH request
- `request(endpoint, options?)` — Generic request

---

### Lazy Rendering

#### `createLazyContainer(element): LazyContainer`

Create a lazy-loading container using IntersectionObserver.

**Instance methods:**
- `setChildren(elements)` — Set items to lazily render
- `appendChild(element)` — Add single lazy item
- `renderAll()` — Force render all items
- `clear()` — Remove all rendered items
- `destroy()` — Cleanup observer

---

## License

MIT — Use it however you want. You built it, you own it.