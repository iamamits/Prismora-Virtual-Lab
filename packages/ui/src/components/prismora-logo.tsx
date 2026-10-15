import { cn } from '../lib/utils';

export interface PrismoraLogoProps {
  variant?: 'full' | 'icon' | 'minimal';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export function PrismoraIcon({
  className,
  size = 36,
  minimal = false,
}: {
  className?: string;
  size?: number;
  minimal?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none', className)}
      aria-label="Prismora Prism"
    >
      {!minimal && (
        <>
          {/* Back Orbital Arc (Cyan #06B6D4) */}
          <path
            d="M 46 80 C 14 96 6 124 30 138 C 44 146 68 144 88 136"
            stroke="#06B6D4"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle cx="48" cy="98" r="4.5" fill="#06B6D4" />
          <circle cx="68" cy="85" r="3" fill="#06B6D4" />
        </>
      )}

      {/* Faceted Geometric Dispersion Prism (Letter A) */}
      {/* Apex Top Left (Electric Blue #2563EB) */}
      <polygon points="100,16 78,64 100,72" fill="#2563EB" />
      {/* Apex Top Right (Cyan #06B6D4) */}
      <polygon points="100,16 100,72 124,58" fill="#06B6D4" />
      {/* Apex Outer Top Right (Amber #FBBF24) */}
      <polygon points="100,16 124,58 142,88" fill="#FBBF24" />

      {/* Left Arm Upper (Violet #8B5CF6) */}
      <polygon points="78,64 100,72 84,104" fill="#8B5CF6" />
      <polygon points="78,64 84,104 52,106" fill="#8B5CF6" />

      {/* Left Arm Lower (Coral #F43F5E & Pink #EC4899) */}
      <polygon points="52,106 84,104 66,126" fill="#F43F5E" />
      <polygon points="52,106 66,126 44,144" fill="#F43F5E" />
      <polygon points="24,154 52,106 44,144" fill="#F43F5E" />
      <polygon points="24,154 44,144 64,154" fill="#EC4899" />

      {/* Bottom Crossbar (Pink #EC4899, Green #22C55E, Cyan #06B6D4) */}
      <polygon points="44,144 66,126 92,138" fill="#EC4899" />
      <polygon points="44,144 92,138 64,154" fill="#EC4899" />
      <polygon points="64,154 92,138 116,154" fill="#22C55E" />
      <polygon points="92,138 134,126 116,154" fill="#22C55E" />
      <polygon points="116,154 134,126 148,154" fill="#06B6D4" />

      {/* Right Arm (Violet #8B5CF6, Coral #F43F5E, Pink #EC4899, Electric Blue #2563EB) */}
      <polygon points="100,72 124,58 134,126" fill="#8B5CF6" />
      <polygon points="124,58 142,88 158,124" fill="#F43F5E" />
      <polygon points="124,58 158,124 134,126" fill="#EC4899" />
      <polygon points="134,126 158,124 148,154" fill="#2563EB" />
      <polygon points="158,124 176,154 148,154" fill="#2563EB" />

      {/* Center 4-Pointed Sparkle Star (Cyan #06B6D4) */}
      <path
        d="M 100 84 Q 100 99 85 99 Q 100 99 100 114 Q 100 99 115 99 Q 100 99 100 84 Z"
        fill="#06B6D4"
      />

      {!minimal && (
        <>
          {/* Front Orbital Arc (Pink #EC4899) */}
          <path
            d="M 112 130 C 144 126 172 112 178 94 C 182 80 170 70 148 70 C 138 70 128 74 120 80"
            stroke="#EC4899"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Top Satellite Planet (Pink #EC4899) */}
          <circle cx="156" cy="48" r="6" fill="#EC4899" />
          {/* Front Right Satellite Planet (Amber #FBBF24) */}
          <circle cx="166" cy="102" r="9" fill="#FBBF24" />
        </>
      )}
    </svg>
  );
}

export function PrismoraLogo({
  variant = 'full',
  size = 'md',
  className,
  theme = 'auto',
}: PrismoraLogoProps) {
  const pixelSizes = {
    sm: 26,
    md: 34,
    lg: 44,
    xl: 56,
  };

  const textSizes = {
    sm: 'text-base tracking-wider',
    md: 'text-xl tracking-wider',
    lg: 'text-2xl tracking-wider',
    xl: 'text-3xl tracking-wider',
  };

  const currentSize = pixelSizes[size];

  if (variant === 'icon') {
    return <PrismoraIcon size={currentSize} className={className} />;
  }

  if (variant === 'minimal') {
    return <PrismoraIcon size={currentSize} minimal className={className} />;
  }

  const textColor =
    theme === 'light'
      ? 'text-[#172033]'
      : theme === 'dark'
      ? 'text-white'
      : 'text-[#172033] dark:text-white';

  return (
    <div className={cn('inline-flex items-center gap-2.5 font-bold select-none', className)}>
      <PrismoraIcon size={currentSize} />
      <div className="flex items-baseline">
        <span
          className={cn(
            'font-black font-sans uppercase font-stretch-expanded',
            textSizes[size],
            textColor,
          )}
        >
          PRISMOR
        </span>
        {/* Stylized A with sparkle accent */}
        <span
          className={cn(
            'font-black font-sans uppercase relative inline-block',
            textSizes[size],
            textColor,
          )}
        >
          A
          <span className="absolute -bottom-0.5 right-0 text-[#06B6D4] text-[0.6em] font-mono leading-none">
            ✦
          </span>
        </span>
      </div>
    </div>
  );
}
