import jwt from 'jsonwebtoken';
import { query } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'bastah-dev-secret-change-in-production';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح للوصول، الرجاء تسجيل الدخول أولاً' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;

    // Fetch user's store if it exists
    const { rows: storeRows } = await query('SELECT id FROM stores WHERE owner_id = $1 LIMIT 1', [req.userId]);
    if (storeRows.length > 0) {
      req.storeId = storeRows[0].id;
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'جلسة عمل غير صالحة أو منتهية، الرجاء تسجيل الدخول مجدداً' });
  }
};
