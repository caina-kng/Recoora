import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Mail, Calendar, Hash, Check, X, ShieldCheck, Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';
import { UserProfile } from '../types';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onSaveProfile: (updated: UserProfile) => void;
  totalSubscriptionsCount?: number;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onSaveProfile,
  totalSubscriptionsCount = 0,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState<string>('');
  const [errors, setErrors] = useState<{ name?: string; email?: string; age?: string }>({});
  const [isTouched, setIsTouched] = useState(false);

  // Sync state when modal opens or userProfile changes
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setEmail(userProfile.email || '');
      setAge(userProfile.age ? String(userProfile.age) : '');
    } else {
      setName('');
      setEmail('');
      setAge('');
    }
    setErrors({});
    setIsTouched(false);
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: { name?: string; email?: string; age?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'O nome completo é obrigatório.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'O nome deve ter pelo menos 2 caracteres.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() && !emailRegex.test(email.trim())) {
      newErrors.email = 'Insira um endereço de e-mail válido.';
    }

    const ageNum = parseInt(age, 10);
    if (!age.trim()) {
      newErrors.age = 'A idade é obrigatória.';
    } else if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
      newErrors.age = 'Insira uma idade válida (entre 1 e 120 anos).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsTouched(true);

    if (!validate()) return;

    const updatedProfile: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      age: parseInt(age, 10),
      createdAt: userProfile?.createdAt || new Date().toISOString(),
    };

    onSaveProfile(updatedProfile);
    onClose();
  };

  const formattedDate = userProfile?.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Recentemente';

  const userInitial = name.trim() ? name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full h-full sm:h-auto sm:max-w-lg bg-white dark:bg-slate-900 sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-screen sm:max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-800/80 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="sm:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg active:bg-slate-200 dark:active:bg-slate-800"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Minha Conta</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                    <ShieldCheck className="w-3 h-3" /> Perfil Ativo
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Gerencie suas informações pessoais e dados de notificação
                </p>
              </div>
            </div>

            <button
              type="button"
              id="close-account-modal-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            
            {/* User Overview Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-teal-500/10 dark:from-teal-950/40 dark:via-slate-900 dark:to-teal-950/30 border border-teal-100 dark:border-teal-900/60 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-teal-600/20 shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {name.trim() || 'Usuário Recorra'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {email.trim() || 'E-mail não informado'}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-teal-700 dark:text-teal-300 font-medium">
                  <span>📅 Membro desde {formattedDate}</span>
                  <span>&bull;</span>
                  <span>📦 {totalSubscriptionsCount} assinaturas</span>
                </div>
              </div>
            </div>

            {/* Input: Nome Completo */}
            <div>
              <label htmlFor="account-name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Nome Completo <span className="text-teal-600 dark:text-teal-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="account-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (isTouched) validate();
                  }}
                  placeholder="Ex: João da Silva"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.name
                      ? 'border-red-300 dark:border-red-800 focus:ring-red-500 focus:border-red-500 bg-red-50/30'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500 focus:border-teal-500'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Input: E-mail (Opcional) */}
            <div>
              <label htmlFor="account-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                E-mail para Alertas <span className="text-slate-400 font-normal lowercase">(opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="account-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (isTouched) validate();
                  }}
                  placeholder="Ex: joao@email.com (opcional)"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.email
                      ? 'border-red-300 dark:border-red-800 focus:ring-red-500 focus:border-red-500 bg-red-50/30'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500 focus:border-teal-500'
                  }`}
                />
              </div>
              {errors.email ? (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.email}</span>
                </p>
              ) : (
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Opcional: este endereço pode ser usado para receber avisos e lembretes.
                </p>
              )}
            </div>

            {/* Input: Idade */}
            <div>
              <label htmlFor="account-age" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Idade <span className="text-teal-600 dark:text-teal-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="account-age"
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    if (isTouched) validate();
                  }}
                  placeholder="Ex: 28"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.age
                      ? 'border-red-300 dark:border-red-800 focus:ring-red-500 focus:border-red-500 bg-red-50/30'
                      : 'border-slate-200 dark:border-slate-700 focus:ring-teal-500 focus:border-teal-500'
                  }`}
                />
              </div>
              {errors.age && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.age}</span>
                </p>
              )}
            </div>

            {/* Privacy note */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Privacidade & Armazenamento</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Suas informações de perfil ficam guardadas de forma segura e privada diretamente no seu navegador.
              </p>
            </div>

            {/* Action buttons inside form for keyboard accessibility */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                id="btn-save-account"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-semibold text-sm shadow-md shadow-teal-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>

              <button
                type="button"
                id="btn-cancel-account"
                onClick={onClose}
                className="w-full sm:w-auto py-3 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-colors text-center"
              >
                Cancelar
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
