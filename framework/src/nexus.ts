/**
 * Nexus.js - A lightweight frontend framework for building reactive web applications
 *
 * Core exports:
 * - $(): Element creation & DOM manipulation
 * - Component(): Reusable component factory
 * - Store: Reactive state management
 * - Router: Hash-based URL routing
 * - http: HTTP client for remote data fetching
 */

// ============================================================================
// CORE ELEMENT SYSTEM
// ============================================================================

type Attrs = Record<string, string | number | boolean>;
type Styles = Record<string, string | number>;
type EventHandler = (event: Event) => void;
type Children = NexusElement | string | number | (NexusElement | string | number)[];

/**
 * NexusElement represents a virtual DOM node
 */
export interface NexusElement {
  type: string;
  props: Record<string, any>;
  children: (NexusElement | string | number)[];
  key?: string;
}

interface DOMNode {
  element: HTMLElement;
  listeners: Map<string, EventHandler>;
  lazy?: boolean;
}

/**
 * Create a virtual DOM element
 */
export function h(
  type: string,
  props: Record<string, any> = {},
  ...children: Children[]
): NexusElement {
  return {
    type,
    props: { ...props },
    children: flattenChildren(children),
    key: props.key || undefined,
  };
}

function flattenChildren(children: Children[]): (NexusElement | string | number)[] {
  const result: (NexusElement | string | number)[] = [];
  for (const child of children) {
    if (Array.isArray(child)) {
      result.push(...flattenChildren(child));
    } else if (child != null) {
      const isBool = typeof child === 'boolean';
      if (!isBool) {
        result.push(child as NexusElement | string | number);
      }
    }
  }
  return result;
}

/**
 * Convert virtual element to real DOM
 */
function createDOM(element: NexusElement, parent?: HTMLElement): DOMNode {
  const { type, props, children } = element;

  if (type === 'text') {
    const textNode = document.createTextNode(String(children[0] || ''));
    const container = parent || document.createElement('span');
    container.appendChild(textNode);
    return { element: container, listeners: new Map() };
  }

  const el = document.createElement(type);

  // Apply attributes
  if (props.attrs) {
    for (const [key, value] of Object.entries(props.attrs)) {
      if (value !== false && value != null) {
        el.setAttribute(key, String(value));
      }
    }
  }

  // Apply styles
  if (props.style) {
    const styles = props.style as Styles;
    for (const [key, value] of Object.entries(styles)) {
      el.style[key as any] = String(value);
    }
  }

  // Apply className
  if (props.className) {
    el.className = String(props.className);
  }

  // Apply id
  if (props.id) {
    el.id = String(props.id);
  }

  // Apply data attributes
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('data-')) {
      el.setAttribute(key, String(value));
    }
  }

  // Handle special props
  const { on, attrs, style, className, id, children: _, ...rest } = props;

  // Apply event listeners (registered during render, not via addEventListener)
  if (on) {
    for (const [eventName, handler] of Object.entries(on)) {
      if (typeof handler === 'function') {
        // Store handler reference for later attachment
        (el as any)._nexusHandlers = (el as any)._nexusHandlers || {};
        (el as any)._nexusHandlers[eventName] = handler;

        // Use event delegation at component level
        el.addEventListener(eventName, handler as EventHandler);
      }
    }
  }

  // Handle value special case
  if ('value' in props && (type === 'input' || type === 'textarea' || type === 'select')) {
    (el as HTMLInputElement).value = String(props.value);
  }

  // Handle checked special case
  if ('checked' in props && type === 'input') {
    (el as HTMLInputElement).checked = Boolean(props.checked);
  }

  // Handle disabled
  if (props.disabled === true) {
    el.setAttribute('disabled', '');
  }

  // Handle placeholder
  if ('placeholder' in props) {
    el.setAttribute('placeholder', String(props.placeholder));
  }

  // Handle href/src etc
  for (const key of ['href', 'src', 'alt', 'title', 'placeholder']) {
    if (key in props) {
      el.setAttribute(key, String(props[key]));
    }
  }

  // Handle innerHTML (dangerous but allowed for performance)
  if ('innerHTML' in props) {
    el.innerHTML = String(props.innerHTML);
  }

  // Handle text content for leaf elements
  if (children.length === 1 && typeof children[0] === 'string' && !el.innerHTML) {
    el.textContent = children[0];
  } else {
    // Recursively create children
    for (const child of children) {
      if (typeof child === 'string' || typeof child === 'number') {
        el.appendChild(document.createTextNode(String(child)));
      } else if (child && typeof child === 'object' && child.type) {
        const childNode = createDOM(child, el);
        el.appendChild(childNode.element);
      }
    }
  }

  return { element: el, listeners: new Map() };
}

