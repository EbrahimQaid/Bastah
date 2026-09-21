import React from "react";

export interface DukkaniLogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: "crimson" | "light" | "dark" | "white" | "monochrome" | "emerald";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  tagline?: string;
  layout?: "horizontal" | "vertical";
  language?: "ar" | "en" | "both";
}

/**
 * DukkaniLogo (شعار منصة دكاني - مستوحى من هوية جيب العالمية #E4122C)
 * 
 * معايير الهوية:
 * 1. اللون القرمزي الناري (#E4122C): لون جيب الصريح الذي يمنح طاقة وحيوية وثقة رقمية فورية.
 * 2. الأيقونة الأيقونية (Pure Minimalist Bag): حقيبة تسوق هندسية بروح رقمية، مع فتحة جيب مقوسة مبتسمة.
 * 3. التايبوجرافي النقي: خط عربي هندسي عريض وقوي بدون أي تشكيل مدرسي، مع استقرار واتزان تام.
 */
export default function DukkaniLogo({
  className = "",
  iconOnly = false,
  variant = "crimson",
  size = "md",
  showTagline = true,
  tagline,
  layout = "horizontal",
  language = "ar",
}: DukkaniLogoProps) {
  const sizeConfig = {
    xs: { px: 28, nameSize: "text-base", subSize: "text-[9px]", gap: "gap-2" },
    sm: { px: 36, nameSize: "text-lg", subSize: "text-[10px]", gap: "gap-2.5" },
    md: { px: 44, nameSize: "text-2xl", subSize: "text-[11px]", gap: "gap-3" },
    lg: { px: 56, nameSize: "text-3xl", subSize: "text-xs", gap: "gap-3.5" },
    xl: { px: 76, nameSize: "text-4xl", subSize: "text-sm", gap: "gap-4" },
  };

  const s = sizeConfig[size] || sizeConfig.md;
  const isLight = variant === "light" || variant === "white";

  const textColor = isLight ? "text-white" : "text-slate-900";
  const subColor = isLight ? "text-rose-100/90" : "text-slate-500";

  const defaultTagline =
    language === "en"
      ? "Your digital store in your hands"
      : "دكانك الرقمي بين يديك";
  const displayTagline = tagline || defaultTagline;

  const idSuffix = React.useId().replace(/:/g, "");

  return (
    <div
      className={`inline-flex ${
        layout === "vertical" ? "flex-col items-center text-center" : "items-center"
      } ${s.gap} ${className} select-none`}
      dir={language === "en" ? "ltr" : "rtl"}
    >
      {/* ── Icon Mark (Crimson Red #E4122C & Pure White) ── */}
      <svg
        width={s.px}
        height={s.px}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105 filter drop-shadow-sm"
      >
        <defs>
          {/* Official Jaib Crimson Red Gradient */}
          <linearGradient id={`crimsonGrad_${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FA1E38" />
            <stop offset="100%" stopColor="#CC0A22" />
          </linearGradient>

          {/* Clean Soft Ambient Glow */}
          <filter id={`softGlow_${idSuffix}`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#990014" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* 1. Squircle App Icon Base */}
        <rect
          width="100"
          height="100"
          rx="26"
          fill={isLight ? "#FFFFFF" : `url(#crimsonGrad_${idSuffix})`}
        />

        {/* 2. Shopping Bag Handle (Bold curved loop) */}
        <path
          d="M 37 32 C 37 19, 63 19, 63 32"
          stroke={isLight ? "#E4122C" : "#FFFFFF"}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />

        {/* 3. Solid Sleek Bag Body */}
        <path
          d="M 27 35 L 73 35 C 75.8 35, 77.6 37.4, 77.1 40.1 L 71.8 72.8 C 71.2 76.9, 67.6 80, 63.4 80 L 36.6 80 C 32.4 80, 28.8 76.9, 28.2 72.8 L 22.9 40.1 C 22.4 37.4, 24.2 35, 27 35 Z"
          fill={isLight ? "#E4122C" : "#FFFFFF"}
          filter={`url(#softGlow_${idSuffix})`}
        />

        {/* 4. The Smiling Pocket Arc (قوس الجيب المبتسم المنحوت في قلب الدكان) */}
        <path
          d="M 39 49 C 39 60, 61 60, 61 49"
          stroke={isLight ? "#FFFFFF" : "#E4122C"}
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* 5. Minimalist Dot / Coin Point */}
        <circle
          cx="62"
          cy="42"
          r="3.5"
          fill={isLight ? "#FFFFFF" : "#E4122C"}
        />
      </svg>

      {/* ── Wordmark Typography ── */}
      {!iconOnly && (
        <div
          className={`flex flex-col ${
            layout === "vertical" ? "items-center" : "items-start"
          } leading-tight`}
        >
          <div className="flex items-center gap-1.5">
            {/* Clean Arabic Name without diacritics */}
            <span
              className={`font-black tracking-tight ${s.nameSize} ${textColor}`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Alexandria', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              دكاني
            </span>

            {/* Crimson Red Brand Dot */}
            <span
              className="w-2 h-2 rounded-full self-baseline mb-1.5 ml-0.5"
              style={{ backgroundColor: isLight ? "#FFFFFF" : "#E4122C" }}
            />

            {/* Subtle English Brand Tag */}
            {language === "both" && (
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono mr-1">
                DUKKANI
              </span>
            )}
          </div>

          {/* Slogan */}
          {showTagline && (
            <span
              className={`font-medium ${s.subSize} ${subColor} tracking-tight mt-0.5`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Alexandria', sans-serif",
              }}
            >
              {displayTagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
