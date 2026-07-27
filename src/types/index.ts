export type Role = 'ROLE_OPERADOR' | 'ROLE_ADMIN';

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: Role;
  token: string;
}
export type StatusUsuario = 'ATIVO' | 'INATIVO';

export interface Doador {
  id: string;
  nome: string;
  telefone?: string;
  endereco?: string;
  status: StatusUsuario;
  createdAt?: string;
}

export type TipoBeneficiario = 'FAMILIA' | 'ONG' | 'ESCOLA' | 'ABRIGO';
export type NivelPrioridade = 'CRITICA' | 'URGENTE' | 'MEDIA' | 'BAIXA';

export interface Beneficiario {
  id: string;
  nome: string;
  telefone?: string;
  endereco?: string;
  tipoBeneficiario: TipoBeneficiario;
  nivelPrioridade: NivelPrioridade;
  status: StatusUsuario;
  createdAt?: string;
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
