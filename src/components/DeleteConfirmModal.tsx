import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Subscription } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscription?: Subscription | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  subscription,
}) => {
  if (!isOpen || !subscription) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="delete-confirm-modal"
        className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-center animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Trash2 className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Excluir Assinatura?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Tem certeza de que deseja remover <strong className="text-slate-900 dark:text-slate-200">{subscription.name}</strong>? Os dados desta assinatura não serão mais contabilizados nos seus relatórios.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            id="btn-confirm-delete"
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors"
          >
            Sim, Excluir
          </button>
        </div>
      </div>
    </div>
  );
};
