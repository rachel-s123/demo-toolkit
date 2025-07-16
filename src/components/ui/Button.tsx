import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'filter' | 'action';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  isActive?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  isActive = false,
  children,
  className,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50';
  
  const variantStyles = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300',
    outline: 'border border-secondary-300 text-secondary-900 hover:bg-secondary-50 active:bg-secondary-100',
    ghost: 'text-secondary-900 hover:bg-secondary-50 active:bg-secondary-100',
    filter: clsx(
      'border border-secondary-200 bg-white text-secondary-900',
      'hover:bg-secondary-50 active:bg-secondary-100',
      isActive && 'border-primary-500 bg-primary-50 text-primary-700'
    ),
    action: clsx(
      'border border-secondary-200 bg-white text-secondary-900',
      'hover:bg-secondary-50 active:bg-secondary-100',
      'flex flex-col items-center gap-2 p-4',
      isActive && 'border-primary-500 bg-primary-50 text-primary-700'
    ),
  };
  
  const sizeStyles = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        variant !== 'action' && sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className={clsx('mr-2', variant === 'action' && 'mb-1')}>{icon}</span>}
      {children}
    </motion.button>
  );
};

export default Button;