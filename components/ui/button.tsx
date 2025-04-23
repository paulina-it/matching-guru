import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[3px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary-hover dark:bg-primary-dark dark:text-white dark:hover:bg-primary-darkHover",
        outline:
          "border border-accent/50 text-accent bg-background shadow-sm hover:bg-accent hover:text-white dark:border-zinc-700 dark:text-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white",
        blueOutline:
          "border border-primary/50 text-primary bg-background shadow-sm hover:bg-primary hover:text-white dark:border-zinc-700 dark:text-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-white",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-zinc-800 dark:hover:text-white",
        link: "text-primary underline-offset-4 hover:underline dark:text-zinc-300 dark:hover:text-white",
        destructive:
          "border border-red-600 text-red-600 bg-transparent hover:bg-red-600 hover:text-white dark:border-red-500 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-[5px] px-3 text-xs",
        lg: "h-10 rounded-[5px] px-8",
        xl: "h-12 rounded-[5px] px-14 text-xl",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
