import React from 'react';
import { BarChart3 } from 'lucide-react';

// Colors the bar by how hot the device is running.
function barTone(cpu) {
  if (cpu >= 85) return 'bg-rose-500';
  if (cpu >= 60) return 'bg-amber-500';
  return 'bg-primary';
}

export default function PerformanceMatrix({ data = [] }) {
  const devices = data || [];

  return (
    <div className="col-span-12 lg:col-span-8 bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h3 className="text-base font-extrabold text-primary flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            System Performance Matrix
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live CPU utilization per registered device (hover for memory &amp; disk)
          </p>
        </div>
        <span className="text-[11px] font-bold text-muted-foreground self-start sm:self-auto">Real-time</span>
      </div>

      {/* Chart Visuals */}
      {devices.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-xs text-muted-foreground">
          No devices reporting metrics yet.
        </div>
      ) : (
        <div className="h-64 w-full relative flex items-end justify-between px-4 gap-4">
          {/* Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
            <div className="border-b border-muted-foreground/30 w-full" />
            <div className="border-b border-muted-foreground/30 w-full" />
            <div className="border-b border-muted-foreground/30 w-full" />
            <div className="border-b border-muted-foreground/30 w-full" />
          </div>

          {/* Bars — one per device, height = CPU % */}
          {devices.map((item) => (
            <div
              key={item.label}
              className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer z-10"
            >
              <div className="absolute -top-16 bg-primary text-primary-foreground text-[11px] py-1.5 px-3 rounded-xl shadow-xl z-30 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-bold text-xs">{item.label}</p>
                <p className="text-[10px]">CPU {item.cpu}% · Mem {item.memory}% · Disk {item.disk}%</p>
              </div>
              <div className="w-full max-w-[44px] flex items-end justify-center h-full">
                <div
                  style={{ height: `${Math.max(2, item.cpu)}%` }}
                  className={`w-full rounded-t-lg transition-all duration-200 ${barTone(item.cpu)} group-hover:brightness-110`}
                />
              </div>
              <span className="text-[10px] font-bold mt-3 text-muted-foreground truncate max-w-[60px]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-6 pt-2 border-t border-border/40 text-xs font-semibold text-muted-foreground">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-md bg-primary inline-block" /><span>Normal</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-md bg-amber-500 inline-block" /><span>High (≥60%)</span></div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-md bg-rose-500 inline-block" /><span>Critical (≥85%)</span></div>
      </div>
    </div>
  );
}
