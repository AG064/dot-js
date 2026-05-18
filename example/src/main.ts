import { $, Component, createStore, createRouter, createHttp, LazyContainer } from '../framework/src/nexus';

// ============================================================================
// APPLICATION STATE
// ============================================================================

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  column: string;
  createdAt: number;
}

interface AppState {
  tasks: Task[];
  columns: { id: string; title: string }[];
  selectedTask: Task | null;
  showModal: boolean;
  modalColumn: string;
  view: 'board' | 'stats' | 'lazy';
  loading: boolean;
}

const defaultState: AppState = {
  tasks: [
    { id: '1', title: 'Design login page', description: 'Create wireframes and mockups for the new login flow', priority: 'high', column: 'todo', createdAt: Date.now() },
    { id: '2', title: 'Set up CI/CD pipeline', description: 'Configure GitHub Actions for automated testing and deployment', priority: 'medium', column: 'todo', createdAt: Date.now() },
    { id: '3', title: 'Write API documentation', description: 'Document all REST endpoints with examples', priority: 'low', column: 'inprogress', createdAt: Date.now() },
    { id: '4', title: 'Fix navigation bug', description: 'Menu does not close on mobile after clicking a link', priority: 'high', column: 'inprogress', createdAt: Date.now() },
    { id: '5', title: 'Code review: Auth module', description: 'Review PR #47 for the new authentication implementation', priority: 'medium', column: 'review', createdAt: Date.now() },
    { id: '6', title: 'Update dependencies', description: 'Audit and update all npm packages to latest stable versions', priority: 'low', column: 'done', createdAt: Date.now() },
  ],
  columns: [
    { id: 'todo', title: 'To Do' },
    { id: 'inprogress', title: 'In Progress' },
    { id: 'review', title: 'In Review' },
    { id: 'done', title: 'Done' },
  ],
  selectedTask: null,
  showModal: false,
  modalColumn: '',
  view: 'board',
  loading: false,
};

// ============================================================================
// HTTP CLIENT - demonstrates remote data fetching
// ============================================================================

const api = createHttp('https://jsonplaceholder.typicode.com');

// ============================================================================
// ROOT COMPONENT
// ============================================================================

class KanbanApp extends Component {
  private lazyContainer: LazyContainer | null = null;
  private lazyEl: HTMLElement | null = null;

  constructor() {
    super({
      render: (state) => this.renderApp(state),
      state: defaultState,
    });

    // Load persisted state from localStorage
    const saved = localStorage.getItem('nexus-kanban-state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AppState;
        this.setState(parsed);
      } catch {
        // ignore parse errors
      }
    }

