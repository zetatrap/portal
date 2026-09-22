import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  let pool;

  try {
    console.log('🚀 Iniciando configuración de PostgreSQL...\n');

    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'appuser',
      password: process.env.DB_PASSWORD || 'postgres123',
      database: process.env.DB_NAME || 'beats_store',
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    });

    const client = await pool.connect();
    console.log('✅ Conectado a PostgreSQL');
    client.release();

    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Ejecutando schema SQL PostgreSQL...');
    await pool.query(schema);

    console.log('✅ Tablas creadas');
    console.log('✅ Datos de ejemplo insertados');
    console.log('\n🎉 ¡Base de datos lista!\n');
    console.log('📊 Base conectada: ' + (process.env.DB_NAME || 'beats_store'));
    console.log('👤 Usuario de prueba:');
    console.log('   Email: test@laordencrew.com');
    console.log('   Password: Test123!\n');
  } catch (error) {
    console.error('❌ Error al configurar la base de datos:', error.message);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

setupDatabase();
