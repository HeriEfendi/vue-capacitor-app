import Dexie from 'dexie';

export const db = new Dexie('umkm_marketplace');

let databaseSeeded = false;

db.version(1).stores({
  categories: 'id, name',
  products: '++id, name, price, stock, categoryId, featured',
  capitalCosts: '++id, createdAt, name, amount',
  debts: '++id, createdAt, name, amount, dueDate',
  incomes: '++id, createdAt, name, amount',
  expenses: '++id, createdAt, name, amount, type',
  rawMaterials: '++id, name, unit, stock',
  dailyLedger: '++id, createdAt, description, amount, type'
});

export async function seedDatabase() {
  if (databaseSeeded) {
    return;
  }

  // Clear existing data from tables before seeding
  await db.categories.clear();
  await db.products.clear();

  const categories = [
    { id: 1, name: 'Makanan' },
    { id: 2, name: 'Minuman' },
    { id: 3, name: 'Kerajinan Tangan' },
    { id: 4, name: 'Pakaian' },
  ];

  await db.categories.bulkAdd(categories);

  function generateDummyProducts(count) {
    const products = [];
    for (let i = 1; i <= count; i++) {
      products.push({
        name: `Produk Makanan ${i}`,
        price: Math.floor(Math.random() * 100000) + 20000,
        stock: Math.floor(Math.random() * 100) + 10,
        description: `Deskripsi produk makanan ${i}. Ini adalah produk unggulan dari UMKM kami.`,
        image: `https://placehold.co/200x150/random`,
        categoryId: 1,
        featured: 0 // 0 means not featured by default
      });
    }
    return products;
  }

  const products = generateDummyProducts(20);
  await db.products.bulkAdd(products);

  databaseSeeded = true;
}

