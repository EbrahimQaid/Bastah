import React from "react";

interface BastahLogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: "light" | "dark" | "gradient";
}

export default function BastahLogo({
  className = "",
  iconOnly = false,
  variant = "gradient",
}: BastahLogoProps) {
  // Styles based on variant
  const iconBgClass =
    variant === "light"
      ? "bg-white text-purple-600"
      : variant === "dark"
      ? "bg-gray-900 text-white"
      : "bg-gradient-to-br from-violet-600 to-emerald-600 text-white shadow-md shadow-purple-500/10";

  const textClass =
    variant === "light"
      ? "text-white"
      : "text-gray-900";

  return (
    <div className={`flex items-center gap-3 ${className}`} dir="rtl">
      {/* Premium Logo Icon: Combining the letter "ب" with a modern shop facade awning */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl relative overflow-hidden transition-all duration-300 hover:scale-105 ${iconBgClass}`}>
        {/* Abstract shop canopy lines */}
        <div className="absolute top-0 inset-x-0 h-1 bg-white/20" />
        
        {/* Arabic Letter "ب" styled nicely */}
        <span style={{ fontFamily: "Cairo, Tajawal, sans-serif" }} className="translate-y-[-1px]">
          ب
        </span>
        
        {/* The dot of the "ب" stylized as a small star/dot below */}
        <div className="absolute bottom-2.5 w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
      </div>

      {!iconOnly && (
        <div className="flex flex-col items-start leading-none">
          <span
            className={`text-xl font-black tracking-tight ${textClass}`}
            style={{ fontFamily: "Tajawal, sans-serif" }}
          >
            بَسطة
          </span>
          <span className="text-[9px] text-gray-400 font-medium tracking-wider mt-0.5">
            منصة المتاجر المتكاملة
          </span>
        </div>
      )}
    </div>
  );
}
