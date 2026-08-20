import React from 'react';

export default function FloatingActionButton() {
  return (
    <button className="fixed bottom-gutter right-gutter w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-primary/30 active:scale-95 group z-50 cursor-pointer">
      <span className="material-symbols-outlined text-2xl group-hover:rotate-90 transition-transform">
        add
      </span>
      <div className="absolute right-16 px-4 py-2 bg-on-surface text-white border border-on-surface rounded-xl text-button-text text-[12px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all pointer-events-none shadow-2xl">
        REGISTER NEW DEVICE
      </div>
    </button>
  );
}
