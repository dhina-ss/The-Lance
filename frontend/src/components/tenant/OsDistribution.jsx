import React from 'react';
import { Monitor } from 'lucide-react';

const GROUP_STYLE = {
  windows: { barColor: 'bg-primary', textColor: 'text-primary' },
  linux: { barColor: 'bg-accent', textColor: 'text-accent' },
  macos: { barColor: 'bg-emerald-500', textColor: 'text-emerald-600' },
  other: { barColor: 'bg-slate-400', textColor: 'text-muted-foreground' },
};

export default function OsDistribution({ items = [] }) {
  const osItems = (items || []).map((it) => ({
    name: it.name,
    percentage: it.percentage,
    count: it.count,
    ...(GROUP_STYLE[it.group] || GROUP_STYLE.other),
  }));
  return (
    <div className="col-span-12 lg:col-span-4 bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/60">
        <h3 className="text-base font-extrabold text-primary flex items-center gap-2">
          <Monitor size={18} className="text-accent" />
          OS Distribution
        </h3>
        <span className="text-[11px] font-bold text-muted-foreground">Live fleet</span>
      </div>

      <div className="space-y-5 flex-1 flex flex-col justify-center">
        {osItems.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No devices reporting yet.</p>
        )}
        {osItems.map((item) => (
          <div key={item.name} className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-primary truncate pr-2">{item.name}</span>
              <span className={item.textColor}>{item.percentage}% <span className="text-muted-foreground font-medium">({item.count})</span></span>
            </div>
            <div className="w-full bg-muted/20 h-2.5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${item.barColor}`} style={{ width: `${item.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-border/40 flex items-center justify-center gap-4 text-xs font-semibold text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
          <span>Windows</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block" />
          <span>Linux</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span>macOS</span>
        </div>
      </div>
    </div>
  );
}