/**
 * Mount a virtual element to the DOM
 */
function mount(element: NexusElement, container: HTMLElement): HTMLElement {
  const node = createDOM(element);
  container.appendChild(node.element);
  return node.element;
}

// ============================================================================
// JQUERY-LIKE ELEMENT CREATION SHORTHAND
// ============================================================================

/**
 * Shorthand for h() - create DOM elements with chainable API
 *
 * Usage:
 *   $('div', { className: 'container' },
 *     $('h1', { attrs: { id: 'title' } }, 'Hello'),
 *     $('button', { on: { click: handler } }, 'Click me')
 *   )
 *
 * Or with children array:
 *   $('div', { className: 'container' }, [
 *     $('span', {}, 'Item 1'),
 *     $('span', {}, 'Item 2')
 *   ])
 */
export function $(
  type: string,
  propsOrChildren?: Record<string, any> | Children,
  ...restChildren: Children[]
): NexusElement {
  // Handle different call signatures
  let props: Record<string, any> = {};
  let children: Children[] = [];

  if (typeof propsOrChildren === 'object' && propsOrChildren !== null && !Array.isArray(propsOrChildren)) {
    props = propsOrChildren as Record<string, any>;
    children = restChildren;
  } else if (Array.isArray(propsOrChildren)) {
    children = propsOrChildren as Children[];
    props = {};
  } else {
    props = {};
    children = [propsOrChildren as Children, ...restChildren].filter(Boolean) as Children[];
  }

  // Filter out null/undefined children
  const filteredChildren = children.filter(c => c != null);

  return h(type, props, ...filteredChildren);
}

// ============================================================================
// COMPONENT SYSTEM
// ============================================================================

export type ComponentRenderFn = (state: Record<string, any>, props?: Record<string, any>) => NexusElement;
export type ComponentDidMountFn = (node: HTMLElement, props?: Record<string, any>) => void;
export type ComponentDidUpdateFn = (prevState: Record<string, any>, nextState: Record<string, any>, props?: Record<string, any>) => void;

export interface ComponentOptions {
  render: ComponentRenderFn;
  state?: Record<string, any>;
  props?: Record<string, any>;
  onMount?: ComponentDidMountFn;
  onUpdate?: ComponentDidUpdateFn;
  onUnmount?: () => void;
}

/**
 * Create a reusable component
 *
 * Components are pure functions that take state and produce virtual DOM.
 * They re-render when state changes via setState().
 */
export class Component {
  private element: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private _state: Record<string, any>;
  private _props: Record<string, any>;
  private renderFn: ComponentRenderFn;
  private onMountFn?: ComponentDidMountFn;
  private onUpdateFn?: ComponentDidUpdateFn;
  private onUnmountFn?: () => void;
  private store?: Store;

  constructor(options: ComponentOptions) {
    this._state = { ...(options.state || {}) };
    this._props = { ...(options.props || {}) };
    this.renderFn = options.render;
    this.onMountFn = options.onMount;
    this.onUpdateFn = options.onUpdate;
    this.onUnmountFn = options.onUnmount;
  }

