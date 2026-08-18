import React, { useState } from 'react';
import { Download, Upload, FileText, X, Check, AlertCircle, RotateCcw, Trash2, ShieldCheck, HardDriveDownload, Moon, Sun } from 'lucide-react';
import { Subscription, UserProfile } from '../types';
import { generateSubscriptionsPDF } from '../utils/pdfGenerator';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  userProfile?: UserProfile | null;
  theme?: 'light' | 'dark';
  onImport: (subscriptions: Subscription[]) => void;
  onResetToSample: () => void;
  onClearAll: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  userProfile = null,
  theme = 'light',
  onImport,
  onResetToSample,
  onClearAll,
}) => {
  const [importStatus, setImportStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  if (!isOpen) return null;

  const isDarkMode = theme === 'dark';

  // 1. Export PDF (Adapts automatically to current theme: Light or Dark)
  const handleExportPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const activeTheme: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
      generateSubscriptionsPDF(subscriptions, userProfile, activeTheme);
      setImportStatus({ 
        message: `Relatório em PDF gerado com sucesso no modo ${isDarkMode ? 'noturno' : 'claro'}!`, 
        type: 'success' 
      });
      setTimeout(() => setImportStatus(null), 3200);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setImportStatus({ message: 'Erro ao gerar relatório em PDF.', type: 'error' });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // 2. Technical Backup export
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(subscriptions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `recorra_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setImportStatus({ message: 'Arquivo de backup salvo no seu dispositivo!', type: 'success' });
    setTimeout(() => setImportStatus(null), 3000);
  };

  // 3. Restore from technical backup
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          onImport(parsed);
          setImportStatus({ message: `${parsed.length} assinaturas restauradas com sucesso!`, type: 'success' });
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1400);
        } else {
          setImportStatus({ message: 'Arquivo de backup com formato inválido.', type: 'error' });
        }
      } catch (err) {
        setImportStatus({ message: 'Erro ao processar o arquivo de backup.', type: 'error' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      id="export-import-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div
        id="export-import-modal"
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h3 id="export-modal-title" className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Relatório e Cópia de Segurança
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gere relatórios visuais formatados ou faça cópias de segurança de suas assinaturas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification */}
        {importStatus && (
          <div
            className={`my-3 p-3 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shrink-0 ${
              importStatus.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900/60'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900/60'
            }`}
          >
            {importStatus.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="py-4 space-y-4 overflow-y-auto pr-1">
          
          {/* PRIMARY HIGHLIGHT OPTION: Download PDF Report (With theme badge) */}
          <div>
            <button
              id="btn-export-pdf-report"
              type="button"
              onClick={handleExportPDF}
              disabled={isGeneratingPDF}
              className="w-full p-5 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white text-left transition-all group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer shadow-lg shadow-teal-600/20 border border-teal-500/40"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-xs text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform border border-white/20">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <h4 className="text-base font-bold tracking-tight">
                      Baixar Relatório em PDF
                    </h4>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white border border-white/25">
                      {isDarkMode ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                      <span>{isDarkMode ? 'Tema Noturno' : 'Tema Claro'}</span>
                    </span>
                  </div>
                  <p className="text-xs text-teal-100 mt-1 leading-relaxed max-w-sm">
                    Relatório visual formatado automaticamente no modo {isDarkMode ? 'noturno' : 'claro'}, com resumo mensal, projeção anual, divisão por categorias e tabela completa.
                  </p>
                </div>
              </div>
              <div className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-teal-900 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 shadow-xs group-hover:bg-teal-50 transition-colors">
                <Download className="w-4 h-4" />
                <span>{isGeneratingPDF ? 'Gerando...' : 'Baixar PDF'}</span>
              </div>
            </button>
          </div>

          {/* VISUAL DIVIDER */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                Cópia de Segurança
              </span>
            </div>
          </div>

          {/* DISCREET BACKUP & RESTORATION SECTION (No technical JSON jargon) */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-start gap-2.5">
              <HardDriveDownload className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Backup dos seus Dados
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  Esse backup serve para você não perder seus dados caso troque de aparelho ou limpe o navegador. Guarde o arquivo baixado em um lugar seguro.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* Button: Backup my data */}
              <button
                id="btn-backup-data"
                type="button"
                onClick={handleExportBackup}
                className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Fazer backup dos meus dados</span>
              </button>

              {/* Button: Restore previous backup */}
              <label className="py-2.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs text-center">
                <Upload className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Restaurar backup anterior</span>
                <input
                  id="file-upload-backup-input"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* BOTTOM ACTIONS: Reset to Sample / Clear All */}
          <div className="pt-2 space-y-1.5">
            <button
              id="btn-restore-sample-data"
              type="button"
              onClick={() => {
                onResetToSample();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar dados de exemplo iniciais</span>
            </button>

            <button
              id="btn-clear-all-data"
              type="button"
              onClick={() => {
                if (confirm('Tem certeza que deseja apagar todas as assinaturas cadastradas? Esta ação não pode ser desfeita.')) {
                  onClearAll();
                  onClose();
                }
              }}
              className="w-full py-2 px-3 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50/70 dark:hover:bg-rose-950/30 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar todos os dados</span>
            </button>
          </div>

        </div>

        {/* Privacy Note Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Privacidade total: todos os dados permanecem salvos no seu dispositivo.</span>
        </div>

      </div>
    </div>
  );
};
