import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSubscriptions } from './hooks/useSubscriptions';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { DashboardSummary } from './components/DashboardSummary';
import { CategoryChart } from './components/CategoryChart';
import { UpcomingRenewals } from './components/UpcomingRenewals';
import { TrialAlertsSection } from './components/TrialAlertsSection';
import { SubscriptionList } from './components/SubscriptionList';
import { SubscriptionFormModal } from './components/SubscriptionFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ExportImportModal } from './components/ExportImportModal';
import { OnboardingScreen } from './components/OnboardingScreen';
import { ToastContainer, ToastMessage } from './components/Toast';
import { Subscription, UserProfile } from './types';
import { POPULAR_PRESETS } from './data/categories';

const ONBOARDING_STORAGE_KEY = 'recorra_onboarding_completed';
const USER_PROFILE_STORAGE_KEY = 'recorra_user_profile';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    subscriptions,
    filteredSubscriptions,
    urgentRenewals,
    activeTrials,
    filters,
    setFilters,
    preferredCurrency,
    setPreferredCurrency,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleStatus,
    markAsPaid,
    convertTrialToPaid,
    resetToSampleData,
    clearAllSubscriptions,
    importSubscriptions,
  } = useSubscriptions();

  // Onboarding & User Profile State
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
      } catch (err) {
        console.error('Error reading onboarding status from localStorage:', err);
      }
    }
    return false;
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (err) {
        console.error('Error reading user profile from localStorage:', err);
      }
    }
    return null;
  });

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);

  // Toast feedback state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((title: string, description?: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingSubscription(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (sub: Subscription) => {
    setEditingSubscription(sub);
    setIsFormModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDeleteModal = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    if (sub) {
      setSubscriptionToDelete(sub);
      setIsDeleteModalOpen(true);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (subscriptionToDelete) {
      deleteSubscription(subscriptionToDelete.id);
      addToast('Assinatura removida', `${subscriptionToDelete.name} foi excluída com sucesso.`);
      setSubscriptionToDelete(null);
    }
  };

  // Save Subscription (Create or Update)
  const handleSaveSubscription = (data: Omit<Subscription, 'id' | 'createdAt'>) => {
    if (editingSubscription) {
      updateSubscription(editingSubscription.id, data);
      addToast('Assinatura atualizada!', `${data.name} foi salva com sucesso.`);
    } else {
      addSubscription(data);
      addToast('Assinatura cadastrada!', `${data.name} adicionada ao seu rastreador.`);
    }
  };

  // Toggle Status
  const handleToggleStatus = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    toggleStatus(id);
    if (sub) {
      const nextStatus = sub.status === 'active' ? 'pausada' : 'reativada';
      addToast(`Assinatura ${nextStatus}`, `${sub.name} agora está com status ${nextStatus}.`);
    }
  };

  // Mark as Paid
  const handleMarkAsPaid = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    markAsPaid(id);
    if (sub) {
      addToast('Pagamento registrado!', `Próxima cobrança de ${sub.name} avançada para o próximo ciclo.`);
    }
  };

  // Convert Trial to Active Paid
  const handleConvertTrial = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    convertTrialToPaid(id);
    if (sub) {
      addToast('Teste convertido em assinatura!', `${sub.name} agora é uma assinatura ativa.`);
    }
  };

  // Cancel Trial / Subscription
  const handleCancelSubscription = (id: string) => {
    const sub = subscriptions.find((s) => s.id === id);
    updateSubscription(id, { status: 'cancelled', isTrial: false });
    if (sub) {
      addToast('Assinatura cancelada', `${sub.name} foi marcada como cancelada.`);
    }
  };

  // Quick preset add
  const handleQuickAddPreset = (presetName: string) => {
    const preset = POPULAR_PRESETS.find((p) => p.name === presetName);
    if (preset) {
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 30);
      const yyyy = defaultDate.getFullYear();
      const mm = String(defaultDate.getMonth() + 1).padStart(2, '0');
      const dd = String(defaultDate.getDate()).padStart(2, '0');

      const newSub = addSubscription({
        name: preset.name,
        amount: preset.defaultAmount,
        currency: preferredCurrency,
        billingCycle: preset.billingCycle,
        nextBillingDate: `${yyyy}-${mm}-${dd}`,
        category: preset.category,
        status: 'active',
        isTrial: false,
        trialEndsAt: null,
        color: preset.color,
      });

      addToast('Assinatura adicionada!', `${newSub.name} foi configurada com valores padrão.`);
    }
  };

  const handleSelectCategoryFromChart = (cat: string) => {
    setFilters((prev) => ({ ...prev, category: cat }));
  };

  const handleFilterUrgent = () => {
    setFilters((prev) => ({
      ...prev,
      status: 'urgent',
    }));
    const el = document.getElementById('subscriptions-list-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCompleteOnboarding = (profile: UserProfile) => {
    try {
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch (err) {
      console.error('Error saving onboarding data to localStorage:', err);
    }
    setUserProfile(profile);
    clearAllSubscriptions();
    setHasCompletedOnboarding(true);
    addToast(
      `Bem-vindo(a), ${profile.name.split(' ')[0]}!`,
      'Sua conta foi criada. Comece cadastrando suas assinaturas recorrentes.'
    );
  };

  // If user hasn't completed onboarding yet, render Onboarding Screen
  if (!hasCompletedOnboarding) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="onboarding-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
        >
          <OnboardingScreen
            onComplete={handleCompleteOnboarding}
            theme={theme}
            toggleTheme={toggleTheme}
          />
          <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard-view"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white transition-colors duration-200"
      >
        
        {/* Top Navbar Header */}
        <Header
          theme={theme}
          toggleTheme={toggleTheme}
          onOpenNewModal={handleOpenAddModal}
          onOpenExportImport={() => setIsExportImportOpen(true)}
          preferredCurrency={preferredCurrency}
          setPreferredCurrency={setPreferredCurrency}
          totalActiveCount={subscriptions.filter((s) => s.status === 'active').length}
          userProfile={userProfile}
        />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Top Spend Highlights & Metric Cards */}
        <DashboardSummary
          subscriptions={subscriptions}
          preferredCurrency={preferredCurrency}
          onFilterByStatus={(status) => setFilters((prev) => ({ ...prev, status }))}
          onFilterByTrial={() => setFilters((prev) => ({ ...prev, status: 'trial' }))}
          onFilterByUrgent={handleFilterUrgent}
          onEdit={handleOpenEditModal}
          onMarkAsPaid={handleMarkAsPaid}
        />

        {/* Free Trials Highlight Section (if any active trials) */}
        <TrialAlertsSection
          subscriptions={subscriptions}
          preferredCurrency={preferredCurrency}
          onConvertTrial={handleConvertTrial}
          onCancelSubscription={handleCancelSubscription}
          onEdit={handleOpenEditModal}
        />

        {/* 2-Column Analytic Widgets (Category Breakdown + Upcoming Renewals) */}
        {subscriptions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <UpcomingRenewals
              subscriptions={subscriptions}
              preferredCurrency={preferredCurrency}
              onMarkAsPaid={handleMarkAsPaid}
              onEdit={handleOpenEditModal}
            />
            <CategoryChart
              subscriptions={subscriptions}
              preferredCurrency={preferredCurrency}
              selectedCategory={filters.category}
              onSelectCategory={handleSelectCategoryFromChart}
            />
          </div>
        )}

        {/* Full Subscription List with Filters, Search, and Cards */}
        <section id="subscriptions-list-section" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Todas as Assinaturas
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Mostrando {filteredSubscriptions.length} de {subscriptions.length}
            </span>
          </div>

          <SubscriptionList
            subscriptions={subscriptions}
            filteredSubscriptions={filteredSubscriptions}
            filters={filters}
            setFilters={setFilters}
            preferredCurrency={preferredCurrency}
            onEdit={handleOpenEditModal}
            onDelete={handleOpenDeleteModal}
            onToggleStatus={handleToggleStatus}
            onMarkAsPaid={handleMarkAsPaid}
            onOpenNewModal={handleOpenAddModal}
            onQuickAddPreset={handleQuickAddPreset}
            onResetToSample={() => {
              resetToSampleData();
              addToast('Dados restaurados', 'Exemplos carregados com sucesso.');
            }}
          />
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">Recorra</span>
            <span>—</span>
            <span>Controle Financeiro de Assinaturas e Recorrências</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Armazenamento seguro 100% no seu navegador. Seus dados nunca saem do seu dispositivo.
          </p>
        </div>
      </footer>

      {/* Modals & Portals */}
      <SubscriptionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingSubscription(null);
        }}
        onSave={handleSaveSubscription}
        onDelete={handleOpenDeleteModal}
        editingSubscription={editingSubscription}
        preferredCurrency={preferredCurrency}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSubscriptionToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        subscription={subscriptionToDelete}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        subscriptions={subscriptions}
        onImport={(imported) => {
          importSubscriptions(imported);
          addToast('Backup restaurado!', `${imported.length} assinaturas carregadas.`);
        }}
        onResetToSample={() => {
          resetToSampleData();
          addToast('Dados restaurados', 'Exemplos carregados com sucesso.');
        }}
        onClearAll={() => {
          clearAllSubscriptions();
          addToast('Dados limpos', 'Todas as assinaturas foram removidas.', 'warning');
        }}
      />

      {/* Toast Feedback Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      </motion.div>
    </AnimatePresence>
  );
}
