import { useEffect, useState } from 'react';
import { Plus, Gift } from 'lucide-react';
import { doacoesService, doadoresService } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { TableSpinner } from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { Field, Input, Select } from '@/components/ui/Form';
import type { Doacao, Doador } from '@/types';

const categoriaLabel: Record<string, string> = {
  ALIMENTACAO: 'Alimentação',
  HIGIENE: 'Higiene',
  VESTUARIO: 'Vestuário',
  SAUDE: 'Saúde',
  EDUCACAO: 'Educação',
  OUTROS: 'Outros',
};

const statusVariant: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  DISPONIVEL: 'success',
  RESERVADO: 'warning',
  ESGOTADO: 'error',
};

const statusLabel: Record<string, string> = {
  DISPONIVEL: 'Disponível',
  RESERVADO: 'Reservado',
  ESGOTADO: 'Esgotado',
};

interface DoacaoForm {
  nome: string;
  categoria: string;
  quantidadeDoada: number;
  doadorId: string | number;
}

const emptyForm: DoacaoForm = {
  nome: '',
  categoria: 'ALIMENTACAO',
  quantidadeDoada: 1,
  doadorId: '',
};

export default function DoacoesPage() {
  const toast = useToast();
  const [items, setItems] = useState<Doacao[]>([]);
  const [doadores, setDoadores] = useState<Doador[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros da API (QueryParams)
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<DoacaoForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);

    // Prepara os parâmetros para a rota GET do Spring Boot
    const params: Record<string, any> = {
      page: 0,
      size: 50,
    };

    if (catFilter !== 'all') params.categoria = catFilter;
    if (statusFilter !== 'all') params.status = statusFilter;

    Promise.all([
      doacoesService.list(params), // Garanta que seu serviço aceite os params de query
      doadoresService.list(),
    ])
      .then(([resDoacoes, resDoadores]) => {
        // Trata a resposta paginada do Spring (content) ou Array simples
        const doacoesList = resDoacoes?.content ?? (Array.isArray(resDoacoes) ? resDoacoes : []);
        setItems(doacoesList);
        setDoadores(Array.isArray(resDoadores) ? resDoadores : []);
      })
      .catch(() => toast.error('Erro ao carregar doações.'))
      .finally(() => setLoading(false));
  };

  // Recarrega sempre que mudar os filtros
  useEffect(load, [catFilter, statusFilter]);

  const openCreate = () => {
    setForm(emptyForm);
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.doadorId || !form.categoria || !form.quantidadeDoada) {
      toast.warning('Preencha todos os campos obrigatórios.');
      return;
    }

    setSaving(true);
    try {
      // Monta o JSON exato exigido no POST:
      // { "nome": "...", "categoria": "...", "quantidadeDoada": 1, "doadorId": 12 }
      const payload = {
        nome: form.nome,
        categoria: form.categoria,
        quantidadeDoada: Number(form.quantidadeDoada),
        doadorId: Number(form.doadorId),
      };

      await doacoesService.create(payload);
      toast.success('Doação cadastrada com sucesso!');
      setModalOpen(false);
      load();
    } catch {
      toast.error('Erro ao registrar doação.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Doações / Itens Doados"
        description="Gerencie os itens de doação cadastrados."
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4" /> Cadastrar Item
          </Button>
        }
      />

      {/* Filtros da Query API */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <Select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="sm:w-1/2"
        >
          <option value="all">Todas as categorias</option>
          {Object.entries(categoriaLabel).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-1/2"
        >
          <option value="all">Todos os status</option>
          {Object.entries(statusLabel).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <TableSpinner />
        ) : items.length === 0 ? (
          <EmptyState message="Nenhum item de doação encontrado." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-semibold">Nome do Item</th>
                  <th className="px-5 py-3 font-semibold">Categoria</th>
                  <th className="px-5 py-3 font-semibold">Quantidade</th>
                  <th className="px-5 py-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => {
                  const cat = categoriaLabel[item.categoria] || item.categoria;
                  const stKey = item.status || 'DISPONIVEL';

                  return (
                    <tr key={item.id ?? idx} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5 font-medium text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Gift className="w-4 h-4" />
                          </div>
                          <span>{item.nome}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="info">{cat}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700 font-semibold">
                        {item.quantidade}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Badge variant={statusVariant[stKey] || 'neutral'}>
                          {statusLabel[stKey] || stKey}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Registrar Doação */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Cadastrar Doação"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save} loading={saving} type="submit" form="doacao-form">
              Cadastrar
            </Button>
          </>
        }
      >
        <form id="doacao-form" onSubmit={save} className="space-y-4">
          <Field label="Nome do Item / Descrição" required>
            <Input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Ex: Arroz 5kg, Agasalho Tam M..."
            />
          </Field>

          <Field label="Doador" required>
            <Select
              value={form.doadorId}
              onChange={(e) => setForm({ ...form, doadorId: e.target.value })}
            >
              <option value="">Selecione um doador...</option>
              {doadores
                .filter((d) => d.status === 'ATIVO' || (d as any).ativo)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
            </Select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Categoria" required>
              <Select
                value={form.categoria}
                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
              >
                {Object.entries(categoriaLabel).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Quantidade Doada" required>
              <Input
                type="number"
                min={1}
                value={form.quantidadeDoada}
                onChange={(e) => setForm({ ...form, quantidadeDoada: Number(e.target.value) })}
              />
            </Field>
          </div>
        </form>
      </Modal>
    </div>
  );
}