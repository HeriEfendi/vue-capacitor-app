/**
 * localStorage Repository Layer
 * Pengganti backend Laravel API dari H_DEV
 * Data disimpan di localStorage dengan key-prefix "hdev_"
 */

const LS_KEYS = {
  USERS: 'hdev_users',
  TODOS: 'hdev_todos',
};

// ─── Helper Functions ─────────────────────────────────────────────────────────

function readLS(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLS(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function generateId(items) {
  if (items.length === 0) return 1;
  return Math.max(...items.map((i) => i.id || 0)) + 1;
}

function generateWorkId(todos) {
  const count = todos.length + 1;
  return `TASK-${String(count).padStart(3, '0')}`;
}

function now() {
  return new Date().toISOString();
}

// ─── Users Repository ────────────────────────────────────────────────────────

export const UsersRepository = {
  getAll() {
    return readLS(LS_KEYS.USERS);
  },

  getById(id) {
    return readLS(LS_KEYS.USERS).find((u) => u.id === Number(id)) || null;
  },

  add(user) {
    const users = readLS(LS_KEYS.USERS);
    const newUser = {
      id: generateId(users),
      name: user.name,
      email: user.email,
      avatar: user.avatar || `https://i.pravatar.cc/150?u=${user.email}`,
      created_at: now(),
    };
    users.push(newUser);
    // Urutkan alfabetis
    users.sort((a, b) => a.name.localeCompare(b.name));
    writeLS(LS_KEYS.USERS, users);
    return newUser;
  },

  update(id, changes) {
    const users = readLS(LS_KEYS.USERS);
    const idx = users.findIndex((u) => u.id === Number(id));
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...changes, updated_at: now() };
    writeLS(LS_KEYS.USERS, users);
    return users[idx];
  },

  delete(id) {
    const users = readLS(LS_KEYS.USERS).filter((u) => u.id !== Number(id));
    writeLS(LS_KEYS.USERS, users);
  },

  seed() {
    const existing = readLS(LS_KEYS.USERS);
    if (existing.length > 0) return; // already seeded
    const seeds = [
      { name: 'Ahmad Heri', email: 'heri@example.com', avatar: 'https://i.pravatar.cc/150?img=1' },
      { name: 'Budi Santoso', email: 'budi@example.com', avatar: 'https://i.pravatar.cc/150?img=2' },
      { name: 'Citra Dewi', email: 'citra@example.com', avatar: 'https://i.pravatar.cc/150?img=5' },
    ];
    seeds.forEach((u) => this.add(u));
  },
};

// ─── Todo Repository ─────────────────────────────────────────────────────────

export const TodoRepository = {
  getAll() {
    const todos = readLS(LS_KEYS.TODOS);
    const users = readLS(LS_KEYS.USERS);

    // Enrich with assignee & reporter objects
    return todos.map((t) => ({
      ...t,
      assignee: users.find((u) => u.id === t.assignee_id) || null,
      reporter: users.find((u) => u.id === t.reporter_id) || null,
    }));
  },

  getById(id) {
    return readLS(LS_KEYS.TODOS).find((t) => t.id === Number(id)) || null;
  },

  add(task) {
    const todos = readLS(LS_KEYS.TODOS);
    const newTask = {
      id: generateId(todos),
      work_id: generateWorkId(todos),
      title: task.title,
      assignee_id: task.assignee_id || null,
      reporter_id: task.reporter_id || null,
      story_points: Number(task.story_points) || 1,
      priority: task.priority || 'Medium',
      status: task.status || 'TO DO',
      due_date: task.due_date || '',
      label: task.label || '',
      created_at: now(),
    };
    todos.push(newTask);
    writeLS(LS_KEYS.TODOS, todos);
    return newTask;
  },

  update(id, changes) {
    const todos = readLS(LS_KEYS.TODOS);
    const idx = todos.findIndex((t) => t.id === Number(id));
    if (idx === -1) return null;
    todos[idx] = { ...todos[idx], ...changes, updated_at: now() };
    writeLS(LS_KEYS.TODOS, todos);
    return todos[idx];
  },

  updateStatus(id, status) {
    return this.update(id, { status });
  },

  delete(id) {
    const todos = readLS(LS_KEYS.TODOS).filter((t) => t.id !== Number(id));
    writeLS(LS_KEYS.TODOS, todos);
  },

  getStats() {
    const todos = readLS(LS_KEYS.TODOS);
    const total = todos.length;
    const done = todos.filter((t) => t.status === 'DONE').length;
    const inProgress = todos.filter((t) => t.status === 'IN PROGRESS').length;
    const toDo = todos.filter((t) => t.status === 'TO DO').length;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, inProgress, toDo, rate };
  },

  getHighPriorityPending(limit = 4) {
    const users = readLS(LS_KEYS.USERS);
    const priorityWeight = { Highest: 4, High: 3, Medium: 2, Low: 1 };
    return readLS(LS_KEYS.TODOS)
      .filter((t) => t.status !== 'DONE')
      .sort((a, b) => {
        const wA = priorityWeight[a.priority] || 0;
        const wB = priorityWeight[b.priority] || 0;
        return wB - wA;
      })
      .slice(0, limit)
      .map((t) => ({
        ...t,
        assignee: users.find((u) => u.id === t.assignee_id) || null,
      }));
  },

  seed() {
    const existing = readLS(LS_KEYS.TODOS);
    if (existing.length > 0) return;
    const users = readLS(LS_KEYS.USERS);
    const userId1 = users[0]?.id || null;
    const userId2 = users[1]?.id || null;

    const seeds = [
      {
        title: 'Setup project struktur folder',
        assignee_id: userId1,
        reporter_id: userId2,
        story_points: 3,
        priority: 'High',
        status: 'DONE',
        due_date: '2026-06-20',
        label: 'setup',
      },
      {
        title: 'Implementasi fitur login dengan localStorage',
        assignee_id: userId1,
        reporter_id: userId2,
        story_points: 5,
        priority: 'Highest',
        status: 'IN PROGRESS',
        due_date: '2026-07-10',
        label: 'auth',
      },
      {
        title: 'Buat halaman dashboard dengan widget',
        assignee_id: userId2,
        reporter_id: userId1,
        story_points: 8,
        priority: 'High',
        status: 'TO DO',
        due_date: '2026-07-15',
        label: 'ui',
      },
      {
        title: 'Integrasi Capacitor Android build',
        assignee_id: userId1,
        reporter_id: null,
        story_points: 5,
        priority: 'Medium',
        status: 'TO DO',
        due_date: '2026-07-20',
        label: 'android',
      },
    ];
    seeds.forEach((t) => this.add(t));
  },
};

// ─── Seed All ─────────────────────────────────────────────────────────────────

export function seedLocalStorage() {
  UsersRepository.seed();
  TodoRepository.seed();
}
