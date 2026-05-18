/**
 * AGX.js — Personal frontend framework
 * A comfortable layer on top of Nexus.js
 * Easy to read, easy to write, works for any site
 */

// We import the $ function from nexus
import nexus from './nexus';
import { NexusElement } from './nexus';

const $ = nexus.$;
const h = nexus.h;

// ============================================================================
// INTERNAL ELEMENT BUILDER
// ============================================================================

function _el(
  tag: string,
  content?: string | number | any[] | NexusElement,
  attrs?: Record<string, any>
): NexusElement {
  if (content === undefined || content === null) {
    return $(tag, attrs || {});
  }
  if (typeof content === 'string' || typeof content === 'number') {
    return $(tag, attrs || {}, content);
  }
  if (Array.isArray(content)) {
    return $(tag, attrs || {}, ...content);
  }
  if (content && typeof content === 'object' && (content as any).type) {
    return $(tag, attrs || {}, content);
  }
  return $(tag, attrs || {});
}

// ============================================================================
// ELEMENT SHORTCUTS
// ============================================================================

function h1(content: string | number, attrs?: Record<string, any>) { return _el('h1', content, attrs); }
function h2(content: string | number, attrs?: Record<string, any>) { return _el('h2', content, attrs); }
function h3(content: string | number, attrs?: Record<string, any>) { return _el('h3', content, attrs); }
function h4(content: string | number, attrs?: Record<string, any>) { return _el('h4', content, attrs); }
function p(content: string | number, attrs?: Record<string, any>) { return _el('p', content, attrs); }
function span(content: string | number, attrs?: Record<string, any>) { return _el('span', content, attrs); }
function div(content?: string | number | any[], attrs?: Record<string, any>) { return _el('div', content, attrs); }
function a(content: string | number, attrs?: Record<string, any>) { return _el('a', content, attrs); }
function button(content: string | number, attrs?: Record<string, any>) { return _el('button', content, attrs); }
function input(attrs?: Record<string, any>) { return _el('input', '', attrs); }
function textarea(content: string, attrs?: Record<string, any>) { return _el('textarea', content, attrs); }
function ul(items: any[], attrs?: Record<string, any>) { return _el('ul', items.map(item => li(item)), attrs); }
function li(content: string | number | any[], attrs?: Record<string, any>) { return _el('li', content, attrs); }
function img(src: string, attrs?: Record<string, any>) { return _el('img', '', { src, ...attrs }); }
function br() { return _el('br', '', {}); }
function hr(attrs?: Record<string, any>) { return _el('hr', '', attrs || {}); }
function form(children: any[], attrs?: Record<string, any>) { return _el('form', children, attrs); }
function label(content: string, attrs?: Record<string, any>) { return _el('label', content, attrs); }
function nav(children: any[], attrs?: Record<string, any>) { return _el('nav', children, attrs); }
function section(children: any[], attrs?: Record<string, any>) { return _el('section', children, attrs); }
function article(children: any[], attrs?: Record<string, any>) { return _el('article', children, attrs); }
function main(children: any[], attrs?: Record<string, any>) { return _el('main', children, attrs); }
function header(children: any[], attrs?: Record<string, any>) { return _el('header', children, attrs); }
function footer(children: any[], attrs?: Record<string, any>) { return _el('footer', children, attrs); }
function aside(children: any[], attrs?: Record<string, any>) { return _el('aside', children, attrs); }
function select(children: any[], attrs?: Record<string, any>) { return _el('select', children, attrs); }
function option(label: string, value: string, attrs?: Record<string, any>) { return _el('option', label, { value, ...attrs }); }

// ============================================================================
// ATTRIBUTE SHORTCUTS
// ============================================================================

function cls(...names: string[]) { return { className: names.join(' ') }; }
function css(styles: Record<string, string | number>) { return { style: styles }; }
function id(name: string) { return { id: name }; }
function data(key: string, value: string) { return { ['data-' + key]: value }; }
function on(event: string, handler: (e: Event) => void) { return { on: { [event]: handler } }; }
function onMulti(events: Record<string, (e: Event) => void>) { return { on: events }; }
function href(url: string, target?: string) { return target ? { href: url, target } : { href: url }; }
function ph(text: string) { return { placeholder: text }; }
function type(t: string) { return { type: t }; }
function name(n: string) { return { name: n }; }
function val(v: string | number | boolean) { return { value: v }; }
function disabled() { return { disabled: true }; }
function required() { return { attrs: { required: 'true' } }; }
function autofocus() { return { attrs: { autofocus: 'true' } }; }

// ============================================================================
// CHILDREN HELPERS
// ============================================================================

function text(content: string | number) { return content; }
function children(...items: any[]) { return items.flat().filter(Boolean); }

// ============================================================================
// COMMON PATTERNS
// ============================================================================

function card(title: string, body: string | any[], actions?: { label: string; onClick: (e: Event) => void }[]) {
  return div([
    h2(title),
    typeof body === 'string' ? p(body) : body,
    actions ? div(actions.map(a => button(a.label, on('click', a.onClick))), cls('card-actions')) : null,
  ], cls('card'));
}

