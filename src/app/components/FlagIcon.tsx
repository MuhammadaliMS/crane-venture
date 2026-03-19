import {
  AlertCircle, Flame, TrendingUp, Rocket, UserMinus,
  ClipboardList, MailX, Banknote, BarChart3, RefreshCw
} from 'lucide-react';
import { type FlagType, getFlagIconColor } from './mock-data';

const iconMap: Record<string, typeof AlertCircle> = {
  'alert-circle': AlertCircle,
  'flame': Flame,
  'trending-up': TrendingUp,
  'rocket': Rocket,
  'user-minus': UserMinus,
  'clipboard-list': ClipboardList,
  'mail-x': MailX,
  'banknote': Banknote,
  'bar-chart-3': BarChart3,
  'refresh-cw': RefreshCw,
};

const iconNameMap: Record<FlagType, string> = {
  'Runway Alert': 'alert-circle',
  'Burn Acceleration': 'flame',
  'Growth Inflection': 'trending-up',
  'New Sales Motion': 'rocket',
  'Key Departure': 'user-minus',
  'Board Coming Up': 'clipboard-list',
  'Engagement Gap': 'mail-x',
  'Fundraising Signal': 'banknote',
  'Market Signal': 'bar-chart-3',
  'Pivot Signal': 'refresh-cw',
};

interface FlagIconProps {
  type: FlagType;
  className?: string;
  size?: number;
}

export function FlagIcon({ type, className = '', size = 16 }: FlagIconProps) {
  const iconName = iconNameMap[type];
  const Icon = iconMap[iconName] || AlertCircle;
  const color = getFlagIconColor(type);

  return (
    <div
      className={`inline-flex items-center justify-center rounded-lg shrink-0 ${className}`}
      style={{ background: color + '15', width: size + 8, height: size + 8 }}
      aria-label={type}
      role="img"
    >
      <Icon style={{ color, width: size, height: size }} />
    </div>
  );
}
