import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Plus,
  ArrowUpDown,
  Filter,
  Layers,
  Sparkles,
  LayoutGrid,
  List,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Edit2,
  Trash2,
  Pause,
  Play,
  Check,
  Calendar,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Subscription, FilterOptions, SupportedCurrency, SubscriptionCategory, SortOption } from '../types';
import { SubscriptionCard } from './SubscriptionCard';
import { CATEGORIES, POPULAR_PRESETS } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDate, getDaysUntil, getRelativeDateLabel } from '../utils/calculations';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  filteredSubscriptions: Subscription[];
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  preferredCurrency: SupportedCurrency;
  onEdit: (sub: Subscription) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  onOpenNewModal: () => void;
  onQuickAddPreset: (presetName: string) => void;
  onResetToSample: () => void;
}

export const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  filteredSubscriptions,
  filters,
  setFilters,
  preferredCurrency,
  onEdit,
  onDelete,
  onToggleStatus,
  onMarkAsPaid,
  onOpenNewModal,
  onQuickAddPreset,
  onResetToSample,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const categoriesList = Object.values(CATEGORIES);

  // Dynamic counts for status chips
  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const pausedCount = subscriptions.filter((s) => s.status === 'paused').length;
  const cancelledCount = subscriptions.filter((s) => s.status === 'cancelled').length;
  const trialCount = subscriptions.filter((s) => s.isTrial && s.status !== 'cancelled').length;
  const urgentCount = subscriptions.filter((s) => {
    if (s.status !== 'active') return false;
    const days = getDaysUntil(s.nextBillingDate);
    return days >= 0 && days <= 3;
  }).length;

  // Sliced items if not expanded and more than 4 items exist
  const INITIAL_LIMIT = 4;
  const hasMore = filteredSubscriptions.length > INITIAL_LIMIT;
  const displayedSubscriptions = !isExpanded && hasMore
    ? filteredSubscriptions.slice(0, INITIAL_LIMIT)
    : filteredSubscriptions;

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="search-input"
              type="text"
              placeholder="Buscar por serviço, plataforma ou notas..."
              value={filters.searchQuery}
              onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Sort selector & view controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                id="sort-select"
                value={filters.sortBy}
                onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value as SortOption }))}
                className="appearance-none bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium rounded-xl px-3 py-2 pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="date_asc">Vencimento mais próximo</option>
                <option value="date_desc">Vencimento mais distante</option>
                <option value="amount_desc">Maior valor (mensal)</option>
                <option value="amount_asc">Menor valor (mensal)</option>
                <option value="name_asc">Nome (A - Z)</option>
              </select>
              <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
                title="Visualização em Grade"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
                title="Visualização em Lista"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Category & Status Filter Chips */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {/* Todas */}
          <button
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, category: 'all', status: 'all' }))}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filters.category === 'all' && filters.status === 'all'
                ? 'bg-teal-600 dark:bg-teal-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Todas ({subscriptions.length})
          </button>

          {/* Ativas */}
          <button
            id="filter-active-subs"
            type="button"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                status: prev.status === 'active' ? 'all' : 'active',
              }))
            }
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filters.status === 'active'
                ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Ativas ({activeCount})
          </button>

          {/* Pausadas */}
          <button
            id="filter-paused-subs"
            type="button"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                status: prev.status === 'paused' ? 'all' : 'paused',
              }))
            }
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filters.status === 'paused'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Pausadas ({pausedCount})
          </button>

          {/* Canceladas */}
          <button
            id="filter-cancelled-subs"
            type="button"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                status: prev.status === 'cancelled' ? 'all' : 'cancelled',
              }))
            }
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filters.status === 'cancelled'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Canceladas ({cancelledCount})
          </button>

          {/* Testes Grátis */}
          <button
            id="filter-trial-subs"
            type="button"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                status: prev.status === 'trial' ? 'all' : 'trial',
              }))
            }
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              filters.status === 'trial'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Testes Grátis ({trialCount})
          </button>

          {/* Urgentes (≤ 3 dias) */}
          {(urgentCount > 0 || filters.status === 'urgent') && (
            <button
              id="filter-urgent-subs"
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: prev.status === 'urgent' ? 'all' : 'urgent',
                }))
              }
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filters.status === 'urgent'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100 dark:hover:bg-amber-900/60'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Urgentes ({urgentCount})</span>
            </button>
          )}

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />

          {/* Category Chips */}
          {categoriesList.map((cat) => {
            const count = subscriptions.filter((s) => s.category === cat.id).length;
            const isSelected = filters.category === cat.id;

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, category: isSelected ? 'all' : cat.id }))}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 dark:bg-teal-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <CategoryIcon category={cat.id} className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                {count > 0 && <span className="text-[10px] opacity-75">({count})</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Header bar of the list */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Suas Assinaturas ({filteredSubscriptions.length})
        </h3>
        {hasMore && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isExpanded ? 'Recolher para 4 itens' : `Ver todas as ${filteredSubscriptions.length}`}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Active Urgent Filter Alert Banner */}
      {filters.status === 'urgent' && (
        <div
          id="banner-urgent-filter-active"
          className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-900/80 flex items-center justify-between gap-3 text-amber-950 dark:text-amber-200 animate-in fade-in"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-500 text-white shrink-0 shadow-2xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-bold truncate">
                Filtro ativo: Cobranças urgentes (próximos 3 dias)
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                {filteredSubscriptions.length} {filteredSubscriptions.length === 1 ? 'assinatura encontrada' : 'assinaturas encontradas'}
              </p>
            </div>
          </div>
          <button
            id="btn-clear-urgent-filter"
            type="button"
            onClick={() => setFilters((prev) => ({ ...prev, status: 'all' }))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-200/90 hover:bg-amber-300 dark:bg-amber-900/90 dark:hover:bg-amber-800 text-amber-950 dark:text-amber-100 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpar filtro</span>
          </button>
        </div>
      )}

      {/* Subscription Cards or Empty State */}
      {filteredSubscriptions.length > 0 ? (
        <div className="space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedSubscriptions.map((sub) => (
                <SubscriptionCard
                  key={sub.id}
                  subscription={sub}
                  preferredCurrency={preferredCurrency}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleStatus={onToggleStatus}
                  onMarkAsPaid={onMarkAsPaid}
                />
              ))}
            </div>
          ) : (
            /* Table/List View Mode */
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {displayedSubscriptions.map((sub) => {
                const catMeta = CATEGORIES[sub.category] || CATEGORIES.outros;
                const daysUntil = getDaysUntil(sub.nextBillingDate);
                const rel = getRelativeDateLabel(daysUntil);
                const isPaused = sub.status === 'paused';
                const isCancelled = sub.status === 'cancelled';

                return (
                  <div
                    key={sub.id}
                    onClick={() => onEdit(sub)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-base font-bold shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: sub.color || catMeta.color }}
                      >
                        {sub.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {sub.name}
                          </h4>
                          {sub.isTrial && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                              Teste
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{catMeta.label}</span>
                          <span>•</span>
                          <span>Próxima: {formatDate(sub.nextBillingDate)} ({rel.label})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4" onClick={(e) => e.stopPropagation()}>
                      <div className="text-left sm:text-right">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {formatCurrency(sub.amount, sub.currency || preferredCurrency)}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">
                          /{sub.billingCycle === 'yearly' ? 'ano' : sub.billingCycle === 'weekly' ? 'sem' : 'mês'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(sub.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={isPaused ? 'Reativar' : 'Pausar'}
                        >
                          {isPaused ? <Play className="w-4 h-4 text-teal-600" /> : <Pause className="w-4 h-4" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => onMarkAsPaid(sub.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          title="Marcar como paga"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(sub)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(sub.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Prominent "Ver todas as X assinaturas" Expand Button (Requirement 6) */}
          {hasMore && (
            <div className="pt-2 flex justify-center">
              <button
                id="btn-expand-all-subs"
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 text-slate-800 dark:text-slate-200 font-bold text-xs shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Mostrar menos (recolher lista)</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Ver todas as {filteredSubscriptions.length} assinaturas</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : subscriptions.length > 0 ? (
        /* Filter returned 0 results */
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <Filter className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="font-bold text-slate-900 dark:text-white text-base">
            Nenhuma assinatura encontrada
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Não encontramos assinaturas correspondentes aos filtros selecionados.
          </p>
          <button
            type="button"
            onClick={() =>
              setFilters({
                category: 'all',
                status: 'all',
                searchQuery: '',
                sortBy: 'date_asc',
                billingCycle: 'all',
              })
            }
            className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            Limpar todos os filtros
          </button>
        </div>
      ) : (
        /* Total Empty State: Welcome to Recorra */
        <div
          id="welcome-empty-state"
          className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Sparkles className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bem-vindo ao Recorra!
          </h3>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
            Tenha clareza total dos seus gastos recorrentes, saiba com antecedência quando será cobrado e nunca mais pague por assinaturas esquecidas.
          </p>

          {/* Primary CTA */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="btn-empty-add"
              type="button"
              onClick={onOpenNewModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Cadastrar Primeira Assinatura</span>
            </button>

            <button
              type="button"
              onClick={onResetToSample}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Carregar Dados de Exemplo</span>
            </button>
          </div>

          {/* Quick Preset Badges */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Ou adicione rapidamente um serviço comum:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
              {POPULAR_PRESETS.slice(0, 6).map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onQuickAddPreset(preset.name)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 dark:bg-slate-800/80 dark:hover:bg-teal-950/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: preset.color }}
                  />
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

