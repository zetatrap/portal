# La Orden Crew - Backend API

Backend profesional para La Orden Crew con Express, MySQL y JWT.

## 🚀 Instalación Rápida

### 1. Instalar dependencias
```bash
cd backend
npm install
```

### 2. Configurar variables de entorno
```bash
# Copiar archivo de ejemplo
copy .env.example .env

# Editar .env con tus credenciales de MySQL
```

### 3. Configurar MySQL
Asegúrate de tener MySQL instalado y corriendo. Luego ejecuta:

```bash
npm run db:setup
```

Este comando creará automáticamente:
- La base de datos `laordencrew_db`
- Todas las tablas necesarias
- Datos de ejemplo
- Usuario de prueba

### 4. Iniciar servidor
```bash
# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: http://localhost:5000

## 📋 Requisitos Previos

- Node.js 18+ instalado
- MySQL 8+ instalado y corriendo
- Puerto 5000 disponible (o cambiar en .env)

## 🗄️ Configuración de MySQL

### Credenciales por defecto (.env):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=laordencrew_db
```

### Verificar MySQL está corriendo:
```bash
# En Windows
net start MySQL80

# O usar MySQL Workbench o similar
```

## 🔌 Endpoints API

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token

### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener producto específico
- `GET /api/products/category/:slug` - Productos por categoría

### Contacto
- `POST /api/contact` - Enviar mensaje
- `GET /api/contact` - Ver mensajes (admin)

### Órdenes
- `POST /api/orders` - Crear orden
- `GET /api/orders/:userId` - Órdenes de usuario
- `GET /api/orders/detail/:orderId` - Detalle de orden

## 🧪 Probar la API

### Usuario de prueba:
```
Email: test@laordencrew.com
Password: Test123!
```

### Ejemplo de registro (POST /api/auth/register):
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "MiPassword123",
  "artistName": "DJ Juan",
  "role": "artist"
}
```

### Ejemplo de contacto (POST /api/contact):
```json
{
  "name": "María García",
  "email": "maria@example.com",
  "message": "Hola, estoy interesada en colaborar..."
}
```

## 🔒 Seguridad

✅ Contraseñas hasheadas con bcrypt
✅ Tokens JWT para autenticación
✅ Validación de datos con express-validator
✅ Protección con Helmet
✅ Rate limiting
✅ CORS configurado
✅ Variables de entorno para secretos

## 📊 Base de Datos

### Tablas creadas:
- `users` - Usuarios registrados
- `products` - Productos de la tienda
- `categories` - Categorías de productos
- `orders` - Órdenes de compra
- `order_items` - Items de cada orden
- `contacts` - Mensajes de contacto
- `downloads` - Registro de descargas

## 🐛 Troubleshooting

### Error: "Cannot connect to MySQL"
1. Verifica que MySQL esté corriendo
2. Revisa las credenciales en .env
3. Asegúrate de tener permisos correctos

### Error: "Port 5000 already in use"
Cambia el puerto en .env:
```env
PORT=3001
```

### Error al ejecutar db:setup
1. Verifica que el archivo database/schema.sql exista
2. Comprueba los permisos del usuario MySQL
3. Asegúrate de que no exista ya la base de datos (o elimínala)

## 📝 Licencia

© 2026 La Orden Crew. Todos los derechos reservados.
