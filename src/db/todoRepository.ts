import { initDB } from '@/db';

const DB_NAME = 'FinancialAppDB';

export const TodoRepository = {
  async getAll() {
    const db = await initDB();
    const todos = await db.getAll('todos');
    const users = await db.getAll('users');
    return todos.map((t) => ({
      ...t,
      assignee: users.find((u) => u.id === t.assignee_id) || null,
      reporter: users.find((u) => u.id === t.reporter_id) || null,
    }));
  },

  async add(task: any) {
    const db = await initDB();
    const newTask = {
      id: Date.now(),
      ...task
    };
    await db.put('todos', newTask);
    return newTask;
  },

  async update(id: number, changes: any) {
    const db = await initDB();
    const task = await db.get('todos', id);
    if (!task) return null;
    const updated = { ...task, ...changes };
    await db.put('todos', updated);
    return updated;
  },

  async delete(id: number) {
    const db = await initDB();
    await db.delete('todos', id);
  }
};
