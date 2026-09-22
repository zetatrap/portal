import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';

const router = express.Router();

// Validaciones
const contactValidation = [
  body('name').trim().notEmpty().withMessage('El nombre es requerido'),
  body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
  body('message').trim().notEmpty().isLength({ min: 10 }).withMessage('El mensaje debe tener al menos 10 caracteres')
];

// POST /api/contact - Enviar mensaje de contacto
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
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Insertar mensaje
    const result = await query(
      `INSERT INTO contacts (name, email, message, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, message, ipAddress, userAgent]
    );

    res.status(201).json({
      success: true,
      message: '¡Mensaje enviado con éxito! Te contactaremos pronto 🚀',
      data: {
        contactId: result.insertId,
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

// GET /api/contact - Obtener todos los mensajes (admin)
router.get('/', async (req, res) => {
  try {
    const { status, limit } = req.query;
    
    let sql = 'SELECT * FROM contacts';
    const params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    if (limit) {
      sql += ' LIMIT ?';
      params.push(parseInt(limit));
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
