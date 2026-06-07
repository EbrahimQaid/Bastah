import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "ar";

interface Translations {
  home: string;
  shop: string;
  cart: string;
  addToCart: string;
  soldOut: string;
  selectSize: string;
  selectColor: string;
  inStock: string;
  outOfStock: string;
  onlyFewLeft: string;
  featured: string;
  viewAll: string;
  searchProducts: string;
  filters: string;
  priceRange: string;
  minPrice: string;
  maxPrice: string;
  size: string;
  color: string;
  clearFilters: string;
  noProductsFound: string;
  products: string;
  proceedToCheckout: string;
  yourCartIsEmpty: string;
  startShopping: string;
  orderSummary: string;
  subtotal: string;
  total: string;
  placeOrder: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  orderConfirmed: string;
  orderConfirmedDesc: string;
  continueShopping: string;
  miniCartTitle: string;
  remove: string;
  shopNow: string;
  totalPrice: string;
  quantity: string;
  allProducts: string;
  apply: string;
}

const en: Translations = {
  home: "Home",
  shop: "Shop",
  cart: "Cart",
  addToCart: "Add to Cart",
  soldOut: "Sold Out",
  selectSize: "Select Size",
  selectColor: "Select Color",
  inStock: "In Stock",
  outOfStock: "Out of Stock",
  onlyFewLeft: "Only a few left",
  featured: "Featured",
  viewAll: "View All",
  searchProducts: "Search products...",
  filters: "Filters",
  priceRange: "Price Range",
  minPrice: "Min price",
  maxPrice: "Max price",
  size: "Size",
  color: "Color",
  clearFilters: "Clear Filters",
  noProductsFound: "No products found",
  products: "Products",
  proceedToCheckout: "Proceed to Checkout",
  yourCartIsEmpty: "Your cart is empty",
  startShopping: "Start Shopping",
  orderSummary: "Order Summary",
  subtotal: "Subtotal",
  total: "Total",
  placeOrder: "Place Order",
  name: "Full Name",
  phone: "Phone Number",
  address: "Delivery Address",
  notes: "Notes (optional)",
  orderConfirmed: "Order Confirmed!",
  orderConfirmedDesc: "We'll be in touch with you soon.",
  continueShopping: "Continue Shopping",
  miniCartTitle: "Added to Cart",
  remove: "Remove",
  shopNow: "SHOP NOW",
  totalPrice: "Total Price",
  quantity: "Qty",
  allProducts: "All Products",
  apply: "Apply",
};

const ar: Translations = {
  home: "الرئيسية",
  shop: "تسوق",
  cart: "السلة",
  addToCart: "أضف إلى السلة",
  soldOut: "نفد المخزون",
  selectSize: "اختر المقاس",
  selectColor: "اختر اللون",
  inStock: "متوفر",
  outOfStock: "غير متوفر",
  onlyFewLeft: "كميات محدودة",
  featured: "مميز",
  viewAll: "عرض الكل",
  searchProducts: "ابحث عن منتجات...",
  filters: "تصفية",
  priceRange: "نطاق السعر",
  minPrice: "أدنى سعر",
  maxPrice: "أعلى سعر",
  size: "المقاس",
  color: "اللون",
  clearFilters: "مسح الفلاتر",
  noProductsFound: "لا توجد منتجات",
  products: "منتجات",
  proceedToCheckout: "متابعة الشراء",
  yourCartIsEmpty: "سلتك فارغة",
  startShopping: "ابدأ التسوق",
  orderSummary: "ملخص الطلب",
  subtotal: "المجموع الفرعي",
  total: "الإجمالي",
  placeOrder: "تأكيد الطلب",
  name: "الاسم الكامل",
  phone: "رقم الهاتف",
  address: "عنوان التوصيل",
  notes: "ملاحظات (اختياري)",
  orderConfirmed: "تم تأكيد الطلب!",
  orderConfirmedDesc: "سنتواصل معك قريباً.",
  continueShopping: "مواصلة التسوق",
  miniCartTitle: "تمت الإضافة",
  remove: "حذف",
  shopNow: "تسوق الآن",
  totalPrice: "السعر الإجمالي",
  quantity: "الكمية",
  allProducts: "جميع المنتجات",
  apply: "تطبيق",
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ar");
  const isRTL = language === "ar";
  const t = language === "ar" ? ar : en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
