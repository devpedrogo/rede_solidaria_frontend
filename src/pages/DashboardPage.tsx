import { useEffect, useState } from 'react';
import { Users, HeartHandshake, Gift, ClipboardList, TrendingUp, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { doadoresService, beneficiariosService, doacoesService, solicitacoesService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { FullSpinner } from '@/components/ui/Spinner';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
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
      doacoesService.list({ size: 100 }),
      solicitacoesService.list(),
    ])
      .then(([d, b, doa, s]) => {
        const listDoadores = Array.isArray(d) ? d : (d as any)?.content ?? [];
        const listBeneficiarios = Array.isArray(b) ? b : (b as any)?.content ?? [];
        const listDoacoes = Array.isArray(doa) ? doa : (doa as any)?.content ?? [];
        const listSolicitacoes = Array.isArray(s) ? s : (s as any)?.content ?? [];

        setDoadores(listDoadores);
        setBeneficiarios(listBeneficiarios);
        setDoacoes(listDoacoes);
        setSolicitacoes(listSolicitacoes);
      })
      .catch((err) => {
        console.error("Erro ao carregar dados do Dashboard:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullSpinner label="Carregando métricas..." />;

  // Métricas calculadas a partir das Solicitações
  const concluidas = solicitacoes.filter((s) => s.status === 'CONCLUIDA').length;
  const pendentesEEmAndamento = solicitacoes.filter((s) => s.status === 'PENDENTE' || s.status === 'APROVADA').length;
  const rejeitadas = solicitacoes.filter((s) => s.status === 'REJEITADA').length;

  const metrics: Metric[] = [
    { 
      label: 'Doadores Ativos', 
      value: doadores.filter((d) => d.status === 'ATIVO').length, 
      icon: Users, 
      color: 'text-accent-600', 
      bg: 'bg-accent-50' 
    },
    { 
      label: 'Beneficiários Ativos', 
      value: beneficiarios.filter((b) => (b as any).status === 'ATIVO' || b.ativo === true).length, 
      icon: HeartHandshake, 
      color: 'text-primary-600', 
      bg: 'bg-primary-50' 
    },
    { 
      label: 'Doações Registradas', 
      value: doacoes.length, 
      icon: Gift, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50' 
    },
    { 
      label: 'Solicitações Pendentes', 
      value: solicitacoes.filter((s) => s.status === 'PENDENTE').length, 
      icon: ClipboardList, 
      color: 'text-red-600', 
      bg: 'bg-red-50' 
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Visão geral das atividades da Rede Solidária${user?.role === 'ROLE_ADMIN' ? ' (Acesso Total)' : ''}.`}
      />

      {/* Grid de Métricas Principais */}
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
        {/* Status das Solicitações */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold text-gray-900">Status das Solicitações</h3>
            </div>
            <div className="space-y-4">
              <StatusRow 
                icon={CheckCircle2} 
                label="Concluídas" 
                value={concluidas} 
                total={solicitacoes.length} 
                color="bg-emerald-500" 
              />
              <StatusRow 
                icon={Clock} 
                label="Pendentes / Em Análise" 
                value={pendentesEEmAndamento} 
                total={solicitacoes.length} 
                color="bg-amber-500" 
              />
              <StatusRow 
                icon={XCircle} 
                label="Rejeitadas" 
                value={rejeitadas} 
                total={solicitacoes.length} 
                color="bg-red-500" 
              />
            </div>
          </div>
        </div>

        {/* Lista de Solicitações Recentes */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertCircle className="w-5 h-5 text-accent-600" />
            <h3 className="font-semibold text-gray-900">Solicitações Recentes</h3>
          </div>

          {solicitacoes.length === 0 ? (
            <EmptyState message="Nenhuma solicitação registrada até o momento." />
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {solicitacoes.slice(0, 5).map((s, idx) => (
                <div 
                  key={s.id ?? `dash-solic-${idx}`} 
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {s.nomeBeneficiario ?? (s as any).beneficiarioNome ?? 'Beneficiário não informado'}
                    </p>
                    <p className="text-xs text-gray-500 truncate" title={s.justificativa}>
                      Item: <span className="font-medium text-gray-700">{s.nomeItem ?? 'Item'}</span> ({s.quantidade ?? 1} un.) - {s.justificativa}
                    </p>
                  </div>
                  <SolicitacaoStatusBadge status={s.status} />
                </div>
              ))}
            </div>
          )}
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
        <div className={`h-full ${color} rounded-full transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SolicitacaoStatusBadge({ status }: { status: Solicitacao['status'] }) {
  const map: Record<string, { v: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'primary'; l: string }> = {
    PENDENTE: { v: 'warning', l: 'Pendente' },
    APROVADA: { v: 'primary', l: 'Aprovada' },
    REJEITADA: { v: 'error', l: 'Rejeitada' },
    CONCLUIDA: { v: 'success', l: 'Concluída' },
    EM_ANALISE: { v: 'info', l: 'Em Análise' },
  };

  const safeKey = status ? String(status).toUpperCase() : 'PENDENTE';
  const c = map[safeKey] || { v: 'neutral', l: status || 'Indefinido' };

  return <Badge variant={c.v}>{c.l}</Badge>;
}