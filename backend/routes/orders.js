import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const {
      userId = null,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerMessage,
      items,
      paymentMethod
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Datos de orden inválidos'
      });
    }

    const firstItem = items[0];
    const productId = Number(firstItem?.productId);
    const quantity = Number(firstItem?.quantity) || 1;

    if (!productId || !buyerName || !buyerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos obligatorios del comprador o del producto'
      });
    }

    const products = await query(
      'SELECT id, name, price FROM products WHERE id = $1 AND is_active = TRUE',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Producto ${productId} no encontrado`
      });
    }

    const product = products[0];
    const finalPrice = Number(product.price) || 0;
    const totalAmount = finalPrice * quantity;

    const orderResult = await query(
      `INSERT INTO orders (
        user_id,
        buyer_name,
        buyer_email,
        buyer_phone,
        buyer_message,
        total_amount,
        payment_method,
        payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [userId ?? null, buyerName, buyerEmail, buyerPhone || null, buyerMessage || null, totalAmount, paymentMethod || 'pending', 'pending']
    );

    const orderId = orderResult[0]?.id;

    await query(
      `INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId, product.id, quantity, finalPrice, totalAmount]
    );

    res.status(201).json({
      success: true,
      message: 'Compra registrada correctamente',
      data: {
        orderId,
        totalAmount,
        productName: product.name,
        buyerEmail,
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
