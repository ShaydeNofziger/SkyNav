/**
 * Seed script to populate Cosmos DB with initial dropzone data
 * 
 * Usage:
 *   npm run seed-dropzones
 *   
 * Environment variables required:
 *   COSMOS_DB_ENDPOINT
 *   COSMOS_DB_KEY
 *   COSMOS_DB_DATABASE_NAME (optional, defaults to SkyNavDB)
 */

import { CosmosClient } from '@azure/cosmos';
import * as fs from 'fs';
import * as path from 'path';
import { DropZone } from '../src/models/DropZone';

// Load environment variables
const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseName = process.env.COSMOS_DB_DATABASE_NAME || 'SkyNavDB';

if (!endpoint || !key) {
  console.error('Error: COSMOS_DB_ENDPOINT and COSMOS_DB_KEY environment variables are required');
  process.exit(1);
}

async function seedDropzones() {
  console.log('🚀 Starting dropzone seed script...\n');

  // Initialize Cosmos DB client
  const cosmosClient = new CosmosClient({ endpoint, key });
  const database = cosmosClient.database(databaseName);
  const container = database.container('dropzones');

  // Load seed data
  const seedDataPath = path.join(__dirname, '../data/seed-dropzones.json');
  console.log(`📂 Loading seed data from: ${seedDataPath}`);
  
  const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8')) as DropZone[];
  console.log(`✅ Loaded ${seedData.length} dropzones\n`);

  // Upsert each dropzone
  let successCount = 0;
  let errorCount = 0;

  for (const dropzone of seedData) {
    try {
      console.log(`⏳ Upserting: ${dropzone.name} (${dropzone.id})...`);
      await container.items.upsert(dropzone);
      console.log(`✅ Success: ${dropzone.name}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error upserting ${dropzone.name}:`, error);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`🎉 Seed complete!`);
  console.log(`✅ Successfully seeded: ${successCount} dropzones`);
  if (errorCount > 0) {
    console.log(`❌ Failed: ${errorCount} dropzones`);
  }
  console.log('='.repeat(60));
}

// Run the seed script
seedDropzones()
  .then(() => {
    console.log('\n✨ Seed script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed script failed:', error);
    process.exit(1);
  });
