import React, { useState } from 'react';
import { BarChart3, ChevronDown } from 'lucide-react';

const monthlyData = [
  { month: 'Feb', height: 55, active: false },
  { month: 'Mar', height: 85, active: true, userCount: '490K', growth: '+49% vs prev month' },
  { month: 'Apr', height: 40, active: false },
  { month: 'May', height: 65, active: false },
  { month: 'Jun', height: 30, active: false },
  { month: 'Jul', height: 50, active: false },
];

export default function PerformanceMatrix() {
  const [timeframe, setTimeframe] = useState('6 months');

  return (
    <div className="col-span-12 lg:col-span-8 bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h3 className="text-base font-extrabold text-primary flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            System Performance Matrix
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Telemetry throughput and user activity volume across registered nodes
          </p>
        </div>

        <button
          onClick={() => setTimeframe(timeframe === '6 months' ? '3 months' : '6 months')}
          className="px-3.5 py-1.5 bg-background border border-input rounded-xl text-xs font-semibold text-primary hover:bg-muted/50 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <span>{timeframe}</span>
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Chart Visuals */}
      <div className="h-64 w-full relative flex items-end justify-between px-4 gap-4">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
          <div className="border-b border-muted-foreground/30 w-full" />
          <div className="border-b border-muted-foreground/30 w-full" />
          <div className="border-b border-muted-foreground/30 w-full" />
          <div className="border-b border-muted-foreground/30 w-full" />
        </div>

        {/* Bars */}
        {monthlyData.map((item) => (
          <div
            key={item.month}
            className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer z-10"
          >
            {item.userCount && (
              <div className="absolute -top-14 bg-primary text-primary-foreground text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-xl z-30 whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-bold text-xs">New Users: {item.userCount}</p>
                <p className="text-emerald-400 font-semibold text-[10px]">{item.growth}</p>
              </div>
            )}
            <div className="w-full max-w-[44px] flex items-end justify-center h-full">
              <div
                style={{ height: `${item.height}%` }}
                className={`w-full rounded-t-lg transition-all duration-200 ${
                  item.active
                    ? 'bg-primary shadow-lg shadow-primary/20 brightness-110'
                    : 'bg-primary/20 group-hover:bg-primary/40'
                }`}
              />
            </div>
            <span className={`text-xs font-bold mt-3 transition-colors ${item.active ? 'text-primary' : 'text-muted-foreground'}`}>
              {item.month}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 pt-2 border-t border-border/40">
        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
          <span className="w-3 h-3 rounded-md bg-primary inline-block" />
          <span>Total Registered Users Activity</span>
        </div>
      </div>
    </div>
  );
}
