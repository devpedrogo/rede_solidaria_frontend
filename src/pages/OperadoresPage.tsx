import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, UserCog, Mail, Phone } from 'lucide-react';
import { operadoresService } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { TableSpinner } from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { Field, Input } from '@/components/ui/Form';
import type { Operador } from '@/types';

const empty: Partial<Operador> & { senha?: string } = { nome: '', email: '', telefone: '', senha: '', ativo: true };

export default function OperadoresPage() {
  const toast = useToast();
  const [items, setItems] = useState<Operador[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Operador | null>(null);
  const [form, setForm] = useState<Partial<Operador> & { senha?: string }>(empty);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<Operador | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    operadoresService.list().then(setItems).catch(() => toast.error('Erro ao carregar operadores.')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => items.filter((o) => !search || o.nome.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase())), [items, search]);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (o: Operador) => { setEditing(o); setForm({ ...o, senha: '' }); setModalOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.email) { toast.warning('Preencha os campos obrigatórios.'); return; }
    if (!editing && !form.senha) { toast.warning('Defina uma senha para o novo operador.'); return; }
    setSaving(true);
    try {
      if (editing) { await operadoresService.update(editing.id, form); toast.success('Operador atualizado!'); }
      else { await operadoresService.create(form); toast.success('Operador cadastrado!'); }
      setModalOpen(false); load();
    } catch { toast.error('Erro ao salvar operador.'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await operadoresService.remove(toDelete.id);
      toast.success('Operador inativado.');
      setToDelete(null); load();
    } catch { toast.error('Erro ao inativar.'); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Operadores"
        description="Gerencie os operadores do sistema (acesso restrito a administradores)."
        action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Novo Operador</Button>}
      />

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? <TableSpinner /> : filtered.length === 0 ? <EmptyState message="Nenhum operador encontrado." /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Contato</th>
                  <th className="px-5 py-3 font-semibold hidden lg:table-cell">Cadastro</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center">
                          <UserCog className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{o.nome}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{o.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-gray-600">{o.telefone}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-gray-600">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-5 py-3.5"><Badge variant={o.ativo ? 'success' : 'neutral'}>{o.ativo ? 'Ativo' : 'Inativo'}</Badge></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(o)} className="p-2 rounded-lg text-gray-500 hover:bg-accent-50 hover:text-accent-600 transition" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setToDelete(o)} className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition" title="Inativar">
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
        title={editing ? 'Editar Operador' : 'Novo Operador'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={save} loading={saving} type="submit" form="op-form">{editing ? 'Salvar' : 'Cadastrar'}</Button>
          </>
        }
      >
        <form id="op-form" onSubmit={save} className="space-y-4">
          <Field label="Nome completo" required>
            <Input value={form.nome ?? ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Field>
          <Field label="E-mail" required>
            <Input type="email" value={form.email ?? ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefone">
              <Input value={form.telefone ?? ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 99999-9999" />
            </Field>
            <Field label={editing ? 'Nova senha (opcional)' : 'Senha'} required={!editing}>
              <Input type="password" value={form.senha ?? ''} onChange={(e) => setForm({ ...form, senha: e.target.value })} placeholder="••••••••" />
            </Field>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Inativar Operador"
        message={`Deseja realmente inativar o operador "${toDelete?.nome}"?`}
      />
    </div>
  );
}
