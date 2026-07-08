import { initDB } from '@/db';

export interface CeklokBreakConfig {
  id: number;
  name: string;
  start: string;
  end: string;
  duration: number; // in minutes
  autoDeduct: boolean;
}

export interface CeklokSettings {
  key: string;
  cutoffType: 'weekly' | 'monthly';
  cutoffDay: number; // 0 = Sunday, 1 = Monday, etc.
  cutoffDate: number; // 1 to 28
  breaks: CeklokBreakConfig[];
  // Work schedule
  workStart: string;        // HH:mm, e.g. '08:00'
  workEnd: string;          // HH:mm, e.g. '17:00'
  toleranceMinutes: number; // minutes tolerance both sides
}

export interface BreakLog {
  start: string; // ISO DateTime
  end: string | null; // ISO DateTime
  durationMinutes: number;
  name: string;
}

export interface CeklokLog {
  id: number;
  date: string; // YYYY-MM-DD
  clockIn: string; // ISO DateTime
  clockOut: string | null; // ISO DateTime
  breaks: BreakLog[];
  notes: string;
  type: 'WFO' | 'WFH' | 'Dinas';
  totalWorkHours: number; // hours (decimal)
}

const DEFAULT_SETTINGS: CeklokSettings = {
  key: 'config',
  cutoffType: 'weekly',
  cutoffDay: 1, // Senin
  cutoffDate: 25, // Tanggal 25
  breaks: [
    { id: 1, name: 'Istirahat Siang', start: '12:00', end: '13:00', duration: 60, autoDeduct: true }
  ],
  workStart: '08:00',
  workEnd: '17:00',
  toleranceMinutes: 15
};

export const CeklokRepository = {
  async getSettings(): Promise<CeklokSettings> {
    const db = await initDB();
    const settings = await db.get('ceklok_settings', 'config');
    if (!settings) {
      await db.put('ceklok_settings', DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
    return settings as CeklokSettings;
  },

  async saveSettings(settings: Partial<CeklokSettings>): Promise<CeklokSettings> {
    const db = await initDB();
    const current = await this.getSettings();
    const updated = { ...current, ...settings, key: 'config' };
    await db.put('ceklok_settings', updated);
    return updated;
  },

  async getAllLogs(): Promise<CeklokLog[]> {
    const db = await initDB();
    const logs = await db.getAll('ceklok_logs');
    // Sort descending by clockIn
    return logs.sort((a, b) => b.id - a.id) as CeklokLog[];
  },

  async getActiveLog(): Promise<CeklokLog | null> {
    const db = await initDB();
    const logs = await db.getAll('ceklok_logs');
    const active = logs.find(log => !log.clockOut);
    return active ? (active as CeklokLog) : null;
  },

  async addLog(log: Omit<CeklokLog, 'id'>): Promise<CeklokLog> {
    const db = await initDB();
    const newLog: CeklokLog = {
      id: Date.now(),
      ...log
    };
    await db.put('ceklok_logs', newLog);
    return newLog;
  },

  async updateLog(id: number, changes: Partial<CeklokLog>): Promise<CeklokLog | null> {
    const db = await initDB();
    const log = await db.get('ceklok_logs', id);
    if (!log) return null;
    const updated = { ...log, ...changes, id };
    await db.put('ceklok_logs', updated);
    return updated as CeklokLog;
  },

  async deleteLog(id: number): Promise<void> {
    const db = await initDB();
    await db.delete('ceklok_logs', id);
  }
};
