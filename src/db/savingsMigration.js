import { db } from './schema';

const MIGRATION_FLAG_KEY = 'savings_migrated';

async function isMigrated() {
  try {
    const flag = await db.table('ceklok_settings').get(MIGRATION_FLAG_KEY);
    return !!flag;
  } catch {
    return false;
  }
}

async function markMigrated() {
  await db.table('ceklok_settings').put({ key: MIGRATION_FLAG_KEY, value: true, updatedAt: new Date().toISOString() });
}

export async function migrateOldSavings() {
  if (!db.isOpen()) await db.open();

  const alreadyDone = await isMigrated();
  if (alreadyDone) {
    return { migrated: 0, skipped: 0, alreadyDone: true };
  }

  const oldSavings = await db.table('savings').toArray();
  if (oldSavings.length === 0) {
    await markMigrated();
    return { migrated: 0, skipped: 0, alreadyDone: false };
  }

  // Group old savings by source name to create accounts
  const accountsMap = {};
  for (const item of oldSavings) {
    const name = item.source || 'Tabungan Utama';
    const category = item.category || 'Rekening Bank';
    if (!accountsMap[name]) {
      accountsMap[name] = {
        name,
        category,
        accountNumber: '',
        createdAt: item.createdAt || new Date().toISOString()
      };
    }
  }

  // Insert accounts
  const createdAccounts = {};
  for (const name of Object.keys(accountsMap)) {
    const id = await db.table('saving_accounts').add(accountsMap[name]);
    createdAccounts[name] = id;
  }

  // Insert transactions
  const transactionsToInsert = oldSavings.map(item => {
    const accountName = item.source || 'Tabungan Utama';
    const accountId = createdAccounts[accountName];
    return {
      accountId,
      type: 'DEPOSIT',
      amount: Number(item.amount || 0),
      date: item.date || new Date().toISOString().substring(0, 10),
      category: 'Setoran Awal',
      description: `Migrasi dari data awal (${item.category || 'Tabungan'})`,
      createdAt: item.createdAt || new Date().toISOString()
    };
  });

  if (transactionsToInsert.length > 0) {
    await db.table('saving_transactions').bulkAdd(transactionsToInsert);
  }

  await markMigrated();
  return { migrated: transactionsToInsert.length, skipped: 0, alreadyDone: false };
}

/**
 * Helpers
 */
export async function getAccountTransactions(accountId) {
  if (!db.isOpen()) await db.open();
  return await db.table('saving_transactions').where('accountId').equals(accountId).toArray();
}

export async function getAccountBalance(accountId) {
  const txs = await getAccountTransactions(accountId);
  return txs.reduce((acc, tx) => {
    if (tx.type === 'DEPOSIT') return acc + Number(tx.amount || 0);
    if (tx.type === 'WITHDRAWAL') return acc - Number(tx.amount || 0);
    return acc;
  }, 0);
}
