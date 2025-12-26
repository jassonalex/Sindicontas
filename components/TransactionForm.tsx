
import React, { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { PLAN_OPTIONS, MODALIDADE_OPTIONS } from '../constants';

interface TransactionFormProps {
  initialData?: Transaction;
  currentCompetencia: string;
  onSubmit: (data: Omit<Transaction, 'id' | 'dataLancamento'>) => void;
  onCancel: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ initialData, currentCompetencia, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    competencia: currentCompetencia,
    plano: '',
    modalidade: '',
    matricula: '',
    cpf: '',
    codigo: '',
    nome: '',
    mensalidade: 0,
    coparticipacao: 0,
    extra: 0,
    uti: 0,
    ajuste: 0,
    total: 0,
    observacao: '',
    status: 'PENDENTE' as 'PAGO' | 'PENDENTE' | 'CANCELADO',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        competencia: initialData.competencia,
        plano: initialData.plano,
        modalidade: initialData.modalidade,
        matricula: initialData.matricula,
        cpf: initialData.cpf,
        codigo: initialData.codigo,
        nome: initialData.nome,
        mensalidade: initialData.mensalidade,
        coparticipacao: initialData.coparticipacao,
        extra: initialData.extra,
        uti: initialData.uti,
        ajuste: initialData.ajuste,
        total: initialData.total,
        observacao: initialData.observacao || '',
        status: initialData.status,
      });
    } else {
        setFormData(prev => ({ ...prev, competencia: currentCompetencia }));
    }
  }, [initialData, currentCompetencia]);

  useEffect(() => {
    const total = 
      Number(formData.mensalidade || 0) +
      Number(formData.coparticipacao || 0) +
      Number(formData.extra || 0) +
      Number(formData.uti || 0) +
      Number(formData.ajuste || 0);
    
    setFormData(prev => ({ ...prev, total: parseFloat(total.toFixed(2)) }));
  }, [formData.mensalidade, formData.coparticipacao, formData.extra, formData.uti, formData.ajuste]);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMaskCPF = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    handleChange('cpf', v);
  };

  const inputClassName = "w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none shadow-sm transition-all";
  const labelClassName = "block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-tighter";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden animate-[fadeIn_0.2s_ease-out] my-8 ring-1 ring-slate-900/5">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="material-icons text-brand-600">{initialData ? 'edit' : 'add_chart'}</span>
            Lançamento de Valores
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className={labelClassName}>Competência</label>
              <input type="month" required value={formData.competencia} onChange={e => handleChange('competencia', e.target.value)} className={inputClassName} />
            </div>
            <div className="md:col-span-1">
              <label className={labelClassName}>Status</label>
              <select value={formData.status} onChange={e => handleChange('status', e.target.value)} className={inputClassName}>
                <option value="PENDENTE">PENDENTE</option>
                <option value="PAGO">PAGO</option>
                <option value="CANCELADO">CANCELADO</option>
              </select>
            </div>
            <div className="md:col-span-1">
              <label className={labelClassName}>Plano</label>
              <input list="planos" value={formData.plano} onChange={e => handleChange('plano', e.target.value)} className={inputClassName} />
              <datalist id="planos">{PLAN_OPTIONS.map(opt => <option key={opt} value={opt} />)}</datalist>
            </div>
            <div className="md:col-span-1">
              <label className={labelClassName}>Modalidade</label>
              <input list="modalidades" value={formData.modalidade} onChange={e => handleChange('modalidade', e.target.value)} className={inputClassName} />
              <datalist id="modalidades">{MODALIDADE_OPTIONS.map(opt => <option key={opt} value={opt} />)}</datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
             <div className="md:col-span-2">
                <label className={labelClassName}>Nome (Titular)</label>
                <input type="text" required value={formData.nome} onChange={e => handleChange('nome', e.target.value)} className={inputClassName} placeholder="NOME DO BENEFICIÁRIO" />
             </div>
             <div>
                <label className={labelClassName}>CPF</label>
                <input type="text" required value={formData.cpf} onChange={e => handleMaskCPF(e.target.value)} className={inputClassName} placeholder="000.000.000-00" />
             </div>
             <div>
                <label className={labelClassName}>Matrícula</label>
                <input type="text" required value={formData.matricula} onChange={e => handleChange('matricula', e.target.value)} className={inputClassName} />
             </div>
             <div className="md:col-span-2">
                <label className={labelClassName}>Código</label>
                <input type="text" value={formData.codigo} onChange={e => handleChange('codigo', e.target.value)} className={inputClassName} placeholder="Ex: 0033.03..." />
             </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg grid grid-cols-2 md:grid-cols-5 gap-4 border border-slate-200">
             <div>
                <label className={labelClassName}>Mensalidade</label>
                <input type="number" step="0.01" value={formData.mensalidade} onChange={e => handleChange('mensalidade', parseFloat(e.target.value) || 0)} className={inputClassName} />
             </div>
             <div>
                <label className={labelClassName}>Coparticipação</label>
                <input type="number" step="0.01" value={formData.coparticipacao} onChange={e => handleChange('coparticipacao', parseFloat(e.target.value) || 0)} className={inputClassName} />
             </div>
             <div>
                <label className={labelClassName}>Extra</label>
                <input type="number" step="0.01" value={formData.extra} onChange={e => handleChange('extra', parseFloat(e.target.value) || 0)} className={inputClassName} />
             </div>
             <div>
                <label className={labelClassName}>UTI</label>
                <input type="number" step="0.01" value={formData.uti} onChange={e => handleChange('uti', parseFloat(e.target.value) || 0)} className={inputClassName} />
             </div>
             <div>
                <label className={labelClassName}>Ajuste</label>
                <input type="number" step="0.01" value={formData.ajuste} onChange={e => handleChange('ajuste', parseFloat(e.target.value) || 0)} className={inputClassName} />
             </div>
          </div>

          <div className="flex items-center justify-between bg-brand-600 text-white p-4 rounded-lg shadow-inner">
             <span className="font-black uppercase text-xs tracking-widest">Total Geral</span>
             <span className="text-3xl font-black">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.total)}
             </span>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={onCancel} className="px-5 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" className="px-8 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow-lg">Salvar Lançamento</button>
          </div>
        </form>
      </div>
    </div>
  );
};
