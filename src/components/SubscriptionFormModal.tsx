import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, Check, Info, Trash2, Sparkles } from 'lucide-react';
import {
  Subscription,
  SubscriptionCategory,
  BillingCycle,
  SubscriptionStatus,
} from '../types';
import { CATEGORIES, POPULAR_PRESETS, SubscriptionPreset } from '../data/categories';
import { CategoryIcon } from './CategoryIcon';

interface SubscriptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Subscription, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
  editingSubscription?: Subscription | null;
}

export const SubscriptionFormModal: React.FC<SubscriptionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editingSubscription,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [nextBillingDate, setNextBillingDate] = useState('');
  const [category, setCategory] = useState<SubscriptionCategory>('streaming');
  const [status, setStatus] = useState<SubscriptionStatus>('active');
  const [isTrial, setIsTrial] = useState(false);
  const [trialEndsAt, setTrialEndsAt] = useState('');
  const [notes, setNotes] = useState('');
  const [website, setWebsite] = useState('');
  const [color, setColor] = useState('#0d9488');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or populate fields when modal opens or editingSubscription changes
  useEffect(() => {
    if (editingSubscription) {
      setName(editingSubscription.name);
      setAmount(editingSubscription.amount.toString());
      setBillingCycle(editingSubscription.billingCycle);
      setNextBillingDate(editingSubscription.nextBillingDate);
      setCategory(editingSubscription.category);
      setStatus(editingSubscription.status);
      setIsTrial(editingSubscription.isTrial);
      setTrialEndsAt(editingSubscription.trialEndsAt || '');
      setNotes(editingSubscription.notes || '');
      setWebsite(editingSubscription.website || '');
      setColor(editingSubscription.color || '#0d9488');
      setErrors({});
    } else {
      // Default new subscription values
      setName('');
      setAmount('');
      setBillingCycle('monthly');
      
      // Default next billing date: 30 days from now or next month
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      const yyyy = defaultDate.getFullYear();
      const mm = String(defaultDate.getMonth() + 1).padStart(2, '0');
      const dd = String(defaultDate.getDate()).padStart(2, '0');
      setNextBillingDate(`${yyyy}-${mm}-${dd}`);

      setCategory('streaming');
      setStatus('active');
      setIsTrial(false);
      setTrialEndsAt('');
      setNotes('');
      setWebsite('');
      setColor('#0d9488');
      setErrors({});
    }
  }, [editingSubscription, isOpen]);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: SubscriptionPreset) => {
    setName(preset.name);
    setAmount(preset.defaultAmount.toString());
    setCategory(preset.category);
    setBillingCycle(preset.billingCycle);
    setColor(preset.color);
    if (errors.name || errors.amount) {
      setErrors({});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nome do serviço é obrigatório';
    }

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Informe um valor válido maior que zero';
    }

    if (!nextBillingDate) {
      newErrors.nextBillingDate = 'Selecione a data da próxima cobrança';
    }

    if (isTrial && !trialEndsAt) {
      newErrors.trialEndsAt = 'Informe a data final do período de teste';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave({
      name: name.trim(),
      amount: parsedAmount,
      currency: 'BRL',
      billingCycle,
      nextBillingDate,
      category,
      status,
      isTrial,
      trialEndsAt: isTrial ? trialEndsAt : null,
      notes: notes.trim() || undefined,
      website: website.trim() || undefined,
      color,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        id="subscription-modal-container"
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingSubscription ? 'Editar Assinatura' : 'Nova Assinatura Recorrente'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {editingSubscription
                ? 'Atualize os detalhes de valor, ciclo e cobrança'
                : 'Cadastre seus gastos recorrentes para acompanhamento automático'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick presets (only when creating new) */}
        {!editingSubscription && (
          <div className="px-6 pt-4 pb-1 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2">
              Modelos rápidos populares:
            </span>
            <div className="flex flex-wrap gap-1.5 pb-3 max-h-24 overflow-y-auto scrollbar-thin">
              {POPULAR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs hover:border-teal-500 hover:text-teal-600 transition-colors"
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
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          
          {/* Nome do Serviço */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nome do Serviço *
            </label>
            <input
              id="sub-input-name"
              type="text"
              placeholder="Ex: Netflix, Academia Smart Fit, ChatGPT..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                errors.name
                  ? 'border-rose-400 focus:ring-rose-500'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Valor (R$) e Ciclo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Valor */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Valor (R$) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 dark:text-slate-500">
                  R$
                </span>
                <input
                  id="sub-input-amount"
                  type="text"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    errors.amount
                      ? 'border-rose-400 focus:ring-rose-500'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                />
              </div>
              {errors.amount && <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>}
            </div>

            {/* Ciclo de Cobrança */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ciclo de Cobrança
              </label>
              <select
                id="sub-input-cycle"
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
                <option value="weekly">Semanal</option>
              </select>
            </div>
          </div>

          {/* Categoria e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Categoria */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Categoria
              </label>
              <select
                id="sub-input-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as SubscriptionCategory)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {Object.values(CATEGORIES).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status da Assinatura
              </label>
              <select
                id="sub-input-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="active">Ativa (cobrança recorrente)</option>
                <option value="paused">Pausada (temporariamente suspensa)</option>
                <option value="cancelled">Cancelada (histórico mantido)</option>
              </select>
            </div>
          </div>

          {/* Próxima Cobrança */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Data da Próxima Cobrança *
            </label>
            <input
              id="sub-input-date"
              type="date"
              value={nextBillingDate}
              onChange={(e) => setNextBillingDate(e.target.value)}
              className={`w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                errors.nextBillingDate
                  ? 'border-rose-400'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            />
            {errors.nextBillingDate && (
              <p className="text-xs text-rose-500 mt-1">{errors.nextBillingDate}</p>
            )}
          </div>

          {/* Período de Teste Grátis (Trial) Toggle */}
          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-bold text-purple-950 dark:text-purple-200">
                  Esta assinatura está em período de teste grátis (Trial)?
                </span>
              </div>
              <input
                id="sub-input-is-trial"
                type="checkbox"
                checked={isTrial}
                onChange={(e) => setIsTrial(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
            </label>

            {isTrial && (
              <div className="pt-2 border-t border-purple-200/60 dark:border-purple-900/60">
                <label className="block text-xs font-semibold text-purple-900 dark:text-purple-300 mb-1">
                  Quando o teste grátis termina e vira cobrança? *
                </label>
                <input
                  id="sub-input-trial-date"
                  type="date"
                  value={trialEndsAt}
                  onChange={(e) => setTrialEndsAt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.trialEndsAt && (
                  <p className="text-xs text-rose-500 mt-1">{errors.trialEndsAt}</p>
                )}
              </div>
            )}
          </div>

          {/* Notas Opcionais */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Notas ou Detalhes do Plano (Opcional)
            </label>
            <input
              id="sub-input-notes"
              type="text"
              placeholder="Ex: Plano Família, compartilhado com 3 pessoas, renovação no cartão Itaú"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Buttons Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2.5">
            {editingSubscription && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(editingSubscription.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-colors"
                title="Excluir esta assinatura"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                id="btn-save-subscription"
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
              >
                {editingSubscription ? 'Salvar Alterações' : 'Cadastrar Assinatura'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
