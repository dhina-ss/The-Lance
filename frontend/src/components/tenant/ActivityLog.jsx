import React from 'react';
import { Activity, DownloadCloud, UserPlus, CheckCircle2, ChevronRight } from 'lucide-react';
import { relativeTime } from '../../api/ems';

const CATEGORY_STYLE = {
  command: { icon: DownloadCloud, iconBg: 'bg-primary/10', iconColor: 'text-primary' },
  activation: { icon: CheckCircle2, iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-600' },
  registration: { icon: UserPlus, iconBg: 'bg-accent/10', iconColor: 'text-accent' },
};

function statusBg(status) {
  const s = (status || '').toLowerCase();
  if (['succeeded', 'active', 'activated', 'registered', 'completed'].includes(s)) return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20';
  if (['failed', 'cancelled', 'canceled', 'blocked'].includes(s)) return 'bg-rose-500/10 text-rose-500 border border-rose-500/20';
  return 'bg-amber-500/10 text-amber-600 border border-amber-500/20';
}

export default function ActivityLog({ items = [] }) {
  const activities = (items || []).map((a, i) => ({
    id: i,
    type: a.type,
    subject: a.subject,
    actor: a.actor,
    timestamp: a.timestamp ? relativeTime(a.timestamp) : '',
    status: a.status,
    statusBg: statusBg(a.status),
    ...(CATEGORY_STYLE[a.category] || CATEGORY_STYLE.command),
  }));
  return (
    <div className="col-span-12 xl:col-span-12 bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm overflow-hidden space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <h3 className="text-base font-extrabold text-primary flex items-center gap-2">
          <Activity size={18} className="text-primary" />
          System Activity Log
        </h3>
        <span className="text-[11px] font-bold text-muted-foreground">Real-time Stream</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-4">Event Type</th>
              <th className="py-3 px-4">Subject Target</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 text-xs">
            {activities.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">No recent activity yet.</td></tr>
            )}
            {activities.map((row) => {
              const Icon = row.icon;
              return (
                <tr key={row.id} className="hover:bg-slate-100 transition-colors group">
                  <td className="py-3.5 px-4 font-bold text-primary">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg ${row.iconBg} ${row.iconColor} flex items-center justify-center`}>
                        <Icon size={14} />
                      </div>
                      <span>{row.type}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-primary">{row.subject}</td>
                  <td className="py-3.5 px-4 text-muted-foreground font-medium">{row.actor}</td>
                  <td className="py-3.5 px-4 text-muted-foreground font-medium">{row.timestamp}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${row.statusBg}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="text-accent font-bold hover:underline inline-flex items-center gap-0.5 cursor-pointer">
                      <span>View</span>
                      <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
