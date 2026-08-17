import React from 'react';
import { Calendar, Check } from 'lucide-react';
import { Subscription } from '../types';
import { getDaysUntil, getRelativeDateLabel, formatCurrency, formatDate } from '../utils/calculations';
import { CATEGORIES } from '../data/categories';

interface UpcomingRenewalsProps {
  subscriptions: Subscription[];
  onMarkAsPaid: (id: string) => void;
  onEdit: (sub: Subscription) => void;
}

export const UpcomingRenewals: React.FC<UpcomingRenewalsProps> = ({
  subscriptions,
  onMarkAsPaid,
  onEdit,
}) => {
  // Sort active subscriptions by next billing date (nearest first)
  const upcomingList = subscriptions
    .filter((s) => s.status === 'active')
    .map((s) => ({
      ...s,
      daysUntil: getDaysUntil(s.nextBillingDate),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 6); // Top 6 upcoming renewals

  if (upcomingList.length === 0) {
    return null;
  }

  return (
    <div
      id="upcoming-renewals-card"
      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
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
          Cronograma imediato
        </span>
      </div>

      <div className="space-y-2.5">
        {upcomingList.map((sub) => {
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
                {/* Monogram/Avatar */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: sub.color || '#0d9488' }}
                >
                  {sub.name.charAt(0).toUpperCase()}
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

              {/* Amount and Urgency Badge + Quick Pay Action */}
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

                {/* Mark as paid button */}
                <button
                  type="button"
                  onClick={() => onMarkAsPaid(sub.id)}
                  title="Registrar pagamento e avançar para o próximo ciclo"
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-600 hover:border-teal-500 dark:hover:text-teal-400 transition-colors shadow-2xs"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
