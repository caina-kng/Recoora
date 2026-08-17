import React from 'react';
import {
  CreditCard,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Sparkles,
  Check,
  CheckCircle2,
  PauseCircle,
  ChevronRight,
} from 'lucide-react';
import { Subscription, SupportedCurrency } from '../types';
import {
  calculateTotals,
  formatCurrency,
  getDaysUntil,
  getRelativeDateLabel,
  formatDate,
} from '../utils/calculations';
import { CATEGORIES } from '../data/categories';

interface DashboardSummaryProps {
  subscriptions: Subscription[];
  preferredCurrency: SupportedCurrency;
  onFilterByStatus?: (status: string) => void;
  onFilterByTrial?: () => void;
  onFilterByUrgent?: () => void;
  onEdit?: (sub: Subscription) => void;
  onMarkAsPaid?: (id: string) => void;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  subscriptions,
  preferredCurrency,
  onFilterByStatus,
  onFilterByTrial,
  onFilterByUrgent,
  onEdit,
  onMarkAsPaid,
}) => {
  const { monthlyTotal, yearlyTotal, activeCount, pausedCount, trialCount, totalCount } =
    calculateTotals(subscriptions);

  // Urgent renewals (active & due in 3 days or less)
  const urgentCount = subscriptions.filter((s) => {
    if (s.status !== 'active') return false;
    const days = getDaysUntil(s.nextBillingDate);
    return days >= 0 && days <= 3;
  }).length;

  // Find next upcoming renewal (earliest active subscription)
  const upcomingSubscriptions = subscriptions
    .filter((s) => s.status === 'active')
    .map((s) => ({
      ...s,
      daysUntil: getDaysUntil(s.nextBillingDate),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil);

  const nextRenewal = upcomingSubscriptions.length > 0 ? upcomingSubscriptions[0] : null;
  const nextRenewalRel = nextRenewal ? getRelativeDateLabel(nextRenewal.daysUntil) : null;
  const nextRenewalCategory = nextRenewal ? CATEGORIES[nextRenewal.category] : null;

  // Monthly savings from paused subscriptions
  const pausedSavings = subscriptions
    .filter((s) => s.status === 'paused')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <section className="space-y-4">
      {/* Top Banner Alert if renewals or trials are urgent */}
      {urgentCount > 0 && (
        <div
          id="urgent-renewals-banner"
          className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-sm shadow-xs animate-in fade-in duration-300"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-amber-950 dark:text-amber-100">
                {urgentCount} {urgentCount === 1 ? 'cobrança prevista' : 'cobranças previstas'} nos próximos 3 dias!
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                Verifique se deseja manter ou pausar antes da renovação automática.
              </p>
            </div>
          </div>
          <button
            id="btn-view-urgents"
            type="button"
            onClick={() => {
              if (onFilterByUrgent) {
                onFilterByUrgent();
              } else {
                onFilterByStatus?.('urgent');
              }
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-200/80 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 hover:bg-amber-300 dark:hover:bg-amber-800 transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <span>Ver urgentes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Metric Cards Grid (3 Cards: Mensal Total, Projeção Anual, Próximo Vencimento) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Mensal Total (Calculado Dinamicamente) */}
        <div
          id="card-monthly-total"
          className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white shadow-lg shadow-teal-950/15 border border-teal-700/50 flex flex-col justify-between"
        >
          <div className="absolute right-0 top-0 w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between text-teal-200 mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-teal-400" />
                <span className="text-xs font-semibold tracking-wide uppercase text-teal-200">
                  Mensal Total
                </span>
              </div>
              <button
                type="button"
                onClick={() => onFilterByStatus?.('active')}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-700/80 text-teal-100 border border-teal-500/40 hover:bg-teal-600 transition-colors cursor-pointer"
                title="Filtrar assinaturas ativas"
              >
                {activeCount} ativas
              </button>
            </div>

            <div className="flex items-baseline gap-1 my-1">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans text-white">
                {formatCurrency(monthlyTotal, preferredCurrency)}
              </h2>
              <span className="text-teal-300 text-sm font-medium">/mês</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-teal-700/60 flex items-center justify-between text-xs text-teal-200/90">
            <span>Média por assinatura:</span>
            <span className="font-bold text-white text-sm">
              {formatCurrency(activeCount > 0 ? monthlyTotal / activeCount : 0, preferredCurrency)}/serviço
            </span>
          </div>
        </div>

        {/* Card 2: Projeção Anual (Calculada Dinamicamente) */}
        <div
          id="card-annual-projection"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold tracking-wide uppercase">
                  Projeção Anual
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60">
                12 Meses
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {formatCurrency(yearlyTotal, preferredCurrency)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Custo estimado nos próximos 365 dias
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Economia com pausadas:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(pausedSavings, preferredCurrency)}/mês
            </span>
          </div>
        </div>

        {/* Card 3: Próximo Vencimento (Calculado Dinamicamente da Assinatura Mais Próxima) */}
        <div
          id="card-next-renewal"
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-xs font-semibold tracking-wide uppercase">
                  Próximo Vencimento
                </span>
              </div>
              {nextRenewal && nextRenewalRel && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    nextRenewal.daysUntil <= 3
                      ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900'
                  }`}
                >
                  {nextRenewalRel.label}
                </span>
              )}
            </div>

            {nextRenewal ? (
              <div
                onClick={() => onEdit?.(nextRenewal)}
                className="group/item cursor-pointer p-2.5 -mx-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                title="Clique para ver ou editar esta assinatura"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0 shadow-2xs group-hover/item:scale-105 transition-transform"
                    style={{ backgroundColor: nextRenewal.color || '#0d9488' }}
                  >
                    {nextRenewal.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base truncate group-hover/item:text-teal-600 dark:group-hover/item:text-teal-400 transition-colors">
                      {nextRenewal.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Data: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(nextRenewal.nextBillingDate)}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-extrabold text-slate-900 dark:text-white block">
                      {formatCurrency(nextRenewal.amount, nextRenewal.currency || preferredCurrency)}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {nextRenewal.billingCycle === 'yearly' ? '/ano' : nextRenewal.billingCycle === 'weekly' ? '/sem' : '/mês'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-3 text-center text-slate-400 dark:text-slate-500 text-sm">
                <Clock className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p className="font-medium">Nenhum vencimento ativo</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs flex items-center justify-between">
            {nextRenewal ? (
              <>
                <button
                  type="button"
                  onClick={() => onEdit?.(nextRenewal)}
                  className="text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                >
                  Ver detalhes
                </button>
                {onMarkAsPaid && (
                  <button
                    type="button"
                    onClick={() => onMarkAsPaid(nextRenewal.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-semibold transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    <span>Pagar ciclo</span>
                  </button>
                )}
              </>
            ) : (
              <span className="text-slate-400">Cadastre uma nova assinatura</span>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

