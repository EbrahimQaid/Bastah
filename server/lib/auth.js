import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'bastah-dev-secret-change-in-production';

// Single-store mode: store ID is always 1
const STORE_ID = Number(process.env.STORE_ID || 1);

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'غير مصرح للوصول، الرجاء تسجيل الدخول أولاً' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.storeId = STORE_ID; // Single store — always fixed
    next();
  } catch (err) {
    return res.status(401).json({ error: 'جلسة عمل غير صالحة أو منتهية، الرجاء تسجيل الدخول مجدداً' });
  }
};
