import express from 'express';
import { query } from '../config/database.js';
import { getAdminActivity } from '../utils/activityLogger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const limit = Number(req.query.limit || 100);
    const logs = await getAdminActivity({ limit });

    const [products, orders, contacts, totals] = await Promise.all([
      query(`
        SELECT id, name, slug, price, is_active, is_featured, created_at, updated_at
        FROM products
        ORDER BY created_at DESC
        LIMIT 20
      `),
      query(`
        SELECT id, buyer_name, buyer_email, total_amount, payment_status, status, created_at
        FROM orders
        ORDER BY created_at DESC
        LIMIT 20
      `),
      query(`
        SELECT id, name, email, status, created_at
        FROM contacts
        ORDER BY created_at DESC
        LIMIT 20
      `),
      query(`
        SELECT
          (SELECT COUNT(*) FROM products) AS total_products,
          (SELECT COUNT(*) FROM orders) AS total_orders,
          (SELECT COUNT(*) FROM contacts) AS total_contacts,
          (SELECT COUNT(*) FROM products WHERE is_active = TRUE) AS active_products,
          (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE payment_status = 'paid') AS total_sales
      `),
    ]);

    res.json({
      success: true,
      data: {
        summary: totals[0] || {
          total_products: 0,
          total_orders: 0,
          total_contacts: 0,
          active_products: 0,
          total_sales: 0,
        },
        products,
        orders,
        contacts,
        logs,
      },
    });
  } catch (error) {
    console.error('Error al obtener actividad del admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividades del panel admin',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export default router;
