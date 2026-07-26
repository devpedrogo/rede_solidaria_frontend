type Variant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary';

const variants: Record<Variant, string> = {
  success: 'bg-primary-100 text-primary-700 border-primary-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-accent-100 text-accent-700 border-accent-200',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  primary: 'bg-primary-600 text-white border-primary-700',
};

export default function Badge({
  children,
  variant = 'neutral',
  className = '',
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
