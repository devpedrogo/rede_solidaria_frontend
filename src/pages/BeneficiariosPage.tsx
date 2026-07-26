import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, HeartHandshake } from 'lucide-react';
import { beneficiariosService } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { TableSpinner } from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { Field, Input, Select, Textarea } from '@/components/ui/Form';
import type { Beneficiario } from '@/types';

const empty: Partial<Beneficiario> = {
  nome: '', email: '', telefone: '', documento: '', endereco: '',
  prioridade: 'MEDIA', tipo: 'INDIVIDUAL', observacoes: '', ativo: true,
};

const prioridadeVariant = { BAIXA: 'neutral', MEDIA: 'info', ALTA: 'warning', CRITICA: 'error' } as const;
const prioridadeLabel = { BAIXA: 'Baixa', MEDIA: 'Média', ALTA: 'Alta', CRITICA: 'Crítica' };
const tipoLabel = { INDIVIDUAL: 'Individual', FAMILIAR: 'Familiar', INSTITUICAO: 'Instituição' };

export default function BeneficiariosPage() {
  const toast = useToast();
  const [items, setItems] = useState<Beneficiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [prioFilter, setPrioFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Beneficiario | null>(null);
  const [form, setForm] = useState<Partial<Beneficiario>>(empty);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<Beneficiario | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    beneficiariosService.list().then(setItems).catch(() => toast.error('Erro ao carregar beneficiários.')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => {
    return items.filter((b) => {
      const ms = !search || b.nome.toLowerCase().includes(search.toLowerCase()) || b.email.toLowerCase().includes(search.toLowerCase());
      const mp = prioFilter === 'all' || b.prioridade === prioFilter;
      return ms && mp;
    });
  }, [items, search, prioFilter]);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (b: Beneficiario) => { setEditing(b); setForm({ ...b }); setModalOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.email) { toast.warning('Preencha os campos obrigatórios.'); return; }
    setSaving(true);
    try {
      if (editing) { await beneficiariosService.update(editing.id, form); toast.success('Beneficiário atualizado!'); }
      else { await beneficiariosService.create(form); toast.success('Beneficiário cadastrado!'); }
      setModalOpen(false); load();
    } catch { toast.error('Erro ao salvar beneficiário.'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await beneficiariosService.remove(toDelete.id);
      toast.success('Beneficiário inativado.');
      setToDelete(null); load();
    } catch { toast.error('Erro ao inativar.'); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Beneficiários"
        description="Gerencie os beneficiários assistidos pela plataforma."
        action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Novo Beneficiário</Button>}
      />

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={prioFilter} onChange={(e) => setPrioFilter(e.target.value)} className="sm:w-48">
          <option value="all">Todas as prioridades</option>
          <option value="BAIXA">Baixa</option>
          <option value="MEDIA">Média</option>
          <option value="ALTA">Alta</option>
          <option value="CRITICA">Crítica</option>
        </Select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? <TableSpinner /> : filtered.length === 0 ? <EmptyState message="Nenhum beneficiário encontrado." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Tipo</th>
                  <th className="px-5 py-3 font-semibold">Prioridade</th>
                  <th className="px-5 py-3 font-semibold hidden lg:table-cell">Contato</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                          <HeartHandshake className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{b.nome}</p>
                          <p className="text-xs text-gray-500">{b.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-gray-600">{tipoLabel[b.tipo]}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={prioridadeVariant[b.prioridade]}>{prioridadeLabel[b.prioridade]}</Badge>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-gray-600">{b.telefone}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={b.ativo ? 'success' : 'neutral'}>{b.ativo ? 'Ativo' : 'Inativo'}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(b)} className="p-2 rounded-lg text-gray-500 hover:bg-accent-50 hover:text-accent-600 transition" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setToDelete(b)} className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition" title="Inativar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
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
        title={editing ? 'Editar Beneficiário' : 'Novo Beneficiário'}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={save} loading={saving} type="submit" form="benef-form">{editing ? 'Salvar' : 'Cadastrar'}</Button>
          </>
        }
      >
        <form id="benef-form" onSubmit={save} className="space-y-4">
          <Field label="Nome" required>
            <Input value={form.nome ?? ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tipo" required>
              <Select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Beneficiario['tipo'] })}>
                <option value="INDIVIDUAL">Individual</option>
                <option value="FAMILIAR">Familiar</option>
                <option value="INSTITUICAO">Instituição</option>
              </Select>
            </Field>
            <Field label="Prioridade" required>
              <Select value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value as Beneficiario['prioridade'] })}>
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica</option>
              </Select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="E-mail" required>
              <Input type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="Telefone">
              <Input value={form.telefone ?? ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Documento">
              <Input value={form.documento ?? ''} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
            </Field>
            <Field label="Endereço">
              <Input value={form.endereco ?? ''} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
            </Field>
          </div>
          <Field label="Observações">
            <Textarea rows={3} value={form.observacoes ?? ''} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
          </Field>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Inativar Beneficiário"
        message={`Deseja realmente inativar "${toDelete?.nome}"?`}
      />
    </div>
  );
}
