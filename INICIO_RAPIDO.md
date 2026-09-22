# 🚀 GUÍA DE INICIO RÁPIDO - LA ORDEN CREW

## ✅ Ya está todo configurado!

### 📁 Estructura del Proyecto
```
laordencrew/
├── frontend/          ← Tu aplicación React (Puerto 5173)
├── backend/           ← API con Express + MySQL (Puerto 5000)
└── database/          ← Schema SQL listo para importar
```

---

## 🗄️ PASO 1: Configurar MySQL

### Opción A: Usar XAMPP (Recomendado para Windows)
1. **Descargar XAMPP** desde: https://www.apachefriends.org/
2. **Instalar XAMPP** y abrir el panel de control
3. **Iniciar MySQL** (click en "Start" junto a MySQL)
4. **Abrir phpMyAdmin** en: http://localhost/phpmyadmin

### Opción B: Usar MySQL Workbench
1. **Descargar MySQL Community** desde: https://dev.mysql.com/downloads/
2. **Instalar MySQL Server**
3. Durante la instalación, configura una contraseña para root
4. Abrir MySQL Workbench

### Opción C: Ya tengo MySQL instalado
¡Perfecto! Solo asegúrate de que esté corriendo.

---

## 🎯 PASO 2: Configurar la Base de Datos

### Método Automático (Recomendado):
```bash
cd backend
npm run db:setup
```

Este comando creará:
- ✅ Base de datos `laordencrew_db`
- ✅ Todas las tablas (users, products, orders, etc.)
- ✅ Datos de ejemplo (12 productos)
- ✅ Usuario de prueba

### Método Manual (Si prefieres):
1. Abre phpMyAdmin o MySQL Workbench
2. Crea una nueva base de datos llamada `laordencrew_db`
3. Importa el archivo: `database/schema.sql`

---

## ▶️ PASO 3: Iniciar los Servidores

### Terminal 1 - Backend API:
```bash
cd backend
npm run dev
```
Debería mostrar:
```
🚀 ================================
   LA ORDEN CREW - API SERVER
   ================================
   🌐 Servidor corriendo en: http://localhost:5000
   📊 Entorno: development
   🗄️  Base de datos: laordencrew_db
   ================================
```

### Terminal 2 - Frontend React:
```bash
# En la raíz del proyecto
npm run dev
```
El frontend ya está corriendo en: http://localhost:5173

---

## 🧪 PASO 4: ¡PROBAR TODO!

### 1. Registrar un Usuario
- Ve a: http://localhost:5173/registro
- Completa el formulario
- ¡Envía el registro!

### 2. Ver el Usuario en la Base de Datos
**Con phpMyAdmin:**
1. Abre http://localhost/phpmyadmin
2. Selecciona la base de datos `laordencrew_db`
3. Click en la tabla `users`
4. ¡Verás tu usuario registrado!

**Con MySQL Workbench:**
1. Conecta a tu servidor local
2. Ejecuta: `SELECT * FROM laordencrew_db.users;`
3. ¡Verás tu usuario registrado!

### 3. Ver Productos en la Tienda
- Ve a: http://localhost:5173/tienda
- Los productos se cargan desde MySQL
- Filtra por categorías

### 4. Enviar Mensaje de Contacto
- Ve a: http://localhost:5173 (Inicio)
- Baja hasta "CONTACTAR"
- Envía un mensaje
- Verás en la tabla `contacts` de la base de datos

---

## 🔧 Solución de Problemas

### ❌ Error: "Cannot connect to MySQL"
**Solución:**
1. Verifica que MySQL esté corriendo
2. Revisa el archivo `backend/.env`:
   ```env
   DB_USER=root
   DB_PASSWORD=          # Pon tu contraseña si tienes una
   DB_HOST=localhost
   DB_PORT=3306
   ```

### ❌ Error: "Port 5000 already in use"
**Solución:**
En `backend/.env` cambia:
```env
PORT=3001
```

### ❌ No veo productos en la tienda
**Solución:**
1. Verifica que el backend esté corriendo
2. Abre la consola del navegador (F12)
3. Busca errores de conexión
4. Verifica que la base de datos tenga datos

---

## 📊 Verificar que Todo Funciona

### Comando SQL para ver usuarios:
```sql
SELECT * FROM laordencrew_db.users;
```

### Comando SQL para ver productos:
```sql
SELECT * FROM laordencrew_db.products;
```

### Comando SQL para ver mensajes de contacto:
```sql
SELECT * FROM laordencrew_db.contacts;
```

---

## 🎉 ¡LISTO!

Tu aplicación completa está funcionando:
- ✅ Frontend React con animaciones profesionales
- ✅ Backend Express con seguridad completa
- ✅ MySQL con todas las tablas
- ✅ Registro de usuarios funcionando
- ✅ Productos desde base de datos
- ✅ Formulario de contacto conectado

### 🚀 URLs Importantes:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **phpMyAdmin:** http://localhost/phpmyadmin (si usas XAMPP)
- **Health Check:** http://localhost:5000/health

---

## 📝 Usuario de Prueba

Si usaste el setup automático, tienes este usuario:
```
Email: test@laordencrew.com
Password: Test123!
```

---

## 💡 Próximos Pasos

1. ✅ Personaliza los productos en la base de datos
2. ✅ Agrega tus propios beats y servicios
3. ✅ Configura email real para notificaciones
4. ✅ Añade pasarela de pago
5. ✅ Deploy a producción

¡Todo está listo para que empieces a trabajar! 🎵✨
