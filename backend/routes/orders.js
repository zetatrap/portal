import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, items, paymentMethod } = req.body;

    if (!userId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Datos de orden inválidos'
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const products = await query(
        'SELECT id, price FROM products WHERE id = $1 AND is_active = TRUE',
        [item.productId]
      );

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Producto ${item.productId} no encontrado`
        });
      }

      const product = products[0];
      const quantity = Number(item.quantity) || 1;
      const subtotal = Number(product.price) * quantity;
      totalAmount += subtotal;

      orderItems.push({
        productId: product.id,
        quantity,
        price: Number(product.price),
        subtotal
      });
    }

    const orderResult = await query(
      `INSERT INTO orders (user_id, total_amount, payment_method)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [userId, totalAmount, paymentMethod || 'pending']
    );

    const orderId = orderResult[0]?.id;

    for (const item of orderItems) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
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

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await query(
      `SELECT o.*, COALESCE(oi.items_count, 0) AS items_count
       FROM orders o
       LEFT JOIN (
         SELECT order_id, COUNT(*) AS items_count
         FROM order_items
         GROUP BY order_id
       ) oi ON oi.order_id = o.id
       WHERE o.user_id = $1
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

router.get('/detail/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const orders = await query(
      'SELECT * FROM orders WHERE id = $1',
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
        p.name AS product_name,
        p.description AS product_description
       FROM order_items oi
       INNER JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
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
