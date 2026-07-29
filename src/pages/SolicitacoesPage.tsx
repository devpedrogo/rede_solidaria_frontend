import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, ClipboardList, Pencil } from 'lucide-react';
import { solicitacoesService, beneficiariosService, doacoesService } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { TableSpinner } from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import type { Beneficiario, Solicitacao } from '@/types';

// Badges e Labels alinhados com o Enum StatusSolicitacao do Spring Boot
const statusVariant: Record<string, 'warning' | 'primary' | 'error' | 'success' | 'neutral'> = {
  PENDENTE: 'warning',
  APROVADA: 'primary',
  REJEITADA: 'error',
  CONCLUIDA: 'success',
};

const statusLabel: Record<string, string> = {
  PENDENTE: 'Pendente',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
  CONCLUIDA: 'Concluída',
};

interface CreateSolicitacaoForm {
  itemId: string | number;
  beneficiarioId: string | number;
  quantidadeSolicitada: number;
  justificativa: string;
}

const emptyForm: CreateSolicitacaoForm = {
  itemId: '',
  beneficiarioId: '',
  quantidadeSolicitada: 1,
  justificativa: '',
};

export default function SolicitacoesPage() {
  const toast = useToast();
  const [items, setItems] = useState<Solicitacao[]>([]);
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [itensDoacao, setItensDoacao] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateSolicitacaoForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [statusModal, setStatusModal] = useState<Solicitacao | null>(null);
  const [newStatus, setNewStatus] = useState<string>('PENDENTE');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      solicitacoesService.list(),
      beneficiariosService.list(),
      doacoesService.list({ size: 100 }), // Carrega itens cadastrados para montar o select
    ])
      .then(([sList, bList, dList]) => {
        setItems(Array.isArray(sList) ? sList : []);
        setBeneficiarios(Array.isArray(bList) ? bList : []);
        
        // Trata a resposta do doacoesService (Spring PageImpl ou Array simples)
        const itemsList = dList?.content ?? (Array.isArray(dList) ? dList : []);
        setItensDoacao(itemsList);
      })
      .catch(() => toast.error('Erro ao carregar solicitações.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return items.filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        s.nomeBeneficiario?.toLowerCase().includes(q) ||
        s.nomeItem?.toLowerCase().includes(q) ||
        s.justificativa?.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [items, search, statusFilter]);

  const openCreate = () => {
    setForm(emptyForm);
    setCreateOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();

    const rawItemId = form.itemId;
    const rawBeneficiarioId = form.beneficiarioId;

    const itemIdNum = rawItemId !== '' && rawItemId !== null && rawItemId !== undefined ? Number(rawItemId) : null;
    const beneficiarioIdNum = rawBeneficiarioId !== '' && rawBeneficiarioId !== null && rawBeneficiarioId !== undefined ? Number(rawBeneficiarioId) : null;
    const qtdNum = Number(form.quantidadeSolicitada) || 1;

    // Validação estrita: garante que os campos não sejam nulos, vazios ou NaN
    if (
      itemIdNum === null || 
      isNaN(itemIdNum) || 
      beneficiarioIdNum === null || 
      isNaN(beneficiarioIdNum) || 
      !form.justificativa.trim()
    ) {
      toast.warning('Selecione um item, um beneficiário e informe a justificativa.');
      return;
    }

    setSaving(true);
    try {
      // JSON exato exigido pelo POST /solicitacoes:
      // { "itemId": 3, "beneficiarioId": 12, "quantidadeSolicitada": 1, "justificativa": "..." }
      const payload = {
        itemId: itemIdNum,
        beneficiarioId: beneficiarioIdNum,
        quantidadeSolicitada: qtdNum,
        justificativa: form.justificativa,
      };

      await solicitacoesService.create(payload as any);
      toast.success('Solicitação criada com sucesso!');
      setCreateOpen(false);
      load();
    } catch {
      toast.error('Erro ao criar solicitação.');
    } finally {
      setSaving(false);
    }
  };

  const openStatus = (s: Solicitacao) => {
    setStatusModal(s);
    setNewStatus(s.status || 'PENDENTE');
  };

  const updateStatus = async () => {
    if (!statusModal) return;

    // Validação rápida no client-side para o mesmo status
    if (statusModal.status === newStatus) {
      toast.warning(`A solicitação já está no status: ${statusLabel[newStatus] || newStatus}`);
      return;
    }

    setUpdatingStatus(true);
    try {
      await solicitacoesService.updateStatus(statusModal.id, newStatus as any);
      toast.success('Status atualizado com sucesso!');
      setStatusModal(null);
      load();
    } catch (err: any) {
      // Extrai a mensagem exata lançada pela RegraDeNegocioException do Spring
      const backendMessage =
        err?.response?.data?.message ??
        (typeof err?.response?.data === 'string' ? err.response.data : null) ??
        'Erro ao atualizar status.';

      toast.error(backendMessage);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Solicitações"
        description="Acompanhe e gerencie as solicitações de itens doados."
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Nova Solicitação
          </Button>
        }
      />

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por beneficiário, item ou justificativa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-52"
        >
          <option value="all">Todos os status</option>
          {Object.entries(statusLabel).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </div>

      {/* Tabela de Solicitações */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <TableSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState message="Nenhuma solicitação encontrada." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Item Solicitado</th>
                  <th className="px-5 py-3 font-semibold">Beneficiário</th>
                  <th className="px-5 py-3 font-semibold">Quantidade</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s, idx) => {
                  const stKey = s.status || 'PENDENTE';

                  return (
                    <tr key={s.id ?? `solic-${idx}`} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center">
                            <ClipboardList className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{s.nomeItem}</p>
                            <p className="text-xs text-gray-500 max-w-xs truncate" title={s.justificativa}>
                              {s.justificativa}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 font-medium">
                        {s.nomeBeneficiario}
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 font-semibold">
                        {s.quantidade}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={statusVariant[stKey] || 'neutral'}>
                          {statusLabel[stKey] || stKey}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button
                          variant="outline"
                          onClick={() => openStatus(s)}
                          className="px-3 py-1.5 text-xs"
                        >
                          <Pencil className="w-3.5 h-3.5" /> Alterar Status
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar Solicitação */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nova Solicitação"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save} loading={saving} type="submit" form="solic-form">
              Criar
            </Button>
          </>
        }
      >
        <form id="solic-form" onSubmit={save} className="space-y-4">
          <Field label="Beneficiário" required>
            <Select
              value={form.beneficiarioId}
              onChange={(e) => setForm({ ...form, beneficiarioId: e.target.value })}
            >
              <option value="">Selecione o beneficiário...</option>
              {beneficiarios.map((b, idx) => {
                const bId = b.id ?? (b as any).beneficiarioId ?? (idx + 1);
                return (
                  <option key={`benef-${bId}-${idx}`} value={bId}>
                    {b.nome}
                  </option>
                );
              })}
            </Select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Field label="Item Doado" required>
                <Select
                  value={form.itemId}
                  onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                >
                  <option value="">Selecione o item...</option>
                  {itensDoacao.map((item, idx) => {
                    const itemId = item.id ?? item.itemId ?? item.idItem ?? (idx + 1);
                    const itemNome = item.nome ?? item.nomeItem ?? 'Item sem nome';
                    const qtd = item.quantidade ?? item.quantidadeDoada ?? 0;

                    return (
                      <option key={`item-${itemId}-${idx}`} value={itemId}>
                        {itemNome} ({qtd} disps.)
                      </option>
                    );
                  })}
                </Select>
              </Field>
            </div>

            <Field label="Qtd. Solicitada" required>
              <Input
                type="number"
                min={1}
                value={form.quantidadeSolicitada}
                onChange={(e) =>
                  setForm({ ...form, quantidadeSolicitada: Number(e.target.value) })
                }
              />
            </Field>
          </div>

          <Field label="Justificativa / Observação" required>
            <Textarea
              rows={3}
              value={form.justificativa}
              onChange={(e) => setForm({ ...form, justificativa: e.target.value })}
              placeholder="Descreva a razão ou destino da solicitação..."
            />
          </Field>
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
            <Button variant="outline" onClick={() => setStatusModal(null)}>
              Cancelar
            </Button>
            <Button 
              onClick={updateStatus} 
              loading={updatingStatus}
              disabled={statusModal?.status === 'CONCLUIDA' || statusModal?.status === 'REJEITADA'}
            >
              Atualizar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-sm font-semibold text-gray-900">{statusModal?.nomeBeneficiario}</p>
            <p className="text-xs text-gray-600 mt-0.5">Item: {statusModal?.nomeItem} ({statusModal?.quantidade} un.)</p>
            <p className="text-xs font-medium text-gray-500 mt-1">
              Status Atual: <span className="text-gray-900">{statusLabel[statusModal?.status || 'PENDENTE']}</span>
            </p>
          </div>

          {/* Alerta preventivo no Modal se o status for final */}
          {(statusModal?.status === 'CONCLUIDA' || statusModal?.status === 'REJEITADA') ? (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
              Esta solicitação encontra-se <strong>{statusModal.status}</strong> e não pode mais ter seu status alterado.
            </div>
          ) : (
            <Field label="Novo Status" required>
              <Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                {Object.entries(statusLabel).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
      </Modal>
    </div>
  );
}