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
/**
 * Create a virtual DOM element
 */
export declare function h(type: string, props?: Record<string, any>, ...children: Children[]): NexusElement;
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
export declare function $(type: string, propsOrChildren?: Record<string, any> | Children, ...restChildren: Children[]): NexusElement;
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
export declare class Component {
    private element;
    private container;
    private _state;
    private _props;
    private renderFn;
    private onMountFn?;
    private onUpdateFn?;
    private onUnmountFn?;
    private store?;
    constructor(options: ComponentOptions);
    /**
     * Attach component to a DOM element
     */
    mount(container: HTMLElement): HTMLElement;
    /**
     * Update the component with new state
     */
    setState(newState: Record<string, any>, callback?: () => void): void;
    /**
     * Update props
     */
    setProps(newProps: Record<string, any>): void;
    /**
     * Get current state
     */
    getState(): Record<string, any>;
    /**
     * Get current props
     */
    getProps(): Record<string, any>;
    /**
     * Attach a store for reactive state updates
     */
    attachStore(store: Store): void;
    private _mount;
    private _update;
    /**
     * Cleanup component
     */
    destroy(): void;
}
/**
 * Functional component shorthand
 */
export declare function component(renderFn: ComponentRenderFn, initialState?: Record<string, any>, initialProps?: Record<string, any>): Component;
type Subscriber = (state: Record<string, any>) => void;
export declare class Store {
    private state;
    private subscribers;
    private listeners;
    constructor(initialState?: Record<string, any>);
    /**
     * Get current state
     */
    getState(): Record<string, any>;
    /**
     * Get specific state value
     */
    get<K extends keyof Record<string, any>>(key: K): any;
    /**
     * Update state (shallow merge)
     */
    setState(newState: Record<string, any>): void;
    /**
     * Set specific state value
     */
    set<K extends keyof Record<string, any>>(key: string, value: any): void;
    /**
     * Subscribe to all state changes
     */
    subscribe(subscriber: Subscriber): () => void;
    /**
     * Subscribe to specific state key changes
     */
    on(key: string, subscriber: Subscriber): () => void;
    /**
     * Compute derived state
     */
    derive<T>(fn: (state: Record<string, any>) => T): T;
    private _notify;
}
/**
 * Create a new store instance
 */
export declare function createStore(initialState?: Record<string, any>): Store;
type RouteHandler = (params: Record<string, string>) => void;
type RouteFilter = (path: string) => boolean;
export declare class Router {
    private routes;
    private currentPath;
    private notFoundHandler?;
    private beforeEachHandler?;
    private rootElement;
    /**
     * Initialize router with a root element
     */
    init(rootElement: HTMLElement): void;
    /**
     * Register a route
     */
    route(path: string, handler: RouteHandler): this;
    /**
     * Set before-each filter
     */
    beforeEach(filter: RouteFilter): this;
    /**
     * Handle 404
     */
    notFound(handler: RouteHandler): this;
    /**
     * Navigate programmatically
     */
    navigate(path: string): void;
    /**
     * Get current path
     */
    getPath(): string;
    private _handleRoute;
    private _matchRoute;
}
/**
 * Create a router instance
 */
export declare function createRouter(): Router;
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
export declare class HttpClient {
    private baseURL;
    constructor(baseURL?: string);
    /**
     * Set base URL for all requests
     */
    setBaseURL(url: string): this;
    /**
     * Make HTTP request
     */
    request<T = any>(endpoint: string, options?: HttpOptions): Promise<HttpResponse<T>>;
    /**
     * GET request
     */
    get<T = any>(endpoint: string, options?: HttpOptions): Promise<HttpResponse<T>>;
    /**
     * POST request
     */
    post<T = any>(endpoint: string, data?: any, options?: HttpOptions): Promise<HttpResponse<T>>;
    /**
     * PUT request
     */
    put<T = any>(endpoint: string, data?: any, options?: HttpOptions): Promise<HttpResponse<T>>;
    /**
     * DELETE request
     */
    delete<T = any>(endpoint: string, options?: HttpOptions): Promise<HttpResponse<T>>;
    /**
     * PATCH request
     */
    patch<T = any>(endpoint: string, data?: any, options?: HttpOptions): Promise<HttpResponse<T>>;
}
/**
 * Create HTTP client instance
 */
export declare function createHttp(baseURL?: string): HttpClient;
export declare const http: HttpClient;
/**
 * LazyContainer - Renders children only when they enter the viewport
 * Uses IntersectionObserver for efficient lazy loading
 */
export declare class LazyContainer {
    private container;
    private children;
    private renderedChildren;
    private observer;
    private pendingIndices;
    constructor(container: HTMLElement);
    /**
     * Set children to be lazily rendered
     */
    setChildren(children: NexusElement[]): void;
    /**
     * Add a single lazily rendered child
     */
    appendChild(child: NexusElement): void;
    /**
     * Clear all children
     */
    clear(): void;
    private _setupObserver;
    private _observeChildren;
    private _observeChild;
    private _renderChild;
    /**
     * Force render all children (bypass lazy)
     */
    renderAll(): void;
    /**
     * Cleanup
     */
    destroy(): void;
}
/**
 * Create lazy container
 */
export declare function createLazyContainer(element: HTMLElement): LazyContainer;
declare const _default: {
    h: typeof h;
    $: typeof $;
    Component: typeof Component;
    component: typeof component;
    Store: typeof Store;
    createStore: typeof createStore;
    Router: Router;
    http: HttpClient;
    createHttp: typeof createHttp;
    LazyContainer: typeof LazyContainer;
    createLazyContainer: typeof createLazyContainer;
};
export default _default;
declare global {
    interface Window {
        Nexus: typeof import('./nexus').default;
    }
}
//# sourceMappingURL=nexus.d.ts.map