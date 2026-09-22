import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET /api/products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const { category, featured, limit, search } = req.query;
    
    let sql = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `;
    const params = [];

    // Filtro por categoría
    if (category && category !== 'all') {
      sql += ' AND c.slug = ?';
      params.push(category);
    }

    // Filtro por destacados
    if (featured === 'true') {
      sql += ' AND p.is_featured = TRUE';
    }

    // Búsqueda por nombre
    if (search) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY p.created_at DESC';

    // Límite
    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    const products = await query(sql, params);

    res.json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener productos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/products/:id - Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const products = await query(
      `SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = TRUE`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Producto no encontrado' 
      });
    }

    res.json({
      success: true,
      data: products[0]
    });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener producto',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/products/category/:slug - Obtener productos por categoría
router.get('/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const products = await query(
      `SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE c.slug = ? AND p.is_active = TRUE
      ORDER BY p.created_at DESC`,
      [slug]
    );

    res.json({
      success: true,
      category: slug,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener productos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
