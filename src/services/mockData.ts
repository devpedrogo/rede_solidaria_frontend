import type {
  Admin, Beneficiario, Doacao, Doador, Operador, Solicitacao,
} from '@/types';

export const mockDoadores: Doador[] = [
  { id: 'd1', nome: 'Maria Silva', email: 'maria.silva@email.com', telefone: '(11) 98765-4321', documento: '123.456.789-00', tipo: 'PF', endereco: 'Rua das Flores, 123 - São Paulo, SP', ativo: true, createdAt: '2024-01-15T10:00:00Z' },
  { id: 'd2', nome: 'João Santos', email: 'joao.santos@email.com', telefone: '(11) 91234-5678', documento: '987.654.321-00', tipo: 'PF', endereco: 'Av. Brasil, 456 - São Paulo, SP', ativo: true, createdAt: '2024-02-20T10:00:00Z' },
  { id: 'd3', nome: 'Supermercado Esperança LTDA', email: 'contato@esperanca.com', telefone: '(11) 3333-4444', documento: '12.345.678/0001-90', tipo: 'PJ', endereco: 'Rua Industrial, 789 - São Paulo, SP', ativo: true, createdAt: '2024-03-10T10:00:00Z' },
  { id: 'd4', nome: 'Ana Oliveira', email: 'ana.oliveira@email.com', telefone: '(21) 99876-5432', documento: '456.789.123-00', tipo: 'PF', endereco: 'Rua Laranjeiras, 32 - Rio de Janeiro, RJ', ativo: false, createdAt: '2024-04-05T10:00:00Z' },
  { id: 'd5', nome: 'Farmácia Vida Saudável', email: 'contato@vidasaudavel.com', telefone: '(11) 4444-5555', documento: '98.765.432/0001-10', tipo: 'PJ', endereco: 'Av. Paulista, 1000 - São Paulo, SP', ativo: true, createdAt: '2024-05-12T10:00:00Z' },
];

export const mockBeneficiarios: Beneficiario[] = [
  { id: 'b1', nome: 'Família Souza', email: 'souza@email.com', telefone: '(11) 97777-8888', documento: '111.222.333-44', endereco: 'Comunidade Vila Nova, São Paulo, SP', prioridade: 'ALTA', tipo: 'FAMILIAR', observacoes: 'Família com 4 filhos pequenos', ativo: true, createdAt: '2024-01-20T10:00:00Z' },
  { id: 'b2', nome: 'Casa de Repouso Bem Viver', email: 'bemviver@email.com', telefone: '(11) 2222-3333', documento: '22.333.444/0001-55', endereco: 'Rua da Paz, 500 - São Paulo, SP', prioridade: 'MEDIA', tipo: 'INSTITUICAO', observacoes: 'Idosos carentes', ativo: true, createdAt: '2024-02-15T10:00:00Z' },
  { id: 'b3', nome: 'Carlos Mendes', email: 'carlos.mendes@email.com', telefone: '(11) 96666-7777', documento: '555.666.777-88', endereco: 'Rua Sete, 90 - São Paulo, SP', prioridade: 'CRITICA', tipo: 'INDIVIDUAL', observacoes: 'Desempregado, precisa de alimentos', ativo: true, createdAt: '2024-03-22T10:00:00Z' },
  { id: 'b4', nome: 'Abrigo Esperança', email: 'abrigo@email.com', telefone: '(11) 5555-6666', documento: '33.444.555/0001-66', endereco: 'Av. Norte, 200 - São Paulo, SP', prioridade: 'BAIXA', tipo: 'INSTITUICAO', ativo: false, createdAt: '2024-04-18T10:00:00Z' },
];

