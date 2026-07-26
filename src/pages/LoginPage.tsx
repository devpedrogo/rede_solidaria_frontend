import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !senha) {
      toast.warning('Preencha e-mail e senha.');
      return;
    }
    try {
      const user = await login(email, senha);
      toast.success(`Bem-vindo, ${user.nome.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch {
      toast.error('Credenciais inválidas. Tente novamente.');
    }
  };

  const quickLogin = (mail: string) => {
    setEmail(mail);
    setSenha('123456');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Painel esquerdo - branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-800 text-white relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-accent-400/20 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <Heart className="w-6 h-6" fill="white" />
            </div>
            <span className="text-xl font-bold">Rede Solidária</span>
          </div>

          <h1 className="text-4xl font-bold leading-tight mb-4">
            Conectando<br />solidariedade a<br />quem precisa.
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            Plataforma unificada para gestão de doadores, beneficiários, doações e solicitações em projetos sociais.
          </p>
        </div>

        <div className="relative grid grid-cols-3 gap-4 max-w-md">
          {[
            { n: '+1.2k', l: 'Doadores' },
            { n: '+800', l: 'Beneficiários' },
            { n: '+3.5k', l: 'Doações' },
          ].map((s) => (
            <div key={s.l} className="bg-white/10 backdrop-blur rounded-xl p-4">
              <p className="text-2xl font-bold">{s.n}</p>
              <p className="text-xs text-white/70 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito - formulário */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Rede Solidária</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900">Acessar plataforma</h2>
          <p className="text-sm text-gray-500 mt-1.5 mb-8">Entre com suas credenciais para continuar.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowSenha((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full py-3">
              Entrar <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-8 p-4 rounded-xl bg-white border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Acesso rápido (demo)</p>
            <div className="flex gap-2">
              <button
                onClick={() => quickLogin('operador@redesolidaria.org')}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-gray-50 hover:bg-primary-50 hover:text-primary-700 text-gray-600 border border-gray-200 transition font-medium"
              >
                Operador
              </button>
              <button
                onClick={() => quickLogin('admin@redesolidaria.org')}
                className="flex-1 text-xs px-3 py-2 rounded-lg bg-gray-50 hover:bg-accent-50 hover:text-accent-700 text-gray-600 border border-gray-200 transition font-medium"
              >
                Administrador
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">Senha demo: 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
