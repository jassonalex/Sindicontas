
export interface Transaction {
  id: string;
  competencia: string; // YYYY-MM
  plano: string;
  modalidade: string;
  matricula: string;
  cpf: string;
  codigo: string; // Corresponds to "CODIGO" column
  nome: string;   // Corresponds to "NOME" column
  
  // Valores Financeiros
  mensalidade: number;
  coparticipacao: number;
  extra: number;
  uti: number;
  ajuste: number;
  total: number; // Calculated field
  
  observacao?: string;
  status: 'PAGO' | 'PENDENTE' | 'CANCELADO'; // Uppercase to match sheet aesthetics
  dataLancamento: string;
}

export interface MonthlyStats {
  totalReceita: number;
  totalCoparticipacao: number;
  count: number;
  averageTicket: number;
}

export enum AppView {
  DASHBOARD = 'dashboard',
  TRANSACTIONS = 'transactions',
  SETTINGS = 'settings'
}
