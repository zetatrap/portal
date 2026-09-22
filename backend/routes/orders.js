import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';

const router = express.Router();

// POST /api/orders - Crear nueva orden
router.post('/', async (req, res) => {
  try {
    const { userId, items, paymentMethod } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Datos de orden inválidos' 
      });
    }

    // Calcular total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const products = await query(
        'SELECT id, price FROM products WHERE id = ? AND is_active = TRUE',
        [item.productId]
      );

      if (products.length === 0) {
        return res.status(404).json({ 
          success: false,
          message: `Producto ${item.productId} no encontrado` 
        });
      }

      const product = products[0];
      const quantity = item.quantity || 1;
      const subtotal = product.price * quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: product.id,
        quantity,
        price: product.price,
        subtotal
      });
    }

    // Crear orden
    const orderResult = await query(
      `INSERT INTO orders (user_id, total_amount, payment_method) 
       VALUES (?, ?, ?)`,
      [userId, totalAmount, paymentMethod || 'pending']
    );

    const orderId = orderResult.insertId;

    // Insertar items de la orden
    for (const item of orderItems) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, subtotal) 
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.price, item.subtotal]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: {
        orderId,
        totalAmount,
        itemsCount: orderItems.length
      }
    });

  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/orders/:userId - Obtener órdenes de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await query(
      `SELECT 
        o.*,
        COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });

  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener órdenes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/orders/detail/:orderId - Obtener detalle de una orden
router.get('/detail/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const orders = await query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Orden no encontrada' 
      });
    }

    const items = await query(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.description as product_description
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?`,
      [orderId]
    );

    res.json({
      success: true,
      data: {
        order: orders[0],
        items
      }
    });

  } catch (error) {
    console.error('Error al obtener detalle de orden:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener detalle de orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
