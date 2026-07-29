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

interface AdminFormData {
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  senha?: string;
}

const emptyForm: AdminFormData = {
  nome: '',
  telefone: '',
  email: '',
  endereco: '',
  senha: '',
};

export default function AdminsPage() {
  const toast = useToast();
  const [items, setItems] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [form, setForm] = useState<AdminFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<Admin | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    adminsService
      .list()
      .then((res: any) => {
        const list = res?.content ?? (Array.isArray(res) ? res : []);
        setItems(list);
      })
      .catch(() => toast.error('Erro ao carregar administradores.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return items.filter(
      (a) =>
        !search ||
        a.nome?.toLowerCase().includes(search.toLowerCase()) ||
        a.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (a: Admin) => {
    const adminId = a.id ?? (a as any).idAdmin ?? (a as any).codigo;
    if (!adminId) {
      toast.error('Não foi possível identificar o ID do administrador.');
      return;
    }

    setEditing({ ...a, id: adminId });
    setForm({
      nome: a.nome || '',
      telefone: a.telefone || '',
      email: a.email || '',
      endereco: (a as any).endereco || '',
      senha: '',
    });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();

    const nomeTrim = form.nome?.trim() || '';
    const emailTrim = form.email?.trim() || '';
    const telefoneTrim = form.telefone?.trim() || '';
    const enderecoTrim = form.endereco?.trim() || '';
    const senhaTrim = form.senha?.trim() || '';

    if (!nomeTrim || !emailTrim) {
      toast.warning('Preencha os campos obrigatórios (Nome e E-mail).');
      return;
    }

    if (!editing && !senhaTrim) {
      toast.warning('Defina uma senha para o novo administrador.');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const targetId = editing.id ?? (editing as any).idAdmin ?? (editing as any).codigo;

        if (!targetId || targetId === 'undefined') {
          toast.error('ID inválido para atualização.');
          setSaving(false);
          return;
        }

        // DTO de Atualização
        const payload: Record<string, any> = {
          nome: nomeTrim,
          email: emailTrim,
          telefone: telefoneTrim,
          endereco: enderecoTrim,
        };

        if (senhaTrim !== '') {
          payload.senha = senhaTrim;
        }

        await adminsService.update(targetId, payload);
        toast.success('Administrador atualizado com sucesso!');
      } else {
        // DTO de Criação exato para o AdminDto do Spring Boot
        const payload = {
          nome: nomeTrim,
          telefone: telefoneTrim,
          email: emailTrim,
          endereco: enderecoTrim,
          senha: senhaTrim,
        };

        await adminsService.create(payload);
        toast.success('Administrador cadastrado com sucesso!');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      const msg =
        err?.response?.data?.mensagem ??
        err?.response?.data?.message ??
        err?.response?.data?.errors?.[0]?.defaultMessage ??
        (typeof err?.response?.data === 'string' ? err.response.data : null) ??
        'Erro ao salvar administrador.';
      toast.error(msg);
      console.error('Detalhes do erro do backend:', err?.response?.data);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const targetId = toDelete.id ?? (toDelete as any).idAdmin ?? (toDelete as any).codigo;

    if (!targetId) {
      toast.error('ID inválido para remoção.');
      return;
    }

    setDeleting(true);
    try {
      await adminsService.remove(targetId);
      toast.success('Administrador inativado com sucesso!');
      setToDelete(null);
      load();
    } catch (err: any) {
      const msg =
        err?.response?.data?.mensagem ??
        err?.response?.data?.message ??
        err?.response?.data?.errors?.[0]?.defaultMessage ??
        'Erro ao inativar administrador.';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Administradores"
        description="Gerencie os administradores do sistema (acesso total)."
        action={
          <Button variant="secondary" onClick={openCreate}>
            <Plus className="w-4 h-4" /> Novo Administrador
          </Button>
        }
      />

      {/* Busca */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabela de Administradores */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <TableSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState message="Nenhum administrador encontrado." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Contato</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((a, idx) => {
                  const isAtivo = a.status === 'ATIVO' || (a as any).ativo === true;

                  return (
                    <tr key={a.id ?? `adm-${idx}`} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-accent-100 text-accent-700 flex items-center justify-center">
                            <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{a.nome}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {a.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-gray-600">
                        {a.telefone || '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={isAtivo ? 'success' : 'neutral'}>
                          {isAtivo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(a)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-accent-50 hover:text-accent-600 transition"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setToDelete(a)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
                            title="Inativar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Criar / Editar */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Administrador' : 'Novo Administrador'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            {/* type="submit" no formulário aciona a função save sem duplicar o evento onClick */}
            <Button variant="secondary" loading={saving} type="submit" form="adm-form">
              {editing ? 'Salvar' : 'Cadastrar'}
            </Button>
          </>
        }
      >
        <form id="adm-form" onSubmit={save} className="space-y-4">
          <Field label="Nome completo" required>
            <Input
              value={form.nome}
              onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
              placeholder="Ex: Luana Silva"
            />
          </Field>

          <Field label="E-mail" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="luana@exemplo.com"
            />
          </Field>

          <Field label="Endereço">
            <Input
              value={form.endereco}
              onChange={(e) => setForm((prev) => ({ ...prev, endereco: e.target.value }))}
              placeholder="Rua, Número, Bairro, Cidade - UF"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Telefone">
              <Input
                value={form.telefone}
                onChange={(e) => setForm((prev) => ({ ...prev, telefone: e.target.value }))}
                placeholder="(79) 99999-9999"
              />
            </Field>

            <Field label={editing ? 'Nova senha (opcional)' : 'Senha'} required={!editing}>
              <Input
                type="password"
                value={form.senha ?? ''}
                onChange={(e) => setForm((prev) => ({ ...prev, senha: e.target.value }))}
                placeholder={editing ? 'Deixe em branco para manter a atual' : '••••••••'}
                required={!editing}
              />
            </Field>
          </div>
        </form>
      </Modal>

      {/* ConfirmDialog */}
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