import React from 'react';
import { PieChart as PieIcon, Layers, ChevronRight } from 'lucide-react';
import { Subscription, SupportedCurrency, SubscriptionCategory } from '../types';
import { getCategoryBreakdown, formatCurrency } from '../utils/calculations';
import { CATEGORIES } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';

interface CategoryChartProps {
  subscriptions: Subscription[];
  preferredCurrency: SupportedCurrency;
  convertFn?: (amount: number, from: SupportedCurrency, to: SupportedCurrency) => number;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({
  subscriptions,
  preferredCurrency,
  convertFn,
  selectedCategory,
  onSelectCategory,
}) => {
  const breakdown = getCategoryBreakdown(subscriptions, preferredCurrency, convertFn);
  const totalMonthly = breakdown.reduce((acc, item) => acc + item.amount, 0);

  if (breakdown.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400">
        <PieIcon className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
        <p className="text-sm font-medium">Nenhuma assinatura ativa para exibir gráficos.</p>
      </div>
    );
  }

  return (
    <div
      id="category-breakdown-card"
      className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
            <PieIcon className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Distribuição por Categoria
          </h3>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {breakdown.length} {breakdown.length === 1 ? 'categoria ativa' : 'categorias ativas'}
        </span>
      </div>

      {/* Segmented Cumulative Bar */}
      <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800 mb-5 p-0.5 gap-0.5 shadow-inner">
        {breakdown.map((item) => {
          const categoryMeta = CATEGORIES[item.category];
          const color = categoryMeta?.color || '#64748B';
          return (
            <div
              key={item.category}
              style={{
                width: `${Math.max(item.percentage, 2)}%`,
                backgroundColor: color,
              }}
              className="h-full rounded-xs transition-all duration-300 hover:opacity-85 cursor-pointer relative group"
              title={`${categoryMeta?.label || item.category}: ${item.percentage.toFixed(1)}%`}
              onClick={() => onSelectCategory(selectedCategory === item.category ? 'all' : item.category)}
            />
          );
        })}
      </div>

      {/* Category List with proportional progress bars */}
      <div className="space-y-3">
        {breakdown.map((item) => {
          const categoryMeta = CATEGORIES[item.category];
          const isSelected = selectedCategory === item.category;
          const color = categoryMeta?.color || '#64748B';

          return (
            <div
              key={item.category}
              onClick={() => onSelectCategory(isSelected ? 'all' : item.category)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-teal-500 bg-teal-50/40 dark:bg-teal-950/20 ring-1 ring-teal-500/40'
                  : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: color }}
                  >
                    <CategoryIcon category={item.category} className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {categoryMeta?.label || item.category}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 ml-2 font-normal">
                      ({item.count} {item.count === 1 ? 'serviço' : 'serviços'})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {formatCurrency(item.amount, preferredCurrency)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">
                    ({item.percentage.toFixed(0)}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedCategory !== 'all' && (
        <button
          type="button"
          onClick={() => onSelectCategory('all')}
          className="mt-3 w-full py-1.5 text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline text-center"
        >
          Limpar filtro de categoria (mostrar todas)
        </button>
      )}
    </div>
  );
};
