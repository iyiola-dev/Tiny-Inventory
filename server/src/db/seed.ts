import { db, stores, products } from './index.js';

async function seed() {
  console.log('Seeding database...');
  
  try {
    // Clear existing data
    await db.delete(products);
    await db.delete(stores);
    
    // Insert stores
    const insertedStores = await db.insert(stores).values([
      {
        name: 'Downtown Electronics',
        location: '123 Main St, City Center',
      },
      {
        name: 'Tech Haven',
        location: '456 Tech Park, Innovation District',
      },
      {
        name: 'Gadget World',
        location: '789 Shopping Mall, West Side',
      },
    ]).returning();
    
    console.log(`Inserted ${insertedStores.length} stores`);
    
    // Insert products for each store
    const productsData = [];
    
    // Products for Downtown Electronics
    productsData.push(
      {
        storeId: insertedStores[0].id,
        name: 'iPhone 15 Pro',
        category: 'Smartphones',
        price: '999.99',
        quantity: 25,
      },
      {
        storeId: insertedStores[0].id,
        name: 'Samsung Galaxy S24',
        category: 'Smartphones',
        price: '899.99',
        quantity: 20,
      },
      {
        storeId: insertedStores[0].id,
        name: 'iPad Air',
        category: 'Tablets',
        price: '599.99',
        quantity: 15,
      },
      {
        storeId: insertedStores[0].id,
        name: 'MacBook Air M3',
        category: 'Laptops',
        price: '1299.99',
        quantity: 10,
      },
    );
    
    // Products for Tech Haven
    productsData.push(
      {
        storeId: insertedStores[1].id,
        name: 'Dell XPS 13',
        category: 'Laptops',
        price: '1199.99',
        quantity: 8,
      },
      {
        storeId: insertedStores[1].id,
        name: 'Sony WH-1000XM5',
        category: 'Audio',
        price: '399.99',
        quantity: 30,
      },
      {
        storeId: insertedStores[1].id,
        name: 'Logitech MX Master 3',
        category: 'Accessories',
        price: '99.99',
        quantity: 50,
      },
      {
        storeId: insertedStores[1].id,
        name: 'Samsung 4K Monitor',
        category: 'Monitors',
        price: '599.99',
        quantity: 12,
      },
    );
    
    // Products for Gadget World
    productsData.push(
      {
        storeId: insertedStores[2].id,
        name: 'Nintendo Switch OLED',
        category: 'Gaming',
        price: '349.99',
        quantity: 20,
      },
      {
        storeId: insertedStores[2].id,
        name: 'PlayStation 5',
        category: 'Gaming',
        price: '499.99',
        quantity: 5,
      },
      {
        storeId: insertedStores[2].id,
        name: 'Xbox Series X',
        category: 'Gaming',
        price: '499.99',
        quantity: 7,
      },
      {
        storeId: insertedStores[2].id,
        name: 'Apple Watch Series 9',
        category: 'Wearables',
        price: '399.99',
        quantity: 18,
      },
    );
    
    const insertedProducts = await db.insert(products).values(productsData).returning();
    console.log(`Inserted ${insertedProducts.length} products`);
    
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
