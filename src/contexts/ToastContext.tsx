import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
  warning: (m: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles: Record<ToastType, string> = {
  success: 'bg-primary-50 border-primary-500 text-primary-800',
  error: 'bg-red-50 border-red-500 text-red-800',
  info: 'bg-accent-50 border-accent-500 text-accent-800',
  warning: 'bg-amber-50 border-amber-500 text-amber-800',
};

const iconColor: Record<ToastType, string> = {
  success: 'text-primary-600',
  error: 'text-red-600',
  info: 'text-accent-600',
  warning: 'text-amber-600',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => remove(id), 4500);
  }, [remove]);

  const value: ToastContextValue = {
    toast,
    success: (m) => toast(m, 'success'),
    error: (m) => toast(m, 'error'),
    info: (m) => toast(m, 'info'),
    warning: (m) => toast(m, 'warning'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div
              key={t.id}
              className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-up ${styles[t.type]}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor[t.type]}`} />
              <p className="flex-1 text-sm font-medium leading-snug">{t.message}</p>
              <button onClick={() => remove(t.id)} className="opacity-50 hover:opacity-100 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}