function field(labelText: string, inputAttrs: Record<string, any>) {
  return div([
    label(labelText, { for: inputAttrs.id || inputAttrs.name }),
    input(inputAttrs),
  ], cls('form-field'));
}

function modal(title: string, content: any[], onClose?: () => void) {
  return div([
    div([
      h2(title),
      ...(Array.isArray(content) ? content : [content]),
    ], cls('modal-content')),
  ], {
    className: 'modal-overlay',
    on: onClose ? {
      click: (e: Event) => {
        if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
          onClose();
        }
      },
    } : undefined,
  });
}

function navbar(brand: string, links: { label: string; href: string }[]) {
  return header([
    div([
      a(brand, { href: '/', className: 'navbar-brand' }),
      nav(links.map(link => a(link.label, { href: link.href, className: 'nav-link' })), { className: 'navbar-menu' }),
    ], cls('navbar-container')),
  ], cls('navbar'));
}

function listItem(content: string | any[], onClick?: (e: Event) => void) {
  return li(content, onClick ? on('click', onClick) : {});
}

function linkButton(label: string, href: string, attrs?: Record<string, any>) {
  return a(label, { href, className: 'btn', ...attrs });
}

// ============================================================================
// LAYOUT HELPERS
// ============================================================================

function row(children: any[], gap: number = 16) {
  return div(children, css({ display: 'flex', gap: gap + 'px', alignItems: 'center' }));
}

function column(children: any[], gap: number = 16) {
  return div(children, css({ display: 'flex', flexDirection: 'column', gap: gap + 'px' }));
}

function center(children: any[], maxWidth: number = 1200) {
  return div(children, css({ maxWidth: maxWidth + 'px', margin: '0 auto', padding: '0 20px' }));
}

function grid(children: any[], columns: number = 3, gap: number = 20) {
  return div(children, css({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: gap + 'px',
  }));
}

// ============================================================================
// INTERACTIVE ELEMENTS
// ============================================================================

function alert(message: string, alertType: 'success' | 'error' | 'warning' | 'info' = 'info') {
  const colors = {
    success: { bg: '#d4edda', text: '#155724' },
    error: { bg: '#f8d7da', text: '#721c24' },
    warning: { bg: '#fff3cd', text: '#856404' },
    info: { bg: '#d1ecf1', text: '#0c5464' },
  };
  const c = colors[alertType];
  return div(message, css({
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    backgroundColor: c.bg,
    color: c.text,
  }));
}

function spinner(size: number = 24) {
  return div('', css({
    width: size + 'px',
    height: size + 'px',
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  }));
}

// ============================================================================
// AGX APP
// ============================================================================

interface AppConfig {
  root: string | HTMLElement;
  state: Record<string, any>;
  render: (state: Record<string, any>) => any;
}

function createApp(config: AppConfig) {
  const rootEl = typeof config.root === 'string'
    ? document.querySelector(config.root) as HTMLElement
    : config.root;

  if (!rootEl) {
    console.error('AGX: Root element not found:', config.root);
    return;
  }

  const listeners: Set<(state: any) => void> = new Set();
  const store = {
    state: { ...config.state },
    setState: (newState: any) => {
      store.state = { ...store.state, ...newState };
      listeners.forEach(fn => fn(store.state));
    },
    subscribe: (fn: (state: any) => void) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };

  function toElement(v: any): Node {
    if (typeof v === 'string' || typeof v === 'number') {
      return document.createTextNode(String(v));
    }
    if (!v || typeof v !== 'object') {
      return document.createTextNode('');
    }
    if (Array.isArray(v)) {
      const frag = document.createDocumentFragment();
      v.forEach(child => frag.appendChild(toElement(child)));
      return frag;
    }

    const el = document.createElement(v.type || 'div');
    const props = v.props || {};

    if (props.className) el.className = props.className;
    if (props.id) el.id = props.id;

    if (props.style) {
      Object.entries(props.style).forEach(([key, value]) => {
        (el.style as any)[key] = value;
      });
    }

    if (props.on) {
      Object.entries(props.on).forEach(([eventName, handler]) => {
        el.addEventListener(eventName, handler as EventListener);
      });
    }

    Object.entries(props).forEach(([key, value]) => {
      if (key.startsWith('data-')) {
        el.setAttribute(key, String(value));
      }
    });

    const children = props.children || v.children || [];
    const arr = Array.isArray(children) ? children : [children];
    arr.forEach((child: any) => {
      if (child) el.appendChild(toElement(child));
    });

    return el;
  }

  function render(state: Record<string, any>) {
    const vdom = config.render(state);
    rootEl.innerHTML = '';
    rootEl.appendChild(toElement(vdom));
  }

  store.subscribe(render);
  render(store.state);

  return store;
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Elements
  div, span, h1, h2, h3, h4, p, a, button, input, textarea, select, option,
  ul, li, img, br, hr, form, label, nav, section, article, main,
  header, footer, aside,

  // Attribute shortcuts
  cls, css, id, data, on, onMulti, href, ph, type, name, val,
  disabled, required, autofocus,

  // Children helpers
  text, children,

  // Common patterns
  card, field, modal, navbar, listItem, linkButton,

  // Layout
  row, column, center, grid,

  // Interactive
  alert, spinner,

  // App
  createApp,
};