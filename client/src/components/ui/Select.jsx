import { clsx } from 'clsx';
import { ChevronDown } from 'lucide-react';

export const Select = ({ className, options = [], placeholder = 'Select...', ...props }) => {
  return (
    <div className="relative">
      <select
        className={clsx(
          'w-full px-4 py-2 pr-10 rounded-lg appearance-none cursor-pointer',
          'bg-crypto-bg-secondary border border-crypto-lime/20',
          'text-gray-100',
          'focus:outline-none focus:border-crypto-lime/50 focus:ring-1 focus:ring-crypto-lime/30',
          'transition-all duration-200',
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
};

