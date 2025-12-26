
import React from 'react';
import { Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStatsProps {
  transactions: Transaction[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ transactions }) => {
  const active = transactions.filter(t => t.status !== 'CANCELADO');
  const totalReceita = active.reduce((acc, t) => acc + t.total, 0);
  const totalCopart = active.reduce((acc, t) => acc + t.coparticipacao, 0);
  const totalUti = active.reduce((acc, t) => acc + t.uti, 0);
  const totalMensalidade = active.reduce((acc, t) => acc + t.mensalidade, 0);

  const revenueComposition = [
    { name: 'Mensalidade', value: totalMensalidade },
    { name: 'Coparticipação', value: totalCopart },
    { name: 'UTI', value: totalUti },
    { name: 'Ajustes/Extra', value: active.reduce((acc, t) => acc + t.extra + t.ajuste, 0) },
  ];

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Faturamento Total', val: totalReceita, color: 'text-brand-600', icon: 'payments' },
          { label: 'Coparticipação', val: totalCopart, color: 'text-purple-600', icon: 'medical_services' },
          { label: 'UTI / Suporte', val: totalUti, color: 'text-blue-600', icon: 'emergency' },
          { label: 'Mensalidade Base', val: totalMensalidade, color: 'text-slate-600', icon: 'description' },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <span className="material-icons text-slate-300">{kpi.icon}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            </div>
            <h3 className={`text-xl font-black ${kpi.color}`}>{fmt(kpi.val)}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 h-80">
        <h4 className="text-sm font-bold uppercase text-slate-500 mb-6">Composição Financeira</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={revenueComposition}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" style={{ fontSize: '10px', fontWeight: 'bold' }} />
            <YAxis hide />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
