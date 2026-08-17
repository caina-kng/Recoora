import React, { useState } from 'react';
import { Download, Upload, FileText, X, Check, AlertCircle, RotateCcw, Trash2 } from 'lucide-react';
import { Subscription } from '../types';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptions: Subscription[];
  onImport: (subscriptions: Subscription[]) => void;
  onResetToSample: () => void;
  onClearAll: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  subscriptions,
  onImport,
  onResetToSample,
  onClearAll,
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(subscriptions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `recorra_assinaturas_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = ['Nome', 'Valor', 'Moeda', 'Ciclo', 'ProximaCobranca', 'Categoria', 'Status', 'Teste', 'Notas'];
    const rows = subscriptions.map((s) => [
      `"${s.name.replace(/"/g, '""')}"`,
      s.amount,
      s.currency,
      s.billingCycle,
      s.nextBillingDate,
      s.category,
      s.status,
      s.isTrial ? 'Sim' : 'Não',
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `recorra_assinaturas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

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
          setImportStatus('Dados importados com sucesso!');
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1200);
        } else {
          setImportStatus('Formato de arquivo JSON inválido.');
        }
      } catch (err) {
        setImportStatus('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="export-import-modal"
        className="relative w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Backup e Exportação de Dados
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Seus dados ficam salvos localmente com total privacidade.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {importStatus && (
          <div className="my-3 p-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-600" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="py-4 space-y-4">
          {/* Export Options */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Exportar Assinaturas
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <Download className="w-4 h-4 text-teal-600" />
                <span>Exportar JSON</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors"
              >
                <FileText className="w-4 h-4 text-sky-600" />
                <span>Exportar CSV / Excel</span>
              </button>
            </div>
          </div>

          {/* Import Option */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Restaurar / Importar Backup
            </h4>
            <label className="flex items-center justify-center gap-2 p-3.5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-400 bg-slate-50/50 dark:bg-slate-800/40 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Selecionar arquivo JSON para restaurar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset / Clear Data */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              type="button"
              onClick={() => {
                onResetToSample();
                onClose();
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar dados de exemplo iniciais</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Tem certeza que deseja apagar todas as assinaturas cadastradas?')) {
                  onClearAll();
                  onClose();
                }
              }}
              className="w-full py-2 px-3 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar todos os dados</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
