# 📡 API ENDPOINTS - LA ORDEN CREW

Base URL: `http://localhost:5000/api`

---

## 🔐 AUTENTICACIÓN

### POST /api/auth/register
**Registrar nuevo usuario**

**Request:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "MiPassword123",
  "artistName": "DJ Juan",
  "role": "artist"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "¡Registro exitoso! Bienvenido a La Orden Crew 🚀",
  "data": {
    "userId": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "artistName": "DJ Juan",
    "role": "artist",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /api/auth/login
**Iniciar sesión**

**Request:**
```json
{
  "email": "juan@example.com",
  "password": "MiPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "¡Bienvenido de vuelta! 🚀",
  "data": {
    "userId": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "artistName": "DJ Juan",
    "role": "artist",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### GET /api/auth/verify
**Verificar token JWT**

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "artistName": "DJ Juan",
    "role": "artist"
  }
}
```

---

## 🛍️ PRODUCTOS

### GET /api/products
**Obtener todos los productos**

**Query Parameters (opcionales):**
- `category` - Filtrar por categoría (beats, apps, videos, webs)
- `featured` - Solo destacados (true/false)
- `limit` - Límite de resultados
- `search` - Búsqueda por nombre o descripción

**Ejemplos:**
```
GET /api/products
GET /api/products?category=beats
GET /api/products?featured=true&limit=6
GET /api/products?search=studio
```

**Response (200):**
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "id": 1,
      "name": "Cosmic Trap Beat",
      "slug": "cosmic-trap-beat",
      "description": "Beat de trap intergaláctico con 808s espaciales",
      "price": 49.99,
      "category_id": 1,
      "category_name": "Beats",
      "category_slug": "beats",
      "image_url": "🎵",
      "rating": 5.0,
      "downloads": 0,
      "is_featured": false,
      "created_at": "2026-03-05T10:00:00.000Z"
    }
  ]
}
```

---

### GET /api/products/:id
**Obtener un producto específico**

**Ejemplo:**
```
GET /api/products/1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Cosmic Trap Beat",
    "slug": "cosmic-trap-beat",
    "description": "Beat de trap intergaláctico con 808s espaciales",
    "price": 49.99,
    "category_name": "Beats",
    "category_slug": "beats",
    "rating": 5.0
  }
}
```

---

### GET /api/products/category/:slug
**Obtener productos por categoría**

**Ejemplo:**
```
GET /api/products/category/beats
```

**Response (200):**
```json
{
  "success": true,
  "category": "beats",
  "count": 3,
  "data": [...]
}
```

---

## 📧 CONTACTO

### POST /api/contact
**Enviar mensaje de contacto**

**Request:**
```json
{
  "name": "María García",
  "email": "maria@example.com",
  "message": "Hola, estoy interesada en colaborar con La Orden Crew..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "¡Mensaje enviado con éxito! Te contactaremos pronto 🚀",
  "data": {
    "contactId": 1,
    "name": "María García",
    "email": "maria@example.com"
  }
}
```

---

### GET /api/contact
**Obtener mensajes (admin)**

**Query Parameters (opcionales):**
- `status` - Filtrar por estado (new, read, replied, archived)
- `limit` - Límite de resultados

**Ejemplo:**
```
GET /api/contact?status=new&limit=10
```

**Response (200):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": 1,
      "name": "María García",
      "email": "maria@example.com",
      "message": "Hola, estoy interesada...",
      "status": "new",
      "created_at": "2026-03-05T12:00:00.000Z"
    }
  ]
}
```

---

## 🛒 ÓRDENES

### POST /api/orders
**Crear nueva orden**

**Request:**
```json
{
  "userId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 1
    },
    {
      "productId": 3,
      "quantity": 2
    }
  ],
  "paymentMethod": "credit_card"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Orden creada exitosamente",
  "data": {
    "orderId": 1,
    "totalAmount": 249.99,
    "itemsCount": 2
  }
}
```

---

### GET /api/orders/:userId
**Obtener órdenes de un usuario**

**Ejemplo:**
```
GET /api/orders/1
```

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "total_amount": 249.99,
      "status": "pending",
      "payment_status": "pending",
      "items_count": 2,
      "created_at": "2026-03-05T14:00:00.000Z"
    }
  ]
}
```

---

### GET /api/orders/detail/:orderId
**Obtener detalle de una orden**

**Ejemplo:**
```
GET /api/orders/detail/1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 1,
      "total_amount": 249.99,
      "status": "pending",
      "created_at": "2026-03-05T14:00:00.000Z"
    },
    "items": [
      {
        "id": 1,
        "product_id": 1,
        "product_name": "Cosmic Trap Beat",
        "quantity": 1,
        "price": 49.99,
        "subtotal": 49.99
      }
    ]
  }
}
```

---

## ❌ RESPUESTAS DE ERROR

**Formato estándar de error:**
```json
{
  "success": false,
  "message": "Descripción del error",
  "errors": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

**Códigos de estado HTTP:**
- `200` - OK
- `201` - Created (recurso creado)
- `400` - Bad Request (datos inválidos)
- `401` - Unauthorized (no autenticado)
- `404` - Not Found (recurso no encontrado)
- `409` - Conflict (email ya existe)
- `500` - Internal Server Error

---

## 🔒 SEGURIDAD

### Autenticación JWT
Para endpoints protegidos, incluye el token en el header:
```
Authorization: Bearer {tu_token_jwt}
```

### Rate Limiting
- 100 requests por 15 minutos por IP
- Aplicado a todas las rutas `/api/*`

### Validaciones
- ✅ Email válido y único
- ✅ Contraseña mínimo 6 caracteres
- ✅ Nombres no vacíos
- ✅ Precios numéricos válidos
- ✅ SQL injection protegido

---

## 🧪 PROBAR CON CURL

### Registrar usuario:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123",
    "artistName": "Test Artist",
    "role": "artist"
  }'
```

### Obtener productos:
```bash
curl http://localhost:5000/api/products
```

### Enviar contacto:
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "email": "test@example.com",
    "message": "Mensaje de prueba"
  }'
```

---

## 🔗 Health Check

**GET /health**
```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-03-05T15:30:00.000Z",
  "environment": "development"
}
```
