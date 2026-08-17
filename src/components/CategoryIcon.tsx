import React from 'react';
import {
  Tv,
  HeartPulse,
  Code,
  Sparkles,
  GraduationCap,
  Gamepad2,
  ShieldCheck,
  Layers,
  LucideIcon,
} from 'lucide-react';
import { SubscriptionCategory } from '../types';

const ICON_MAP: Record<string, LucideIcon> = {
  Tv,
  HeartPulse,
  Code,
  Sparkles,
  GraduationCap,
  Gamepad2,
  ShieldCheck,
  Layers,
};

interface CategoryIconProps {
  category: SubscriptionCategory | string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, className = 'w-4 h-4' }) => {
  switch (category) {
    case 'streaming':
      return <Tv className={className} />;
    case 'saude':
      return <HeartPulse className={className} />;
    case 'software':
      return <Code className={className} />;
    case 'produtividade':
      return <Sparkles className={className} />;
    case 'educacao':
      return <GraduationCap className={className} />;
    case 'jogos':
      return <Gamepad2 className={className} />;
    case 'financas':
      return <ShieldCheck className={className} />;
    case 'outros':
    default:
      return <Layers className={className} />;
  }
};