export const mockDoacoes: Doacao[] = [
  { id: 'do1', doadorId: 'd1', doadorNome: 'Maria Silva', beneficiarioId: 'b1', beneficiarioNome: 'Família Souza', descricao: 'Cesta básica completa', quantidade: 5, categoria: 'ALIMENTOS', data: '2024-05-01T10:00:00Z', status: 'ENTREGUE' },
  { id: 'do2', doadorId: 'd3', doadorNome: 'Supermercado Esperança LTDA', beneficiarioId: 'b2', beneficiarioNome: 'Casa de Repouso Bem Viver', descricao: 'Produtos de higiene e limpeza', quantidade: 20, categoria: 'OUTROS', data: '2024-05-10T10:00:00Z', status: 'PENDENTE' },
  { id: 'do3', doadorId: 'd5', doadorNome: 'Farmácia Vida Saudável', beneficiarioId: 'b3', beneficiarioNome: 'Carlos Mendes', descricao: 'Medicamentos básicos', quantidade: 10, categoria: 'MEDICAMENTOS', data: '2024-05-15T10:00:00Z', status: 'ENTREGUE' },
  { id: 'do4', doadorId: 'd2', doadorNome: 'João Santos', beneficiarioId: 'b1', beneficiarioNome: 'Família Souza', descricao: 'Roupas infantis', quantidade: 30, categoria: 'ROUPAS', data: '2024-05-20T10:00:00Z', status: 'PENDENTE' },
];

export const mockSolicitacoes: Solicitacao[] = [
  { id: 's1', beneficiarioId: 'b1', beneficiarioNome: 'Família Souza', descricao: 'Necessidade de cestas básicas mensais', categoria: 'ALIMENTOS', quantidade: 4, urgencia: 'ALTA', status: 'PENDENTE', createdAt: '2024-05-18T10:00:00Z' },
  { id: 's2', beneficiarioId: 'b3', beneficiarioNome: 'Carlos Mendes', descricao: 'Medicamentos para hipertensão', categoria: 'MEDICAMENTOS', quantidade: 2, urgencia: 'CRITICA', status: 'EM_ANALISE', createdAt: '2024-05-19T10:00:00Z' },
  { id: 's3', beneficiarioId: 'b2', beneficiarioNome: 'Casa de Repouso Bem Viver', descricao: 'Roupas de cama e banho', categoria: 'ROUPAS', quantidade: 15, urgencia: 'MEDIA', status: 'APROVADA', createdAt: '2024-05-12T10:00:00Z' },
  { id: 's4', beneficiarioId: 'b1', beneficiarioNome: 'Família Souza', descricao: 'Fraldas infantis', categoria: 'OUTROS', quantidade: 10, urgencia: 'ALTA', status: 'ATENDIDA', createdAt: '2024-04-28T10:00:00Z' },
  { id: 's5', beneficiarioId: 'b3', beneficiarioNome: 'Carlos Mendes', descricao: 'Ajuda financeira para aluguel', categoria: 'DINHEIRO', quantidade: 1, urgencia: 'CRITICA', status: 'REJEITADA', createdAt: '2024-05-05T10:00:00Z' },
];

export const mockOperadores: Operador[] = [
  { id: 'o1', nome: 'Patrícia Lima', email: 'patricia.lima@redesolidaria.org', telefone: '(11) 98888-1234', ativo: true, createdAt: '2024-01-10T10:00:00Z' },
  { id: 'o2', nome: 'Roberto Costa', email: 'roberto.costa@redesolidaria.org', telefone: '(11) 97777-5678', ativo: true, createdAt: '2024-02-08T10:00:00Z' },
  { id: 'o3', nome: 'Fernanda Dias', email: 'fernanda.dias@redesolidaria.org', telefone: '(11) 96666-9012', ativo: false, createdAt: '2024-03-15T10:00:00Z' },
];

export const mockAdmins: Admin[] = [
  { id: 'a1', nome: 'Administrador Principal', email: 'admin@redesolidaria.org', telefone: '(11) 90000-0000', ativo: true, createdAt: '2024-01-01T10:00:00Z' },
  { id: 'a2', nome: 'Coordenador Geral', email: 'coordenador@redesolidaria.org', telefone: '(11) 91111-1111', ativo: true, createdAt: '2024-01-05T10:00:00Z' },
];
