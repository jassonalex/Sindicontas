
import React, { useState, useMemo, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Sidebar } from './components/Sidebar';
import { DashboardStats } from './components/DashboardStats';
import { TransactionForm } from './components/TransactionForm';
import { ImportPreviewModal } from './components/ImportPreviewModal';
import { MOCK_TRANSACTIONS } from './constants';
import { Transaction, AppView } from './types';
import { analyzeFinancials, parseImportDataInChunks } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.TRANSACTIONS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [filterCompetencia, setFilterCompetencia] = useState<string>(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<{current: number, total: number} | null>(null);
  const [previewData, setPreviewData] = useState<Omit<Transaction, 'id' | 'dataLancamento'>[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesCompetencia = t.competencia === filterCompetencia;
      const matchesSearch = t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.cpf.includes(searchTerm) ||
                            t.matricula.includes(searchTerm);
      return matchesCompetencia && matchesSearch;
    });
  }, [transactions, filterCompetencia, searchTerm]);

  const handleAddTransaction = (data: Omit<Transaction, 'id' | 'dataLancamento'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      dataLancamento: new Date().toISOString().split('T')[0]
    };
    setTransactions(prev => [newTransaction, ...prev]);
    setIsFormOpen(false);
  };

  const handleEditTransaction = (data: Omit<Transaction, 'id' | 'dataLancamento'>) => {
    if (!editingTransaction) return;
    setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...data } : t));
    setEditingTransaction(undefined);
    setIsFormOpen(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportProgress({ current: 0, total: 1 });
    const text = await file.text();
    
    try {
      const parsedData = await parseImportDataInChunks(text, filterCompetencia, (current, total) => {
        setImportProgress({ current, total });
      });
      
      if (parsedData.length === 0) {
        alert("Nenhum dado foi extraído. Verifique o formato do arquivo.");
      } else {
        setPreviewData(parsedData);
        setIsPreviewOpen(true);
      }
    } catch (error) {
      alert("Erro crítico na leitura via IA.");
    } finally {
      setImportProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fmtMoney = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 no-print">
          <div className="flex items-center gap-4">
            <input type="month" value={filterCompetencia} onChange={(e) => setFilterCompetencia(e.target.value)} className="bg-slate-100 border-none rounded-lg text-sm font-bold p-2" />
            <input type="text" placeholder="Buscar por nome ou CPF..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm w-64" />
          </div>
          <div className="flex items-center gap-3">
             <div className="relative overflow-hidden">
                <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={!!importProgress} />
                <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${importProgress ? 'bg-slate-200 text-slate-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                   <span className={`material-icons text-sm ${importProgress ? 'animate-spin' : 'text-green-600'}`}>
                      {importProgress ? 'sync' : 'upload_file'}
                   </span>
                   {importProgress ? `Lendo Lote ${importProgress.current}/${importProgress.total}` : 'Importar TXT/CSV'}
                </button>
             </div>
             <button onClick={() => { setEditingTransaction(undefined); setIsFormOpen(true); }} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-brand-700 transition-all">
                Novo Lançamento
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {currentView === AppView.DASHBOARD && <DashboardStats transactions={filteredTransactions} />}
          {currentView === AppView.TRANSACTIONS && (
            <div className="space-y-6">
               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse min-w-[1200px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase">
                          <th className="px-4 py-3 sticky left-0 bg-slate-50 shadow-sm">PLANO</th>
                          <th className="px-4 py-3">MODALIDADE</th>
                          <th className="px-4 py-3">MATRÍCULA</th>
                          <th className="px-4 py-3">CPF</th>
                          <th className="px-4 py-3">CÓDIGO</th>
                          <th className="px-4 py-3">NOME</th>
                          <th className="px-4 py-3 text-right">MENSALIDADE</th>
                          <th className="px-4 py-3 text-right">COPART.</th>
                          <th className="px-4 py-3 text-right">EXTRA</th>
                          <th className="px-4 py-3 text-right">UTI</th>
                          <th className="px-4 py-3 text-right">AJUSTE</th>
                          <th className="px-4 py-3 text-right font-bold text-slate-800 bg-slate-100">TOTAL</th>
                          <th className="px-4 py-3 text-center">STATUS</th>
                          <th className="px-4 py-3 text-center no-print">AÇÕES</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={14} className="px-4 py-12 text-center text-slate-400 italic font-medium">Nenhum registro encontrado para esta competência.</td>
                          </tr>
                        ) : (
                          filteredTransactions.map(t => (
                            <tr key={t.id} className="hover:bg-blue-50/40 transition-colors">
                              <td className="px-4 py-3 sticky left-0 bg-white font-bold">{t.plano}</td>
                              <td className="px-4 py-3">{t.modalidade}</td>
                              <td className="px-4 py-3">{t.matricula}</td>
                              <td className="px-4 py-3 font-mono">{t.cpf}</td>
                              <td className="px-4 py-3 text-slate-400">{t.codigo}</td>
                              <td className="px-4 py-3 font-bold text-slate-700 uppercase">{t.nome}</td>
                              <td className="px-4 py-3 text-right">{fmtMoney(t.mensalidade)}</td>
                              <td className="px-4 py-3 text-right text-purple-600">{t.coparticipacao > 0 ? fmtMoney(t.coparticipacao) : '-'}</td>
                              <td className="px-4 py-3 text-right">{t.extra > 0 ? fmtMoney(t.extra) : '-'}</td>
                              <td className="px-4 py-3 text-right">{t.uti > 0 ? fmtMoney(t.uti) : '-'}</td>
                              <td className="px-4 py-3 text-right">{t.ajuste > 0 ? fmtMoney(t.ajuste) : '-'}</td>
                              <td className="px-4 py-3 text-right font-black bg-slate-50">{fmtMoney(t.total)}</td>
                              <td className="px-4 py-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${t.status === 'PAGO' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {t.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center no-print">
                                 <div className="flex justify-center gap-1">
                                    <button onClick={() => { setEditingTransaction(t); setIsFormOpen(true); }} className="text-brand-600 hover:bg-brand-50 p-1 rounded">
                                       <span className="material-icons text-sm">edit</span>
                                    </button>
                                    <button onClick={() => { if(confirm('Excluir?')) setTransactions(prev => prev.filter(x => x.id !== t.id)) }} className="text-red-400 hover:bg-red-50 p-1 rounded">
                                       <span className="material-icons text-sm">delete</span>
                                    </button>
                                 </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}
        </div>
      </main>

      {isFormOpen && (
        <TransactionForm 
          initialData={editingTransaction} 
          currentCompetencia={filterCompetencia} 
          onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction} 
          onCancel={() => { setIsFormOpen(false); setEditingTransaction(undefined); }} 
        />
      )}
      
      {isPreviewOpen && (
        <ImportPreviewModal 
          data={previewData} 
          competencia={filterCompetencia} 
          onConfirm={() => { 
            const newRecords = previewData.map(d => ({ 
              ...d, 
              id: Math.random().toString(36).substr(2,9), 
              dataLancamento: new Date().toISOString().split('T')[0] 
            }));
            setTransactions(prev => [...newRecords, ...prev]); 
            setIsPreviewOpen(false); 
            setPreviewData([]); 
          }} 
          onCancel={() => { setIsPreviewOpen(false); setPreviewData([]); }} 
        />
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find root');
createRoot(rootElement).render(<App />);
