import React from 'react';
import { ShieldCheck, ShieldAlert, ShieldX, Bug, Trash2 } from 'lucide-react';

export default function AntivirusStatus({ data }) {
  const av = data || { status: 'No Devices', totalDevices: 0, protectedDevices: 0, threatsRemoved: 0, activeThreats: 0 };
  const protectedAll = av.status === 'Protected';
  const noDevices = av.status === 'No Devices' || av.totalDevices === 0;

  const theme = protectedAll
    ? { Icon: ShieldCheck, ring: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', label: 'Protected', labelColor: 'text-emerald-600', glow: 'bg-emerald-500/10' }
    : noDevices
      ? { Icon: ShieldX, ring: 'bg-slate-400/10 text-slate-500 border-slate-400/20', label: 'No Devices', labelColor: 'text-slate-500', glow: 'bg-slate-400/10' }
      : { Icon: ShieldAlert, ring: 'bg-amber-500/10 text-amber-600 border-amber-500/20', label: 'At Risk', labelColor: 'text-amber-600', glow: 'bg-amber-500/10' };
  const { Icon } = theme;

  return (
    <div className="col-span-12 bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${theme.glow}`} />
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Status */}
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${theme.ring}`}>
            <Icon size={28} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Antivirus Protection</h3>
            <p className={`text-2xl font-extrabold leading-tight ${theme.labelColor}`}>{theme.label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Windows Defender real-time protection against viruses, ransomware &amp; spyware
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 shrink-0">
          <div className="px-4 py-3 rounded-xl bg-slate-100/80 border border-border/60 text-center min-w-[92px]">
            <div className="flex items-center justify-center gap-1.5 text-emerald-600">
              <ShieldCheck size={15} />
              <span className="text-lg font-extrabold">{av.protectedDevices}/{av.totalDevices}</span>
            </div>
            <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 uppercase tracking-wide">Protected</p>
          </div>
          <div className="px-4 py-3 rounded-xl bg-slate-100/80 border border-border/60 text-center min-w-[92px]">
            <div className="flex items-center justify-center gap-1.5 text-primary">
              <Trash2 size={15} />
              <span className="text-lg font-extrabold">{av.threatsRemoved}</span>
            </div>
            <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 uppercase tracking-wide">Removed</p>
          </div>
          <div className="px-4 py-3 rounded-xl bg-slate-100/80 border border-border/60 text-center min-w-[92px]">
            <div className={`flex items-center justify-center gap-1.5 ${av.activeThreats > 0 ? 'text-rose-500' : 'text-muted-foreground'}`}>
              <Bug size={15} />
              <span className="text-lg font-extrabold">{av.activeThreats}</span>
            </div>
            <p className="text-[10px] font-semibold text-muted-foreground mt-0.5 uppercase tracking-wide">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
