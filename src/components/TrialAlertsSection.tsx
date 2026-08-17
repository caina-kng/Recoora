import React from 'react';
import { Sparkles, Clock, AlertCircle, ArrowUpRight, Check, XCircle } from 'lucide-react';
import { Subscription, SupportedCurrency } from '../types';
import { getDaysUntil, formatCurrency, formatDate } from '../utils/calculations';

interface TrialAlertsSectionProps {
  subscriptions: Subscription[];
  preferredCurrency: SupportedCurrency;
  convertFn?: (amount: number, from: SupportedCurrency, to: SupportedCurrency) => number;
  onConvertTrial: (id: string) => void;
  onCancelSubscription: (id: string) => void;
  onEdit: (sub: Subscription) => void;
}

export const TrialAlertsSection: React.FC<TrialAlertsSectionProps> = ({
  subscriptions,
  preferredCurrency,
  convertFn,
  onConvertTrial,
  onCancelSubscription,
  onEdit,
}) => {
  const trialSubs = subscriptions.filter((s) => s.isTrial && s.status !== 'cancelled');

  if (trialSubs.length === 0) {
    return null;
  }

  return (
    <div
      id="trial-alerts-section"
      className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 via-purple-50/50 to-indigo-50/40 dark:from-purple-950/40 dark:via-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-900/60 shadow-xs"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-purple-950 dark:text-purple-100 text-base">
              Períodos de Teste Grátis (Free Trials)
            </h3>
            <p className="text-xs text-purple-800/80 dark:text-purple-300/80">
              Acompanhe quando os testes virarão cobrança automática para evitar surpresas.
            </p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-200/80 dark:bg-purple-900/80 text-purple-900 dark:text-purple-200">
          {trialSubs.length} {trialSubs.length === 1 ? 'teste ativo' : 'testes ativos'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {trialSubs.map((sub) => {
          const expirationDate = sub.trialEndsAt || sub.nextBillingDate;
          const daysLeft = getDaysUntil(expirationDate);
          const isUrgent = daysLeft >= 0 && daysLeft <= 3;

          const rawCurrency = sub.currency || preferredCurrency;
          const isConverted = rawCurrency !== preferredCurrency;
          const convertedAmount = convertFn ? convertFn(sub.amount, rawCurrency, preferredCurrency) : sub.amount;

          return (
            <div
              key={sub.id}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                onEdit(sub);
              }}
              className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 shadow-xs flex flex-col justify-between cursor-pointer hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: sub.color || '#9333EA' }}
                  >
                    {sub.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {sub.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Fim do teste: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(expirationDate)}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                    isUrgent
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                  }`}
                >
                  {daysLeft <= 0
                    ? 'Termina hoje!'
                    : daysLeft === 1
                    ? 'Resta 1 dia'
                    : `Restam ${daysLeft} dias`}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs mb-3 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Cobrança após o teste:
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-right">
                  {formatCurrency(convertedAmount, preferredCurrency)}
                  {isConverted && (
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-1 font-normal">
                      ({formatCurrency(sub.amount, rawCurrency)})
                    </span>
                  )}{' '}
                  / {sub.billingCycle === 'yearly' ? 'ano' : sub.billingCycle === 'weekly' ? 'semana' : 'mês'}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onConvertTrial(sub.id);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirmar Assinatura</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancelSubscription(sub.id);
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors"
                  title="Cancelar para não ser cobrado"
                >
                  <XCircle className="w-3.5 h-3.5 inline mr-1" />
                  <span>Cancelar Teste</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(sub);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Ver detalhes"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
