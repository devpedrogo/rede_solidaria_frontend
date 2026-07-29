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

export type CategoriaItem = 'ALIMENTACAO' | 'HIGIENE' | 'VESTUARIO' | 'SAUDE' | 'EDUCACAO' | 'OUTROS';
export type StatusItem = 'DISPONIVEL' | 'RESERVADO' | 'ESGOTADO';

export interface Doacao {
  id: string;
  nome: string;
  categoria: CategoriaItem;
  quantidade: number;
  status: StatusItem;
  data?: string;
  createdAt?: string;
}

export type StatusSolicitacao = 'PENDENTE' | 'APROVADA' | 'REJEITADA' | 'CONCLUIDA';

export interface Solicitacao {
  id: string | number;
  itemId: string | number;
  nomeItem: string;
  beneficiarioId: string | number;
  nomeBeneficiario: string;
  quantidade: number;
  justificativa: string;
  status: StatusSolicitacao;
  createdAt?: string;
}

export interface Operador {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  status: StatusUsuario;
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
