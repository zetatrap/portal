import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { testConnection } from './config/database.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import productsRoutes from './routes/products.js';
import adminProductsRoutes from './routes/adminProducts.js';
import contactRoutes from './routes/contact.js';
import ordersRoutes from './routes/orders.js';

// Configuración
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de seguridad
app.use(helmet());

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5179',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  'http://127.0.0.1:5176',
  'http://127.0.0.1:5177',
  'http://127.0.0.1:5178',
  'http://127.0.0.1:5179',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/admin/products', adminProductsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/orders', ordersRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: '🚀 LA ORDEN CREW API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      contact: '/api/contact',
      orders: '/api/orders'
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path 
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Iniciar servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('⚠️  No se pudo conectar a PostgreSQL. Verifica tu configuración.');
      console.log('💡 Asegúrate de:');
      console.log('   1. Tener PostgreSQL instalado y corriendo');
      console.log('   2. Configurar correctamente las variables DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_NAME en .env');
      console.log('   3. Ejecutar el schema SQL para crear las tablas y usuarios necesarios');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log('\n🚀 ================================');
      console.log('   LA ORDEN CREW - API SERVER');
      console.log('   ================================');
      console.log(`   🌐 Servidor corriendo en: http://localhost:${PORT}`);
      console.log(`   📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   🗄️  Base de datos: ${process.env.DB_NAME}`);
      console.log('   ================================\n');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();

export default app;
