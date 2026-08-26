import React, { useState } from 'react';
import { X, Download, Key, ShieldCheck, AlertCircle, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { verifyLicenseKey } from '../../api/ems';
import { API_BASE } from '../../api/client';

export default function DownloadModal({ isOpen, onClose }) {
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setLicenseKey('');
    setError('');
    setSuccessData(null);
    setLoading(false);
    onClose();
  };

  const handleUseSampleKey = () => {
    setLicenseKey('LANCE-EMS-2026-KEY');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const key = licenseKey.trim();
    if (!key) {
      setError('Please enter a valid product license key.');
      return;
    }

    setError('');
    setLoading(true);
    setSuccessData(null);

    try {
      const result = await verifyLicenseKey(key);
      if (result && result.success) {
        // The download bundles this exact key as license.key inside the zip.
        const downloadUrl = `${API_BASE}/api/download-file?licenseKey=${encodeURIComponent(key)}`;
        setSuccessData({ ...(result.tenant || {}), downloadUrl });

        // Trigger automated browser download
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = '';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, 600);
      } else {
        setError(result?.error || 'Invalid or expired license key. Please check your key and try again.');
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please check your license key and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-background/95 border border-border/80 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 transition-all transform scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-slate-300 transition-colors"
          title="Close Modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-emerald-500/20 text-emerald-600 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
            <Download size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold text-primary tracking-tight">Download Product</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
                <Sparkles size={11} className="animate-pulse" />
                Licensed
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter your product license key to verify entitlement and start setup download.
            </p>
          </div>
        </div>

        {/* Content View: Success or Form */}
        {successData ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={24} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">License Verified Successfully!</h4>
                <p className="text-xs text-emerald-600/90 dark:text-emerald-300">
                  Your product installer <span className="font-mono font-semibold">({successData.fileName || 'TheLanceEndpoint.zip'})</span> is automatically downloading...
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs">
              <span className="text-emerald-700/80 dark:text-emerald-400 font-medium">
                Tenant: <strong>{successData.tenantName || 'Nexus Global'}</strong>
              </span>
              <a
                href={successData.downloadUrl || `${API_BASE}/api/download-file`}
                download
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Click if download didn't start
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* License Key Input Box */}
            <div className="space-y-2">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Product License Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
                  <Key size={16} />
                </div>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  placeholder="e.g. LANCE-EMS-2026-KEY"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border/80 rounded-xl text-sm font-mono tracking-wider font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all placeholder:text-muted-foreground/50 placeholder:font-sans placeholder:tracking-normal placeholder:font-normal"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Helper sample key shortcut */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
              <span>Required for agent activation</span>
              <button
                type="button"
                onClick={handleUseSampleKey}
                className="text-accent hover:underline font-medium cursor-pointer"
              >
                Use Sample Demo Key
              </button>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-600 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-muted-foreground hover:text-primary hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl text-xs font-bold shadow-lg shadow-accent/20 hover:shadow-xl transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Verifying Key...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={15} />
                    <span>Verify & Download</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
