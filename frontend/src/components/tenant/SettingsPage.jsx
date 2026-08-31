import React, { useState, useEffect } from 'react';
import { Clock, Lock, Bell, Save, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { fetchTenantSettings, saveTenantSettings } from '../../api/ems';

export default function SettingsPage() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [toast, setToast] = useState(null); // { kind: 'ok'|'err', text }

	const [lockMinutes, setLockMinutes] = useState(5);
	const [alertMinutes, setAlertMinutes] = useState(10);

	const load = async () => {
		try {
			const s = await fetchTenantSettings();
			setLockMinutes(s.inactivityLockMinutes ?? 5);
			setAlertMinutes(s.inactivityAlertMinutes ?? 10);
		} catch (err) {
			setToast({ kind: 'err', text: err instanceof Error ? err.message : 'Failed to load settings.' });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { load(); }, []);

	useEffect(() => {
		if (toast) {
			const t = setTimeout(() => setToast(null), 5000);
			return () => clearTimeout(t);
		}
	}, [toast]);

	const handleSave = async () => {
		setSaving(true);
		try {
			await saveTenantSettings({
				inactivityLockMinutes: Number(lockMinutes) || 5,
				inactivityAlertMinutes: Number(alertMinutes) || 10,
			});
			setToast({ kind: 'ok', text: 'Settings saved successfully.' });
		} catch (err) {
			setToast({ kind: 'err', text: err instanceof Error ? err.message : 'Failed to save settings.' });
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <div className="p-6 lg:p-10 text-sm text-muted-foreground">Loading settings…</div>;
	}

	return (
		<div className="p-6 lg:p-10 space-y-6 max-w-4xl">
			{toast && (
				<div className={`rounded-2xl p-4 flex items-center justify-between shadow-sm border ${
					toast.kind === 'ok'
						? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
						: 'bg-rose-500/10 border-rose-500/30 text-rose-600'
				}`}>
					<div className="flex items-center gap-3">
						<div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${toast.kind === 'ok' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
							{toast.kind === 'ok' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
						</div>
						<span className="text-xs font-bold">{toast.text}</span>
					</div>
					<button onClick={() => setToast(null)} className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"><X size={16} /></button>
				</div>
			)}

			{/* Inactivity Auto-Lock */}
			<section className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm">
				<div className="flex items-start gap-3 mb-5">
					<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Clock size={20} /></div>
					<div>
						<h2 className="text-lg font-extrabold text-primary tracking-tight">Inactivity Auto-Lock</h2>
						<p className="text-xs text-muted-foreground mt-0.5">Lock idle devices automatically and email the assigned manager if the user does not return. Applies to every device in your tenant. Managers are assigned per user in User Management.</p>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1.5"><Lock size={13} /> Lock screen after (minutes)</label>
						<input type="number" min={1} max={240} value={lockMinutes} onChange={(e) => setLockMinutes(e.target.value)} className={inputCls} />
					</div>
					<div>
						<label className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1.5"><Bell size={13} /> Alert manager after locked (minutes)</label>
						<input type="number" min={1} max={1440} value={alertMinutes} onChange={(e) => setAlertMinutes(e.target.value)} className={inputCls} />
					</div>
				</div>
				<p className="text-[11px] text-muted-foreground mt-4">Alert emails are sent through the mail server configured by the software provider.</p>
			</section>

			<div className="flex justify-end">
				<button type="button" onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60">
					<Save size={16} /> {saving ? 'Saving…' : 'Save Settings'}
				</button>
			</div>
		</div>
	);
}

const inputCls = 'w-full bg-background border border-input rounded-xl px-3.5 py-2 text-xs font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all';
