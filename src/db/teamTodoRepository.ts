import { initDB } from '@/db';

export const TeamTodoRepository = {
  async getAll() {
    const db = await initDB();
    const todos = await db.getAll('team_todos');
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
      id: Number(task.id || Date.now()),
      ...task
    };
    // Ensure id is present and is a number
    if (!newTask.id || isNaN(newTask.id)) {
        newTask.id = Date.now();
    }
    await db.put('team_todos', newTask);
    return newTask;
  },

  async update(id: number, changes: any) {
    const db = await initDB();
    const task = await db.get('team_todos', id);
    if (!task) return null;
    const updated = { ...task, ...changes };
    await db.put('team_todos', updated);
    return updated;
  },

  async delete(id: number) {
    const db = await initDB();
    await db.delete('team_todos', id);
  },

  async updateStatus(id: number, status: string) {
      return await this.update(id, { status });
  }
};
