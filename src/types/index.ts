export type Role = 'ROLE_OPERADOR' | 'ROLE_ADMIN';

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: Role;
  token: string;
}

export interface Doador {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  tipo: 'PF' | 'PJ';
  endereco?: string;
  ativo: boolean;
  createdAt: string;
}

export interface Beneficiario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  documento: string;
  endereco: string;
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  tipo: 'INDIVIDUAL' | 'FAMILIAR' | 'INSTITUICAO';
  observacoes?: string;
  ativo: boolean;
  createdAt: string;
}

export interface Doacao {
  id: string;
  doadorId: string;
  doadorNome: string;
  beneficiarioId: string;
  beneficiarioNome: string;
  descricao: string;
  quantidade: number;
  categoria: 'ALIMENTOS' | 'ROUPAS' | 'MEDICAMENTOS' | 'DINHEIRO' | 'OUTROS';
  data: string;
  status: 'PENDENTE' | 'ENTREGUE' | 'CANCELADA';
}

export interface Solicitacao {
  id: string;
  beneficiarioId: string;
  beneficiarioNome: string;
  descricao: string;
  categoria: 'ALIMENTOS' | 'ROUPAS' | 'MEDICAMENTOS' | 'DINHEIRO' | 'OUTROS';
  quantidade: number;
  urgencia: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  status: 'PENDENTE' | 'EM_ANALISE' | 'APROVADA' | 'REJEITADA' | 'ATENDIDA';
  createdAt: string;
}

export interface Operador {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  createdAt: string;
}

export interface Admin {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  createdAt: string;
}
