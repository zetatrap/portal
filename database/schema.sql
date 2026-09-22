-- ============================================
-- LA ORDEN CREW - Database Schema
-- ============================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS laordencrew_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE laordencrew_db;

-- ============================================
-- Tabla: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    artist_name VARCHAR(255) NOT NULL,
    role ENUM('artist', 'producer', 'dj', 'label', 'other') DEFAULT 'artist',
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_artist_name (artist_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: products
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category_id INT NOT NULL,
    image_url VARCHAR(500),
    rating DECIMAL(2, 1) DEFAULT 5.0,
    downloads INT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    INDEX idx_category (category_id),
    INDEX idx_slug (slug),
    INDEX idx_featured (is_featured)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: orders
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: order_items
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: contacts
-- ============================================
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabla: downloads
-- ============================================
CREATE TABLE IF NOT EXISTS downloads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    ip_address VARCHAR(45),
    downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_product (product_id),
    INDEX idx_downloaded (downloaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insertar categorías por defecto
-- ============================================
INSERT INTO categories (name, slug, description, icon) VALUES
('Beats', 'beats', 'Instrumentales profesionales y beats únicos', 'Music'),
('Aplicaciones', 'apps', 'Software y aplicaciones para producción musical', 'Smartphone'),
('Videos', 'videos', 'Videoclips, visualizadores y contenido audiovisual', 'Video'),
('Webs', 'webs', 'Diseño web y soluciones digitales', 'Globe');

-- ============================================
-- Insertar productos de ejemplo
-- ============================================
INSERT INTO products (name, slug, description, price, category_id, image_url, rating) VALUES
-- Beats
('Cosmic Trap Beat', 'cosmic-trap-beat', 'Beat de trap intergaláctico con 808s espaciales y sintetizadores atmosféricos', 49.99, 1, '🎵', 5.0),
('Nebula Wave', 'nebula-wave', 'Instrumental atmosférico con sintetizadores etéreos perfectos para rap melódico', 39.99, 1, '🎹', 4.0),
('Dark Symphony', 'dark-symphony', 'Beat orquestal oscuro con cuerdas épicas y percusión cinematográfica', 59.99, 1, '🎻', 5.0),

-- Aplicaciones
('Studio Pro X', 'studio-pro-x', 'Suite completa de producción musical con inteligencia artificial integrada', 199.99, 2, '📱', 5.0),
('Beat Maker AI', 'beat-maker-ai', 'Genera beats profesionales usando inteligencia artificial avanzada', 149.99, 2, '🤖', 5.0),
('Mix Master Pro', 'mix-master-pro', 'Mezcla y masteriza tus tracks como los profesionales del sector', 179.99, 2, '🎛️', 5.0),

-- Videos
('Video Clip Espacial', 'video-clip-espacial', 'Producción completa de videoclip con efectos visuales futuristas 4K', 299.99, 3, '🎬', 5.0),
('Visualizer 4K', 'visualizer-4k', 'Visualizador de audio animado en ultra alta definición con preset personalizables', 79.99, 3, '🎥', 4.0),
('Video Lyric Maker', 'video-lyric-maker', 'Crea videos con letras animadas de forma profesional y rápida', 99.99, 3, '📝', 4.0),

-- Webs
('Web Premium', 'web-premium', 'Diseño web completamente personalizado con animaciones 3D y optimización SEO', 499.99, 4, '🌐', 5.0),
('Landing Pro', 'landing-pro', 'Landing page optimizada especialmente para artistas musicales y productores', 249.99, 4, '💻', 4.0),
('E-commerce Musical', 'ecommerce-musical', 'Tienda online completa para vender tu música y merchandise', 699.99, 4, '🛒', 5.0);

-- ============================================
-- Usuario de prueba (password: Test123!)
-- ============================================
INSERT INTO users (name, email, password_hash, artist_name, role) VALUES
('Test User', 'test@laordencrew.com', '$2b$10$KfXrQzWvXq.6YJ5qYXzQXO8hVJ7yCqNqKqK8NqKqKqKqKqKqKqKqK', 'Test Artist', 'artist');

-- ============================================
-- Vistas útiles
-- ============================================

-- Vista de productos con categoría
CREATE OR REPLACE VIEW v_products_full AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug
FROM products p
INNER JOIN categories c ON p.category_id = c.id
WHERE p.is_active = TRUE;

-- Vista de estadísticas de usuarios
CREATE OR REPLACE VIEW v_user_stats AS
SELECT 
    COUNT(*) as total_users,
    SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active_users,
    SUM(CASE WHEN email_verified = TRUE THEN 1 ELSE 0 END) as verified_users,
    SUM(CASE WHEN role = 'artist' THEN 1 ELSE 0 END) as artists,
    SUM(CASE WHEN role = 'producer' THEN 1 ELSE 0 END) as producers
FROM users;

-- Vista de productos más vendidos
CREATE OR REPLACE VIEW v_top_products AS
SELECT 
    p.id,
    p.name,
    p.price,
    c.name as category_name,
    COUNT(oi.id) as total_sold,
    SUM(oi.subtotal) as total_revenue
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN categories c ON p.category_id = c.id
GROUP BY p.id, p.name, p.price, c.name
ORDER BY total_sold DESC;
