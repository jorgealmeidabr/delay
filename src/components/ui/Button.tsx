import React from "react"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', fullWidth = false, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-radar-green)] focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:opacity-50 disabled:pointer-events-none"
    
    const variants = {
      primary: "bg-[var(--color-radar-green)] text-black hover:bg-[var(--color-radar-green-hover)] font-bold",
      secondary: "bg-[var(--color-alert-yellow)] text-black hover:bg-[#E6C200] font-bold",
      outline: "border border-[var(--color-radar-green)] text-[var(--color-radar-green)] hover:bg-[var(--color-radar-green)] hover:text-black",
      ghost: "text-gray-300 hover:text-white hover:bg-white/10"
    }

    const sizes = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-4 py-2",
      lg: "h-14 px-8 text-lg"
    }

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`

    return (
      <button ref={ref} className={classes} {...props} />
    )
  }
)
Button.displayName = "Button"
