import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const products = await query(`
      SELECT
        p.*,
        c.slug AS category_slug,
        c.name AS category_name
      FROM products p
      INNER JOIN categories c ON c.id = p.category_id
      ORDER BY p.created_at DESC
    `);

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Error al obtener productos del admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      categorySlug,
      imageUrl,
      audioUrl,
      rating,
      isFeatured,
      isActive,
    } = req.body;

    if (!name || !description || !price) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, descripción y precio son obligatorios',
      });
    }

    const categoryResult = await query(
      'SELECT id FROM categories WHERE slug = $1 LIMIT 1',
      [categorySlug || 'beats']
    );

    if (categoryResult.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La categoría indicada no existe',
      });
    }

    const productSlug = slug || String(name).toLowerCase().replace(/\s+/g, '-');

    const result = await query(
      `INSERT INTO products (
        name,
        slug,
        description,
        price,
        category_id,
        image_url,
        audio_url,
        rating,
        is_featured,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        name,
        productSlug,
        description,
        Number(price),
        categoryResult[0].id,
        imageUrl || '🎵',
        audioUrl || null,
        Number(rating) || 5,
        Boolean(isFeatured),
        Boolean(isActive),
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Beat creado correctamente',
      data: result[0],
    });
  } catch (error) {
    console.error('Error al crear producto del admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear beat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      slug,
      description,
      price,
      categorySlug,
      imageUrl,
      audioUrl,
      rating,
      isFeatured,
      isActive,
    } = req.body;

    const categoryResult = await query(
      'SELECT id FROM categories WHERE slug = $1 LIMIT 1',
      [categorySlug || 'beats']
    );

    if (categoryResult.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'La categoría indicada no existe',
      });
    }

    const result = await query(
      `UPDATE products
       SET
         name = $1,
         slug = $2,
         description = $3,
         price = $4,
         category_id = $5,
         image_url = $6,
         audio_url = $7,
         rating = $8,
         is_featured = $9,
         is_active = $10,
         updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        name,
        slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        Number(price),
        categoryResult[0].id,
        imageUrl || '🎵',
        audioUrl || null,
        Number(rating) || 5,
        Boolean(isFeatured),
        Boolean(isActive),
        id,
      ]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Beat no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Beat actualizado correctamente',
      data: result[0],
    });
  } catch (error) {
    console.error('Error al actualizar producto del admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar beat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Beat no encontrado',
      });
    }

    res.json({
      success: true,
      message: 'Beat eliminado correctamente',
      data: result[0],
    });
  } catch (error) {
    console.error('Error al eliminar producto del admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar beat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
