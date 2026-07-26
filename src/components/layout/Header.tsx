import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  if (!user) return null;

  const roleLabel = user.role === 'ROLE_ADMIN' ? 'Administrador' : 'Operador';
  const initials = user.nome.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100">
        <Menu className="w-6 h-6" />
      </button>

      <div className="hidden lg:block">
        <p className="text-sm text-gray-500">Bem-vindo de volta,</p>
        <p className="text-sm font-semibold text-gray-900 -mt-0.5">{user.nome.split(' ')[0]}!</p>
      </div>

      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full hover:bg-gray-100 transition"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-semibold text-gray-900 leading-tight">{user.nome}</p>
            <p className="text-[11px] text-gray-500 leading-tight">{roleLabel}</p>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-400 transition ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 animate-fade-in">
            <div className="px-4 py-2.5 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">{user.nome}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" /> Sair da conta
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
