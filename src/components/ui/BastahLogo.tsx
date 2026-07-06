import React from "react";

interface BastahLogoProps {
  className?: string;
  iconOnly?: boolean;
  variant?: "light" | "dark" | "gradient";
  size?: "sm" | "md" | "lg";
}

/**
 * BastahLogo — matches the official brand identity:
 *  - Red (#E8232A) as primary brand color
 *  - "b" letter where the bowl of the "b" is a speech/chat bubble
 *  - Name: "Bastah" in Poppins
 *  - Tagline: "منصة بسيطة، أثر كبير" in Tajawal
 */
export default function BastahLogo({
  className = "",
  iconOnly = false,
  variant = "gradient",
  size = "md",
}: BastahLogoProps) {
  const sizeMap = {
    sm: { px: 30, nameSize: "text-base", subSize: "text-[8px]", gap: "gap-2" },
    md: { px: 40, nameSize: "text-xl", subSize: "text-[9px]", gap: "gap-2.5" },
    lg: { px: 52, nameSize: "text-2xl", subSize: "text-[11px]", gap: "gap-3" },
  };
  const s = sizeMap[size];

  // The icon is always red on a white/transparent bg, or white on red bg
  const iconFill = variant === "light" ? "#E8232A" : variant === "dark" ? "#E8232A" : "#FFFFFF";
  const iconBg = variant === "gradient" ? "#E8232A" : "transparent";
  const showBg = variant === "gradient";

  const textColor =
    variant === "light"
      ? "text-white"
      : variant === "dark"
      ? "text-[#1a1a1a]"
      : "text-[#E8232A]";

  const subColor =
    variant === "light"
      ? "text-white/55"
      : variant === "dark"
      ? "text-gray-500"
      : "text-gray-400";

  // SVG: The iconic "b" shape where the counter/bowl is a speech bubble
  // The speech bubble has a small tail at bottom-left
  const px = s.px;
  const viewBox = 100;

  return (
    <div className={`flex items-center ${s.gap} ${className}`} dir="ltr">
      <svg
        width={px}
        height={px}
        viewBox={`0 0 ${viewBox} ${viewBox}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Background rounded rect (only for gradient/icon variant) */}
        {showBg && (
          <rect width="100" height="100" rx="24" fill={iconBg} />
        )}

        {/*
          The "b" shape:
          - A tall vertical stem on the left (rounded at top, squared at bottom where it connects)
          - A speech bubble forming the round "bowl" of the "b"
          - The speech bubble tail points down-left from the bottom of the bowl
        */}

        {/* === Vertical stem of the "b" === */}
        {/* Top rounded cap */}
        <rect
          x={showBg ? "18" : "8"}
          y={showBg ? "10" : "5"}
          width="19"
          height="80"
          rx="9.5"
          fill={iconFill}
        />

        {/* === Speech bubble bowl === */}
        {/*
          A circle for the main bowl body.
          Center around x=62, y=58 with radius ~24
          The stem connects to it at around x=37, y=48..68
        */}
        <circle
          cx={showBg ? "62" : "62"}
          cy="57"
          r={showBg ? "26" : "27"}
          fill={iconFill}
        />

        {/*
          The speech bubble tail:
          A small triangle/curve pointing down from the bottom of the bowl,
          curving slightly to the left (towards the stem side)
        */}
        <path
          d={
            showBg
              ? "M 48 74 Q 36 85 34 92 Q 48 84 62 78"
              : "M 40 75 Q 28 86 26 93 Q 40 84 54 79"
          }
          fill={iconFill}
        />

        {/*
          Negative space inside the speech bubble = the hollow ring
          This creates the characteristic round hole in the "b" bowl
          It's offset slightly down-right to mimic the speech bubble look
        */}
        <circle
          cx={showBg ? "62" : "62"}
          cy="57"
          r={showBg ? "13" : "14"}
          fill={showBg ? "#E8232A" : (variant === "light" ? "#0d0d0d" : variant === "dark" ? "#ffffff" : "#E8232A")}
        />

        {/*
          The speech bubble "notch" at the bottom — a small white teardrop
          that completes the chat-bubble look inside the hollow
        */}
        {showBg && (
          <path
            d="M 55 68 Q 49 76 46 80 Q 53 74 62 70"
            fill="#E8232A"
          />
        )}
      </svg>

      {!iconOnly && (
        <div className="flex flex-col items-start leading-none">
          <span
            className={`font-black tracking-tight ${s.nameSize} ${textColor}`}
            style={{
              fontFamily: "'Poppins', 'Inter', sans-serif",
              letterSpacing: "-0.03em",
            }}
          >
            Bastah
          </span>
          <span
            className={`font-medium mt-0.5 ${s.subSize} ${subColor}`}
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            منصة بسيطة، أثر كبير
          </span>
        </div>
      )}
    </div>
  );
}
