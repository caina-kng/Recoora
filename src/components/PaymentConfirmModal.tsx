import React, { useEffect } from 'react';
import { CheckCircle2, Calendar, ArrowRight, X, AlertCircle } from 'lucide-react';
import { Subscription } from '../types';
import { formatCurrency, formatDate, advanceBillingDate } from '../utils/calculations';
import { CATEGORIES } from '../data/categories';

interface PaymentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription | null;
  onConfirm: (sub: Subscription) => void;
}

export const PaymentConfirmModal: React.FC<PaymentConfirmModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onConfirm,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !subscription) return null;

  const categoryMeta = CATEGORIES[subscription.category] || CATEGORIES.outros;
  const nextCalculatedDate = advanceBillingDate(subscription.nextBillingDate, subscription.billingCycle);

  const cycleName =
    subscription.billingCycle === 'yearly'
      ? 'anual (+1 ano)'
      : subscription.billingCycle === 'weekly'
      ? 'semanal (+7 dias)'
      : 'mensal (+1 mês)';

  return (
    <div
      id="payment-confirm-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div
        id="payment-confirm-modal"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Icon */}
        <div className="flex items-start gap-4 mb-5">
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-900/60 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 id="payment-modal-title" className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
              Confirmar Pagamento do Ciclo
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Registre a quitação e atualize o cronograma da assinatura.
            </p>
          </div>
        </div>

        {/* Subscription Info Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 mb-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0 shadow-2xs"
                style={{ backgroundColor: subscription.color || categoryMeta.color }}
              >
                {subscription.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate">
                  {subscription.name}
                </h4>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {categoryMeta.label}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-base font-extrabold text-slate-900 dark:text-white block">
                {formatCurrency(subscription.amount)}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {subscription.billingCycle === 'yearly'
                  ? 'por ano'
                  : subscription.billingCycle === 'weekly'
                  ? 'por semana'
                  : 'por mês'}
              </span>
            </div>
          </div>
        </div>

        {/* Date Transition Card */}
        <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-900/50 mb-5">
          <div className="text-xs font-semibold text-teal-900 dark:text-teal-200 mb-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Atualização do próximo vencimento ({cycleName})</span>
          </div>

          <div className="flex items-center justify-between gap-2 text-center bg-white dark:bg-slate-900 p-3 rounded-xl border border-teal-100 dark:border-teal-900/40">
            <div className="flex-1">
              <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                Data Atual
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                {formatDate(subscription.nextBillingDate)}
              </span>
            </div>

            <div className="p-1 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>

            <div className="flex-1">
              <span className="block text-[10px] text-teal-600 dark:text-teal-400 uppercase font-semibold">
                Nova Data
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-teal-700 dark:text-teal-300">
                {formatDate(nextCalculatedDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Explanatory note */}
        <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            Ao confirmar, a data do próximo vencimento de <strong>{subscription.name}</strong> será avançada para <strong>{formatDate(nextCalculatedDate)}</strong>.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            id="btn-cancel-payment-confirm"
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            id="btn-submit-payment-confirm"
            type="button"
            onClick={() => {
              onConfirm(subscription);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-700/20 hover:shadow-lg transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar Pagamento</span>
          </button>
        </div>
      </div>
    </div>
  );
};
