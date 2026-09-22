import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, featured, limit, search } = req.query;

    let sql = `
      SELECT
        p.*,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = TRUE
    `;

    const params = [];

    if (category && category !== 'all') {
      sql += ' AND c.slug = $' + (params.length + 1);
      params.push(category);
    }

    if (featured === 'true') {
      sql += ' AND p.is_featured = TRUE';
    }

    if (search) {
      sql += ' AND (LOWER(p.name) LIKE $' + (params.length + 1) + ' OR LOWER(p.description) LIKE $' + (params.length + 2) + ')';
      params.push(`%${String(search).toLowerCase()}%`, `%${String(search).toLowerCase()}%`);
    }

    sql += ' ORDER BY p.created_at DESC';

    if (limit) {
      sql += ' LIMIT $' + (params.length + 1);
      params.push(parseInt(limit, 10));
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

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const products = await query(
      `SELECT
        p.*,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1 AND p.is_active = TRUE`,
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

router.get('/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const products = await query(
      `SELECT
        p.*,
        c.name AS category_name,
        c.slug AS category_slug
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE c.slug = $1 AND p.is_active = TRUE
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
