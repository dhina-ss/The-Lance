import React from 'react';

export default function FleetGeolocation() {
  return (
    <div className="bg-white border border-outline-variant/50 rounded-3xl p-lg h-48 relative overflow-hidden card-shadow">
      <div className="absolute inset-0 z-0 grayscale opacity-20 hover:grayscale-0 transition-all duration-1000">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDFOc9lcx5mb5fG67Z8odekVTFmfdl8INFj1coMh7tkdLsC9Z3_p_9Qm3-I-_QXucVkyIWFL_Xy5UAYFR88AlYAImtMs3Upixg-3biHWrTqZDCHa8sFTheeNJ7g6PXD8EWqXqzHfnJZj6xdY_-xedcgESfZcF2IOM268NeHXOzQLG3XV_FAg4Dqqolh2s9sEKCo5_QPfZJeBnYJ8yWYRHmf4m768-5cSCAXAH_G09b3URflIawPZF6B')`,
          }}
        ></div>
      </div>
      <div className="relative z-10 flex flex-col h-full pointer-events-none">
        <h5 className="text-[10px] font-bold uppercase tracking-widest text-on-surface bg-white/90 px-3 py-1 rounded-full self-start border border-outline-variant/30 mb-auto shadow-sm">
          Fleet Geolocation
        </h5>
        <div className="flex gap-4 mt-auto">
          <div className="bg-white/95 px-4 py-2 rounded-2xl border border-outline-variant/30 backdrop-blur-sm shadow-md">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase">US-EAST</p>
            <p className="text-md font-bold text-primary">842 Nodes</p>
          </div>
          <div className="bg-white/95 px-4 py-2 rounded-2xl border border-outline-variant/30 backdrop-blur-sm shadow-md">
            <p className="text-[10px] text-on-surface-variant font-bold uppercase">EU-WEST</p>
            <p className="text-md font-bold text-secondary">442 Nodes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