  /**
   * Attach component to a DOM element
   */
  mount(container: HTMLElement): HTMLElement {
    this.container = container;
    this.element = this._mount();
    if (this.onMountFn && this.element !== null) {
      const el = this.element as HTMLElement;
      this.onMountFn(el, this._props);
    }
    return this.element;
  }

  /**
   * Update the component with new state
   */
  setState(newState: Record<string, any>, callback?: () => void): void {
    const prevState = { ...this._state };
    this._state = { ...this._state, ...newState };
    if (this.element && this.container) {
      this._update();
      if (this.onUpdateFn) {
        this.onUpdateFn(prevState, this._state, this._props);
      }
    }
    if (callback) callback();
  }

  /**
   * Update props
   */
  setProps(newProps: Record<string, any>): void {
    const prevProps = { ...this._props };
    this._props = { ...this._props, ...newProps };
    if (this.element && this.container) {
      this._update();
    }
  }

  /**
   * Get current state
   */
  getState(): Record<string, any> {
    return { ...this._state };
  }

  /**
   * Get current props
   */
  getProps(): Record<string, any> {
    return { ...this._props };
  }

  /**
   * Attach a store for reactive state updates
   */
  attachStore(store: Store): void {
    this.store = store;
    store.subscribe((state) => {
      if (this.element && this.container) {
        this.setState(state);
      }
    });
  }

  private _mount(): HTMLElement {
    const vdom = this.renderFn(this._state, this._props);
    const el = document.createElement('div');
    this.container?.appendChild(el);
    const node = createDOM(vdom, el);
    el.appendChild(node.element);
    return el;
  }

  private _update(): void {
    if (!this.container || !this.element) return;
    const vdom = this.renderFn(this._state, this._props);
    this.element.innerHTML = '';
    const node = createDOM(vdom, this.element);
    this.element.appendChild(node.element);
  }

  /**
   * Cleanup component
   */
  destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    if (this.onUnmountFn) {
      this.onUnmountFn();
    }
    this.element = null;
    this.container = null;
  }
}

/**
 * Functional component shorthand
 */
export function component(
  renderFn: ComponentRenderFn,
  initialState?: Record<string, any>,
  initialProps?: Record<string, any>
): Component {
  return new Component({ render: renderFn, state: initialState, props: initialProps });
}

// ============================================================================
// REACTIVE STATE MANAGEMENT (STORE)
// ============================================================================

type Subscriber = (state: Record<string, any>) => void;

export class Store {
  private state: Record<string, any>;
  private subscribers: Set<Subscriber> = new Set();
  private listeners: Map<string, Set<Subscriber>> = new Map();

  constructor(initialState: Record<string, any> = {}) {
    this.state = { ...initialState };
  }

  /**
   * Get current state
   */
  getState(): Record<string, any> {
    return { ...this.state };
  }

  /**
   * Get specific state value
   */
  get<K extends keyof Record<string, any>>(key: K): any {
    return this.state[key];
  }

  /**
   * Update state (shallow merge)
   */
  setState(newState: Record<string, any>): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this._notify(prevState, newState);
  }

  /**
   * Set specific state value
   */
  set<K extends keyof Record<string, any>>(key: string, value: any): void {
    const prevState = { ...this.state };
    this.state[key] = value;
    this._notify(prevState, { [key]: value });
  }

  /**
   * Subscribe to all state changes
   */
  subscribe(subscriber: Subscriber): () => void {
    this.subscribers.add(subscriber);
    return () => this.subscribers.delete(subscriber);
  }

  /**
   * Subscribe to specific state key changes
   */
  on(key: string, subscriber: Subscriber): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(subscriber);
    return () => this.listeners.get(key)?.delete(subscriber);
  }

  /**
   * Compute derived state
   */
  derive<T>(fn: (state: Record<string, any>) => T): T {
    return fn(this.state);
  }

  private _notify(prevState: Record<string, any>, changed: Record<string, any>): void {
    // Notify global subscribers
    for (const sub of this.subscribers) {
      sub(this.state);
    }
    // Notify key-specific subscribers
    for (const key of Object.keys(changed)) {
      const subs = this.listeners.get(key);
      if (subs) {
        for (const sub of subs) {
          sub(this.state);
        }
      }
    }
  }
}

