import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, UserCog, Mail } from 'lucide-react';
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

interface OperadorFormData {
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  senha?: string;
}

const emptyForm: OperadorFormData = {
  nome: '',
  telefone: '',
  email: '',
  endereco: '',
  senha: '',
};

export default function OperadoresPage() {
  const toast = useToast();
  const [items, setItems] = useState<Operador[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Operador | null>(null);
  const [form, setForm] = useState<OperadorFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<Operador | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    operadoresService
      .list()
      .then((res: any) => {
        const list = res?.content ?? (Array.isArray(res) ? res : []);
        setItems(list);
      })
      .catch(() => toast.error('Erro ao carregar operadores.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return items.filter(
      (o) =>
        !search ||
        o.nome?.toLowerCase().includes(search.toLowerCase()) ||
        o.email?.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (o: Operador) => {
    setEditing(o);
    setForm({
      nome: o.nome || '',
      telefone: o.telefone || '',
      email: o.email || '',
      endereco: (o as any).endereco || '',
      senha: '',
    });
    setModalOpen(true);
  };

  // 1. Função save ajustada para tratar o payload na edição
  const save = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.nome.trim() || !form.email.trim()) {
      toast.warning('Preencha os campos obrigatórios (Nome e E-mail).');
      return;
    }

    // Apenas obriga a senha ao criar um novo operador
    if (!editing && !form.senha?.trim()) {
      toast.warning('Defina uma senha para o novo operador.');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        // Monta o payload sem incluir a senha caso esteja vazia ou contenha só espaços
        const payload: Record<string, any> = {
          nome: form.nome,
          telefone: form.telefone,
          email: form.email,
          endereco: form.endereco,
        };

        if (form.senha && form.senha.trim() !== '') {
          payload.senha = form.senha.trim();
        }

        await operadoresService.update(editing.id, payload as any);
        toast.success('Operador atualizado com sucesso!');
      } else {
        const payload = {
          nome: form.nome,
          telefone: form.telefone,
          email: form.email,
          endereco: form.endereco,
          senha: form.senha,
        };

        await operadoresService.create(payload as any);
        toast.success('Operador cadastrado com sucesso!');
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        (typeof err?.response?.data === 'string' ? err.response.data : null) ??
        'Erro ao salvar operador.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await operadoresService.remove(toDelete.id);
      toast.success('Operador inativado com sucesso!');
      setToDelete(null);
      load();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        (typeof err?.response?.data === 'string' ? err.response.data : null) ??
        'Erro ao inativar operador.';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Operadores"
        description="Gerencie os operadores do sistema (acesso restrito a administradores)."
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Novo Operador
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

      {/* Tabela de Operadores */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <TableSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState message="Nenhum operador encontrado." />
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
                {filtered.map((o, idx) => {
                  const isAtivo = o.status === 'ATIVO';

                  return (
                    <tr key={o.id ?? `op-${idx}`} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center">
                            <UserCog className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{o.nome}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {o.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-gray-600">
                        {o.telefone || '-'}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={isAtivo ? 'success' : 'neutral'}>
                          {isAtivo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(o)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-accent-50 hover:text-accent-600 transition"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setToDelete(o)}
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
        title={editing ? 'Editar Operador' : 'Novo Operador'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save} loading={saving} type="submit" form="op-form">
              {editing ? 'Salvar' : 'Cadastrar'}
            </Button>
          </>
        }
      >
        <form id="op-form" onSubmit={save} className="space-y-4">
          <Field label="Nome completo" required>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Carlos Silva"
            />
          </Field>

          <Field label="E-mail" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="carlos@exemplo.com"
            />
          </Field>

          <Field label="Endereço">
            <Input
              value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              placeholder="Rua, Número, Bairro, Cidade - UF"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Telefone">
              <Input
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="(79) 99999-9999"
              />
            </Field>

            {/* O label informa se é opcional e a prop 'required' só vai pro Input no modo de criação (!editing) */}
            <Field label={editing ? 'Nova senha (opcional)' : 'Senha'} required={!editing}>
              <Input
                type="password"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                placeholder={editing ? 'Deixe em branco para manter a atual' : '••••••••'}
                required={!editing} // Importante: evita a validação HTML5 do navegador ao editar!
              />
            </Field>
          </div>
        </form>
      </Modal>

      {/* Modal de Confirmação para Inativar */}
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