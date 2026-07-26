import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
  secondary: 'bg-accent-600 hover:bg-accent-700 text-white shadow-sm',
  danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  outline: 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700',
};

export default function Button({ variant = 'primary', loading, children, className = '', disabled, ...rest }: Props) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  );
}
