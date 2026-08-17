import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Bell,
  Sun,
  Moon,
  User,
  Calendar,
  Mail,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: (profile: UserProfile) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  theme,
  toggleTheme,
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [email, setEmail] = useState('');

  // Touched state for immediate visual validation feedback
  const [touched, setTouched] = useState({
    name: false,
    age: false,
    email: false,
  });

  // Validation rules
  const isNameValid = name.trim().length >= 2;
  const parsedAge = parseInt(age, 10);
  const isAgeValid = !isNaN(parsedAge) && parsedAge > 0 && parsedAge <= 120;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email.trim());

  const isFormValid = isNameValid && isAgeValid && isEmailValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, age: true, email: true });

    if (!isFormValid) return;

    const profile: UserProfile = {
      name: name.trim(),
      age: parsedAge,
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };

    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-teal-500 selection:text-white transition-colors duration-200">
      
      {/* Top Navbar / Header for Onboarding */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-600/20 font-extrabold text-xl tracking-tight">
            R
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Recorra
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          id="btn-onboarding-theme-toggle"
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer flex items-center gap-2 text-xs font-semibold"
          title="Alternar tema claro / escuro"
        >
          {theme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">Modo Escuro</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Modo Claro</span>
            </>
          )}
        </button>
      </header>

      {/* Main Center Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6"
        >
          {/* Header & Tagline */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Boas-vindas ao Recorra</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Nunca mais seja pego de surpresa por uma cobrança
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Organize todas as suas assinaturas, controle seus gastos mensais e receba avisos antes de qualquer renovação automática.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2" noValidate>
            
            {/* Campo: Nome */}
            <div className="space-y-1.5">
              <label
                htmlFor="onboarding-name"
                className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300"
              >
                Nome completo <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="onboarding-name"
                  type="text"
                  placeholder="Como gostaria de ser chamado?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all ${
                    touched.name && !isNameValid
                      ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-500/20'
                      : touched.name && isNameValid
                      ? 'border-teal-500/80 ring-2 ring-teal-500/10'
                      : 'border-slate-200 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                  }`}
                  required
                />
                {touched.name && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    {isNameValid ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                )}
              </div>
              {touched.name && !isNameValid && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                  Por favor, informe seu nome (mínimo de 2 caracteres).
                </p>
              )}
            </div>

            {/* Campo: Idade */}
            <div className="space-y-1.5">
              <label
                htmlFor="onboarding-age"
                className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300"
              >
                Idade <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="onboarding-age"
                  type="number"
                  min="1"
                  max="120"
                  placeholder="Ex: 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, age: true }))}
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all ${
                    touched.age && !isAgeValid
                      ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-500/20'
                      : touched.age && isAgeValid
                      ? 'border-teal-500/80 ring-2 ring-teal-500/10'
                      : 'border-slate-200 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                  }`}
                  required
                />
                {touched.age && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    {isAgeValid ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                )}
              </div>
              {touched.age && !isAgeValid && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                  Por favor, informe uma idade válida (número positivo maior que 0).
                </p>
              )}
            </div>

            {/* Campo: E-mail */}
            <div className="space-y-1.5">
              <label
                htmlFor="onboarding-email"
                className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300"
              >
                E-mail <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="onboarding-email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none transition-all ${
                    touched.email && !isEmailValid
                      ? 'border-rose-400 dark:border-rose-500 ring-2 ring-rose-500/20'
                      : touched.email && isEmailValid
                      ? 'border-teal-500/80 ring-2 ring-teal-500/10'
                      : 'border-slate-200 dark:border-slate-700/80 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
                  }`}
                  required
                />
                {touched.email && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    {isEmailValid ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                )}
              </div>

              {/* Explicação clara sobre o uso do e-mail para notificações */}
              <div className="p-2.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/60 dark:border-teal-900/60 flex items-start gap-2 text-xs text-teal-900 dark:text-teal-200 mt-1">
                <Bell className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <span>
                  Este e-mail será usado para <strong>enviar alertas e notificações antecipadas</strong> sobre o vencimento das suas assinaturas e testes grátis.
                </span>
              </div>

              {touched.email && !isEmailValid && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                  Por favor, informe um endereço de e-mail válido (ex: nome@dominio.com).
                </p>
              )}
            </div>

            {/* Botão de Envio */}
            <div className="pt-3">
              <button
                id="btn-onboarding-submit"
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-3 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isFormValid
                    ? 'bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white shadow-lg shadow-teal-600/25 cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300/40 dark:border-slate-700/40'
                }`}
              >
                <span>Começar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Privacy & Storage Note */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>Seus dados são salvos localmente e protegidos no seu navegador.</span>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
        Recorra &bull; Gestão inteligente de assinaturas &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};
