'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus-visible:ring-[#2563EB] shadow-sm',
        cyan:
          'bg-[#06B6D4] text-white hover:bg-[#0891B2] focus-visible:ring-[#06B6D4] shadow-sm',
        violet:
          'bg-[#8B5CF6] text-white hover:bg-[#7C3AED] focus-visible:ring-[#8B5CF6] shadow-sm',
        coral:
          'bg-[#F43F5E] text-white hover:bg-[#E11D48] focus-visible:ring-[#F43F5E] shadow-sm',
        pink:
          'bg-[#EC4899] text-white hover:bg-[#DB2777] focus-visible:ring-[#EC4899] shadow-sm',
        amber:
          'bg-[#FBBF24] text-[#172033] hover:bg-[#F59E0B] focus-visible:ring-[#FBBF24] shadow-sm font-bold',
        success:
          'bg-[#22C55E] text-white hover:bg-[#16A34A] focus-visible:ring-[#22C55E] shadow-sm',
        secondary:
          'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
        outline:
          'border border-zinc-300 dark:border-zinc-700 bg-transparent text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800',
        ghost:
          'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
        destructive:
          'bg-[#F43F5E] text-white hover:bg-[#E11D48]',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-5 text-base',
        icon: 'h-9 w-9',
        'icon-sm': 'h-7 w-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
