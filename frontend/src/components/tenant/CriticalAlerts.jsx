import React from 'react';
import { AlertTriangle, AlertCircle, ShieldAlert, ChevronDown } from 'lucide-react';

const alertsList = [
  {
    id: 'CPU-9812',
    title: 'High CPU Utilization Warning',
    time: '2m ago',
    description: 'Server-DB-Production-01 is exceeding 98% sustained CPU capacity.',
    tag: 'Urgent',
    tagBg: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
    icon: AlertTriangle,
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },
  {
    id: 'SEC-2241',
    title: 'Firewall Policy Disabled',
    time: '15m ago',
    description: 'Endpoint-WK-LT-442 security policy bypass detected by local user.',
    tag: 'Active Policy',
    tagBg: 'bg-primary/10 text-primary border border-primary/20',
    icon: ShieldAlert,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
];

export default function CriticalAlerts() {
  return (
    <div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm flex-1 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <h3 className="text-base font-extrabold text-primary flex items-center gap-2">
          <AlertCircle size={18} className="text-rose-500" />
          Critical Alerts Stream
        </h3>
        <button className="px-3 py-1.5 bg-background border border-input rounded-xl text-xs font-semibold text-primary hover:bg-muted/50 transition-colors flex items-center gap-1.5 cursor-pointer">
          <span>Last Month</span>
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {alertsList.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.id}
              className="p-4 rounded-xl border border-border/60 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer group space-y-2"
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 shrink-0 ${alert.iconBg} ${alert.iconColor} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-xs text-primary truncate">{alert.title}</h4>
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0">{alert.time}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{alert.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px]">
                <span className={`px-2 py-0.5 font-bold rounded-md ${alert.tagBg}`}>{alert.tag}</span>
                <span className="text-muted-foreground font-mono font-medium">ID: {alert.id}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
