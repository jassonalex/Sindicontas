import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const menuItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: 'dashboard' },
    { id: AppView.TRANSACTIONS, label: 'Lançamentos', icon: 'receipt_long' },
    { id: AppView.SETTINGS, label: 'Configurações', icon: 'settings' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white flex flex-col h-full no-print transition-all duration-300">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="material-icons text-brand-500">verified_user</span>
          PlanGestor
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              currentView === item.id
                ? 'bg-brand-600 text-white shadow-lg'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="material-icons">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
        v1.0.0 - Gestão SaaS
      </div>
    </div>
  );
};
