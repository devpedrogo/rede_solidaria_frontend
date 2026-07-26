import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, HeartHandshake, Gift, ClipboardList,
  UserCog, ShieldCheck, X, Heart,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/types';

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ROLE_OPERADOR', 'ROLE_ADMIN'] },
  { to: '/doadores', label: 'Doadores', icon: Users, roles: ['ROLE_OPERADOR', 'ROLE_ADMIN'] },
  { to: '/beneficiarios', label: 'Beneficiários', icon: HeartHandshake, roles: ['ROLE_OPERADOR', 'ROLE_ADMIN'] },
  { to: '/doacoes', label: 'Doações', icon: Gift, roles: ['ROLE_OPERADOR', 'ROLE_ADMIN'] },
  { to: '/solicitacoes', label: 'Solicitações', icon: ClipboardList, roles: ['ROLE_OPERADOR', 'ROLE_ADMIN'] },
  { to: '/operadores', label: 'Operadores', icon: UserCog, roles: ['ROLE_ADMIN'] },
  { to: '/admins', label: 'Administradores', icon: ShieldCheck, roles: ['ROLE_ADMIN'] },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth();
  if (!user) return null;

  const items = navItems.filter((i) => i.roles.includes(user.role));

  return (
    <>
      {/* Overlay mobile */}
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <p className="font-bold text-gray-900 leading-tight">Rede Solidária</p>
              <p className="text-[11px] text-gray-400 leading-tight">Plataforma Social</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Menu</p>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 p-3.5">
            <p className="text-xs font-semibold text-gray-700">Modo Demonstração</p>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
              Dados simulados quando o backend está offline.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
