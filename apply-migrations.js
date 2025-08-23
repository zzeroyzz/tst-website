#!/usr/bin/env node

/**
 * Apply Supabase migrations using REST API
 * This bypasses the need for database password by using the service role key
 */

const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✓' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✓' : '❌');
  process.exit(1);
}

async function executeSql(sql, migrationName) {
  console.log(`\n📦 Applying ${migrationName}...`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({ sql })
    });

    if (!response.ok) {
      // Try alternative approach - direct SQL execution via edge function
      const sqlResponse = await fetch(`${SUPABASE_URL}/rest/v1/rpc/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY,
        },
        body: JSON.stringify({ query: sql })
      });

      if (!sqlResponse.ok) {
        console.log('⚠️  Direct SQL execution not available. Need to use CLI with database password.');
        return false;
      }
    }

    console.log(`✅ ${migrationName} applied successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying ${migrationName}:`, error.message);
    return false;
  }
}

async function applyMigrations() {
  console.log('🚀 Starting migration application...');
  console.log(`📡 Target: ${SUPABASE_URL}`);

  const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
  const migrationFiles = [
    '001_crm_schema.sql',
    '002_appointments_table.sql', 
    '003_notifications_table.sql'
  ];

  let allSuccessful = true;

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Migration file not found: ${filePath}`);
      allSuccessful = false;
      continue;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    const success = await executeSql(sql, file);
    
    if (!success) {
      allSuccessful = false;
      break;
    }

    // Small delay between migrations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (allSuccessful) {
    console.log('\n🎉 All migrations applied successfully!');
    console.log('\n📋 What was created:');
    console.log('   ✅ Extended contacts table with CRM columns');
    console.log('   ✅ crm_messages table for messaging');
    console.log('   ✅ crm_message_templates for reusable templates');
    console.log('   ✅ appointments table for scheduling'); 
    console.log('   ✅ notifications table for dashboard alerts');
    console.log('   ✅ All views, indexes, and triggers');
    console.log('\n🧪 Test your GraphQL mutations - they should work now!');
  } else {
    console.log('\n⚠️  Some migrations failed. You may need to use the CLI approach with database password.');
    console.log('   See GET_DB_PASSWORD.md for instructions.');
  }
}

// Check if dotenv is available
try {
  require('dotenv');
} catch (error) {
  console.error('❌ dotenv not installed. Installing...');
  require('child_process').execSync('npm install dotenv', { stdio: 'inherit' });
  require('dotenv').config({ path: '.env.local' });
}

applyMigrations().catch(console.error);