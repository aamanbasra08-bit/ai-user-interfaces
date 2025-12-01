import { clsx } from 'clsx';

export const Button = ({ 
  children, 
  variant = 'default', 
  size = 'default',
  className,
  disabled,
  ...props 
}) => {
  const variants = {
    default: 'bg-crypto-lime text-black hover:bg-crypto-lime-dark',
    outline: 'border border-crypto-lime/50 text-crypto-lime hover:bg-crypto-lime/10',
    ghost: 'text-crypto-lime hover:bg-crypto-lime/10',
    destructive: 'bg-crypto-red text-white hover:bg-crypto-red/80',
    secondary: 'bg-crypto-bg-secondary text-gray-300 hover:bg-crypto-bg-card',
  };

  const sizes = {
    default: 'px-4 py-2',
    sm: 'px-3 py-1 text-sm',
    lg: 'px-6 py-3 text-lg',
    icon: 'p-2',
  };

  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-crypto-lime/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export const ButtonGroup = ({ children, className }) => {
  return (
    <div className={clsx('flex gap-2', className)}>
      {children}
    </div>
  );
};

