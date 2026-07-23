/**
 * Buku Kas Migration Helper
 * 
 * Memindahkan data `transactions[]` yang tersimpan nested di dalam record `projects`
 * ke tabel `transactions` terpisah (dengan field project_id).
 * 
 * Aman dijalankan berulang kali (idempotent) — data yang sudah dipindah
 * tidak akan duplikat karena menggunakan db.put() (upsert).
 */

import { db } from './schema';

const MIGRATION_FLAG_KEY = 'buku_kas_tx_migrated';

/**
 * Cek apakah migrasi sudah pernah dijalankan
 */
async function isMigrated() {
  try {
    const flag = await db.table('ceklok_settings').get(MIGRATION_FLAG_KEY);
    return !!flag;
  } catch {
    return false;
  }
}

/**
 * Tandai migrasi sudah selesai
 */
async function markMigrated() {
  await db.table('ceklok_settings').put({ key: MIGRATION_FLAG_KEY, value: true, updatedAt: new Date().toISOString() });
}

/**
 * Fungsi utama migrasi.
 * 
 * Proses:
 * 1. Ambil semua project dari tabel `projects`
 * 2. Untuk setiap project, ambil `transactions[]` yang nested
 * 3. Pindahkan setiap transaksi ke tabel `transactions` (set project_id)
 * 4. Hapus field `transactions` dari object project (bersihkan data lama)
 * 5. Simpan ulang project yang sudah bersih
 * 
 * @returns {{ migrated: number, skipped: number, errors: string[] }}
 */
export async function migrateProjectTransactions() {
  if (!db.isOpen()) await db.open();

  const alreadyDone = await isMigrated();
  if (alreadyDone) {
    return { migrated: 0, skipped: 0, errors: [], alreadyDone: true };
  }

  const projects = await db.table('projects').toArray();
  let migrated = 0;
  let skipped = 0;
  const errors = [];

  for (const project of projects) {
    try {
      const nestedTxs = project.transactions;

      // Kalau tidak ada transactions nested, skip
      if (!Array.isArray(nestedTxs) || nestedTxs.length === 0) {
        skipped++;
        continue;
      }

      // Siapkan transaksi untuk dipindah ke tabel transactions
      const txToInsert = nestedTxs.map(tx => ({
        ...tx,
        project_id: project.id,
        // Pastikan field wajib ada
        id: tx.id || Date.now() + Math.random(),
        type: tx.type || 'EXPENSE',
        amount: tx.amount || 0,
        date: tx.date || new Date().toISOString().substring(0, 10),
        category: tx.category || 'Lainnya',
        description: tx.description || '',
      }));

      // Bulk insert ke tabel transactions (upsert — aman jika data sudah ada)
      await db.table('transactions').bulkPut(txToInsert);

      // Hapus field transactions dari project object (bersihkan nested data)
      const cleanProject = { ...project };
      delete cleanProject.transactions;

      // Simpan ulang project tanpa transactions nested
      await db.table('projects').put(cleanProject);

      migrated += txToInsert.length;
      console.log(`[BukuKasMigration] Project "${project.name}" (${project.id}): migrated ${txToInsert.length} transactions`);
    } catch (err) {
      errors.push(`Project ${project.id} (${project.name}): ${err.message}`);
      console.error(`[BukuKasMigration] Error for project ${project.id}:`, err);
    }
  }

  // Tandai migrasi selesai
  await markMigrated();

  console.log(`[BukuKasMigration] Done. migrated=${migrated}, skipped=${skipped}, errors=${errors.length}`);
  return { migrated, skipped, errors, alreadyDone: false };
}

/**
 * Query helper: ambil semua transaksi untuk satu project
 * @param {number} projectId
 * @returns {Promise<Transaction[]>}
 */
export async function getTransactionsByProject(projectId) {
  if (!db.isOpen()) await db.open();
  return await db.table('transactions').where('project_id').equals(projectId).toArray();
}

/**
 * Hitung agregat totals untuk satu project dari tabel transactions terpisah
 * @param {number} projectId
 * @returns {Promise<{ total_deposits: number, total_expenses: number, balance: number, modal_total: number, panen_total: number }>}
 */
export async function calcProjectTotals(projectId) {
  const txs = await getTransactionsByProject(projectId);

  const DEPOSIT_MODAL = ['Modal Awal', 'Pinjaman', 'Investor', 'Lainnya'];
  const DEPOSIT_PENDAPATAN = ['Penjualan Panen', 'Keuntungan', 'Transfer'];

  const deposits = txs.filter(t => t.type === 'DEPOSIT');
  const expenses = txs.filter(t => t.type === 'EXPENSE');

  const total_deposits = deposits.reduce((acc, t) => acc + (t.amount || 0), 0);
  const total_expenses = expenses.reduce((acc, t) => acc + (t.amount || 0), 0);
  const modal_total = deposits.filter(t => DEPOSIT_MODAL.includes(t.category)).reduce((acc, t) => acc + (t.amount || 0), 0);
  const panen_total = deposits.filter(t => DEPOSIT_PENDAPATAN.includes(t.category)).reduce((acc, t) => acc + (t.amount || 0), 0);

  return {
    total_deposits,
    total_expenses,
    balance: total_deposits - total_expenses,
    modal_total,
    panen_total,
  };
}
