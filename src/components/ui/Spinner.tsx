import { Loader2 } from 'lucide-react';

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`w-5 h-5 animate-spin ${className}`} />;
}

export function FullSpinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500">
      <Spinner className="w-8 h-8 text-primary-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

export function TableSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <Spinner className="w-7 h-7 text-primary-500" />
        <p className="text-sm">Carregando dados...</p>
      </div>
    </div>
  );
}