/**
 * Create a new store instance
 */
export function createStore(initialState?: Record<string, any>): Store {
  return new Store(initialState);
}

// ============================================================================
// ROUTER
// ============================================================================

type RouteHandler = (params: Record<string, string>) => void;
type RouteFilter = (path: string) => boolean;

interface Route {
  path: string;
  handler: RouteHandler;
  filter?: RouteFilter;
  params?: Record<string, string>;
}

export class Router {
  private routes: Route[] = [];
  private currentPath: string = '/';
  private notFoundHandler?: RouteHandler;
  private beforeEachHandler?: RouteFilter;
  private rootElement: HTMLElement | null = null;

  /**
   * Initialize router with a root element
   */
  init(rootElement: HTMLElement): void {
    this.rootElement = rootElement;
    window.addEventListener('hashchange', () => this._handleRoute());
    this._handleRoute();
  }

  /**
   * Register a route
   */
  route(path: string, handler: RouteHandler): this {
    this.routes.push({ path, handler });
    return this;
  }

  /**
   * Set before-each filter
   */
  beforeEach(filter: RouteFilter): this {
    this.beforeEachHandler = filter;
    return this;
  }

  /**
   * Handle 404
   */
  notFound(handler: RouteHandler): this {
    this.notFoundHandler = handler;
    return this;
  }

  /**
   * Navigate programmatically
   */
  navigate(path: string): void {
    if (path.startsWith('#')) {
      window.location.hash = path;
    } else if (path.startsWith('/')) {
      window.location.hash = '#' + path;
    } else {
      window.location.hash = '#/' + path;
    }
  }

  /**
   * Get current path
   */
  getPath(): string {
    return window.location.hash.replace('#', '') || '/';
  }

  private _handleRoute(): void {
    const path = this.getPath();

    // Apply before-each filter
    if (this.beforeEachHandler && !this.beforeEachHandler(path)) {
      return;
    }

    // Find matching route
    for (const route of this.routes) {
      const params = this._matchRoute(route.path, path);
      if (params !== null) {
        route.handler(params);
        return;
      }
    }

    // 404
    if (this.notFoundHandler) {
      this.notFoundHandler({});
    }
  }

  private _matchRoute(pattern: string, path: string): Record<string, string> | null {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':')) {
        // Parameter
        params[patternPart.slice(1)] = pathPart;
      } else if (patternPart === '*') {
        // Wildcard
        params['wildcard'] = pathParts.slice(i).join('/');
      } else if (patternPart !== pathPart) {
        return null;
      }
    }

    return params;
  }
}

/**
 * Create a router instance
 */
export function createRouter(): Router {
  return new Router();
}

// ============================================================================
// HTTP CLIENT
// ============================================================================

export interface HttpOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  credentials?: 'include' | 'omit' | 'same-origin';
  signal?: AbortSignal;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export class HttpClient {
  private baseURL: string = '';

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  /**
   * Set base URL for all requests
   */
  setBaseURL(url: string): this {
    this.baseURL = url;
    return this;
  }

  /**
   * Make HTTP request
   */
  async request<T = any>(endpoint: string, options: HttpOptions = {}): Promise<HttpResponse<T>> {
    const url = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
      credentials: options.credentials || 'same-origin',
    };

    if (options.body && config.method !== 'GET') {
      config.body = JSON.stringify(options.body);
    }

    if (options.signal) {
      config.signal = options.signal;
    }

    const response = await fetch(url, config);

    const data = await response.json().catch(() => null);

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      data: data as T,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    };
  }

  /**
   * GET request
   */
  get<T = any>(endpoint: string, options?: HttpOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  post<T = any>(endpoint: string, data?: any, options?: HttpOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: data });
  }

  /**
   * PUT request
   */
  put<T = any>(endpoint: string, data?: any, options?: HttpOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: data });
  }

  /**
   * DELETE request
   */
  delete<T = any>(endpoint: string, options?: HttpOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  patch<T = any>(endpoint: string, data?: any, options?: HttpOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body: data });
  }
}

