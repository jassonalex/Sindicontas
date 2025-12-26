
import React from 'react';
import { Transaction } from '../types';

interface ImportPreviewModalProps {
  data: Omit<Transaction, 'id' | 'dataLancamento'>[];
  competencia: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({ data, competencia, onConfirm, onCancel }) => {
  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
  
  const totalGeral = data.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[90vh] animate-[fadeIn_0.3s_ease-out]">
        <div className="px-6 py-5 border-b bg-slate-50 rounded-t-xl flex justify-between items-center">
          <div>
            <div className="flex items-center gap-3">
               <h3 className="text-xl font-black text-slate-800">Análise de Importação Concluída</h3>
               <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">IA Processed</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">Competência alvo: <span className="font-bold text-slate-700">{competencia}</span></p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
             <span className="material-icons text-3xl">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto bg-slate-100">
          <table className="w-full text-[10px] border-collapse bg-white">
            <thead className="bg-slate-200 sticky top-0 font-black uppercase text-slate-600 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 text-left">Plano</th>
                <th className="px-4 py-3 text-left">Mod.</th>
                <th className="px-4 py-3 text-left">Matricula</th>
                <th className="px-4 py-3 text-left">Nome do Beneficiário</th>
                <th className="px-4 py-3 text-right">Mensal.</th>
                <th className="px-4 py-3 text-right">Copart.</th>
                <th className="px-4 py-3 text-right">Extra</th>
                <th className="px-4 py-3 text-right">UTI</th>
                <th className="px-4 py-3 text-right">Ajuste</th>
                <th className="px-4 py-3 text-right bg-slate-800 text-white">Total</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((item, i) => (
                <tr key={i} className="hover:bg-brand-50/50 transition-colors group">
                  <td className="px-4 py-2.5 font-bold text-brand-700">{item.plano}</td>
                  <td className="px-4 py-2.5 text-slate-500">{item.modalidade}</td>
                  <td className="px-4 py-2.5">{item.matricula}</td>
                  <td className="px-4 py-2.5 font-black text-slate-700 uppercase truncate max-w-[200px]">{item.nome}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{fmt(item.mensalidade)}</td>
                  <td className="px-4 py-2.5 text-right text-purple-600 font-medium">{item.coparticipacao > 0 ? fmt(item.coparticipacao) : '-'}</td>
                  <td className="px-4 py-2.5 text-right text-blue-600 font-medium">{item.extra > 0 ? fmt(item.extra) : '-'}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{item.uti > 0 ? fmt(item.uti) : '-'}</td>
                  <td className="px-4 py-2.5 text-right font-medium">{item.ajuste > 0 ? fmt(item.ajuste) : '-'}</td>
                  <td className="px-4 py-2.5 text-right font-black bg-slate-50 group-hover:bg-slate-100">{fmt(item.total)}</td>
                  <td className="px-4 py-2.5 text-center">
                     <span className="text-[8px] font-black text-green-600 border border-green-200 px-1.5 py-0.5 rounded uppercase">{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-6 border-t flex flex-col md:flex-row justify-between items-center bg-white rounded-b-xl gap-4">
           <div className="flex items-center gap-8">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total de Registros</p>
                 <p className="text-2xl font-black text-slate-800">{data.length}</p>
              </div>
              <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor Total Consolidado</p>
                 <p className="text-2xl font-black text-brand-600">{fmt(totalGeral)}</p>
              </div>
           </div>
           
           <div className="flex gap-4">
              <button 
                onClick={onCancel} 
                className="px-6 py-3 text-slate-500 font-black uppercase text-[11px] hover:bg-slate-50 rounded-lg transition-all"
              >
                Descartar
              </button>
              <button 
                onClick={onConfirm} 
                className="px-10 py-3 bg-green-600 text-white font-black rounded-lg shadow-xl shadow-green-200 uppercase text-[11px] hover:bg-green-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <span className="material-icons text-sm">check_circle</span>
                Confirmar Importação
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
