import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, ClipboardList, Pencil } from 'lucide-react';
import { solicitacoesService, beneficiariosService } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { TableSpinner } from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import type { Beneficiario, Solicitacao } from '@/types';

const statusVariant = { PENDENTE: 'warning', EM_ANALISE: 'info', APROVADA: 'primary', REJEITADA: 'error', ATENDIDA: 'success' } as const;
const statusLabel = { PENDENTE: 'Pendente', EM_ANALISE: 'Em Análise', APROVADA: 'Aprovada', REJEITADA: 'Rejeitada', ATENDIDA: 'Atendida' };
const urgenciaVariant = { BAIXA: 'neutral', MEDIA: 'info', ALTA: 'warning', CRITICA: 'error' } as const;
const urgenciaLabel = { BAIXA: 'Baixa', MEDIA: 'Média', ALTA: 'Alta', CRITICA: 'Crítica' };
const categoriaLabel = { ALIMENTOS: 'Alimentos', ROUPAS: 'Roupas', MEDICAMENTOS: 'Medicamentos', DINHEIRO: 'Dinheiro', OUTROS: 'Outros' };

const empty: Partial<Solicitacao> = { beneficiarioId: '', descricao: '', categoria: 'ALIMENTOS', quantidade: 1, urgencia: 'MEDIA' };

export default function SolicitacoesPage() {
  const toast = useToast();
  const [items, setItems] = useState<Solicitacao[]>([]);
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<Partial<Solicitacao>>(empty);
  const [saving, setSaving] = useState(false);

  const [statusModal, setStatusModal] = useState<Solicitacao | null>(null);
  const [newStatus, setNewStatus] = useState<Solicitacao['status']>('PENDENTE');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([solicitacoesService.list(), beneficiariosService.list()])
      .then(([s, b]) => { setItems(s); setBeneficiarios(b); })
      .catch(() => toast.error('Erro ao carregar solicitações.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    return items.filter((s) => {
      const ms = !search || s.beneficiarioNome.toLowerCase().includes(search.toLowerCase()) || s.descricao.toLowerCase().includes(search.toLowerCase());
      const mf = statusFilter === 'all' || s.status === statusFilter;
      return ms && mf;
    });
  }, [items, search, statusFilter]);

  const openCreate = () => { setForm(empty); setCreateOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.beneficiarioId || !form.descricao) { toast.warning('Preencha os campos obrigatórios.'); return; }
    setSaving(true);
    try {
      const benef = beneficiarios.find((b) => b.id === form.beneficiarioId);
      await solicitacoesService.create({ ...form, beneficiarioNome: benef?.nome ?? '' });
      toast.success('Solicitação criada!');
      setCreateOpen(false); load();
    } catch { toast.error('Erro ao criar solicitação.'); }
    finally { setSaving(false); }
  };

  const openStatus = (s: Solicitacao) => {
    setStatusModal(s);
    setNewStatus(s.status);
  };

  const updateStatus = async () => {
    if (!statusModal) return;
    setUpdatingStatus(true);
    try {
      await solicitacoesService.updateStatus(statusModal.id, newStatus);
      toast.success('Status atualizado!');
      setStatusModal(null); load();
    } catch { toast.error('Erro ao atualizar status.'); }
    finally { setUpdatingStatus(false); }
  };

  return (
    <div>
      <PageHeader
        title="Solicitações"
        description="Acompanhe e gerencie as solicitações de doação."
        action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Nova Solicitação</Button>}
      />

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar por beneficiário ou descrição..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-52">
          <option value="all">Todos os status</option>
          {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? <TableSpinner /> : filtered.length === 0 ? <EmptyState message="Nenhuma solicitação encontrada." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Descrição</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Beneficiário</th>
                  <th className="px-5 py-3 font-semibold hidden lg:table-cell">Categoria</th>
                  <th className="px-5 py-3 font-semibold">Urgência</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center">
                          <ClipboardList className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 max-w-xs truncate">{s.descricao}</p>
                          <p className="text-xs text-gray-500">Qtd: {s.quantidade}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-gray-600">{s.beneficiarioNome}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell"><Badge variant="neutral">{categoriaLabel[s.categoria]}</Badge></td>
                    <td className="px-5 py-3.5"><Badge variant={urgenciaVariant[s.urgencia]}>{urgenciaLabel[s.urgencia]}</Badge></td>
                    <td className="px-5 py-3.5"><Badge variant={statusVariant[s.status]}>{statusLabel[s.status]}</Badge></td>
                    <td className="px-5 py-3.5 text-right">
                      <Button variant="outline" onClick={() => openStatus(s)} className="px-3 py-1.5 text-xs">
                        <Pencil className="w-3.5 h-3.5" /> Alterar Status
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nova Solicitação"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={save} loading={saving} type="submit" form="solic-form">Criar</Button>
          </>
        }
      >
        <form id="solic-form" onSubmit={save} className="space-y-4">
          <Field label="Beneficiário" required>
            <Select value={form.beneficiarioId ?? ''} onChange={(e) => setForm({ ...form, beneficiarioId: e.target.value })}>
              <option value="">Selecione...</option>
              {beneficiarios.filter((b) => b.ativo).map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
            </Select>
          </Field>
          <Field label="Descrição" required>
            <Textarea rows={2} value={form.descricao ?? ''} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descreva a necessidade..." />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Categoria" required>
              <Select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as Solicitacao['categoria'] })}>
                {Object.entries(categoriaLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Quantidade" required>
              <Input type="number" min={1} value={form.quantidade ?? 1} onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })} />
            </Field>
            <Field label="Urgência" required>
              <Select value={form.urgencia} onChange={(e) => setForm({ ...form, urgencia: e.target.value as Solicitacao['urgencia'] })}>
                {Object.entries(urgenciaLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
          </div>
        </form>
      </Modal>

      {/* Modal Alterar Status */}
      <Modal
        open={!!statusModal}
        onClose={() => setStatusModal(null)}
        title="Alterar Status da Solicitação"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setStatusModal(null)}>Cancelar</Button>
            <Button onClick={updateStatus} loading={updatingStatus}>Atualizar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-gray-50">
            <p className="text-sm font-medium text-gray-900">{statusModal?.beneficiarioNome}</p>
            <p className="text-xs text-gray-500 mt-0.5">{statusModal?.descricao}</p>
          </div>
          <Field label="Novo Status" required>
            <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value as Solicitacao['status'])}>
              {Object.entries(statusLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  );
}
