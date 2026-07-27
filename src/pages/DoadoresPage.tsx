import { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Pencil, Trash2, HeartHandshake } from 'lucide-react';
import { doadoresService } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { TableSpinner } from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { Field, Input } from '@/components/ui/Form';
import type { Doador } from '@/types';

const empty: Partial<Doador> = {
  nome: '',
  telefone: '',
  endereco: '',
  status: 'ATIVO',
};

export default function DoadoresPage() {
  const toast = useToast();
  const [items, setItems] = useState<Doador[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Doador | null>(null);
  const [form, setForm] = useState<Partial<Doador>>(empty);
  const [saving, setSaving] = useState(false);

  const [toDelete, setToDelete] = useState<Doador | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    doadoresService
      .list()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Erro ao carregar doadores.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    return items.filter((d) => {
      const q = search.toLowerCase();
      return (
        !search ||
        d.nome?.toLowerCase().includes(q) ||
        d.telefone?.toLowerCase().includes(q) ||
        d.endereco?.toLowerCase().includes(q)
      );
    });
  }, [items, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setModalOpen(true);
  };

  const openEdit = (d: Doador) => {
    setEditing(d);
    setForm({ ...d });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome) {
      toast.warning('Preencha os campos obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await doadoresService.update(editing.id, form);
        toast.success('Doador atualizado com sucesso!');
      } else {
        await doadoresService.create(form);
        toast.success('Doador cadastrado com sucesso!');
      }
      setModalOpen(false);
      load();
    } catch {
      toast.error('Erro ao salvar doador.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await doadoresService.remove(toDelete.id);
      toast.success('Doador inativado.');
      setToDelete(null);
      load();
    } catch {
      toast.error('Erro ao inativar doador.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Doadores"
        description="Gerencie os doadores cadastrados na plataforma."
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Novo Doador
          </Button>
        }
      />

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar por nome, telefone ou endereço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <TableSpinner />
        ) : filtered.length === 0 ? (
          <EmptyState message="Nenhum doador encontrado." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Nome</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Telefone</th>
                  <th className="px-5 py-3 font-semibold hidden lg:table-cell">Endereço</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((d) => {
                  const isAtivo = d.status === 'ATIVO';

                  return (
                    <tr key={d.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-accent-50 text-accent-600 flex items-center justify-center">
                            <HeartHandshake className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{d.nome}</p>
                            <p className="text-xs text-gray-500 md:hidden">
                              {d.telefone || 'Sem telefone'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell text-gray-600">
                        {d.telefone || '-'}
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell text-gray-600">
                        {d.endereco || 'Não informado'}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={isAtivo ? 'success' : 'neutral'}>
                          {isAtivo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(d)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-accent-50 hover:text-accent-600 transition"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setToDelete(d)}
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

      {/* Modal Create/Edit */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Doador' : 'Novo Doador'}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save} loading={saving} form="doador-form" type="submit">
              {editing ? 'Salvar' : 'Cadastrar'}
            </Button>
          </>
        }
      >
        <form id="doador-form" onSubmit={save} className="space-y-4">
          <Field label="Nome completo / Razão Social" required>
            <Input
              value={form.nome ?? ''}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Nome do doador"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Telefone">
              <Input
                value={form.telefone ?? ''}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </Field>
            <Field label="Endereço">
              <Input
                value={form.endereco ?? ''}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                placeholder="Rua, Número, Bairro"
              />
            </Field>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
        title="Inativar Doador"
        message={`Deseja realmente inativar o doador "${toDelete?.nome}"?`}
      />
    </div>
  );
}