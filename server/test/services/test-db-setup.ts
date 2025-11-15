import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Client } from 'pg';
import * as schema from '../../src/db/schema.js';

let container: StartedPostgreSqlContainer;
let client: Client;
export let testDb: ReturnType<typeof drizzle>;

export async function setupTestDatabase() {
  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withExposedPorts(5432)
    .start();
    
  process.env.DATABASE_URL = container.getConnectionUri();

  client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  
  await client.connect();
  
  testDb = drizzle(client, { schema });
  
  await migrate(testDb, { migrationsFolder: 'drizzle' });
  
  return { container, client, testDb };
}

export async function teardownTestDatabase() {
  if (client) {
    await client.end();
  }
  if (container) {
    await container.stop();
  }
}

export async function clearDatabase() {
  await testDb.delete(schema.products);
  await testDb.delete(schema.stores);
}
