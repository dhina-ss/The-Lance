import React, { useState, useEffect } from 'react';
import { Clock, Lock, Bell, Mail, Save, Send, ShieldCheck, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { fetchTenantSettings, saveTenantSettings, testTenantEmail } from '../../api/ems';

export default function SettingsPage() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [testing, setTesting] = useState(false);
	const [toast, setToast] = useState(null); // { kind: 'ok'|'err', text }

	const [lockMinutes, setLockMinutes] = useState(5);
	const [alertMinutes, setAlertMinutes] = useState(10);
	const [smtpHost, setSmtpHost] = useState('');
	const [smtpPort, setSmtpPort] = useState(587);
	const [smtpUser, setSmtpUser] = useState('');
	const [smtpFrom, setSmtpFrom] = useState('');
	const [smtpUseTls, setSmtpUseTls] = useState(true);
	const [smtpPass, setSmtpPass] = useState('');
	const [smtpConfigured, setSmtpConfigured] = useState(false);
	const [testTo, setTestTo] = useState('');

	const applySettings = (s) => {
		setLockMinutes(s.inactivityLockMinutes ?? 5);
		setAlertMinutes(s.inactivityAlertMinutes ?? 10);
		setSmtpHost(s.smtpHost || '');
		setSmtpPort(s.smtpPort ?? 587);
		setSmtpUser(s.smtpUser || '');
		setSmtpFrom(s.smtpFrom || '');
		setSmtpUseTls(s.smtpUseTls ?? true);
		setSmtpConfigured(!!s.smtpConfigured);
	};

	const load = async () => {
		try {
			applySettings(await fetchTenantSettings());
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
				smtpHost: smtpHost.trim(),
				smtpPort: Number(smtpPort) || 587,
				smtpUser: smtpUser.trim(),
				smtpFrom: smtpFrom.trim(),
				smtpUseTls: smtpUseTls,
				smtpPass: smtpPass, // blank keeps the saved password
			});
			setSmtpPass('');
			await load();
			setToast({ kind: 'ok', text: 'Settings saved successfully.' });
		} catch (err) {
			setToast({ kind: 'err', text: err instanceof Error ? err.message : 'Failed to save settings.' });
		} finally {
			setSaving(false);
		}
	};

	const handleTest = async () => {
		setTesting(true);
		try {
			const r = await testTenantEmail(testTo.trim());
			if (r.emailed) {
				setToast({ kind: 'ok', text: `Test email sent to ${r.to}.` });
			} else {
				setToast({ kind: 'err', text: `Not sent: ${r.detail || 'unknown error'}` });
			}
		} catch (err) {
			setToast({ kind: 'err', text: err instanceof Error ? err.message : 'Failed to send test email.' });
		} finally {
			setTesting(false);
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
			</section>

			{/* Email (SMTP) Configuration */}
			<section className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm">
				<div className="flex items-start gap-3 mb-5">
					<div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0"><Mail size={20} /></div>
					<div className="flex-1">
						<h2 className="text-lg font-extrabold text-primary tracking-tight flex items-center gap-2">
							Alert Mail Configuration (SMTP)
							{smtpConfigured && (
								<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 inline-flex items-center gap-1">
									<ShieldCheck size={11} /> Configured
								</span>
							)}
						</h2>
						<p className="text-xs text-muted-foreground mt-0.5">The mailbox used to send inactivity alerts to managers. For Gmail/Outlook, use an app password. Stored securely on the server.</p>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="sm:col-span-2">
						<label className={labelCls}>SMTP Host</label>
						<input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="e.g. smtp.gmail.com" className={inputCls} />
					</div>
					<div>
						<label className={labelCls}>Port</label>
						<input type="number" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} placeholder="587" className={inputCls} />
					</div>
					<div className="flex items-end pb-1">
						<label className="flex items-center gap-2 cursor-pointer select-none">
							<input type="checkbox" checked={smtpUseTls} onChange={(e) => setSmtpUseTls(e.target.checked)} className="rounded border-input text-primary focus:ring-accent accent-accent cursor-pointer" />
							<span className="text-xs font-semibold text-primary">Use STARTTLS (uncheck for port 465 / SSL)</span>
						</label>
					</div>
					<div>
						<label className={labelCls}>Username</label>
						<input type="text" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="mailbox@company.com" className={inputCls} />
					</div>
					<div>
						<label className={labelCls}>Password / App password</label>
						<input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder={smtpConfigured ? 'Leave blank to keep saved password' : 'Enter password'} className={inputCls} />
					</div>
					<div className="sm:col-span-2">
						<label className={labelCls}>From address (optional)</label>
						<input type="text" value={smtpFrom} onChange={(e) => setSmtpFrom(e.target.value)} placeholder="Defaults to the username above" className={inputCls} />
					</div>
				</div>

				<div className="mt-5 pt-4 border-t border-border/60 flex flex-col sm:flex-row sm:items-end gap-3">
					<div className="flex-1">
						<label className={labelCls}>Send a test email to</label>
						<input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="Defaults to the tenant admin email" className={inputCls} />
					</div>
					<button type="button" onClick={handleTest} disabled={testing} className="px-4 py-2.5 bg-background border border-border/80 text-primary hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-60 h-[38px]">
						<Send size={15} /> {testing ? 'Sending…' : 'Send Test'}
					</button>
				</div>
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
const labelCls = 'text-xs font-semibold text-primary block mb-1.5';
