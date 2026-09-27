import { query } from '../config/database.js';

export const logAdminActivity = async ({
  action,
  entityType,
  entityId = null,
  entityName = null,
  details = {},
  userName = 'system',
}) => {
  try {
    await query(
      `INSERT INTO admin_activity_logs (action, entity_type, entity_id, entity_name, user_name, details)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        String(action || 'unknown'),
        String(entityType || 'general'),
        entityId ?? null,
        entityName ?? null,
        String(userName || 'system'),
        JSON.stringify(details || {}),
      ]
    );

    return true;
  } catch (error) {
    console.error('Error al registrar actividad admin:', error);
    return false;
  }
};

export const getAdminActivity = async ({ limit = 100 } = {}) => {
  const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Number(limit) : 100;

  const rows = await query(
    `SELECT *
     FROM admin_activity_logs
     ORDER BY created_at DESC
     LIMIT $1`,
    [safeLimit]
  );

  return rows;
};
