import React from 'react';
import {
  MoreVertical,
  Edit2,
  Trash2,
  Pause,
  Play,
  Check,
  Calendar,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Subscription } from '../types';
import {
  formatCurrency,
  formatDate,
  getDaysUntil,
  getRelativeDateLabel,
  getMonthlyEquivalent,
} from '../utils/calculations';
import { CATEGORIES } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';

interface SubscriptionCardProps {
  subscription: Subscription;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  onRequestPayment?: (sub: Subscription) => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onEdit,
  onDelete,
  onToggleStatus,
  onMarkAsPaid,
  onRequestPayment,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const monthlyEquivalent = getMonthlyEquivalent(subscription.amount, subscription.billingCycle);

  const categoryMeta = CATEGORIES[subscription.category] || CATEGORIES.outros;
  const daysUntil = getDaysUntil(subscription.nextBillingDate);
  const relLabel = getRelativeDateLabel(daysUntil);
  const isUrgent = subscription.status === 'active' && daysUntil >= 0 && daysUntil <= 3;
  const isPaused = subscription.status === 'paused';
  const isCancelled = subscription.status === 'cancelled';

  const cycleLabel =
    subscription.billingCycle === 'yearly'
      ? '/ano'
      : subscription.billingCycle === 'weekly'
      ? '/sem'
      : '/mês';

  return (
    <div
      id={`sub-card-${subscription.id}`}
      onClick={(e) => {
        // Only trigger edit if clicking on the card background, not on interactive buttons
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
          return;
        }
        onEdit(subscription);
      }}
      className={`group relative rounded-2xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between cursor-pointer ${
        isPaused
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-75 hover:opacity-100 hover:border-slate-400'
          : isCancelled
          ? 'bg-slate-50/40 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-50 hover:opacity-80'
          : isUrgent
          ? 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-900/80 shadow-amber-500/5 ring-1 ring-amber-400/30 hover:border-amber-400'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-teal-500/60 dark:hover:border-teal-500/60 hover:shadow-md'
      }`}
    >
      {/* Header of Card */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Logo monogram / Color avatar */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0 shadow-2xs transition-transform group-hover:scale-105"
              style={{ backgroundColor: subscription.color || categoryMeta.color }}
            >
              {subscription.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white text-base truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {subscription.name}
                </h4>
                {subscription.website && (
                  <a
                    href={subscription.website.startsWith('http') ? subscription.website : `https://${subscription.website}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
                    title="Acessar site do serviço"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Category tag */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${categoryMeta.bgLight} ${categoryMeta.bgDark} ${categoryMeta.textColor}`}
                >
                  <CategoryIcon category={subscription.category} className="w-3 h-3" />
                  {categoryMeta.label}
                </span>

                {subscription.isTrial && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                    <Sparkles className="w-2.5 h-2.5" />
                    Teste
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Context menu action button */}
          <div className="relative" ref={menuRef}>
            <button
              id={`btn-menu-${subscription.id}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Mais opções"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-8 z-20 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs animate-in fade-in zoom-in-95 duration-150"
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(subscription);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  Editar Assinatura
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onToggleStatus(subscription.id);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
                >
                  {subscription.status === 'active' ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-500" />
                      Pausar Assinatura
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-teal-500" />
                      Reativar Assinatura
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    if (onRequestPayment) {
                      onRequestPayment(subscription);
                    } else {
                      onMarkAsPaid(subscription.id);
                    }
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  Pagar ciclo (+1 período)
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(subscription.id);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir Assinatura
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notes if present */}
        {subscription.notes && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-1 italic">
            "{subscription.notes}"
          </p>
        )}
      </div>

      {/* Pricing & Billing Details */}
      <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-baseline justify-between mb-2">
          <div>
            <div className="flex items-baseline">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatCurrency(subscription.amount)}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                {cycleLabel}
              </span>
            </div>
          </div>

          {/* Monthly equivalent indicator if yearly/weekly */}
          {subscription.billingCycle !== 'monthly' && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium text-right" title="Equivalente mensal">
              ~{formatCurrency(monthlyEquivalent)}/mês
            </span>
          )}
        </div>

        {/* Next billing date & relative countdown */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Próxima: </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {formatDate(subscription.nextBillingDate)}
            </span>
          </div>

          {/* Status Badge */}
          {isPaused ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Pausada
            </span>
          ) : isCancelled ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400">
              Cancelada
            </span>
          ) : (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                isUrgent
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
              }`}
            >
              {relLabel.label}
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(subscription);
          }}
          className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors py-1"
        >
          Editar detalhes
        </button>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(subscription.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isPaused ? 'Reativar assinatura' : 'Pausar assinatura'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-teal-600" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsPaid(subscription.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
            title="Marcar como paga e avançar ciclo"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
