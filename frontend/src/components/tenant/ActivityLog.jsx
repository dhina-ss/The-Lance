import React from 'react';
import { Activity, DownloadCloud, UserPlus, Key, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';

const activities = [
  {
    id: 1,
    type: 'Software Patch',
    icon: DownloadCloud,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    subject: 'KB5032486 Update',
    actor: 'System-Automator',
    timestamp: '2026-08-19 21:40',
    status: 'Completed',
    statusBg: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
  },
  {
    id: 2,
    type: 'Device Registration',
    icon: UserPlus,
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    subject: 'Workstation-NY-42',
    actor: 'j_doe@enterprise.com',
    timestamp: '2026-08-19 20:15',
    status: 'Active',
    statusBg: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
  },
  {
    id: 3,
    type: 'Admin Access',
    icon: Key,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    subject: 'Root Console Login',
    actor: 'sec-admin-01',
    timestamp: '2026-08-19 19:30',
    status: 'Verified',
    statusBg: 'bg-primary/10 text-primary border border-primary/20',
  },
  {
    id: 4,
    type: 'Policy Violation',
    icon: AlertTriangle,
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
    subject: 'Unlicensed Software',
    actor: 'User-88219',
    timestamp: '2026-08-19 18:05',
    status: 'Blocked',
    statusBg: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
  },
];

export default function ActivityLog() {
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
            {activities.map((row) => {
              const Icon = row.icon;
              return (
                <tr key={row.id} className="hover:bg-muted/40 transition-colors group">
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
