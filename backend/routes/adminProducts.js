import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { query } from '../config/database.js';
import { logAdminActivity } from '../utils/activityLogger.js';

const router = express.Router();
const uploadDir = path.resolve(process.cwd(), 'uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9._-]/g, '');

    const timestamp = Date.now();
    const extension = path.extname(safeName) || '.wav';
    cb(null, `${timestamp}-${safeName || 'beat'}${extension}`);
  },
});

const allowedMimeTypes = ['audio/wav', 'audio/x-wav', 'audio/wave', 'audio/mpeg', 'audio/mp3'];
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const isAllowedName = /\.(wav|mp3|mpeg|m4a)$/i.test(file.originalname || '');
    const isAllowedType = allowedMimeTypes.includes(file.mimetype);

    if (isAllowedName || isAllowedType) {
      cb(null, true);
      return;
    }

    cb(new Error('Solo se aceptan archivos de audio WAV o MP3.'));
  },
});

const sanitizeSlug = (value = '') => {
  const nextValue = String(value).trim().toLowerCase();
  const slug = nextValue
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'beat';
};

const normalizeBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
  }

  return Boolean(value);
};

const normalizeAudioUrl = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
};

const deleteUploadedAudio = (audioUrl) => {
  if (!audioUrl || typeof audioUrl !== 'string' || !audioUrl.startsWith('/uploads/')) {
    return;
  }

  const localPath = path.resolve(process.cwd(), `.${audioUrl}`);
  fs.rm(localPath, { force: true }).catch(() => {});
};

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

router.post('/', upload.single('audioFile'), async (req, res) => {
  try {
    const body = req.body || {};
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
    } = body;

    const trimmedName = String(name || '').trim();
    const trimmedDescription = String(description || '').trim();
    const parsedPrice = Number(price);
    const uploadedAudioPath = req.file ? `/uploads/${req.file.filename}` : null;
    const finalAudioUrl = uploadedAudioPath || normalizeAudioUrl(audioUrl);

    if (!trimmedName || !trimmedDescription || !price || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, descripción y precio válido son obligatorios',
      });
    }

    if (!finalAudioUrl) {
      return res.status(400).json({
        success: false,
        message: 'Debes subir un archivo WAV/MP3 o indicar una URL de audio.',
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

    const productSlug = sanitizeSlug(slug || trimmedName);

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
        trimmedName,
        productSlug,
        trimmedDescription,
        parsedPrice,
        categoryResult[0].id,
        imageUrl || '🎵',
        finalAudioUrl,
        Number(rating) || 5,
        normalizeBoolean(isFeatured, false),
        normalizeBoolean(isActive, true),
      ]
    );

    await logAdminActivity({
      action: 'create',
      entityType: 'beat',
      entityId: result[0]?.id ?? null,
      entityName: result[0]?.name || trimmedName,
      details: {
        slug: result[0]?.slug || productSlug,
        price: Number(result[0]?.price ?? parsedPrice),
        categorySlug: categorySlug || 'beats',
        isActive: normalizeBoolean(isActive, true),
        isFeatured: normalizeBoolean(isFeatured, false),
        audioUrl: finalAudioUrl,
      },
      userName: 'admin',
    });

    res.status(201).json({
      success: true,
      message: 'Beat creado correctamente',
      data: result[0],
    });
  } catch (error) {
    console.error('Error al crear producto del admin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear beat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.put('/:id', upload.single('audioFile'), async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body || {};
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
    } = body;

    const currentProduct = await query('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);
    if (currentProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Beat no encontrado',
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

    const uploadedAudioPath = req.file ? `/uploads/${req.file.filename}` : null;
    const finalAudioUrl = uploadedAudioPath || normalizeAudioUrl(audioUrl) || currentProduct[0].audio_url;
    const nextPrice = Number(price);
    const safePrice = Number.isFinite(nextPrice) && nextPrice > 0 ? nextPrice : Number(currentProduct[0].price);
    const nextIsFeatured = normalizeBoolean(isFeatured, currentProduct[0].is_featured);
    const nextIsActive = normalizeBoolean(isActive, currentProduct[0].is_active);

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
        String(name || currentProduct[0].name).trim(),
        sanitizeSlug(slug || name || currentProduct[0].name),
        String(description || currentProduct[0].description).trim(),
        safePrice,
        categoryResult[0].id,
        imageUrl || currentProduct[0].image_url || '🎵',
        finalAudioUrl,
        Number(rating) || Number(currentProduct[0].rating || 5),
        nextIsFeatured,
        nextIsActive,
        id,
      ]
    );

    if (uploadedAudioPath && currentProduct[0].audio_url && currentProduct[0].audio_url.startsWith('/uploads/')) {
      deleteUploadedAudio(currentProduct[0].audio_url);
    }

    await logAdminActivity({
      action: 'update',
      entityType: 'beat',
      entityId: Number(id),
      entityName: result[0]?.name || name,
      details: {
        slug: result[0]?.slug || slug,
        price: Number(result[0]?.price ?? safePrice),
        categorySlug: categorySlug || 'beats',
        isActive: nextIsActive,
        isFeatured: nextIsFeatured,
        audioUrl: finalAudioUrl,
      },
      userName: 'admin',
    });

    res.json({
      success: true,
      message: 'Beat actualizado correctamente',
      data: result[0],
    });
  } catch (error) {
    console.error('Error al actualizar producto del admin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar beat',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const currentProduct = await query('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);

    if (currentProduct.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Beat no encontrado',
      });
    }

    const result = await query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );

    deleteUploadedAudio(result[0]?.audio_url || currentProduct[0]?.audio_url);

    await logAdminActivity({
      action: 'delete',
      entityType: 'beat',
      entityId: Number(id),
      entityName: result[0]?.name || currentProduct[0]?.name || 'Beat eliminado',
      details: {
        slug: result[0]?.slug || currentProduct[0]?.slug || null,
        price: Number(result[0]?.price ?? currentProduct[0]?.price ?? 0),
        deletedAt: new Date().toISOString(),
      },
      userName: 'admin',
    });

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
