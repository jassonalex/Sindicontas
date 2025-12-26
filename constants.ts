
import { Transaction } from './types';

export const PLAN_OPTIONS = ['315', '5295'];
export const MODALIDADE_OPTIONS = ['3358', '001', '054', '066', '090'];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    competencia: '2023-10',
    plano: '315',
    modalidade: '3358',
    matricula: '3702405',
    cpf: '553.441.244-15',
    codigo: '0033.03.03358.00012-0',
    nome: 'ALBERTO DE OLIVEIRA ALVES',
    mensalidade: 2187.81,
    coparticipacao: 0,
    extra: 0,
    uti: 85.06,
    ajuste: 0,
    total: 2272.87,
    status: 'PAGO',
    dataLancamento: '2023-10-05'
  },
  {
    id: '2',
    competencia: '2023-10',
    plano: '315',
    modalidade: '3358',
    matricula: '3700666',
    cpf: '185.773.184-00',
    codigo: '0033.03.03358.00014-7',
    nome: 'JOAO MANOEL DA SILVA',
    mensalidade: 886.74,
    coparticipacao: 0,
    extra: 0,
    uti: 81.29,
    ajuste: 0,
    total: 968.03,
    status: 'PAGO',
    dataLancamento: '2023-10-05'
  }
];
