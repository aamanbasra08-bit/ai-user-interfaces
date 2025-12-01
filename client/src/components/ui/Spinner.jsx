import { clsx } from 'clsx';

export const Spinner = ({ size = 'default', className }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    default: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={clsx(
        'animate-spin rounded-full',
        'border-crypto-bg-secondary border-t-crypto-lime',
        sizes[size],
        className
      )}
    />
  );
};

export const LoadingOverlay = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-crypto-bg/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-crypto-lime text-lg font-medium animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export const LoadingCard = ({ message = 'Loading data...' }) => {
  return (
    <div className="glass-card p-12 flex flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="text-gray-400 mt-4">{message}</p>
    </div>
  );
};

