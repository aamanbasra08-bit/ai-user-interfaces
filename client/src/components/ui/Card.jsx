import { clsx } from 'clsx';

export const Card = ({ children, className, hover = false, glow = false, ...props }) => {
  return (
    <div
      className={clsx(
        'glass-card p-6',
        hover && 'hover-lift hover:border-crypto-lime/30 transition-all duration-300',
        glow && 'pulse-glow',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className }) => {
  return (
    <div className={clsx('mb-4', className)}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className }) => {
  return (
    <h3 className={clsx('text-xl font-bold text-crypto-lime', className)}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className }) => {
  return (
    <p className={clsx('text-sm text-gray-400 mt-1', className)}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className }) => {
  return (
    <div className={clsx('', className)}>
      {children}
    </div>
  );
};

