import React from 'react';
import { Plus, Sun, Moon, Download } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onOpenNewModal: () => void;
  onOpenExportImport: () => void;
  onOpenAccountModal: () => void;
  totalActiveCount: number;
  userProfile?: UserProfile | null;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  toggleTheme,
  onOpenNewModal,
  onOpenExportImport,
  onOpenAccountModal,
  totalActiveCount,
  userProfile,
}) => {
  const userInitial = userProfile?.name?.trim() ? userProfile.name.trim().charAt(0).toUpperCase() : 'U';
  const firstName = userProfile?.name?.trim() ? userProfile.name.trim().split(' ')[0] : 'Usuário';

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* DESKTOP HEADER (sm:flex) */}
        <div className="hidden sm:flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20 font-extrabold text-xl tracking-tight shrink-0">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Recorra
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                  {totalActiveCount} ativas
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {userProfile?.name ? (
                  <>
                    Olá, <span className="font-semibold text-slate-700 dark:text-slate-300">{firstName}</span> &bull; Gestão de assinaturas em Reais (R$)
                  </>
                ) : (
                  'Gestão inteligente de assinaturas & recorrências em Real (R$)'
                )}
              </p>
            </div>
          </div>

          {/* Desktop Actions & Utilities */}
          <div className="flex items-center gap-2.5 lg:gap-3">
            
            {/* Backup / Export Import */}
            <button
              id="btn-export-import"
              onClick={onOpenExportImport}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Backup e Exportação de Dados"
              aria-label="Backup e Exportação"
            >
              <Download className="w-5 h-5" />
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
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* Account / Profile Button */}
            <button
              id="btn-account-profile-desktop"
              onClick={onOpenAccountModal}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              title="Minha Conta e Perfil"
            >
              <div className="w-6 h-6 rounded-lg bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {userInitial}
              </div>
              <span className="max-w-[90px] truncate">{firstName}</span>
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

        {/* MOBILE HEADER (sm:hidden) - Balanced multi-line structure */}
        <div className="sm:hidden py-2.5 space-y-2.5">
          
          {/* Mobile Line 1: Logo + "Recorra" Title + Profile Account Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20 font-extrabold text-lg tracking-tight shrink-0">
                R
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  Recorra
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800 shrink-0">
                  {totalActiveCount} ativas
                </span>
              </div>
            </div>

            {/* Mobile Profile / Minha Conta Button */}
            <button
              id="btn-account-profile-mobile"
              onClick={onOpenAccountModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold active:bg-slate-200 dark:active:bg-slate-700 transition-colors border border-slate-200/60 dark:border-slate-700/60 shrink-0"
              title="Acessar Minha Conta"
            >
              <div className="w-5 h-5 rounded-md bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {userInitial}
              </div>
              <span className="text-xs">{firstName}</span>
            </button>
          </div>

          {/* Mobile Line 2: Utilities (Backup and Theme toggle balanced) */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Valores em Real (R$)
            </span>

            {/* Utility Actions Group */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-export-import-mobile"
                onClick={onOpenExportImport}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-slate-800 transition-colors flex items-center gap-1 px-2.5 text-xs font-medium"
                title="Backup e Exportação"
                aria-label="Backup"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup</span>
              </button>

              <button
                id="theme-toggle-btn-mobile"
                onClick={toggleTheme}
                className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg bg-slate-100 dark:bg-slate-800 transition-colors flex items-center gap-1 px-2.5 text-xs font-medium"
                title={theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-600" />
                    <span>Escuro</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Line 3: Full-width "Nova Assinatura" Button */}
          <button
            id="btn-new-subscription-mobile"
            onClick={onOpenNewModal}
            className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Assinatura</span>
          </button>

        </div>

      </div>
    </header>
  );
};

