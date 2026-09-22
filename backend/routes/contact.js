import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';

const router = express.Router();

const contactValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('message')
    .trim()
    .notEmpty()
    .isLength({ min: 10 })
    .withMessage('El mensaje debe tener al menos 10 caracteres')
];

router.post('/', contactValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, message } = req.body;
    const ipAddress = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || '';

    const result = await query(
      `INSERT INTO contacts (name, email, message, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [name, email, message, ipAddress, userAgent]
    );

    res.status(201).json({
      success: true,
      message: '¡Mensaje enviado con éxito! Te contactaremos pronto 🚀',
      data: {
        contactId: result[0]?.id ?? null,
        name,
        email
      }
    });
  } catch (error) {
    console.error('Error al enviar contacto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar mensaje',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, limit } = req.query;

    let sql = 'SELECT * FROM contacts';
    const params = [];

    if (status) {
      sql += ' WHERE status = $' + (params.length + 1);
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    if (limit) {
      sql += ' LIMIT $' + (params.length + 1);
      params.push(parseInt(limit, 10));
    }

    const contacts = await query(sql, params);

    res.json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Error al obtener contactos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
