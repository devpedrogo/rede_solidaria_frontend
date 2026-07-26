import { useEffect, useState } from 'react';
import { Users, HeartHandshake, Gift, ClipboardList, TrendingUp, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { doadoresService, beneficiariosService, doacoesService, solicitacoesService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { FullSpinner } from '@/components/ui/Spinner';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import type { Beneficiario, Doacao, Doador, Solicitacao } from '@/types';

interface Metric {
  label: string;
  value: number;
  icon: typeof Users;
  color: string;
  bg: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [doadores, setDoadores] = useState<Doador[]>([]);
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);

  useEffect(() => {
    Promise.all([
      doadoresService.list(),
      beneficiariosService.list(),
      doacoesService.list(),
      solicitacoesService.list(),
    ])
      .then(([d, b, doa, s]) => {
        setDoadores(d);
        setBeneficiarios(b);
        setDoacoes(doa);
        setSolicitacoes(s);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullSpinner label="Carregando métricas..." />;

  const pendentes = solicitacoes.filter((s) => s.status === 'PENDENTE' || s.status === 'EM_ANALISE').length;
  const entregues = doacoes.filter((d) => d.status === 'ENTREGUE').length;

  const metrics: Metric[] = [
    { label: 'Doadores', value: doadores.filter((d) => d.ativo).length, icon: Users, color: 'text-accent-600', bg: 'bg-accent-50' },
    { label: 'Beneficiários', value: beneficiarios.filter((b) => b.ativo).length, icon: HeartHandshake, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Doações', value: doacoes.length, icon: Gift, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Solicitações Pendentes', value: pendentes, icon: ClipboardList, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Visão geral das atividades da Rede Solidária${user?.role === 'ROLE_ADMIN' ? ' (Acesso total)' : ''}.`}
      />

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">{m.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{m.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${m.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status das doações */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Status das Doações</h3>
          </div>
          <div className="space-y-4">
            <StatusRow icon={CheckCircle2} label="Entregues" value={entregues} total={doacoes.length} color="bg-primary-500" />
            <StatusRow icon={Clock} label="Pendentes" value={doacoes.length - entregues} total={doacoes.length} color="bg-amber-500" />
          </div>
        </div>

        {/* Solicitações recentes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertCircle className="w-5 h-5 text-accent-600" />
            <h3 className="font-semibold text-gray-900">Solicitações Recentes</h3>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {solicitacoes.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.beneficiarioNome}</p>
                  <p className="text-xs text-gray-500 truncate">{s.descricao}</p>
                </div>
                <SolicitacaoStatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ icon: Icon, label, value, total, color }: { icon: typeof Users; label: string; value: number; total: number; color: string }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-2 text-sm text-gray-600">
          <Icon className="w-4 h-4" /> {label}
        </span>
        <span className="text-sm font-semibold text-gray-900">{value} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SolicitacaoStatusBadge({ status }: { status: Solicitacao['status'] }) {
  const map: Record<Solicitacao['status'], { v: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary'; l: string }> = {
    PENDENTE: { v: 'warning', l: 'Pendente' },
    EM_ANALISE: { v: 'info', l: 'Em Análise' },
    APROVADA: { v: 'primary', l: 'Aprovada' },
    REJEITADA: { v: 'error', l: 'Rejeitada' },
    ATENDIDA: { v: 'success', l: 'Atendida' },
  };
  const c = map[status];
  return <Badge variant={c.v}>{c.l}</Badge>;
}
