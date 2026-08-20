import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto p-gutter border-t border-outline-variant/50 flex flex-col md:flex-row justify-between items-center gap-md bg-white">
      <div className="flex items-center gap-2 text-on-surface-variant text-xs font-semibold">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft"></span>
        <span>
          SYSTEM STATUS:{' '}
          <span className="font-bold text-primary uppercase">Nominal</span>
        </span>
        <span className="mx-2 text-outline-variant/50">|</span>
        <span>LATENCY: 12ms</span>
        <span className="mx-2 text-outline-variant/50">|</span>
        <span>SYNC: 2s AGO</span>
      </div>
      <div className="text-[10px] text-on-surface-variant font-bold tracking-wider uppercase">
        © 2024 EMS MISSION CONTROL - SECURED ENTERPRISE ARCHITECTURE
      </div>
    </footer>
  );
}
