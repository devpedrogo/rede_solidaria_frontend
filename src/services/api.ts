import { api, isBackendDown } from './apiClient';
import { mockAdmins, mockBeneficiarios, mockDoacoes, mockDoadores, mockOperadores, mockSolicitacoes } from './mockData';
import type {
  Admin, AuthUser, Beneficiario, Doacao, Doador, Operador, Solicitacao,
} from '@/types';

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));

// ---------- AUTH ----------
export const authService = {
  async login(email: string, senha: string): Promise<AuthUser> {
    try {
      const { data } = await api.post('/auth/login', { email, senha });
      return {
        id: data.id ?? 'mock-id',
        nome: data.nome ?? email.split('@')[0],
        email: data.email ?? email,
        role: data.role ?? 'ROLE_OPERADOR',
        token: data.token ?? data.jwt ?? 'mock-jwt-token',
      };
    } catch (err) {
      if (isBackendDown(err)) {
        // Mock: admin@redesolidaria.org / operador@redesolidaria.org
        await delay(500);
        const isAdmin = email.toLowerCase().includes('admin');
        return {
          id: isAdmin ? 'a1' : 'o1',
          nome: isAdmin ? 'Administrador Principal' : 'Patrícia Lima',
          email,
          role: isAdmin ? 'ROLE_ADMIN' : 'ROLE_OPERADOR',
          token: 'mock-jwt-' + (isAdmin ? 'admin' : 'operador'),
        };
      }
      throw err;
    }
  },
};

// ---------- DOADORES ----------
export const doadoresService = {
  async list(): Promise<Doador[]> {
    try {
      const { data } = await api.get('/doadores');
      return Array.isArray(data) ? data : data.content ?? [];
    } catch (err) {
      if (isBackendDown(err)) { await delay(); return [...mockDoadores]; }
      throw err;
    }
  },
  async get(id: string): Promise<Doador> {
    try { const { data } = await api.get(`/doadores/${id}`); return data; }
    catch (err) { if (isBackendDown(err)) { await delay(); return mockDoadores.find((d) => d.id === id)!; } throw err; }
  },
  async create(payload: Partial<Doador>): Promise<Doador> {
    try { const { data } = await api.post('/doadores', payload); return data; }
    catch (err) { if (isBackendDown(err)) { await delay(); const novo: Doador = { id: 'd' + Date.now(), status: 'ATIVO', createdAt: new Date().toISOString(), nome:'', telefone:'', endereco:'', ...payload }; return novo; } throw err; }
  },
  async update(id: string, payload: Partial<Doador>): Promise<Doador> {
    try { const { data } = await api.put(`/doadores/${id}`, payload); return data; }
    catch (err) { if (isBackendDown(err)) { await delay(); return { ...mockDoadores.find((d) => d.id === id)!, ...payload }; } throw err; }
  },
  async remove(id: string): Promise<void> {
    try { await api.delete(`/doadores/${id}`); }
    catch (err) { if (isBackendDown(err)) { await delay(); return; } throw err; }
  },
};

// ---------- BENEFICIARIOS ----------
export const beneficiariosService = {
  async list(): Promise<Beneficiario[]> {
    try { const { data } = await api.get('/beneficiarios'); return Array.isArray(data) ? data : data.content ?? []; }
    catch (err) { if (isBackendDown(err)) { await delay(); return [...mockBeneficiarios]; } throw err; }
  },
  async get(id: string): Promise<Beneficiario> {
    try { const { data } = await api.get(`/beneficiarios/${id}`); return data; }
    catch (err) { if (isBackendDown(err)) { await delay(); return mockBeneficiarios.find((b) => b.id === id)!; } throw err; }
  },
  async create(payload: Partial<Beneficiario>): Promise<Beneficiario> {
    try { const { data } = await api.post('/beneficiarios', payload); return data; }
    catch (err) { if (isBackendDown(err)) { await delay(); const novo: Beneficiario = { id: 'b' + Date.now(), status: 'ATIVO', createdAt: new Date().toISOString(), nome:'', telefone:'', endereco:'', nivelPrioridade:'MEDIA', tipoBeneficiario:'FAMILIA', ...payload }; return novo; } throw err; }
  },
  async update(id: string, payload: Partial<Beneficiario>): Promise<Beneficiario> {
    try { const { data } = await api.put(`/beneficiarios/${id}`, payload); return data; }
    catch (err) { if (isBackendDown(err)) { await delay(); return { ...mockBeneficiarios.find((b) => b.id === id)!, ...payload }; } throw err; }
  },
  async remove(id: string): Promise<void> {
    try { await api.delete(`/beneficiarios/${id}`); }
    catch (err) { if (isBackendDown(err)) { await delay(); return; } throw err; }
  },
};

// ---------- DOACOES ----------
export interface DoacaoFilterParams {
  status?: string;
  categoria?: string;
  page?: number;
  size?: number;
}

