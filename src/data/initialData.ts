import { Subscription } from '../types';

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 'sub-netflix',
    name: 'Netflix',
    amount: 44.90,
    currency: 'BRL',
    billingCycle: 'monthly',
    nextBillingDate: getUpcomingDate(2), // 2 days from now (Urgent alert < 3 days)
    category: 'streaming',
    status: 'active',
    isTrial: false,
    trialEndsAt: null,
    notes: 'Plano Padrão 2 telas em Full HD',
    color: '#E50914',
    website: 'netflix.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub-smartfit',
    name: 'Academia Smart Fit',
    amount: 129.90,
    currency: 'BRL',
    billingCycle: 'monthly',
    nextBillingDate: getUpcomingDate(5), // 5 days from now
    category: 'saude',
    status: 'active',
    isTrial: false,
    trialEndsAt: null,
    notes: 'Plano Black com acesso a todas unidades',
    color: '#FFB800',
    website: 'smartfit.com.br',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub-chatgpt',
    name: 'ChatGPT Plus (OpenAI)',
    amount: 110.00,
    currency: 'BRL',
    billingCycle: 'monthly',
    nextBillingDate: getUpcomingDate(12),
    category: 'produtividade',
    status: 'active',
    isTrial: false,
    trialEndsAt: null,
    notes: 'Acesso ao GPT-4o, Canvas e gerador de imagens',
    color: '#10A37F',
    website: 'chat.openai.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub-spotify',
    name: 'Spotify Premium',
    amount: 21.90,
    currency: 'BRL',
    billingCycle: 'monthly',
    nextBillingDate: getUpcomingDate(19),
    category: 'streaming',
    status: 'active',
    isTrial: false,
    trialEndsAt: null,
    notes: 'Plano Individual sem anúncios',
    color: '#1DB954',
    website: 'spotify.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub-amazon',
    name: 'Amazon Prime',
    amount: 199.00,
    currency: 'BRL',
    billingCycle: 'yearly',
    nextBillingDate: getUpcomingDate(65),
    category: 'streaming',
    status: 'active',
    isTrial: false,
    trialEndsAt: null,
    notes: 'Plano Anual com frete grátis e Prime Video',
    color: '#00A8E1',
    website: 'amazon.com.br',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sub-duolingo-trial',
    name: 'Duolingo Super (Teste Grátis)',
    amount: 18.90,
    currency: 'BRL',
    billingCycle: 'monthly',
    nextBillingDate: getUpcomingDate(3),
    category: 'educacao',
    status: 'active',
    isTrial: true,
    trialEndsAt: getUpcomingDate(3), // Trial ends in 3 days!
    notes: 'Período promocional de 14 dias de teste',
    color: '#58CC02',
    website: 'duolingo.com',
    createdAt: new Date().toISOString(),
  },
];

function getUpcomingDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