/**
 * Create HTTP client instance
 */
export function createHttp(baseURL?: string): HttpClient {
  return new HttpClient(baseURL);
}

// Alias for HTTP module
export const http = new HttpClient();

// ============================================================================
// LAZY RENDERING (PERFORMANCE FEATURE)
// ============================================================================

/**
 * LazyContainer - Renders children only when they enter the viewport
 * Uses IntersectionObserver for efficient lazy loading
 */
export class LazyContainer {
  private container: HTMLElement;
  private children: NexusElement[] = [];
  private renderedChildren: Map<number, HTMLElement> = new Map();
  private observer: IntersectionObserver | null = null;
  private pendingIndices: Set<number> = new Set();

  constructor(container: HTMLElement) {
    this.container = container;
    this._setupObserver();
  }

  /**
   * Set children to be lazily rendered
   */
  setChildren(children: NexusElement[]): void {
    this.children = children;
    this._observeChildren();
  }

  /**
   * Add a single lazily rendered child
   */
  appendChild(child: NexusElement): void {
    this.children.push(child);
    const index = this.children.length - 1;
    this._observeChild(index);
  }

  /**
   * Clear all children
   */
  clear(): void {
    this.children = [];
    this.renderedChildren.forEach((el) => el.remove());
    this.renderedChildren.clear();
    this.pendingIndices.clear();
  }

  private _setupObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = (entry.target as HTMLElement).dataset.index;
            if (index !== undefined) {
              this._renderChild(parseInt(index, 10));
            }
          }
        });
      },
      { rootMargin: '100px', threshold: 0.1 }
    );
  }

  private _observeChildren(): void {
    this.children.forEach((_, index) => {
      this._observeChild(index);
    });
  }

  private _observeChild(index: number): void {
    // Create placeholder element
    const placeholder = document.createElement('div');
    placeholder.dataset.index = String(index);
    placeholder.style.minHeight = '50px';
    placeholder.className = 'lazy-placeholder';

    this.container.appendChild(placeholder);

    if (this.observer) {
      this.observer.observe(placeholder);
    }

    this.pendingIndices.add(index);
  }

  private _renderChild(index: number): void {
    if (!this.pendingIndices.has(index)) return;

    const placeholder = this.container.querySelector(`[data-index="${index}"]`);
    if (!placeholder) return;

    const child = this.children[index];
    if (!child) return;

    const node = createDOM(child, this.container);
    placeholder.replaceWith(node.element);
    this.renderedChildren.set(index, node.element);
    this.pendingIndices.delete(index);

    if (this.observer) {
      this.observer.unobserve(placeholder);
    }
  }

  /**
   * Force render all children (bypass lazy)
   */
  renderAll(): void {
    this.pendingIndices.forEach((index) => {
      this._renderChild(index);
    });
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.clear();
  }
}

/**
 * Create lazy container
 */
export function createLazyContainer(element: HTMLElement): LazyContainer {
  return new LazyContainer(element);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  h,
  $,
  Component,
  component,
  Store,
  createStore,
  Router: createRouter(),
  http,
  createHttp,
  LazyContainer,
  createLazyContainer,
};

// ============================================================================
// TYPESCRIPT DECLARATIONS FOR JS USAGE
// ============================================================================

declare global {
  interface Window {
    Nexus: typeof import('./nexus').default;
  }
}