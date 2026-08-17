import React from 'react';
import { Plus, Sun, Moon, Sparkles, Download, RefreshCw, Layers } from 'lucide-react';
import { SupportedCurrency, UserProfile } from '../types';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onOpenNewModal: () => void;
  onOpenExportImport: () => void;
  preferredCurrency: SupportedCurrency;
  setPreferredCurrency: (c: SupportedCurrency) => void;
  totalActiveCount: number;
  userProfile?: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  onOpenNewModal,
  onOpenExportImport,
  preferredCurrency,
  setPreferredCurrency,
  totalActiveCount,
  userProfile,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20 font-extrabold text-xl tracking-tight">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Recorra
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                  {totalActiveCount} ativas
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {userProfile?.name ? (
                  <>
                    Olá, <span className="font-semibold text-slate-700 dark:text-slate-300">{userProfile.name.split(' ')[0]}</span> &bull; Gestão inteligente de assinaturas
                  </>
                ) : (
                  'Gestão inteligente de assinaturas & recorrências'
                )}
              </p>
            </div>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Currency Selector */}
            <div className="relative">
              <select
                id="currency-selector"
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value as SupportedCurrency)}
                className="appearance-none bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-lg px-2.5 py-1.5 pr-6 cursor-pointer border border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
                title="Alterar moeda padrão"
              >
                <option value="BRL">R$ (BRL)</option>
                <option value="USD">$ (USD)</option>
                <option value="EUR">€ (EUR)</option>
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                ▼
              </span>
            </div>

            {/* Backup / Export Import */}
            <button
              id="btn-export-import"
              onClick={onOpenExportImport}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Backup e Exportação de Dados"
              aria-label="Backup e Exportação"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              )}
            </button>

            {/* Primary Action Button */}
            <button
              id="btn-new-subscription"
              onClick={onOpenNewModal}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="font-semibold">Nova Assinatura</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
