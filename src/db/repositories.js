import { appDatabase } from './db'

function createCrudRepository(table) {
  return {
    async add(record) {
      const id = await table.add({ ...record, createdAt: new Date().toISOString() })
      return { id, ...record }
    },
    async bulkAdd(records) {
      return table.bulkAdd(records.map(r => ({ ...r, createdAt: new Date().toISOString() })))
    },
    async update(id, changes) {
      await table.update(id, { ...changes, updatedAt: new Date().toISOString() })
    },
    async delete(id) {
      await table.delete(id)
    },
    async getById(id) {
      return table.get(id)
    },
    async getAll() {
      return table.toArray()
    },
    async where(index, value) {
      return table.where(index).equals(value).toArray()
    },
  }
}

export const capitalCostsRepo = createCrudRepository(appDatabase.table('capitalCosts'))
export const debtsRepo = createCrudRepository(appDatabase.table('debts'))
export const incomesRepo = createCrudRepository(appDatabase.table('incomes'))
export const expensesRepo = createCrudRepository(appDatabase.table('expenses'))
export const rawMaterialsRepo = createCrudRepository(appDatabase.table('rawMaterials'))
export const productsRepo = createCrudRepository(appDatabase.table('products'))
export const dailyLedgerRepo = createCrudRepository(appDatabase.table('dailyLedger'))


