import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel.js";
import { StoreModel } from "../models/storeModel.js";
import { getJwtSecret } from "../lib/auth.js";

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS) || 10;

function signToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

/**
 * 🔐 Auth Controller (MVC - Controller)
 */
export async function register(req, res) {
  const { fullName, email, phone, password } = req.body || {};

  if (!fullName || !email || !password) {
    return res.status(400).json({ error: "الاسم والبريد وكلمة المرور مطلوبة" });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
  }

  try {
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await UserModel.create({
      email,
      passwordHash,
      fullName,
      phone,
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[register controller]", err);
    return res.status(500).json({ error: "خطأ في السيرفر أثناء التسجيل" });
  }
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "البريد وكلمة المرور مطلوبان" });
  }

  try {
    const user = await UserModel.findByEmail(email);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: "بيانات الدخول خاطئة" });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "بيانات الدخول خاطئة" });
    }

    await UserModel.updateLastLogin(user.id);

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("[login controller]", err);
    return res.status(500).json({ error: "خطأ في السيرفر أثناء تسجيل الدخول" });
  }
}

export async function createStore(req, res) {
  if (req.storeId) {
    return res.status(409).json({ error: "لديك متجر بالفعل" });
  }

  const {
    name,
    slug,
    description,
    whatsappNumber,
    primaryColor,
    secondaryColor,
    fontFamily,
    shippingRate,
    defaultCurrency,
  } = req.body || {};

  if (!name?.trim() || !/^[a-z0-9-]{3,60}$/.test(slug || "")) {
    return res
      .status(400)
      .json({ error: "اسم المتجر والرابط بصيغة صحيحة مطلوبان" });
  }

  try {
    const createdStore = await StoreModel.create({
      ownerId: req.userId,
      name,
      slug,
      description,
      whatsappNumber,
      primaryColor,
      secondaryColor,
      fontFamily,
      shippingRate,
      defaultCurrency,
    });

    return res.status(201).json(createdStore);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "رابط المتجر مستخدم بالفعل" });
    }
    console.error("[store/create controller]", error);
    return res.status(500).json({ error: "تعذر إنشاء المتجر" });
  }
}

export async function getMe(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "غير مصرح" });
  }

  try {
    const payload = jwt.verify(authHeader.slice(7), getJwtSecret());
    const user = await UserModel.findById(payload.userId);
    if (!user) {
      return res.status(404).json({ error: "المستخدم غير موجود" });
    }

    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatar_url,
    });
  } catch {
    return res.status(401).json({ error: "token غير صالح" });
  }
}
