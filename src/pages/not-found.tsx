import { Link } from "wouter";
import { Store, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className="min-h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-zinc-950 p-6 text-center"
    >
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-neutral-400">
          <Store className="w-8 h-8 text-neutral-500" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold tracking-widest text-red-600 uppercase">
            خطأ 404
          </span>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            الصفحة المطلوبة غير متوفرة
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-zinc-400 leading-relaxed">
            ربما تم نقل الصفحة أو أن الرابط الذي قمت بفتحه لم يعد موجوداً. يمكنك العودة إلى المتجر ومتابعة التسوق.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/store" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm">
              <Store className="w-4 h-4" />
              <span>الرئيسية</span>
            </button>
          </Link>
          <Link href="/store/products" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-neutral-800 dark:text-zinc-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors">
              <ShoppingBag className="w-4 h-4" />
              <span>كتالوج المنتجات</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