    // Persist state changes to localStorage
    this.attachStore(this.getStore());
  }

  private getStore(): ReturnType<typeof createStore> {
    // Create a store wrapper that syncs with component state
    const store = createStore(this.getState());
    store.subscribe((state) => {
      localStorage.setItem('nexus-kanban-state', JSON.stringify(state));
    });
    return store;
  }

  private renderApp(state: AppState): ReturnType<typeof $> {
    return $('div', { attrs: { id: 'root' } }, [
      $('h1', {}, 'Nexus.js Kanban Board'),

      // Navigation
      this.renderNav(state),

      // Main content based on view
      state.view === 'board' ? this.renderBoard(state) : null,
      state.view === 'stats' ? this.renderStats(state) : null,
      state.view === 'lazy' ? this.renderLazyDemo(state) : null,

      // Modal
      state.showModal ? this.renderModal(state) : null,
    ]);
  }

  private renderNav(state: AppState): ReturnType<typeof $> {
    return $('nav', { className: 'nav' }, [
      $('a', {
        className: state.view === 'board' ? 'nav-link active' : 'nav-link',
        on: { click: (e: Event) => { e.preventDefault(); this.navigate('board'); } },
      }, 'Board'),
      $('a', {
        className: state.view === 'stats' ? 'nav-link active' : 'nav-link',
        on: { click: (e: Event) => { e.preventDefault(); this.navigate('stats'); } },
      }, 'Statistics'),
      $('a', {
        className: state.view === 'lazy' ? 'nav-link active' : 'nav-link',
        on: { click: (e: Event) => { e.preventDefault(); this.navigate('lazy'); } },
      }, 'Lazy Rendering Demo'),
    ]);
  }

  private navigate(view: 'board' | 'stats' | 'lazy'): void {
    this.setState({ view });
  }

  private renderBoard(state: AppState): ReturnType<typeof $> {
    return $('div', { className: 'board' },
      state.columns.map(col =>
        this.renderColumn(state, col.id, col.title)
      )
    );
  }

  private renderColumn(state: AppState, columnId: string, title: string): ReturnType<typeof $> {
    const tasks = state.tasks.filter(t => t.column === columnId);
    return $('div', { className: 'column', attrs: { 'data-column': columnId } }, [
      $('div', { className: 'column-header' }, [
        $('span', { className: 'column-title' }, title),
        $('span', { className: 'column-count' }, String(tasks.length)),
      ]),
      $('div', { className: 'task-list', attrs: { 'data-tasks-for': columnId } },
        tasks.length === 0
          ? [$('div', { className: 'empty-state' }, 'No tasks yet')]
          : tasks.map(task => this.renderTaskCard(task))
      ),
      $('button', {
        className: 'add-task-btn',
        on: {
          click: (e: Event) => {
            e.preventDefault();
            this.setState({ showModal: true, modalColumn: columnId });
          },
        },
      }, '+ Add task'),
    ]);
  }

  private renderTaskCard(task: Task): ReturnType<typeof $> {
    return $('div', {
      className: 'task-card',
      attrs: { 'data-task-id': task.id, 'data-priority': task.priority },
      on: {
        // Delegated event: handle click on task card
        click: (e: Event) => {
          const target = e.target as HTMLElement;
          // Don't open modal if clicking "Delete" button area
          if (target.closest('.delete-btn')) return;
          // Prevent bubbling
          e.stopPropagation();
          this.setState({ selectedTask: task });
        },
        // Demonstrate custom delegated event
        customAction: (e: Event) => {
          const customEvent = e as CustomEvent;
          console.log('Custom action on task:', customEvent.detail);
        },
      },
    }, [
      $('div', { className: 'task-title' }, task.title),
      $('div', { className: 'task-meta' }, [
        $('span', { className: `task-priority priority-${task.priority}` }, task.priority),
        $('button', {
          className: 'delete-btn',
          style: { background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer', fontSize: '12px' },
          on: {
            click: (e: Event) => {
              e.preventDefault();
              e.stopPropagation();
              this.deleteTask(task.id);
            },
          },
        }, 'Delete'),
      ]),
    ]);
  }

  private deleteTask(taskId: string): void {
    const tasks = this.getState().tasks.filter(t => t.id !== taskId);
    this.setState({ tasks });
  }

  private renderStats(state: AppState): ReturnType<typeof $> {
    const total = state.tasks.length;
    const todo = state.tasks.filter(t => t.column === 'todo').length;
    const inprogress = state.tasks.filter(t => t.column === 'inprogress').length;
    const review = state.tasks.filter(t => t.column === 'review').length;
    const done = state.tasks.filter(t => t.column === 'done').length;
    const high = state.tasks.filter(t => t.priority === 'high').length;

    return $('div', {}, [
      $('h2', { style: { marginBottom: '16px', color: '#1a1a2e' } }, 'Task Statistics'),
      $('div', { className: 'stats' }, [
        this.statCard('Total Tasks', total),
        this.statCard('To Do', todo),
        this.statCard('In Progress', inprogress),
        this.statCard('In Review', review),
        this.statCard('Done', done),
        this.statCard('High Priority', high),
      ]),
      $('h3', { style: { marginTop: '24px', marginBottom: '12px' } }, 'Remote Data Demo'),
      $('button', {
        className: 'btn btn-primary',
        style: { marginBottom: '16px' },
        on: {
          click: () => this.fetchRemoteData(),
        },
      }, 'Fetch users from API'),
      $('div', { id: 'api-results', style: { background: 'white', padding: '16px', borderRadius: '12px' } },
        state.loading ? [$('p', {}, 'Loading...')] : [$('p', { style: { color: '#57606a' } }, 'Click button to fetch data from JSONPlaceholder API')]
      ),
    ]);
  }

  private statCard(label: string, value: number): ReturnType<typeof $> {
    return $('div', { className: 'stat-card' }, [
      $('div', { className: 'stat-label' }, label),
      $('div', { className: 'stat-value' }, String(value)),
    ]);
  }

  private async fetchRemoteData(): Promise<void> {
    this.setState({ loading: true });
    try {
      // Demonstrate HTTP module
      const response = await api.get('/users?_limit=5');
      const container = document.getElementById('api-results');
      if (container) {
        container.innerHTML = '';
        const users = response.data as any[];
        const list = document.createElement('ul');
        list.style.cssText = 'list-style: none; padding: 0;';
        users.forEach((user: any) => {
          const li = document.createElement('li');
          li.style.cssText = 'padding: 8px 0; border-bottom: 1px solid #e8ecf0;';
          li.textContent = `${user.name} (${user.email})`;
          list.appendChild(li);
        });
        container.appendChild(list);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      const container = document.getElementById('api-results');
      if (container) {
        container.innerHTML = '<p style="color: #ff6b6b;">Failed to load data</p>';
      }
    }
    this.setState({ loading: false });
  }

  private renderLazyDemo(state: AppState): ReturnType<typeof $> {
    // Generate 100 mock tasks to demonstrate lazy rendering
    const largeTaskList: ReturnType<typeof $>[] = Array.from({ length: 100 }, (_, i) =>
      $('div', { className: 'lazy-row', attrs: { 'data-index': String(i) } },
        `Lazy task #${i + 1} — rendered only when in viewport`
      )
    );

    return $('div', {}, [
      $('h2', { style: { marginBottom: '8px' } }, 'Lazy Rendering Demo'),
      $('p', { style: { color: '#57606a', marginBottom: '16px' } },
        'Scroll down. Rows are rendered only when they enter the viewport (IntersectionObserver).'
      ),
      $('button', {
        className: 'btn btn-secondary',
        style: { marginBottom: '16px' },
        on: {
          click: () => {
            if (this.lazyContainer) {
              this.lazyContainer.renderAll();
            }
          },
        },
      }, 'Force render all (bypass lazy)'),
      $('div', {
        ref: (el: HTMLElement) => {
          if (el && !this.lazyContainer) {
            this.lazyContainer = createLazyContainer(el);
            this.lazyEl = el;
          }
        },
        style: { maxHeight: '500px', overflowY: 'auto', background: 'white', borderRadius: '12px', padding: '16px' },
      }, ...largeTaskList),
    ]);
  }

  private renderModal(state: AppState): ReturnType<typeof $> {
    return $('div', {
      className: 'modal-overlay',
      on: {
        // Event delegation: close on backdrop click
        click: (e: Event) => {
          const target = e.target as HTMLElement;
          if (target.classList.contains('modal-overlay')) {
            this.setState({ showModal: false, modalColumn: '' });
          }
        },
        // Prevent default on escape-like behavior
        keydown: (e: Event) => {
          e.preventDefault();
        },
      },
    }, [
      $('div', { className: 'modal' }, [
        $('h2', {}, 'Add New Task'),
        $('form', {
          id: 'task-form',
          on: {
            submit: (e: Event) => {
              e.preventDefault();
              this.handleFormSubmit(state.modalColumn);
            },
          },
        }, [
          $('div', { className: 'form-group' }, [
            $('label', { attrs: { for: 'task-title' } }, 'Title'),
            $('input', {
              type: 'text',
              id: 'task-title',
              name: 'title',
              placeholder: 'Enter task title',
              required: 'true',
              attrs: { required: 'true' },
            }),
          ]),
          $('div', { className: 'form-group' }, [
            $('label', { attrs: { for: 'task-desc' } }, 'Description'),
            $('textarea', {
              id: 'task-desc',
              name: 'description',
              placeholder: 'Enter task description',
            }),
          ]),
          $('div', { className: 'form-group' }, [
            $('label', { attrs: { for: 'task-priority' } }, 'Priority'),
            $('select', { id: 'task-priority', name: 'priority' }, [
              $('option', { value: 'low' }, 'Low'),
              $('option', { value: 'medium' }, 'Medium'),
              $('option', { value: 'high' }, 'High'),
            ]),
          ]),
          $('div', { className: 'modal-actions' }, [
            $('button', {
              type: 'button',
              className: 'btn btn-secondary',
              on: {
                click: () => this.setState({ showModal: false, modalColumn: '' }),
              },
            }, 'Cancel'),
            $('button', { type: 'submit', className: 'btn btn-primary' }, 'Add Task'),
          ]),
        ]),
      ]),
    ]);
  }

  private handleFormSubmit(column: string): void {
    const form = document.getElementById('task-form') as HTMLFormElement;
    if (!form) return;

    const titleInput = form.querySelector('#task-title') as HTMLInputElement;
    const descInput = form.querySelector('#task-desc') as HTMLTextAreaElement;
    const prioritySelect = form.querySelector('#task-priority') as HTMLSelectElement;

    const title = titleInput?.value?.trim();
    if (!title) return;

    const newTask: Task = {
      id: String(Date.now()),
      title,
      description: descInput?.value?.trim() || '',
      priority: (prioritySelect?.value as 'high' | 'medium' | 'low') || 'medium',
      column,
      createdAt: Date.now(),
    };

    const tasks = [...this.getState().tasks, newTask];
    this.setState({ tasks, showModal: false, modalColumn: '' });
    form.reset();

    // Update lazy container if present
    if (this.lazyContainer && this.lazyEl) {
      const newItem = $('div', { className: 'lazy-row' },
        `Task: ${newTask.title}`
      );
      this.lazyContainer.appendChild(newItem);
    }
  }

  public mount(element: HTMLElement): void {
    super.mount(element);
  }
}

// ============================================================================
// BOOTSTRAP
// ============================================================================

function bootstrap(): void {
  const root = document.getElementById('app');
  if (!root) return;

  // Create and mount the app
  const app = new KanbanApp();
  app.mount(root);
}

document.addEventListener('DOMContentLoaded', bootstrap);