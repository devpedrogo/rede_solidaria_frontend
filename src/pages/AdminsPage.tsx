import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, ShieldCheck, Mail } from 'lucide-react';
import { adminsService } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { TableSpinner } from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { Field, Input } from '@/components/ui/Form';
import type { Admin } from '@/types';

const empty: Partial<Admin> & { senha?: string } = { nome: '', email: '', telefone: '', senha: '', ativo: true };

export default function AdminsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [form, setForm] = useState<Partial<Admin> & { senha?: string }>(empty);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<Admin | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    adminsService.list().then(setItems).catch(() => toast.error('Erro ao carregar administradores.')).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const filtered = useMemo(() => items.filter((a) => !search || a.nome.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())), [items, search]);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (a: Admin) => { setEditing(a); setForm({ ...a, senha: '' }); setModalOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.email) { toast.warning('Preencha os campos obrigatórios.'); return; }
    if (!editing && !form.senha) { toast.warning('Defina uma senha para o novo administrador.'); return; }
    setSaving(true);
    try {
      if (editing) { await adminsService.update(editing.id, form); toast.success('Administrador atualizado!'); }
      else { await adminsService.create(form); toast.success('Administrador cadastrado!'); }
      setModalOpen(false); load();
    } catch { toast.error('Erro ao salvar administrador.'); }
    finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminsService.remove(toDelete.id);
      toast.success('Administrador inativado.');
      setToDelete(null); load();
    } catch { toast.error('Erro ao inativar.'); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Administradores"
        description="Gerencie os administradores do sistema (acesso total)."
        action={<Button variant="secondary" onClick={openCreate}><Plus className="w-4 h-4" /> Novo Administrador</Button>}
      />

      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar por nome ou e-mail..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? <TableSpinner /> : filtered.length === 0 ? <EmptyState message="Nenhum administrador encontrado." /> : (
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
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-accent-100 text-accent-700 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{a.nome}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" />{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell text-gray-600">{a.telefone}</td>
                    <td className="px-5 py-3.5 hidden lg:table-cell text-gray-600">{new Date(a.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td className="px-5 py-3.5"><Badge variant={a.ativo ? 'success' : 'neutral'}>{a.ativo ? 'Ativo' : 'Inativo'}</Badge></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(a)} className="p-2 rounded-lg text-gray-500 hover:bg-accent-50 hover:text-accent-600 transition" title="Editar">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setToDelete(a)} className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition" title="Inativar">
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
        title={editing ? 'Editar Administrador' : 'Novo Administrador'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button variant="secondary" onClick={save} loading={saving} type="submit" form="adm-form">{editing ? 'Salvar' : 'Cadastrar'}</Button>
          </>
        }
      >
        <form id="adm-form" onSubmit={save} className="space-y-4">
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
        title="Inativar Administrador"
        message={`Deseja realmente inativar o administrador "${toDelete?.nome}"?`}
      />
    </div>
  );
}
