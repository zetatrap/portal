import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';

const router = express.Router();
const isProduction = process.env.NODE_ENV === 'production';

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
  });
};

const checkoutValidation = [
  body('buyerName').trim().notEmpty().withMessage('El nombre del comprador es obligatorio'),
  body('buyerEmail').isEmail().normalizeEmail().withMessage('El email del comprador es inválido'),
  body('items').isArray({ min: 1 }).withMessage('Debes incluir al menos un producto'),
  body('items.*.productId').isInt({ min: 1 }).withMessage('Producto inválido'),
  body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
];

const getOrCreateCheckoutCustomer = async ({ buyerName, buyerEmail }) => {
  const normalizedEmail = String(buyerEmail || '').trim().toLowerCase();

  const existingUsers = await query(
    'SELECT id, name, email, role FROM users WHERE email = $1 LIMIT 1',
    [normalizedEmail]
  );

  if (existingUsers.length > 0) {
    return existingUsers[0];
  }

  const fallbackPassword = `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
  const passwordHash = await bcrypt.hash(fallbackPassword, bcryptRounds);

  const created = await query(
    `INSERT INTO users (name, email, password_hash, artist_name, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role`,
    [buyerName.trim(), normalizedEmail, passwordHash, buyerName.trim(), 'other']
  );

  return created[0];
};

const createCheckoutOrder = async ({ buyerName, buyerEmail, buyerPhone, buyerMessage, items, paymentMethod }) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Datos de orden inválidos');
  }

  const productIds = items.map((item) => Number(item?.productId)).filter((id) => Number.isFinite(id) && id > 0);

  if (productIds.length !== items.length) {
    throw new Error('Hay productos inválidos en la compra');
  }

  const products = await query(
    'SELECT id, name, price FROM products WHERE id = ANY($1) AND is_active = TRUE',
    [productIds]
  );

  const productMap = new Map(products.map((product) => [product.id, product]));

  if (products.length !== productIds.length) {
    const missingIds = productIds.filter((id) => !productMap.has(id));
    throw new Error(`Productos no disponibles: ${missingIds.join(', ')}`);
  }

  let totalAmount = 0;
  const orderItems = items.map((item) => {
    const product = productMap.get(Number(item.productId));
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const subtotal = Number(product.price) * quantity;
    totalAmount += subtotal;

    return {
      productId: Number(product.id),
      quantity,
      price: Number(product.price),
      subtotal,
      productName: product.name,
    };
  });

  const customer = await getOrCreateCheckoutCustomer({ buyerName, buyerEmail });

  const orderResult = await query(
    `INSERT INTO orders (
      user_id,
      buyer_name,
      buyer_email,
      buyer_phone,
      buyer_message,
      total_amount,
      payment_method,
      payment_status,
      status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, total_amount, payment_status, status`,
    [
      customer.id,
      buyerName.trim(),
      String(buyerEmail).trim().toLowerCase(),
      buyerPhone || null,
      buyerMessage || null,
      totalAmount,
      paymentMethod || 'pending',
      'pending',
      'pending',
    ]
  );

  const orderId = orderResult[0]?.id;

  for (const item of orderItems) {
    await query(
      `INSERT INTO order_items (order_id, product_id, quantity, price, subtotal)
       VALUES ($1, $2, $3, $4, $5)`,
      [orderId, item.productId, item.quantity, item.price, item.subtotal]
    );
  }

  const token = jwt.sign(
    {
      userId: customer.id,
      email: customer.email,
      role: customer.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    orderId,
    totalAmount,
    customer,
    token,
    items: orderItems,
  };
};

router.post('/checkout', checkoutValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerMessage,
      items,
      paymentMethod,
    } = req.body;

    const checkout = await createCheckoutOrder({
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerMessage,
      items,
      paymentMethod,
    });

    setAuthCookie(res, checkout.token);

    res.status(201).json({
      success: true,
      message: 'Compra registrada correctamente y sesión iniciada',
      data: {
        orderId: checkout.orderId,
        totalAmount: checkout.totalAmount,
        customer: checkout.customer,
        items: checkout.items,
      },
    });
  } catch (error) {
    console.error('Error al crear checkout:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al crear la compra',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      userId = null,
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerMessage,
      items,
      paymentMethod,
    } = req.body;

    const checkout = await createCheckoutOrder({
      buyerName,
      buyerEmail,
      buyerPhone,
      buyerMessage,
      items,
      paymentMethod,
    });

    if (userId) {
      checkout.customer.id = userId;
    }

    setAuthCookie(res, checkout.token);

    res.status(201).json({
      success: true,
      message: 'Compra registrada correctamente',
      data: {
        orderId: checkout.orderId,
        totalAmount: checkout.totalAmount,
        customer: checkout.customer,
      },
    });
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

router.post('/checkout/complete/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const orders = await query(
      'SELECT id, payment_status, status FROM orders WHERE id = $1',
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }

    await query(
      `UPDATE orders
       SET payment_status = 'paid', status = 'completed', updated_at = NOW()
       WHERE id = $1`,
      [orderId]
    );

    clearAuthCookie(res);

    res.json({
      success: true,
      message: 'Pago confirmado y sesión cerrada',
      data: {
        orderId: Number(orderId),
      },
    });
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error al confirmar la compra',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
      data: orders,
    });
  } catch (error) {
    console.error('Error al obtener órdenes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener órdenes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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
        message: 'Orden no encontrada',
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
        items,
      },
    });
  } catch (error) {
    console.error('Error al obtener detalle de orden:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalle de orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
