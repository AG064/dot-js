/**
 * Nexus.js — A comfortable frontend framework
 *
 * Primary API is designed to be intuitive and readable:
 * - Element functions: div(), h1(), button(), input(), etc.
 * - Attribute helpers: cls(), css(), id(), on(), etc.
 * - Layout helpers: row(), column(), center(), grid()
 * - State: createStore()
 * - Router: createRouter()
 * - HTTP: createHttp()
 * - App: createApp()
 *
 * Everything is vanilla TypeScript, no external frameworks.
 */
type Attrs = Record<string, any>;
type Styles = Record<string, string | number>;
type EventHandler = (event: Event) => void;
type ChildItem = NexusElement | string | number | null | undefined;
type Children = ChildItem | ChildItem[];
export interface NexusElement {
    type: string;
    props: Record<string, any>;
    children: (NexusElement | string | number)[];
    key?: string;
}
export declare function h(type: string, props?: Attrs, ...children: any[]): NexusElement;
export declare function div(content?: Children, attrs?: Attrs): NexusElement;
export declare function span(content?: string | number, attrs?: Attrs): NexusElement;
export declare function p(content?: string | number, attrs?: Attrs): NexusElement;
export declare function h1(content?: string | number, attrs?: Attrs): NexusElement;
export declare function h2(content?: string | number, attrs?: Attrs): NexusElement;
export declare function h3(content?: string | number, attrs?: Attrs): NexusElement;
export declare function h4(content?: string | number, attrs?: Attrs): NexusElement;
export declare function h5(content?: string | number, attrs?: Attrs): NexusElement;
export declare function h6(content?: string | number, attrs?: Attrs): NexusElement;
export declare function a(content?: string | number, attrs?: Attrs): NexusElement;
export declare function strong(content?: string | number, attrs?: Attrs): NexusElement;
export declare function em(content?: string | number, attrs?: Attrs): NexusElement;
export declare function small(content?: string | number, attrs?: Attrs): NexusElement;
export declare function blockquote(content?: string | number, attrs?: Attrs): NexusElement;
export declare function code(content?: string | number, attrs?: Attrs): NexusElement;
export declare function pre(content?: string | number, attrs?: Attrs): NexusElement;
export declare function button(content?: string | number, attrs?: Attrs): NexusElement;
export declare function input(attrs?: Attrs): NexusElement;
export declare function textarea(content?: string, attrs?: Attrs): NexusElement;
export declare function select(children?: any[], attrs?: Attrs): NexusElement;
export declare function option(label?: string, value?: string, attrs?: Attrs): NexusElement;
export declare function ul(items?: (string | number)[], attrs?: Attrs): NexusElement;
export declare function ol(items?: (string | number)[], attrs?: Attrs): NexusElement;
export declare function li(content?: Children, attrs?: Attrs): NexusElement;
export declare function img(src?: string, attrs?: Attrs): NexusElement;
export declare function video(attrs?: Attrs): NexusElement;
export declare function audio(attrs?: Attrs): NexusElement;
export declare function nav(children?: Children, attrs?: Attrs): NexusElement;
export declare function header(children?: Children, attrs?: Attrs): NexusElement;
export declare function footer(children?: Children, attrs?: Attrs): NexusElement;
export declare function main(children?: Children, attrs?: Attrs): NexusElement;
export declare function section(children?: Children, attrs?: Attrs): NexusElement;
export declare function article(children?: Children, attrs?: Attrs): NexusElement;
export declare function aside(children?: Children, attrs?: Attrs): NexusElement;
export declare function form(children?: Children, attrs?: Attrs): NexusElement;
export declare function label(content?: string, attrs?: Attrs): NexusElement;
export declare function fieldset(children?: Children, attrs?: Attrs): NexusElement;
export declare function legend(content?: string, attrs?: Attrs): NexusElement;
export declare function br(): NexusElement;
export declare function hr(attrs?: Attrs): NexusElement;
export declare function spacer(size?: number): NexusElement;
export declare function cls(...names: string[]): {
    className: string;
};
export declare function css(styles: Styles): {
    style: Styles;
};
export declare function id(name: string): {
    id: string;
};
export declare function data(key: string, value: string): {
    [x: string]: string;
};
export declare function on(event: string, handler: EventHandler): {
    on: {
        [event]: EventHandler;
    };
};
export declare function onMulti(events: Record<string, EventHandler>): {
    on: Record<string, EventHandler>;
};
export declare function href(url: string, target?: string): {
    href: string;
    target: string;
} | {
    href: string;
    target?: undefined;
};
export declare function ph(text: string): {
    placeholder: string;
};
export declare function type(t: string): {
    type: string;
};
export declare function name(n: string): {
    name: string;
};
export declare function val(v: string | number | boolean): {
    value: string | number | boolean;
};
export declare function disabled(): {
    disabled: boolean;
};
export declare function required(): {
    required: boolean;
};
export declare function autofocus(): {
    autofocus: boolean;
};
export declare function readonly(): {
    readOnly: boolean;
};
export declare function checked(): {
    checked: boolean;
};
export declare function row(children: any[], gap?: number): NexusElement;
export declare function column(children: any[], gap?: number): NexusElement;
export declare function center(children: any[], maxWidth?: number): NexusElement;
export declare function grid(children: any[], columns?: number, gap?: number): NexusElement;
export declare function flex(children: any[], direction?: string, gap?: number, align?: string): NexusElement;
export declare function full(child: any): NexusElement;
export declare function createDOM(element: any): Node;
interface AppConfig {
    root: string | HTMLElement;
    state: Record<string, any>;
    render: (state: Record<string, any>) => any;
}
export declare function createApp(config: AppConfig): {
    state: any;
    setState: (newState: any) => void;
    subscribe: (fn: (state: any) => void) => () => boolean;
    get: (key: string) => any;
} | undefined;
export declare class Component {
    private el;
    private _state;
    private renderFn;
    private onMountFn?;
    constructor(config: {
        render: (state: any, props?: any) => any;
        state?: any;
        onMount?: (el: HTMLElement) => void;
    });
    mount(container: HTMLElement): HTMLElement;
    setState(newState: Record<string, any>): void;
    getState(): {
        [x: string]: any;
    };
}
type Subscriber = (state: Record<string, any>) => void;
export declare class Store {
    private state;
    private subscribers;
    private listeners;
    constructor(initialState?: Record<string, any>);
    getState(): {
        [x: string]: any;
    };
    get<K extends keyof Record<string, any>>(key: K): any;
    setState(newState: Record<string, any>): void;
    set(key: string, value: any): void;
    subscribe(fn: Subscriber): () => boolean;
    on(key: string, fn: Subscriber): () => boolean | undefined;
    derive<T>(fn: (state: Record<string, any>) => T): T;
    private _notify;
}
export declare function createStore(initialState?: Record<string, any>): Store;
type RouteHandler = (params: Record<string, string>) => void;
type RouteFilter = (path: string) => boolean;
export declare class Router {
    private routes;
    private notFoundHandler?;
    private beforeEachHandler?;
    init(): void;
    route(path: string, handler: RouteHandler): this;
    beforeEach(fn: RouteFilter): this;
    notFound(fn: RouteHandler): this;
    navigate(path: string): void;
    getPath(): string;
    private _handle;
    private _match;
}
export declare function createRouter(): Router;
interface HttpOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
}
interface HttpResponse<T = any> {
    data: T;
    status: number;
}
export declare class HttpClient {
    private baseURL;
    constructor(baseURL?: string);
    setBaseURL(url: string): this;
    request<T = any>(endpoint: string, options?: HttpOptions): Promise<HttpResponse<T>>;
    get<T = any>(endpoint: string): Promise<HttpResponse<T>>;
    post<T = any>(endpoint: string, data?: any): Promise<HttpResponse<T>>;
    put<T = any>(endpoint: string, data?: any): Promise<HttpResponse<T>>;
    delete<T = any>(endpoint: string): Promise<HttpResponse<T>>;
    patch<T = any>(endpoint: string, data?: any): Promise<HttpResponse<T>>;
}
export declare function createHttp(baseURL?: string): HttpClient;
export declare class LazyContainer {
    private container;
    private children;
    private observer;
    private pending;
    constructor(container: HTMLElement);
    setChildren(children: any[]): void;
    private _render;
    renderAll(): void;
    destroy(): void;
}
export declare function createLazyContainer(el: HTMLElement): LazyContainer;
export declare function card(title: string, body: any, actions?: {
    label: string;
    onClick: (e: Event) => void;
}[]): NexusElement;
export declare function modal(title: string, content: any[], onClose?: () => void): NexusElement;
export declare function navbar(brand: string, links: {
    label: string;
    href: string;
}[]): NexusElement;
export declare function alert(message: string, type?: 'success' | 'error' | 'warning' | 'info'): NexusElement;
export declare function spinner(size?: number): NexusElement;
declare const _default: {
    div: typeof div;
    span: typeof span;
    p: typeof p;
    h1: typeof h1;
    h2: typeof h2;
    h3: typeof h3;
    h4: typeof h4;
    h5: typeof h5;
    h6: typeof h6;
    a: typeof a;
    strong: typeof strong;
    em: typeof em;
    small: typeof small;
    blockquote: typeof blockquote;
    code: typeof code;
    pre: typeof pre;
    button: typeof button;
    input: typeof input;
    textarea: typeof textarea;
    select: typeof select;
    option: typeof option;
    ul: typeof ul;
    ol: typeof ol;
    li: typeof li;
    img: typeof img;
    video: typeof video;
    audio: typeof audio;
    nav: typeof nav;
    header: typeof header;
    footer: typeof footer;
    main: typeof main;
    section: typeof section;
    article: typeof article;
    aside: typeof aside;
    form: typeof form;
    label: typeof label;
    fieldset: typeof fieldset;
    legend: typeof legend;
    br: typeof br;
    hr: typeof hr;
    spacer: typeof spacer;
    cls: typeof cls;
    css: typeof css;
    id: typeof id;
    data: typeof data;
    on: typeof on;
    onMulti: typeof onMulti;
    href: typeof href;
    ph: typeof ph;
    type: typeof type;
    name: typeof name;
    val: typeof val;
    disabled: typeof disabled;
    required: typeof required;
    autofocus: typeof autofocus;
    readonly: typeof readonly;
    checked: typeof checked;
    row: typeof row;
    column: typeof column;
    center: typeof center;
    grid: typeof grid;
    flex: typeof flex;
    full: typeof full;
    h: typeof h;
    createDOM: typeof createDOM;
    createApp: typeof createApp;
    createStore: typeof createStore;
    Store: typeof Store;
    Component: typeof Component;
    createRouter: typeof createRouter;
    Router: typeof Router;
    createHttp: typeof createHttp;
    HttpClient: typeof HttpClient;
    createLazyContainer: typeof createLazyContainer;
    LazyContainer: typeof LazyContainer;
    card: typeof card;
    modal: typeof modal;
    navbar: typeof navbar;
    alert: typeof alert;
    spinner: typeof spinner;
};
export default _default;
//# sourceMappingURL=nexus.d.ts.map