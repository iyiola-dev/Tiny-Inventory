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
      {
        name: 'Digital Paradise',
        location: '321 Silicon Valley, Tech District',
      },
      {
        name: 'Smart Devices Hub',
        location: '555 Innovation Ave, Business Park',
      },
    ]).returning();
    
    console.log(`Inserted ${insertedStores.length} stores`);
    
    // Insert products for each store
    const productsData = [];
    
    // Products for Downtown Electronics (12 products)
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
      {
        storeId: insertedStores[0].id,
        name: 'AirPods Pro',
        category: 'Audio',
        price: '249.99',
        quantity: 40,
      },
      {
        storeId: insertedStores[0].id,
        name: 'Apple Watch Ultra',
        category: 'Wearables',
        price: '799.99',
        quantity: 8,
      },
      {
        storeId: insertedStores[0].id,
        name: 'Magic Keyboard',
        category: 'Accessories',
        price: '99.99',
        quantity: 30,
      },
      {
        storeId: insertedStores[0].id,
        name: 'USB-C Cable',
        category: 'Accessories',
        price: '19.99',
        quantity: 100,
      },
      {
        storeId: insertedStores[0].id,
        name: 'iPhone 14',
        category: 'Smartphones',
        price: '699.99',
        quantity: 18,
      },
      {
        storeId: insertedStores[0].id,
        name: 'iPad Pro 12.9',
        category: 'Tablets',
        price: '1099.99',
        quantity: 6,
      },
      {
        storeId: insertedStores[0].id,
        name: 'HomePod mini',
        category: 'Audio',
        price: '99.99',
        quantity: 22,
      },
      {
        storeId: insertedStores[0].id,
        name: 'MagSafe Charger',
        category: 'Accessories',
        price: '39.99',
        quantity: 45,
      },
    );
    
    // Products for Tech Haven (12 products)
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
      {
        storeId: insertedStores[1].id,
        name: 'HP Spectre x360',
        category: 'Laptops',
        price: '1399.99',
        quantity: 5,
      },
      {
        storeId: insertedStores[1].id,
        name: 'Bose QuietComfort 45',
        category: 'Audio',
        price: '329.99',
        quantity: 25,
      },
      {
        storeId: insertedStores[1].id,
        name: 'Mechanical Keyboard RGB',
        category: 'Accessories',
        price: '149.99',
        quantity: 35,
      },
      {
        storeId: insertedStores[1].id,
        name: 'LG UltraWide Monitor',
        category: 'Monitors',
        price: '799.99',
        quantity: 7,
      },
      {
        storeId: insertedStores[1].id,
        name: 'Lenovo ThinkPad X1',
        category: 'Laptops',
        price: '1599.99',
        quantity: 4,
      },
      {
        storeId: insertedStores[1].id,
        name: 'JBL Flip 6',
        category: 'Audio',
        price: '129.99',
        quantity: 40,
      },
      {
        storeId: insertedStores[1].id,
        name: 'Webcam HD Pro',
        category: 'Accessories',
        price: '89.99',
        quantity: 28,
      },
      {
        storeId: insertedStores[1].id,
        name: 'ASUS ROG Monitor',
        category: 'Monitors',
        price: '699.99',
        quantity: 9,
      },
    );
    
    // Products for Gadget World (12 products)
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
      {
        storeId: insertedStores[2].id,
        name: 'Meta Quest 3',
        category: 'Gaming',
        price: '499.99',
        quantity: 12,
      },
      {
        storeId: insertedStores[2].id,
        name: 'Steam Deck',
        category: 'Gaming',
        price: '399.99',
        quantity: 8,
      },
      {
        storeId: insertedStores[2].id,
        name: 'Fitbit Charge 6',
        category: 'Wearables',
        price: '159.99',
        quantity: 35,
      },
      {
        storeId: insertedStores[2].id,
        name: 'Garmin Forerunner',
        category: 'Wearables',
        price: '299.99',
        quantity: 14,
      },
      {
        storeId: insertedStores[2].id,
        name: 'Razer DeathAdder Mouse',
        category: 'Gaming',
        price: '69.99',
        quantity: 45,
      },
      {
        storeId: insertedStores[2].id,
        name: 'Samsung Galaxy Watch 6',
        category: 'Wearables',
        price: '349.99',
        quantity: 16,
      },
      {
        storeId: insertedStores[2].id,
        name: 'Gaming Headset Pro',
        category: 'Gaming',
        price: '149.99',
        quantity: 28,
      },
      {
        storeId: insertedStores[2].id,
        name: 'RGB Gaming Chair',
        category: 'Gaming',
        price: '299.99',
        quantity: 6,
      },
    );
    
    // Products for Digital Paradise (12 products)
    productsData.push(
      {
        storeId: insertedStores[3].id,
        name: 'Google Pixel 8 Pro',
        category: 'Smartphones',
        price: '899.99',
        quantity: 15,
      },
      {
        storeId: insertedStores[3].id,
        name: 'OnePlus 11',
        category: 'Smartphones',
        price: '699.99',
        quantity: 22,
      },
      {
        storeId: insertedStores[3].id,
        name: 'Microsoft Surface Pro 9',
        category: 'Tablets',
        price: '999.99',
        quantity: 10,
      },
      {
        storeId: insertedStores[3].id,
        name: 'Kindle Paperwhite',
        category: 'Tablets',
        price: '139.99',
        quantity: 50,
      },
      {
        storeId: insertedStores[3].id,
        name: 'Beats Studio Pro',
        category: 'Audio',
        price: '349.99',
        quantity: 18,
      },
      {
        storeId: insertedStores[3].id,
        name: 'Anker Power Bank',
        category: 'Accessories',
        price: '49.99',
        quantity: 75,
      },
      {
        storeId: insertedStores[3].id,
        name: 'Ring Video Doorbell',
        category: 'Smart Home',
        price: '99.99',
        quantity: 32,
      },
      {
        storeId: insertedStores[3].id,
        name: 'Nest Thermostat',
        category: 'Smart Home',
        price: '129.99',
        quantity: 24,
      },
      {
        storeId: insertedStores[3].id,
        name: 'Philips Hue Starter Kit',
        category: 'Smart Home',
        price: '199.99',
        quantity: 20,
      },
      {
        storeId: insertedStores[3].id,
        name: 'Echo Dot 5th Gen',
        category: 'Smart Home',
        price: '49.99',
        quantity: 60,
      },
      {
        storeId: insertedStores[3].id,
        name: 'Wyze Cam v3',
        category: 'Smart Home',
        price: '35.99',
        quantity: 45,
      },
      {
        storeId: insertedStores[3].id,
        name: 'Google Nest Hub',
        category: 'Smart Home',
        price: '89.99',
        quantity: 28,
      },
    );
    
    // Products for Smart Devices Hub (12 products)
    productsData.push(
      {
        storeId: insertedStores[4].id,
        name: 'Asus ZenBook 14',
        category: 'Laptops',
        price: '899.99',
        quantity: 12,
      },
      {
        storeId: insertedStores[4].id,
        name: 'Acer Predator Monitor',
        category: 'Monitors',
        price: '549.99',
        quantity: 8,
      },
      {
        storeId: insertedStores[4].id,
        name: 'Corsair Gaming Keyboard',
        category: 'Accessories',
        price: '129.99',
        quantity: 25,
      },
      {
        storeId: insertedStores[4].id,
        name: 'SteelSeries Mouse',
        category: 'Accessories',
        price: '79.99',
        quantity: 30,
      },
      {
        storeId: insertedStores[4].id,
        name: 'Canon EOS R50',
        category: 'Cameras',
        price: '899.99',
        quantity: 7,
      },
      {
        storeId: insertedStores[4].id,
        name: 'GoPro Hero 12',
        category: 'Cameras',
        price: '399.99',
        quantity: 15,
      },
      {
        storeId: insertedStores[4].id,
        name: 'DJI Mini 3 Pro',
        category: 'Cameras',
        price: '759.99',
        quantity: 5,
      },
      {
        storeId: insertedStores[4].id,
        name: 'Sony Alpha A6400',
        category: 'Cameras',
        price: '899.99',
        quantity: 6,
      },
      {
        storeId: insertedStores[4].id,
        name: 'Blue Yeti Microphone',
        category: 'Audio',
        price: '99.99',
        quantity: 40,
      },
      {
        storeId: insertedStores[4].id,
        name: 'Elgato Stream Deck',
        category: 'Accessories',
        price: '149.99',
        quantity: 18,
      },
      {
        storeId: insertedStores[4].id,
        name: 'Samsung T7 SSD 1TB',
        category: 'Accessories',
        price: '129.99',
        quantity: 35,
      },
      {
        storeId: insertedStores[4].id,
        name: 'Seagate External HDD 4TB',
        category: 'Accessories',
        price: '99.99',
        quantity: 42,
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
