import React from 'react';
import { Calendar, Check, Clock, PlusCircle } from 'lucide-react';
import { Subscription } from '../types';
import { getDaysUntil, getRelativeDateLabel, formatCurrency, formatDate } from '../utils/calculations';
import { CATEGORIES } from '../data/categories';

interface UpcomingRenewalsProps {
  subscriptions: Subscription[];
  onRequestPayment?: (sub: Subscription) => void;
  onEdit: (sub: Subscription) => void;
  onOpenNewModal?: () => void;
}

export const UpcomingRenewals: React.FC<UpcomingRenewalsProps> = ({
  subscriptions,
  onRequestPayment,
  onEdit,
  onOpenNewModal,
}) => {
  // Sort active subscriptions by next billing date (nearest first)
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const upcomingList = activeSubs
    .map((s) => ({
      ...s,
      daysUntil: getDaysUntil(s.nextBillingDate),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 10); // Show next 5 to 10 renewals (or all if < 5)

  // When there are 0 active subscriptions
  if (activeSubs.length === 0) {
    return (
      <div
        id="upcoming-renewals-card"
        className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Próximas Cobranças na Fila
            </h3>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Fila cronológica
          </span>
        </div>

        <div className="py-8 text-center px-4">
          <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nenhuma cobrança ativa no cronograma
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Cadastre suas assinaturas para acompanhar a ordem cronológica dos próximos vencimentos.
          </p>
          {onOpenNewModal && (
            <button
              type="button"
              onClick={onOpenNewModal}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Adicionar Assinatura</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      id="upcoming-renewals-card"
      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base leading-none">
              Próximas Cobranças na Fila
            </h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Próximos {upcomingList.length} {upcomingList.length === 1 ? 'vencimento' : 'vencimentos'} por data
            </span>
          </div>
        </div>
        <span className="text-xs text-teal-700 dark:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-100 dark:border-teal-900/40">
          {upcomingList.length} {upcomingList.length === 1 ? 'item' : 'itens'} na fila
        </span>
      </div>

      {/* If only 1 subscription exists, show the item plus an educational cue */}
      {upcomingList.length === 1 && (
        <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Cadastre mais assinaturas para visualizar uma fila cronológica ampliada.</span>
          {onOpenNewModal && (
            <button
              type="button"
              onClick={onOpenNewModal}
              className="text-teal-600 dark:text-teal-400 font-bold hover:underline ml-2 whitespace-nowrap"
            >
              + Adicionar
            </button>
          )}
        </div>
      )}

      {/* Chronological Queue (up to 10 items) */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {upcomingList.map((sub, index) => {
          const rel = getRelativeDateLabel(sub.daysUntil);
          const isUrgent = sub.daysUntil >= 0 && sub.daysUntil <= 3;
          const isWarning = sub.daysUntil > 3 && sub.daysUntil <= 7;
          const categoryMeta = CATEGORIES[sub.category];

          return (
            <div
              key={sub.id}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                onEdit(sub);
              }}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer group hover:border-teal-500/60 dark:hover:border-teal-500/60 ${
                isUrgent
                  ? 'border-amber-300 dark:border-amber-900/70 bg-amber-50/70 dark:bg-amber-950/30'
                  : isWarning
                  ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                  : 'border-slate-100 dark:border-slate-800/60 bg-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Queue position badge & Monogram */}
                <div className="relative">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: sub.color || '#0d9488' }}
                  >
                    {sub.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full bg-slate-800 dark:bg-slate-700 text-[9px] font-bold text-white flex items-center justify-center border border-white dark:border-slate-900">
                    {index + 1}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {sub.name}
                    </span>
                    {sub.isTrial && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        Teste
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatDate(sub.nextBillingDate)}</span>
                    <span>•</span>
                    <span className="capitalize">{categoryMeta?.label || sub.category}</span>
                  </div>
                </div>
              </div>

              {/* Amount and Urgency Badge + Confirm Payment Trigger */}
              <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                <div className="text-right">
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {formatCurrency(sub.amount)}
                  </div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight mt-0.5 ${
                      isUrgent
                        ? 'bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                        : isWarning
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {rel.label}
                  </span>
                </div>

                {/* Confirm pay button */}
                {onRequestPayment && (
                  <button
                    type="button"
                    onClick={() => onRequestPayment(sub)}
                    title="Confirmar pagamento do ciclo e atualizar data"
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:border-teal-500 dark:hover:text-teal-400 transition-colors shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
