import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🚀 Iniciando configuración de base de datos...\n');

    // Conectar a MySQL (sin seleccionar base de datos)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ Conectado a MySQL');

    // Leer archivo SQL
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Ejecutando schema SQL...');

    // Ejecutar schema
    await connection.query(schema);

    console.log('✅ Base de datos creada exitosamente');
    console.log('✅ Tablas creadas');
    console.log('✅ Datos de ejemplo insertados');
    console.log('\n🎉 ¡Base de datos lista!\n');
    console.log('📊 Puedes conectarte a: ' + process.env.DB_NAME);
    console.log('👤 Usuario de prueba:');
    console.log('   Email: test@laordencrew.com');
    console.log('   Password: Test123!\n');

  } catch (error) {
    console.error('❌ Error al configurar la base de datos:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();
