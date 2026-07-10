import Dexie from 'dexie'

// Single Dexie instance for the whole app
export const appDatabase = new Dexie('sme_ledger_db')

// Schema v1
appDatabase.version(1).stores({
  capitalCosts: '++id, date, amount, note',
  debts: '++id, date, creditor, amount, note, status',
  incomes: '++id, date, source, amount, note',
  expenses: '++id, date, category, amount, note',
  products: '++id, date, name, quantity, unit, unitCost, totalCost, note',
  dailyLedger: '++id, date, type, amount, note',
})

export function initializeDatabase() {
  return appDatabase.open()
}


