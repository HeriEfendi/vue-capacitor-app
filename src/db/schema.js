import Dexie from 'dexie'

export const db = new Dexie('umkmDatabase')

db.version(1).stores({
  categories: '++id, name, image, description, slug',
  products: '++id, name, price, description, image, categoryId, featured, stock, slug',
  orders: '++id, userId, products, totalAmount, status, createdAt',
  users: '++id, name, email, phone, address',
  cart: '++id, userId, productId, quantity'
})

// Menambahkan hooks untuk slug generation
db.categories.hook('creating', function (primKey, obj) {
  if (!obj.slug) {
    obj.slug = generateSlug(obj.name)
  }
})

db.products.hook('creating', function (primKey, obj) {
  if (!obj.slug) {
    obj.slug = generateSlug(obj.name)
  }
})

function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// Initial seed data
export async function seedDatabase() {
  const categoriesCount = await db.categories.count()
  const productsCount = await db.products.count()

  if (categoriesCount === 0) {
    await db.categories.bulkAdd([
      {
        name: 'Makanan',
        image: 'https://placehold.co/300x200',
        description: 'Berbagai makanan tradisional dan modern dari UMKM lokal'
      },
      {
        name: 'Fashion',
        image: 'https://placehold.co/300x200',
        description: 'Pakaian dan aksesori fashion buatan pengrajin lokal'
      },
      {
        name: 'Kerajinan',
        image: 'https://placehold.co/300x200',
        description: 'Kerajinan tangan berkualitas dari pengrajin Indonesia'
      },
      {
        name: 'Aksesoris',
        image: 'https://placehold.co/300x200',
        description: 'Berbagai aksesori unik dan menarik'
      }
    ])
  }

  if (productsCount === 0) {
    await db.products.bulkAdd([
      {
        name: 'Kue Tradisional',
        price: 150000,
        description: 'Kue tradisional yang dibuat dengan bahan berkualitas',
        image: 'https://placehold.co/300x200',
        categoryId: 1,
        featured: true,
        stock: 50
      },
      {
        name: 'Batik Modern',
        price: 200000,
        description: 'Batik modern dengan desain kontemporer',
        image: 'https://placehold.co/300x200',
        categoryId: 2,
        featured: true,
        stock: 30
      },
      {
        name: 'Tas Anyaman',
        price: 175000,
        description: 'Tas anyaman tradisional dengan sentuhan modern',
        image: 'https://placehold.co/300x200',
        categoryId: 3,
        featured: true,
        stock: 25
      },
      {
        name: 'Gelang Etnik',
        price: 250000,
        description: 'Gelang dengan desain etnik khas Indonesia',
        image: 'https://placehold.co/300x200',
        categoryId: 4,
        featured: true,
        stock: 40
      }
    ])
  }
}