export const doacoesService = {
  async list(params?: DoacaoFilterParams): Promise<any> {
    try {
      const cleanParams: Record<string, any> = {};
      if (params?.status && params.status !== 'all') cleanParams.status = params.status;
      if (params?.categoria && params.categoria !== 'all') cleanParams.categoria = params.categoria;
      if (params?.page !== undefined) cleanParams.page = params.page;
      if (params?.size !== undefined) cleanParams.size = params.size;

      const { data } = await api.get('/doacoes', { params: cleanParams });
      return data;
    } catch (err) {
      if (isBackendDown(err)) { 
        await delay(); 
        return { content: [...mockDoacoes], page: { totalElements: mockDoacoes.length } }; 
      }
      throw err;
    }
  },
  async get(id: string): Promise<Doacao> {
    try { const { data } = await api.get(`/doacoes/${id}`); return data; }
    catch (err) { if (isBackendDown(err)) { await delay(); return mockDoacoes.find((d) => d.id === id)!; } throw err; }
  },
  async create(payload: { nome: string; categoria: string; quantidadeDoada: number; doadorId: number }): Promise<Doacao> {
    try { const { data } = await api.post('/doacoes', payload); return data; }
    catch (err) { 
      if (isBackendDown(err)) { 
        await delay(); 
        const novo: any = { 
          id: 'do' + Date.now(), 
          nome: payload.nome,
          categoria: payload.categoria,
          quantidade: payload.quantidadeDoada,
          status: 'DISPONIVEL'
        }; 
        return novo; 
      } 
      throw err; 
    }
  },
};

// ---------- SOLICITACOES ----------
export const solicitacoesService = {
  async list(): Promise<Solicitacao[]> {
    try {
      const { data } = await api.get('/solicitacoes');
      return Array.isArray(data) ? data : data.content ?? [];
    } catch (err) {
      if (isBackendDown(err)) { await delay(); return [...mockSolicitacoes]; }
      throw err;
    }
  },
  async create(payload: { itemId: number; beneficiarioId: number; quantidadeSolicitada: number; justificativa: string }): Promise<Solicitacao> {
    try {
      const { data } = await api.post('/solicitacoes', payload);
      return data;
    } catch (err) {
      if (isBackendDown(err)) { await delay(); return { id: Date.now(), ...payload } as any; }
      throw err;
    }
  },
  async updateStatus(id: string | number, status: string): Promise<Solicitacao> {
    try {
      // Envia PATCH /solicitacoes/{id}/status com JSON { "status": "PENDENTE" }
      const { data } = await api.patch(`/solicitacoes/${id}/status`, { status });
      return data;
    } catch (err) {
      if (isBackendDown(err)) { await delay(); return { id, status } as any; }
      throw err;
    }
  },
};

// ---------- OPERADORES (ADMIN) ----------
export const operadoresService = {
  async list(): Promise<Operador[]> {
    try { const { data } = await api.get('/operadores'); return Array.isArray(data) ? data : data.content ?? []; }
    catch (err) { if (isBackendDown(err)) { await delay(); return [...mockOperadores]; } throw err; }
  },
  async get(id: string): Promise<Operador> {
    try { const { data } = await api.get(`/operadores/${id}`); return data; }
    catch (err) { if (isBackendDown(err)) { await delay(); return mockOperadores.find((o) => o.id === id)!; } throw err; }
  },
  async create(payload: Partial<Operador> & { senha?: string }): Promise<Operador> {
    try { const { data } = await api.post('/operadores', payload); return data; }
    catch (err) { if (isBackendDown(err)) { await delay(); const novo: Operador = { id: 'o' + Date.now(), ativo: true, createdAt: new Date().toISOString(), nome:'', email:'', telefone:'', ...payload }; return novo; } throw err; }
  },
  async update(id: string, payload: Partial<Operador>): Promise<Operador> {
    try { const { data } = await api.put(`/operadores/${id}`, payload); return data; }
    catch (err) { if (isBackendDown(err)) { await delay(); return { ...mockOperadores.find((o) => o.id === id)!, ...payload }; } throw err; }
  },
  async remove(id: string): Promise<void> {
    try { await api.delete(`/operadores/${id}`); }
    catch (err) { if (isBackendDown(err)) { await delay(); return; } throw err; }
  },
};

// ---------- ADMINS (ADMIN) ----------
export const adminsService = {
  async list(): Promise<Admin[]> {
    try {
      const { data } = await api.get('/admins');
      return Array.isArray(data) ? data : data.content ?? [];
    } catch (err) {
      if (isBackendDown(err)) {
        await delay();
        return [...mockAdmins];
      }
      throw err;
    }
  },

  async get(id: number | string): Promise<Admin> {
    try {
      const { data } = await api.get(`/admins/${id}`);
      return data;
    } catch (err) {
      if (isBackendDown(err)) {
        await delay();
        return mockAdmins.find((a) => String(a.id) === String(id))!;
      }
      throw err;
    }
  },

  async create(payload: Record<string, any>): Promise<Admin> {
    try {
      const { data } = await api.post('/admins', payload);
      return data;
    } catch (err) {
      if (isBackendDown(err)) {
        await delay();
        const novo: Admin = {
          id: Date.now() as any,
          status: 'ATIVO',
          ativo: true,
          createdAt: new Date().toISOString(),
          nome: '',
          email: '',
          telefone: '',
          ...(payload as any),
        };
        return novo;
      }
      throw err;
    }
  },

  async update(id: number | string, payload: Record<string, any>): Promise<Admin> {
    try {
      const { data } = await api.put(`/admins/${id}`, payload);
      return data;
    } catch (err) {
      if (isBackendDown(err)) {
        await delay();
        const target = mockAdmins.find((a) => String(a.id) === String(id))!;
        return { ...target, ...payload };
      }
      throw err;
    }
  },

  async remove(id: number | string): Promise<void> {
    try {
      await api.delete(`/admins/${id}`);
    } catch (err) {
      if (isBackendDown(err)) {
        await delay();
        return;
      }
      throw err;
    }
  },
};