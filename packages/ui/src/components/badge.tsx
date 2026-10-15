'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#2563EB] text-white',
        secondary: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
        physics: 'bg-[#2563EB] text-white',
        chemistry: 'bg-[#FBBF24] text-[#172033]',
        biology: 'bg-[#22C55E] text-white',
        mathematics: 'bg-[#8B5CF6] text-white',
        astronomy: 'bg-[#06B6D4] text-white',
        engineering: 'bg-[#F43F5E] text-white',
        pink: 'bg-[#EC4899] text-white',
        outline: 'border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 bg-transparent',
        success: 'bg-[#22C55E] text-white',
        warning: 'bg-[#FBBF24] text-[#172033]',
        destructive: 'bg-[#F43F5E] text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
