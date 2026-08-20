import React from 'react';
import { Monitor, Wifi, Moon, WifiOff, TrendingUp, TrendingDown } from 'lucide-react';

const ICON_MAP = {
  devices: Monitor,
  sensors: Wifi,
  bedtime: Moon,
  cloud_off: WifiOff,
};

export default function MetricCard({
  title,
  value,
  icon,
  iconBgColor = 'bg-primary/10',
  iconTextColor = 'text-primary',
  trendValue,
  trendIsUp = true,
  trendColor = 'text-emerald-600',
  trendBg = 'bg-emerald-50',
  timeframe = 'Last 30 days',
}) {
  const IconComponent = ICON_MAP[icon] || Monitor;

  return (
    <div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
        <div className={`w-9 h-9 rounded-xl ${iconBgColor} ${iconTextColor} flex items-center justify-center`}>
          <IconComponent size={18} />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-black text-primary">{value}</div>
        {trendValue && (
          <span className={`text-xs font-bold ${trendColor} ${trendBg} px-2 py-0.5 rounded-md flex items-center gap-1`}>
            {trendIsUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">{timeframe}</p>
      <div className="w-full bg-muted/30 h-1.5 rounded-full mt-3 overflow-hidden">
        <div className={`h-full rounded-full ${iconTextColor.includes('secondary') ? 'bg-secondary' : iconTextColor.includes('tertiary') ? 'bg-amber-500' : iconTextColor.includes('error') ? 'bg-rose-500' : 'bg-primary'} w-[75%]`} />
      </div>
    </div>
  );
}
