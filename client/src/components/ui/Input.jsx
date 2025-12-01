import { clsx } from 'clsx';

export const Input = ({ className, error, ...props }) => {
  return (
    <input
      className={clsx(
        'w-full px-4 py-2 rounded-lg',
        'bg-crypto-bg-secondary border border-crypto-lime/20',
        'text-gray-100 placeholder-gray-500',
        'focus:outline-none focus:border-crypto-lime/50 focus:ring-1 focus:ring-crypto-lime/30',
        'transition-all duration-200',
        error && 'border-crypto-red/50 focus:border-crypto-red focus:ring-crypto-red/30',
        className
      )}
      {...props}
    />
  );
};

export const Label = ({ children, htmlFor, required, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={clsx('block text-sm font-medium text-gray-300 mb-2', className)}
    >
      {children}
      {required && <span className="text-crypto-red ml-1">*</span>}
    </label>
  );
};

export const TextArea = ({ className, error, ...props }) => {
  return (
    <textarea
      className={clsx(
        'w-full px-4 py-2 rounded-lg resize-none',
        'bg-crypto-bg-secondary border border-crypto-lime/20',
        'text-gray-100 placeholder-gray-500',
        'focus:outline-none focus:border-crypto-lime/50 focus:ring-1 focus:ring-crypto-lime/30',
        'transition-all duration-200',
        error && 'border-crypto-red/50 focus:border-crypto-red focus:ring-crypto-red/30',
        className
      )}
      {...props}
    />
  );
};

