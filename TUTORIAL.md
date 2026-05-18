# Как создать свой Frontend Framework с нуля — Полное руководство

> Это руководство для студентов IVKHK. Мы построим Nexus.js — настоящий frontend framework,
> используя только TypeScript и стандартные браузерные API. Никаких React, Vue, Angular — только JavaScript.

---

## Оглавление

1. [Зачем это нужно?](#1-зачем-это-нужно)
2. [Что мы будем создавать](#2-что-мы-будем-создавать)
3. [Настройка проекта](#3-настройка-проекта)
4. [Virtual DOM — сердце любого фреймворка](#4-virtual-dom--сердце-любого-фреймворка)
5. [Функция `$()` — создаём элементы](#5-функция---создаём-элементы)
6. [Component System — повторно используемые блоки](#6-component-system--повторно-используемые-блоки)
7. [State Management — реактивное состояние](#7-state-management--реактивное-состояние)
8. [Router — навигация без перезагрузки](#8-router--навигация-без-перезагрузки)
9. [Event Handling — события по-другому](#9-event-handling--события-по-другому)
10. [HTTP Client — запросы к API](#10-http-client--запросы-к-api)
11. [Lazy Rendering — оптимизация](#11-lazy-rendering--оптимизация)
12. [Как всё связать — пример Kanban](#12-как-всё-связать--пример-kanban)
13. [Частые ошибки и как их избежать](#13-частые-ошибки-и-как-их-избежать)

---

## 1. Зачем это нужно?

### Проблема: JavaScript Fatigue

Каждую неделю появляется новый JavaScript фреймворк. React, Vue, Angular, Svelte, Solid... Как выбрать? Как понять как они работают внутри?

**Ответ простой:** построить свой. Не для продакшена, а для понимания.

### Что ты получишь:

- Глубокое понимание как работает React под капотом
- Навыки архитектурного мышления
- Умение писать чистый, типобезопасный код на TypeScript
- Проект для портфолио (выглядит впечатляюще!)
- Понимание компромиссов: что легко, что сложно, что невозможно

### Framework vs Library — в чём разница?

Это важно понять перед тем как писать свой фреймворк.

**Library (библиотека):** ты вызываешь её функции. Ты контролируешь поток выполнения.
```javascript
// jQuery — библиотека
$('#button').click(handler);
```

**Framework (фреймворк):** он вызывает ТВОЙ код. ОН контролирует поток выполнения.
```javascript
// React — фреймворк
function App() {
  return <button onClick={handler}>Click</button>;
}
```

Мы создаём именно **framework** — ты описываешь что хочешь увидеть, а фреймворк решает как это показать.

---

## 2. Что мы будем создавать

### Nexus.js — наш фреймворк

Назовём его Nexus.js. Он будет делать следующее:

| Фича | Описание |
|------|----------|
| **`$()` функция** | Создаёт виртуальные DOM элементы |
| **`Component` класс** | Повторно используемые UI блоки |
| **`createStore()`** | Реактивное хранилище состояния |
| **`createRouter()`** | Навигация между страницами (SPA) |
| **`createHttp()`** | HTTP запросы к API |
| **`LazyContainer`** | Ленивая загрузка для больших списков |

### Структура проекта

```
dot-js/
├── framework/              ← наш фреймворк
│   ├── src/
│   │   └── nexus.ts       ← весь код здесь
│   ├── dist/               ← скомпилированные файлы
│   └── README.md
│
└── example/                ← пример использования
    └── src/
        └── main.ts        ← Kanban доска
```

---

## 3. Настройка проекта

### Шаг 3.1: Создаём папку

```bash
mkdir -p dot-js/framework/src
cd dot-js/framework
npm init -y
```

### Шаг 3.2: Устанавливаем TypeScript

```bash
npm install typescript --save-dev
```

### Шаг 3.3: Создаём tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "node",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "outDir": "./dist",
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

### Шаг 3.4: Структура файла фреймворка

Весь наш фреймворк будет в одном файле `src/nexus.ts`. Звучит безумно, но это нормально для учебного проекта. В продакшене каждый модуль был бы в отдельном файле.

---

## 4. Virtual DOM — сердце любого фреймворка

### Что такое DOM?

DOM (Document Object Model) — это представление HTML страницы в виде объектов JavaScript.

```javascript
// DOM выглядит примерно так:
{
  tagName: 'DIV',
  children: [
    { tagName: 'H1', textContent: 'Hello' },
    { tagName: 'BUTTON', textContent: 'Click' }
  ]
}
```

**Проблема:** напрямую менять DOM — медленно. Каждое изменение вызывает reflow и repaint браузера.

### Что такое Virtual DOM?

Virtual DOM — это "клон" реального DOM, сделанный из обычных JavaScript объектов.

```typescript
// Это НЕ DOM. Это JavaScript объект.
const virtualElement = {
  type: 'div',
  props: { className: 'container' },
  children: [
    { type: 'h1', props: {}, children: ['Hello'] }
  ]
};
```

### Зачем нужен Virtual DOM?

1. **Быстрое сравнение:** сравнить два JavaScript объекта — дешевле чем менять реальный DOM
2. **Batch updates:** можно накопить изменения и применить их разом
3. **Абстракция:** не нужно знать как работает браузерный DOM

### Как работает согласование (Reconciliation)?

Когда состояние меняется:

1. Создаётся НОВЫЙ виртуальный DOM (новый объект)
2. Сравниваем новый с предыдущим (diffing)
3. Находим минимальные изменения
4. Применяем ТОЛЬКО нужные изменения к реальному DOM

```typescript
// Было:
// { type: 'div', children: ['Hello'] }

// Стало:
// { type: 'div', children: ['Hello World'] }

// Diff: child[0] изменился с 'Hello' на 'Hello World'
// Браузеру: element.textContent = 'Hello World'
```

### Ключевое понятие: NexusElement

```typescript
// Интерфейс виртуального элемента
interface NexusElement {
  type: string;           // 'div', 'span', 'button'...
  props: Record<string, any>;  // атрибуты, стили, обработчики
  children: (NexusElement | string | number)[];  // дочерние элементы
  key?: string;           // для оптимизации списков
}
```

---

## 5. Функция `$()` — создаём элементы

### Идея

Вместо:
```javascript
const div = document.createElement('div');
div.className = 'container';
const h1 = document.createElement('h1');
h1.textContent = 'Hello';
div.appendChild(h1);
document.body.appendChild(div);
```

Мы хотим:
```javascript
const vdom = $('div', { className: 'container' },
  $('h1', {}, 'Hello')
);
```

### Функция `h()` — базовая

```typescript
/**
 * Создаёт виртуальный DOM элемент
 *
 * @param type - HTML тег ('div', 'span', 'button'...)
 * @param props - атрибуты и свойства { className, style, on: {...} }
 * @param children - дочерние элементы
 */
export function h(
  type: string,
  props: Record<string, any> = {},
  ...children: (NexusElement | string | number)[]
): NexusElement {
  return {
    type,
    props: { ...props },
    children: flattenChildren(children),
    key: props.key || undefined,
  };
}

/**
 * Превращает вложенные массивы в плоский список
 * Это нужно для поддержки: $('div', {}, [$('span'), $('span')])
 */
function flattenChildren(children: any[]): (NexusElement | string | number)[] {
  const result: (NexusElement | string | number)[] = [];

  for (const child of children) {
    if (Array.isArray(child)) {
      // Рекурсивно обрабатываем вложенные массивы
      result.push(...flattenChildren(child));
    } else if (child != null) {
      // null и undefined игнорируем
      result.push(child);
    }
  }

  return result;
}
```

### Функция `$()` — шорткат

```typescript
/**
 * Shorthand для h() — создаёт DOM элемент с цепочечным API
 *
 * Использование:
 *   $('div', { className: 'container' },
 *     $('h1', {}, 'Hello'),
 *     $('button', { on: { click: handler } }, 'Click me')
 *   )
 *
 * Или с массивом детей:
 *   $('div', { className: 'container' }, [
 *     $('span', {}, 'Item 1'),
 *     $('span', {}, 'Item 2')
 *   ])
 */
export function $(
  type: string,
  propsOrChildren?: Record<string, any> | any[],
  ...restChildren: any[]
): NexusElement {
  let props: Record<string, any> = {};
  let children: any[] = [];

  // Разные варианты вызова:
  // $('div', { className: 'x' }, child1, child2)
  // $('div', [child1, child2])
  // $('div', child1, child2)

  if (typeof propsOrChildren === 'object' && propsOrChildren !== null && !Array.isArray(propsOrChildren)) {
    props = propsOrChildren;
    children = restChildren;
  } else if (Array.isArray(propsOrChildren)) {
    children = propsOrChildren;
  } else {
    children = [propsOrChildren, ...restChildren].filter(Boolean);
  }

  return h(type, props, ...children);
}
```

### Преобразование в реальный DOM

Теперь нам нужна функция которая превратит `NexusElement` в настоящий `HTMLElement`:

```typescript
/**
 * Превращает виртуальный элемент в реальный DOM
 */
function createDOM(element: NexusElement, parent?: HTMLElement): HTMLElement {
  const { type, props, children } = element;

  // Текстовые узлы
  if (type === 'text') {
    return document.createTextNode(String(children[0] || ''));
  }

  // Создаём HTML элемент
  const el = document.createElement(type);

  // === АТРИБУТЫ ===
  if (props.attrs) {
    for (const [key, value] of Object.entries(props.attrs)) {
      if (value !== false && value != null) {
        el.setAttribute(key, String(value));
      }
    }
  }

  // === СТИЛИ ===
  if (props.style) {
    for (const [key, value] of Object.entries(props.style)) {
      (el.style as any)[key] = String(value);
    }
  }

  // === CLASSNAME ===
  if (props.className) {
    el.className = String(props.className);
  }

  // === ID ===
  if (props.id) {
    el.id = String(props.id);
  }

  // === EVENT LISTENERS ===
  // ВАЖНО: Мы НЕ используем addEventListener здесь!
  // Вместо этого сохраняем обработчики в _nexusHandlers
  // Это позволяет событиям работать как в React — на уровне "рендера"
  if (props.on) {
    for (const [eventName, handler] of Object.entries(props.on)) {
      if (typeof handler === 'function') {
        // Сохраняем для отладки и возможных манипуляций
        (el as any)._nexusHandlers = (el as any)._nexusHandlers || {};
        (el as any)._nexusHandlers[eventName] = handler;

        // Привязываем событие через стандартный addEventListener
        // Но делаем это ВО ВРЕМЯ рендера, а не после
        el.addEventListener(eventName, handler as EventListener);
      }
    }
  }

  // === SPECIAL INPUT PROPS ===
  if ('value' in props && (type === 'input' || type === 'textarea' || type === 'select')) {
    (el as HTMLInputElement).value = String(props.value);
  }

  if ('checked' in props && type === 'input') {
    (el as HTMLInputElement).checked = Boolean(props.checked);
  }

  // === SPECIAL ATTRIBUTES ===
  if (props.disabled === true) {
    el.setAttribute('disabled', '');
  }

  if ('placeholder' in props) {
    el.setAttribute('placeholder', String(props.placeholder));
  }

  for (const key of ['href', 'src', 'alt', 'title']) {
    if (key in props) {
      el.setAttribute(key, String(props[key]));
    }
  }

  // === INNER HTML ===
  if ('innerHTML' in props) {
    el.innerHTML = String(props.innerHTML);
  }

  // === РЕКУРСИВНО СОЗДАЁМ ДЕТЕЙ ===
  for (const child of children) {
    if (typeof child === 'string' || typeof child === 'number') {
      el.appendChild(document.createTextNode(String(child)));
    } else if (child && typeof child === 'object' && child.type) {
      // Рекурсивно создаём дочерние элементы
      const childEl = createDOM(child, el);
      el.appendChild(childEl);
    }
  }

  return el;
}
```

---

## 6. Component System — повторно используемые блоки

### Проблема

У нас есть элементы, но как сделать чтобы их можно было переиспользовать с разным состоянием?

### Решение: Component класс

```typescript
/**
 * Опции компонента
 */
export interface ComponentOptions {
  // Обязательно: функция рендера
  render: (state: Record<string, any>, props?: Record<string, any>) => NexusElement;

  // Начальное состояние
  state?: Record<string, any>;

  // Начальные пропсы
  props?: Record<string, any>;

  // Lifecycle: после монтирования в DOM
  onMount?: (node: HTMLElement, props?: Record<string, any>) => void;

  // Lifecycle: после каждого обновления состояния
  onUpdate?: (prevState: any, nextState: any, props?: any) => void;

  // Lifecycle: перед уничтожением
  onUnmount?: () => void;
}

/**
 * Компонент — это "живой" кусок UI
 *
 * В отличие от простого NexusElement, компонент:
 * 1. Имеет СОСТОЯНИЕ (state)
 * 2. Умеет ПЕРЕРИСОВЫВАТЬСЯ при изменении состояния
 * 3. Имеет ЖИЗНЕННЫЙ ЦИКЛ (mount, update, unmount)
 */
export class Component {
  private element: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private _state: Record<string, any>;
  private _props: Record<string, any>;
  private renderFn: ComponentOptions['render'];
  private onMountFn?: ComponentOptions['onMount'];
  private onUpdateFn?: ComponentOptions['onUpdate'];
  private onUnmountFn?: ComponentOptions['onUnmount'];

  constructor(options: ComponentOptions) {
    // Копируем чтобы не мутировать входные данные
    this._state = { ...(options.state || {}) };
    this._props = { ...(options.props || {}) };
    this.renderFn = options.render;
    this.onMountFn = options.onMount;
    this.onUpdateFn = options.onUpdate;
    this.onUnmountFn = options.onUnmount;
  }

  /**
   * Примонтировать компонент к DOM элементу
   */
  mount(container: HTMLElement): HTMLElement {
    this.container = container;
    this.element = this._mount();

    // Вызываем onMount хук
    if (this.onMountFn && this.element) {
      this.onMountFn(this.element, this._props);
    }

    return this.element;
  }

  /**
   * Обновить состояние и перерисовать
   */
  setState(newState: Record<string, any>): void {
    const prevState = { ...this._state };

    // Shallow merge — новые значения перезаписывают старые
    this._state = { ...this._state, ...newState };

    // Если элемент уже в DOM — перерисовать
    if (this.element && this.container) {
      this._update();

      // Вызываем onUpdate хук
      if (this.onUpdateFn) {
        this.onUpdateFn(prevState, this._state, this._props);
      }
    }
  }

  /**
   * Обновить пропсы (аналог React props)
   */
  setProps(newProps: Record<string, any>): void {
    this._props = { ...this._props, ...newProps };
    if (this.element && this.container) {
      this._update();
    }
  }

  /**
   * Получить текущее состояние (копия)
   */
  getState(): Record<string, any> {
    return { ...this._state };
  }

  /**
   * Примонтировать стор для реактивности
   */
  attachStore(store: Store): void {
    store.subscribe((state) => {
      if (this.element && this.container) {
        this.setState(state);
      }
    });
  }

  /**
   * Уничтожить компонент
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

  // === Приватные методы ===

  private _mount(): HTMLElement {
    // 1. Рендерим виртуальный DOM
    const vdom = this.renderFn(this._state, this._props);

    // 2. Создаём обёртку
    const wrapper = document.createElement('div');

    // 3. Добавляем в контейнер
    this.container?.appendChild(wrapper);

    // 4. Превращаем виртуальный DOM в реальный
    const node = createDOM(vdom, wrapper);
    wrapper.appendChild(node);

    return wrapper;
  }

  private _update(): void {
    if (!this.container || !this.element) return;

    // 1. Рендерим новый виртуальный DOM
    const vdom = this.renderFn(this._state, this._props);

    // 2. Очищаем текущий элемент
    this.element.innerHTML = '';

    // 3. Создаём новый реальный DOM и вставляем
    const node = createDOM(vdom, this.element);
    this.element.appendChild(node);
  }
}
```

### Использование Component

```typescript
// Пример: компонент кнопки со счётчиком кликов
const counterStore = createStore({ count: 0 });

class CounterButton extends Component {
  constructor() {
    super({
      render: (state) => $('button', {
        on: {
          click: () => {
            // При клике обновляем store
            counterStore.set('count', state.count + 1);
          }
        }
      }, `Кликнули ${state.count} раз`),

      state: { count: 0 },
    });

    // Слушаем изменения store
    counterStore.subscribe((newState) => {
      this.setState(newState);
    });
  }
}

// Использование:
const button = new CounterButton();
button.mount(document.getElementById('app'));
```

---

## 7. State Management — реактивное состояние

### Что такое реактивность?

Реактивность — это когда при изменении данных автоматически обновляется UI.

БЕЗ реактивности:
```javascript
let count = 0;
button.addEventListener('click', () => {
  count++;
  // Нужно вручную обновлять текст
  button.textContent = `Count: ${count}`;
});
```

С реактивностью:
```javascript
const store = createStore({ count: 0 });

button.addEventListener('click', () => {
  store.set('count', store.get('count') + 1);
  // UI обновится АВТОМАТИЧЕСКИ
});

// Мы "подписываемся" на изменения
store.subscribe((state) => {
  button.textContent = `Count: ${state.count}`;
});
```

### Store — хранилище состояния

```typescript
/**
 * Subscriber — функция которая вызывается при изменении состояния
 */
type Subscriber = (state: Record<string, any>) => void;

/**
 * Store — реактивное хранилище данных
 *
 * Принцип работы:
 * 1. Данные хранятся в одном объекте
 * 2. При изменении — уведомляем всех подписчиков
 * 3. Подписчики сами решают что обновить
 */
export class Store {
  private state: Record<string, any>;
  private subscribers: Set<Subscriber> = new Set();
  // Подписки на конкретные ключи: store.on('count', fn)
  private listeners: Map<string, Set<Subscriber>> = new Map();

  constructor(initialState: Record<string, any> = {}) {
    this.state = { ...initialState };
  }

  /**
   * Получить всё состояние
   */
  getState(): Record<string, any> {
    return { ...this.state };
  }

  /**
   * Получить конкретное значение
   */
  get<K extends keyof Record<string, any>>(key: K): any {
    return this.state[key];
  }

  /**
   * Установить состояние (shallow merge)
   */
  setState(newState: Record<string, any>): void {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this._notify(prevState, newState);
  }

  /**
   * Установить конкретное значение
   */
  set(key: string, value: any): void {
    const prevState = { ...this.state };
    this.state[key] = value;
    this._notify(prevState, { [key]: value });
  }

  /**
   * Подписаться на ВСЕ изменения
   */
  subscribe(subscriber: Subscriber): () => void {
    this.subscribers.add(subscriber);
    // Возвращаем функцию отписки
    return () => this.subscribers.delete(subscriber);
  }

  /**
   * Подписаться на изменения конкретного ключа
   */
  on(key: string, subscriber: Subscriber): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(subscriber);
    return () => this.listeners.get(key)?.delete(subscriber);
  }

  /**
   * Вычислить производное значение
   */
  derive<T>(fn: (state: Record<string, any>) => T): T {
    return fn(this.state);
  }

  /**
   * Уведомить подписчиков об изменении
   */
  private _notify(prevState: Record<string, any>, changed: Record<string, any>): void {
    // Все подписчики
    for (const sub of this.subscribers) {
      sub(this.state);
    }

    // Подписчики конкретных ключей
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
 * Фабрика для создания store
 */
export function createStore(initialState?: Record<string, any>): Store {
  return new Store(initialState);
}
```

### Использование Store

```typescript
// Создаём store с начальным состоянием
const appStore = createStore({
  user: null as { name: string; email: string } | null,
  theme: 'light',
  todos: [] as string[],
  loading: false,
});

// Подписываемся на всё
const unsubscribe = appStore.subscribe((state) => {
  console.log('State changed:', state);
});

// Подписываемся на конкретный ключ
const unsubTodos = appStore.on('todos', (state) => {
  console.log('Todos changed:', state.todos);
  renderTodoList(state.todos);
});

// Изменяем данные — подписчики автоматически вызовутся
appStore.set('theme', 'dark');
appStore.set('todos', [...appStore.get('todos'), 'New todo']);
appStore.setState({ user: { name: 'Alice', email: 'alice@example.com' } });

// Отписываемся
unsubTodos();
unsubscribe();
```

### Persistence — сохранение между сессиями

```typescript
// Сохраняем в localStorage при каждом изменении
const store = createStore(
  JSON.parse(localStorage.getItem('app-state') || '{}')
);

store.subscribe((state) => {
  localStorage.setItem('app-state', JSON.stringify(state));
});
```

---

## 8. Router — навигация без перезагрузки

### Что такое SPA роутинг?

Традиционный сайт: ты переходишь по ссылке → браузер запрашивает новую страницу с сервера → полная перезагрузка.

SPA (Single Page Application): ты переходишь по ссылке → JavaScript перехватывает → показывает другой "вид" → НЕТ перезагрузки.

### Как работает Hash Router?

Проблема: браузер отправляет на сервер только URL ДО `#`. Значит `#/about` никогда не попадёт на сервер.

```javascript
// URL: https://example.com/page#/about
// Сервер видит: https://example.com/page
// Браузер видит: всё что после #

window.location.hash;  // '#/about'
```

Hash Router использует это! Изменяя `window.location.hash` мы меняем "URL" без запроса к серверу.

### Реализация Router

```typescript
type RouteHandler = (params: Record<string, string>) => void;
type RouteFilter = (path: string) => boolean;

interface Route {
  path: string;       // Шаблон пути, например '/user/:id'
  handler: RouteHandler;
  params?: Record<string, string>;
}

export class Router {
  private routes: Route[] = [];
  private currentPath: string = '/';
  private notFoundHandler?: RouteHandler;
  private beforeEachHandler?: RouteFilter;
  private rootElement: HTMLElement | null = null;

  /**
   * Инициализировать роутер с корневым элементом
   */
  init(rootElement: HTMLElement): void {
    this.rootElement = rootElement;

    // Слушаем изменения хэша
    window.addEventListener('hashchange', () => this._handleRoute());

    // Обрабатываем текущий путь при загрузке
    this._handleRoute();
  }

  /**
   * Зарегистрировать маршрут
   *
   * Примеры:
   *   router.route('/home', () => renderHome())
   *   router.route('/user/:id', (params) => renderUser(params.id))
   *   router.route('/post/:slug/:id', (params) => ...)
   */
  route(path: string, handler: RouteHandler): this {
    this.routes.push({ path, handler });
    return this;  // Для цепочки вызовов
  }

  /**
   * Фильтр перед каждым переходом (например, для авторизации)
   */
  beforeEach(filter: RouteFilter): this {
    this.beforeEachHandler = filter;
    return this;
  }

  /**
   * Обработчик для 404
   */
  notFound(handler: RouteHandler): this {
    this.notFoundHandler = handler;
    return this;
  }

  /**
   * Перейти на другой путь программно
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
   * Получить текущий путь (без #)
   */
  getPath(): string {
    return window.location.hash.replace('#', '') || '/';
  }

  /**
   * Обработать текущий путь
   */
  private _handleRoute(): void {
    const path = this.getPath();

    // Применяем фильтр перед переходом
    if (this.beforeEachHandler && !this.beforeEachHandler(path)) {
      return;
    }

    // Ищем подходящий маршрут
    for (const route of this.routes) {
      const params = this._matchRoute(route.path, path);
      if (params !== null) {
        route.handler(params);
        return;
      }
    }

    // Ничего не нашлось — 404
    if (this.notFoundHandler) {
      this.notFoundHandler({});
    }
  }

  /**
   * Сравнить путь с шаблоном и извлечь параметры
   */
  private _matchRoute(pattern: string, path: string): Record<string, string> | null {
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    // Если количество сегментов не совпадает — не подходит
    if (patternParts.length !== pathParts.length) {
      return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':')) {
        // Это параметр, например :id
        params[patternPart.slice(1)] = pathPart;
      } else if (patternPart !== pathPart) {
        // Точная строка не совпала
        return null;
      }
    }

    return params;
  }
}

export function createRouter(): Router {
  return new Router();
}
```

### Использование Router

```typescript
const router = createRouter();

// Фильтр перед переходом (например, проверка авторизации)
router.beforeEach((path) => {
  const isLoggedIn = localStorage.getItem('token') !== null;
  if (!isLoggedIn && path !== '/login') {
    router.navigate('/login');
    return false;  // Блокируем переход
  }
  return true;
});

// Маршруты
router
  .route('/home', () => {
    console.log('Home page');
  })
  .route('/about', () => {
    console.log('About page');
  })
  .route('/user/:id', (params) => {
    console.log('User ID:', params.id);
  })
  .route('/post/:slug', (params) => {
    console.log('Post slug:', params.slug);
  })
  .notFound(() => {
    console.log('404 — страница не найдена');
  });

// Запускаем
router.init(document.getElementById('app'));

// Программная навигация
router.navigate('/user/123');  // Перейдёт на /user/123
```

---

## 9. Event Handling — события по-другому

### Почему не `addEventListener`?

В React ты не вызываешь `addEventListener` после рендера. Вместо этого:

```jsx
// React
function Button() {
  return <button onClick={handleClick}>Click</button>;
}
```

Мы делаем так же. Наш синтаксис:

```typescript
$('button', {
  on: {
    click: (e: Event) => {
      e.preventDefault();
      console.log('Clicked!');
    },
    mouseenter: () => console.log('Entered'),
  }
}, 'Click me');
```

### Как это работает внутри?

```typescript
// Внутри createDOM:

if (props.on) {
  for (const [eventName, handler] of Object.entries(props.on)) {
    if (typeof handler === 'function') {
      // Привязываем обработчик ВО ВРЕМЯ создания DOM
      // Это ключевое отличие от jQuery/lodash подхода
      el.addEventListener(eventName, handler as EventListener);
    }
  }
}
```

### Event Delegation — оптимизация

Если у нас список из 1000 элементов, вешать обработчик на каждый — дорого. Event delegation — вешаем ОДИН обработчик на родителя и ловим события от детей через bubbling.

```typescript
// Вместо 1000 addEventListener (дорого):
tasks.map(task => $('li', {
  on: { click: () => handleTaskClick(task.id) }
}, task.title));

// Один обработчик на родителе (дёшево):
$('ul', {
  on: {
    // Этот обработчик получит клики ОТ ВСЕХ дочерних li
    click: (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'LI') {
        const taskId = target.dataset.taskId;
        handleTaskClick(taskId);
      }
    }
  }
}, tasks.map(task => $('li', { 'data-task-id': task.id }, task.title)));
```

### preventDefault и stopPropagation

```typescript
$('form', {
  on: {
    submit: (e: Event) => {
      e.preventDefault();         // Отменяем стандартное поведение формы
      e.stopPropagation();        // Останавливаем всплытие
      // Обрабатываем данные...
    }
  }
}, [...]);

// Или для ссылок:
$('a', {
  href: '/other-page',
  on: {
    click: (e: Event) => {
      e.preventDefault();         // SPA навигация вместо перехода
      router.navigate('/other-page');
    }
  }
}, 'Link');
```

---

## 10. HTTP Client — запросы к API

### Зачем нужен свой HTTP клиент?

fetch API хорош, но требует много бойлерплейта:

```javascript
// Чистый fetch
const response = await fetch('https://api.example.com/users');
const data = await response.json();
console.log(data);

// С ошибками, заголовками, etc...
const response = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice' }),
});
if (!response.ok) throw new Error('HTTP error');
const data = await response.json();
```

Наш HTTP клиент:

```typescript
const api = createHttp('https://api.example.com');

// GET
const users = await api.get('/users');

// POST
const newUser = await api.post('/users', { name: 'Alice' });
```

### Реализация

```typescript
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

  setBaseURL(url: string): this {
    this.baseURL = url;
    return this;
  }

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

    // Пробуем распарсить JSON, если не получится — null
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

  get<T = any>(endpoint: string, options?: HttpOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, data?: any, options?: HttpOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: data });
  }

  put<T = any>(endpoint: string, data?: any, options?: HttpOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: data });
  }

  delete<T = any>(endpoint: string, options?: HttpOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  patch<T = any>(endpoint: string, data?: any, options?: HttpOptions): Promise<HttpResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body: data });
  }
}

export function createHttp(baseURL?: string): HttpClient {
  return new HttpClient(baseURL);
}
```

### Использование

```typescript
// Создаём клиент для JSONPlaceholder API
const api = createHttp('https://jsonplaceholder.typicode.com');

class UsersComponent extends Component {
  constructor() {
    super({
      render: (state) => $('div', {}, state.loading ? 'Loading...' : 'Done'),
      state: { users: [], loading: true },
    });

    this.loadUsers();
  }

  async loadUsers() {
    try {
      const response = await api.get('/users?_limit=5');
      this.setState({ users: response.data, loading: false });
    } catch (error) {
      console.error('Failed to load users:', error);
      this.setState({ loading: false });
    }
  }
}
```

---

## 11. Lazy Rendering — оптимизация

### Проблема больших списков

Попробуй отрендерить список из 10,000 элементов. Браузер зависнет на несколько секунд.

Почему? Потому что:
1. Нужно создать 10,000 DOM узлов
2. Для каждого применить CSS (каскад, вычисления)
3. Провести layout (вычисление позиций)
4. Repaint для каждого элемента

### Решение: Lazy Rendering

Идея: рендерить элементы только когда они видны на экране.

```typescript
/**
 * LazyContainer — рендерит детей только когда они входят в viewport
 *
 * Использует IntersectionObserver API для эффективного определения
 * видимости элемента без слушания scroll событий.
 */
export class LazyContainer {
  private container: HTMLElement;
  private children: NexusElement[] = [];
  private observer: IntersectionObserver | null = null;
  private pendingIndices: Set<number> = new Set();

  constructor(container: HTMLElement) {
    this.container = container;
    this._setupObserver();
  }

  private _setupObserver(): void {
    // IntersectionObserver намного эффективнее scroll событий
    // Он работает асинхронно и не блокирует main thread
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Элемент вошёл в viewport
            const index = (entry.target as HTMLElement).dataset.index;
            if (index !== undefined) {
              this._renderChild(parseInt(index, 10));
            }
          }
        });
      },
      {
        rootMargin: '100px',  // Начинаем за 100px до входа в viewport
        threshold: 0.1,       // Срабатывает когда 10% элемента видно
      }
    );
  }

  /**
   * Установить детей для ленивого рендеринга
   */
  setChildren(children: NexusElement[]): void {
    this.children = children;

    // Очищаем контейнер и создаём плейсхолдеры
    this.container.innerHTML = '';

    children.forEach((_, index) => {
      const placeholder = document.createElement('div');
      placeholder.dataset.index = String(index);
      placeholder.style.minHeight = '50px';  // Место под будущий элемент
      placeholder.className = 'lazy-placeholder';

      this.container.appendChild(placeholder);
      this.observer?.observe(placeholder);  // Начинаем следить
      this.pendingIndices.add(index);
    });
  }

  /**
   * Отрисовать конкретный элемент
   */
  private _renderChild(index: number): void {
    if (!this.pendingIndices.has(index)) return;

    const placeholder = this.container.querySelector(`[data-index="${index}"]`);
    if (!placeholder) return;

    const child = this.children[index];
    if (!child) return;

    // Создаём реальный DOM
    const node = createDOM(child, this.container);

    // Заменяем плейсхолдер на реальный элемент
    placeholder.replaceWith(node.element);

    // Прекращаем следить за этим элементом
    this.observer?.unobserve(placeholder);
    this.pendingIndices.delete(index);
  }

  /**
   * Принудительно отрендерить всё (отключить ленивость)
   */
  renderAll(): void {
    for (const index of this.pendingIndices) {
      this._renderChild(index);
    }
  }

  destroy(): void {
    this.observer?.disconnect();
    this.children = [];
    this.pendingIndices.clear();
  }
}

export function createLazyContainer(element: HTMLElement): LazyContainer {
  return new LazyContainer(element);
}
```

### Когда использовать LazyContainer?

| Сценарий | Нужен Lazy? |
|----------|-------------|
| Список < 50 элементов | Нет (оверхед больше выгоды) |
| Список 50-1000 элементов | Возможно |
| Список > 1000 элементов | Да |
| Infinite scroll | Да |
| Таблица с 10к+ строк | Да |
| Dropdown с 1000+ опций | Да |

---

## 12. Как всё связать — пример Kanban

Теперь соберём всё вместе в приложение Kanban:

```typescript
import { $, Component, createStore, createHttp, createLazyContainer } from './nexus';

// === STATE ===
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  column: string;
}

interface AppState {
  tasks: Task[];
  columns: { id: string; title: string }[];
  showModal: boolean;
  modalColumn: string;
  view: 'board' | 'stats';
}

const store = createStore<AppState>({
  tasks: [],
  columns: [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ],
  showModal: false,
  modalColumn: '',
  view: 'board',
});

// Подписываемся на изменения
store.subscribe((state) => {
  // Сохраняем в localStorage
  localStorage.setItem('kanban-state', JSON.stringify(state));
});

// === HTTP ===
const api = createHttp('https://jsonplaceholder.typicode.com');

// === COMPONENT ===
class KanbanApp extends Component {
  constructor() {
    // Загружаем сохранённое состояние
    const saved = localStorage.getItem('kanban-state');
    const initialState = saved ? JSON.parse(saved) : store.getState();

    super({
      render: (state) => this.renderApp(state),
      state: initialState,
    });

    store.subscribe((newState) => this.setState(newState));
  }

  renderApp(state: AppState) {
    return $('div', { id: 'app' }, [
      $('h1', {}, 'Kanban Board'),

      // Рендерим колонки
      ...state.columns.map(col =>
        this.renderColumn(state, col.id, col.title)
      ),

      // Модалка
      state.showModal ? this.renderModal(state) : null,
    ]);
  }

  renderColumn(state: AppState, columnId: string, title: string) {
    const tasks = state.tasks.filter(t => t.column === columnId);

    return $('div', { className: 'column' }, [
      $('div', { className: 'column-header' }, [
        $('span', { className: 'column-title' }, title),
        $('span', { className: 'column-count' }, String(tasks.length)),
      ]),

      // Список задач с event delegation
      $('div', {
        className: 'task-list',
        on: {
          click: (e: Event) => {
            // Обработка клика по задаче
          }
        }
      }, tasks.map(task => this.renderTask(task))),

      // Кнопка добавить
      $('button', {
        className: 'add-task-btn',
        on: {
          click: () => {
            store.setState({ showModal: true, modalColumn: columnId });
          }
        }
      }, '+ Add task'),
    ]);
  }

  renderTask(task: Task) {
    return $('div', {
      className: 'task-card',
      'data-task-id': task.id,
      on: {
        click: () => console.log('Task clicked:', task.id)
      }
    }, [
      $('div', { className: 'task-title' }, task.title),
      $('span', { className: `priority-${task.priority}` }, task.priority),
    ]);
  }

  renderModal(state: AppState) {
    return $('div', {
      className: 'modal-overlay',
      on: {
        click: (e: Event) => {
          // Закрыть по клику на фон
          if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
            store.setState({ showModal: false });
          }
        }
      }
    }, $('div', { className: 'modal' }, [
      $('h2', {}, 'Add Task'),
      $('form', {
        on: {
          submit: (e: Event) => {
            e.preventDefault();
            // Обработка формы...
          }
        }
      }, [
        $('input', { type: 'text', name: 'title', required: true }),
        $('textarea', { name: 'description' }),
        $('select', { name: 'priority' }, [
          $('option', { value: 'low' }, 'Low'),
          $('option', { value: 'medium' }, 'Medium'),
          $('option', { value: 'high' }, 'High'),
        ]),
        $('button', { type: 'submit' }, 'Add'),
      ]),
    ]));
  }
}

// === START ===
const app = new KanbanApp();
app.mount(document.getElementById('app'));
```

---

## 13. Частые ошибки и как их избежать

### 1. Мутация состояния напрямую

```typescript
// ❌ НЕПРАВИЛЬНО — мутируем state
state.tasks.push(newTask);

// ✅ ПРАВИЛЬНО — создаём новый объект
this.setState({ tasks: [...state.tasks, newTask] });
```

### 2. Забываем про key в списках

```typescript
// ❌ Без key — неэффективный diffing
tasks.map(task => $('li', {}, task.title));

// ✅ С key — правильная идентификация элементов
tasks.map(task => $('li', { key: task.id }, task.title));
```

### 3. Утечка памяти — не отписываемся от store

```typescript
// ❌ Утечка — subscribe возвращает функцию отписки, но мы её не сохраняем
store.subscribe((state) => {
  this.setState(state);
});

// ✅ Правильно — сохраняем и используем при destroy
const unsubscribe = store.subscribe((state) => {
  this.setState(state);
});

// При уничтожении компонента:
destroy() {
  unsubscribe();  // Отписываемся!
}
```

### 4. preventDefault только когда нужно

```typescript
// ❌ Не отменяем когда нужно — страница перезагружается
$('form', { on: { submit: handleSubmit } });

// ✅ Отменяем для SPA
$('form', { on: { submit: (e) => { e.preventDefault(); handleSubmit(); } } });
```

### 5. Забываем про border cases в children

```typescript
// ❌ Не обрабатываем undefined/null
children.push(child);  // child может быть null!

// ✅ Фильтруем
if (child != null) {
  children.push(child);
}
```

---

## Итог

Ты построил полноценный frontend framework с нуля:

- **Virtual DOM** — эффективные обновления через сравнение объектов
- **Components** — переиспользуемые блоки с состоянием и lifecycle
- **Store** — реактивное состояние с подписками
- **Router** — SPA навигация через hash
- **Event Handling** — события при рендере, не после
- **HTTP** — удобный клиент для API
- **Lazy Rendering** — оптимизация для больших списков

Каждая из этих идей используется в реальных фреймворках (React, Vue, Angular). Теперь ты понимаешь как они работают изнутри.

---

## Следующие шаги

1. **Добавь TypeScript generic'и** для типобезопасности
2. **Реализуй shouldComponentUpdate** (мемоизация для оптимизации)
3. **Добавь анимации** (CSS transitions при переходах)
4. **Реализуй Suspense** (загрузка с placeholder)
5. **Добавь DevTools** (отладка состояния в браузере)

---

*Руководство написано для студентов IVKHK. Nexus.js — учебный фреймворк, не для продакшена.*
