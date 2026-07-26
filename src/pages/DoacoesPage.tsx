import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Gift, Calendar } from 'lucide-react';
import { doacoesService, doadoresService, beneficiariosService } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { TableSpinner } from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import type { Beneficiario, Doacao, Doador } from '@/types';

const categoriaLabel = { ALIMENTOS: 'Alimentos', ROUPAS: 'Roupas', MEDICAMENTOS: 'Medicamentos', DINHEIRO: 'Dinheiro', OUTROS: 'Outros' };
const statusVariant = { PENDENTE: 'warning', ENTREGUE: 'success', CANCELADA: 'error' } as const;
const statusLabel = { PENDENTE: 'Pendente', ENTREGUE: 'Entregue', CANCELADA: 'Cancelada' };

const empty: Partial<Doacao> = {
  doadorId: '', beneficiarioId: '', descricao: '', quantidade: 1, categoria: 'ALIMENTOS',
};

export default function DoacoesPage() {
  const toast = useToast();
  const [items, setItems] = useState<Doacao[]>([]);
  const [doadores, setDoadores] = useState<Doador[]>([]);
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Doacao>>(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([doacoesService.list(), doadoresService.list(), beneficiariosService.list()])
      .then(([d, dos, bens]) => { setItems(d); setDoadores(dos); setBeneficiarios(bens); })
      .catch(() => toast.error('Erro ao carregar doações.'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    return items.filter((d) => {
      const ms = !search || d.doadorNome.toLowerCase().includes(search.toLowerCase()) || d.beneficiarioNome.toLowerCase().includes(search.toLowerCase()) || d.descricao.toLowerCase().includes(search.toLowerCase());
      const mc = catFilter === 'all' || d.categoria === catFilter;
      return ms && mc;
    });
  }, [items, search, catFilter]);

  const openCreate = () => { setForm(empty); setModalOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.doadorId || !form.beneficiarioId || !form.descricao) { toast.warning('Preencha os campos obrigatórios.'); return; }
    setSaving(true);
    try {
      const doador = doadores.find((d) => d.id === form.doadorId);
      const benef = beneficiarios.find((b) => b.id === form.beneficiarioId);
      await doacoesService.create({
        ...form,
        doadorNome: doador?.nome ?? '',
        beneficiarioNome: benef?.nome ?? '',
      });
      toast.success('Doação registrada com sucesso!');
      setModalOpen(false); load();
    } catch { toast.error('Erro ao registrar doação.'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader
        title="Doações"
        description="Registre e acompanhe as doações realizadas."
        action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Registrar Doação</Button>}
      />

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar por doador, beneficiário ou descrição..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="sm:w-48">
          <option value="all">Todas as categorias</option>
          {Object.entries(categoriaLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </Select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? <TableSpinner /> : filtered.length === 0 ? <EmptyState message="Nenhuma doação encontrada." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Descrição</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Doador</th>
                  <th className="px-5 py-3 font-semibold hidden lg:table-cell">Beneficiário</th>
                  <th className="px-5 py-3 font-semibold">Categoria</th>
                  <th className="px-5 py-3 font-semibold hidden sm:table-cell">Qtd.</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Gift className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{d.descricao}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(d.data).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-gray-600">{d.doadorNome}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-gray-600">{d.beneficiarioNome}</td>
                    <td className="px-5 py-3.5"><Badge variant="info">{categoriaLabel[d.categoria]}</Badge></td>
                    <td className="px-5 py-3.5 hidden sm:table-cell text-gray-600 font-semibold">{d.quantidade}</td>
                    <td className="px-5 py-3.5"><Badge variant={statusVariant[d.status]}>{statusLabel[d.status]}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Registrar Doação"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={save} loading={saving} type="submit" form="doacao-form">Registrar</Button>
          </>
        }
      >
        <form id="doacao-form" onSubmit={save} className="space-y-4">
          <Field label="Doador" required>
            <Select value={form.doadorId ?? ''} onChange={(e) => setForm({ ...form, doadorId: e.target.value })}>
              <option value="">Selecione um doador...</option>
              {doadores.filter((d) => d.ativo).map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </Select>
          </Field>
          <Field label="Beneficiário" required>
            <Select value={form.beneficiarioId ?? ''} onChange={(e) => setForm({ ...form, beneficiarioId: e.target.value })}>
              <option value="">Selecione um beneficiário...</option>
              {beneficiarios.filter((b) => b.ativo).map((b) => <option key={b.id} value={b.id}>{b.nome}</option>)}
            </Select>
          </Field>
          <Field label="Descrição" required>
            <Input value={form.descricao ?? ''} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex.: Cesta básica, roupas, medicamentos..." />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoria" required>
              <Select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as Doacao['categoria'] })}>
                {Object.entries(categoriaLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </Select>
            </Field>
            <Field label="Quantidade" required>
              <Input type="number" min={1} value={form.quantidade ?? 1} onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })} />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}
