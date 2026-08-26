import React from 'react';
import { Download } from 'lucide-react';

export default function Header({ pageTitle = 'Dashboard Overview', onDownloadClick }) {
  // Always route through the license-key modal (the download needs a key).
  const handleDownload = () => onDownloadClick?.();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-xl border-b border-border/80 px-6 lg:px-10 pb-4 pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl lg:text-2xl font-extrabold text-primary tracking-tight">
              {pageTitle}
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time endpoint status, user activity, policies & fleet security
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-accent-foreground font-extrabold text-sm rounded-xl shadow-md shadow-accent/20 hover:shadow-lg transition-all transform active:scale-95 cursor-pointer shrink-0"
          title="Download Product Setup Package"
        >
          <Download size={16} />
          <span>Download</span>
        </button>
      </div>
    </header>
  );
}



