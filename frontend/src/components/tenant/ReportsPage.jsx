import React, { useState, useEffect, useMemo } from 'react';
import XLSX from 'xlsx-js-style';
import {
	FileText,
	Monitor,
	Users,
	Search,
	Download,
	RefreshCw,
	LogIn,
	LogOut,
	Power,
	Moon,
	Sun,
	Lock,
	Unlock,
	Bell,
	UserPlus,
	Activity,
	Wifi,
	WifiOff,
	ShieldCheck,
	ShieldAlert,
	ArrowRight,
	CheckCircle2,
	Loader2,
	ChevronLeft,
	ChevronRight,
	Calendar,
} from 'lucide-react';
import { fetchAllUserLogs, fetchDevices, fetchUsers, formatDate, relativeTime } from '../../api/ems';

function getEventMeta(type, detail) {
	const t = (type || '').toLowerCase();
	switch (t) {
		case 'login':
			return {
				label: 'User Login',
				icon: LogIn,
				badge: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
				desc: detail ? `User signed in: ${detail}` : 'Employee signed in to endpoint session',
			};
		case 'logoff':
		case 'logout':
			return {
				label: 'User Logoff',
				icon: LogOut,
				badge: 'text-slate-600 bg-slate-500/10 border-slate-500/20',
				desc: detail ? `User signed out: ${detail}` : 'Employee signed out of endpoint session',
			};
		case 'device_on':
		case 'startup':
		case 'power_on':
			return {
				label: 'Device On',
				icon: Power,
				badge: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20',
				desc: detail || 'Endpoint powered on and online',
			};
		case 'sleep':
		case 'suspend':
			return {
				label: 'Device Sleep',
				icon: Moon,
				badge: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20',
				desc: detail || 'Endpoint entered sleep / standby mode',
			};
		case 'wake':
		case 'resume':
			return {
				label: 'Device Woke',
				icon: Sun,
				badge: 'text-sky-600 bg-sky-500/10 border-sky-500/20',
				desc: detail || 'Endpoint resumed from sleep / standby',
			};
		case 'lock':
			return {
				label: 'Screen Locked',
				icon: Lock,
				badge: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
				desc: detail ? `Screen locked: ${detail}` : 'Inactivity auto-lock / user screen locked',
			};
		case 'unlock':
			return {
				label: 'Screen Unlocked',
				icon: Unlock,
				badge: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
				desc: detail || 'Endpoint screen unlocked / session resumed',
			};
		case 'shutdown': {
			const isDurationOnly = detail && /^\d+[dhm](\s+\d+[hm])?$/i.test(detail.trim());
			return {
				label: 'Device Shutdown',
				icon: Power,
				badge: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
				desc: detail ? (isDurationOnly ? `Session ended (gap: ${detail})` : detail) : 'Endpoint powered off',
			};
		}
		case 'alert':
			return {
				label: 'Inactivity Alert',
				icon: Bell,
				badge: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
				desc: detail ? `Manager notified: ${detail}` : 'Prolonged inactivity manager alert',
			};
		case 'account_created':
			return {
				label: 'Account Enrolled',
				icon: UserPlus,
				badge: 'text-purple-600 bg-purple-500/10 border-purple-500/20',
				desc: detail || 'EMS account enrolled',
			};
		default:
			return {
				label: (type || 'Activity').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
				icon: Activity,
				badge: 'text-primary bg-primary/10 border-primary/20',
				desc: detail || 'Endpoint event recorded',
			};
	}
}

function getDeviceSecurityCondition(dev) {
	if (dev.securityStatusUpdatedAt == null) {
		return { label: 'Pending', ok: true, cls: 'bg-slate-100 text-slate-600 border-slate-200' };
	}
	const sigOk = dev.defenderSignatureAgeDays == null || dev.defenderSignatureAgeDays <= 7;
	const ok = dev.defenderRealtime === true && dev.defenderAntivirus === true && sigOk;
	return ok
		? { label: 'Optimal', ok: true, cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' }
		: { label: 'Attention', ok: false, cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
}

function exportStyledSheet(sheetName, fileName, headers, rows, centerCols = [0]) {
	const sheetData = [headers, ...rows];
	const ws = XLSX.utils.aoa_to_sheet(sheetData);
	const thinBorder = {
		top: { style: 'thin', color: { rgb: 'D0D5DD' } },
		bottom: { style: 'thin', color: { rgb: 'D0D5DD' } },
		left: { style: 'thin', color: { rgb: 'D0D5DD' } },
		right: { style: 'thin', color: { rgb: 'D0D5DD' } },
	};
	const headerStyle = {
		fill: { fgColor: { rgb: '16365C' } },
		font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11, name: 'Calibri' },
		alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
		border: thinBorder,
	};
	const dataStyle = {
		font: { sz: 10, name: 'Calibri', color: { rgb: '1D2939' } },
		alignment: { vertical: 'center' },
		border: thinBorder,
	};

	const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
	ws['!cols'] = headers.map((h, colIdx) => {
		let maxLen = h.length;
		for (let r = 1; r <= rows.length; r++) {
			const val = String(sheetData[r]?.[colIdx] ?? '');
			if (val.length > maxLen) maxLen = val.length;
		}
		return { wch: Math.min(Math.max(maxLen + 4, 12), 42) };
	});
	ws['!rows'] = [{ hpt: 22, hpx: 22 }, ...rows.map(() => ({ hpt: 19, hpx: 19 }))];

	for (let R = range.s.r; R <= range.e.r; R++) {
		for (let C = range.s.c; C <= range.e.c; C++) {
			const addr = XLSX.utils.encode_cell({ r: R, c: C });
			if (!ws[addr]) continue;
			ws[addr].s =
				R === 0
					? headerStyle
					: { ...dataStyle, alignment: { ...dataStyle.alignment, horizontal: centerCols.includes(C) ? 'center' : 'left' } };
		}
	}

	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, sheetName);
	XLSX.writeFile(wb, fileName);
}

export default function ReportsPage({ onNavigateTab, onNavigateToDevice }) {
	const [activeCard, setActiveCard] = useState('user-logs'); // 'user-logs' | 'device-report'
	const [devices, setDevices] = useState([]);
	const [users, setUsers] = useState([]);
	const [userLogs, setUserLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState(null);
	const [toast, setToast] = useState(null);

	// Filters & pagination
	const [searchTerm, setSearchTerm] = useState('');
	const [daysWindow, setDaysWindow] = useState(30); // 1 | 7 | 30
	const [eventFilter, setEventFilter] = useState('ALL');
	const [deviceStatusFilter, setDeviceStatusFilter] = useState('ALL');
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 15;
	const [exportingKind, setExportingKind] = useState(null);

	const loadAll = async (silent = false, days = daysWindow) => {
		if (!silent) setLoading(true);
		else setRefreshing(true);
		try {
			const [devs, usrs, logs] = await Promise.all([
				fetchDevices().catch(() => []),
				fetchUsers().catch(() => []),
				fetchAllUserLogs(days, 600).catch(() => []),
			]);
			setDevices(devs || []);
			setUsers(usrs || []);
			setUserLogs(logs || []);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load reports data.');
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	useEffect(() => {
		loadAll(false, daysWindow);
		const timer = setInterval(() => loadAll(true, daysWindow), 30000);
		return () => clearInterval(timer);
	}, [daysWindow]);

	useEffect(() => {
		setCurrentPage(1);
	}, [activeCard, searchTerm, eventFilter, deviceStatusFilter, daysWindow]);

	const notify = (msg) => {
		setToast(msg);
		setTimeout(() => setToast(null), 4000);
	};

	// Card summary stats
	const logStats = useMemo(() => {
		const todayPrefix = new Date().toISOString().slice(0, 10);
		let todayCount = 0;
		let loginCount = 0;
		let sleepWakeCount = 0;
		let shutdownCount = 0;
		for (const ev of userLogs) {
			const t = (ev.type || '').toLowerCase();
			if (ev.at && ev.at.slice(0, 10) === todayPrefix) todayCount++;
			if (t === 'login' || t === 'unlock' || t === 'device_on') loginCount++;
			else if (t === 'sleep' || t === 'wake' || t === 'lock') sleepWakeCount++;
			else if (t === 'shutdown') shutdownCount++;
		}
		return {
			total: userLogs.length,
			todayCount,
			loginCount,
			sleepWakeCount,
			shutdownCount,
			userCount: users.length,
		};
	}, [userLogs, users]);

	const deviceStats = useMemo(() => {
		const total = devices.length;
		const online = devices.filter((d) => d.status === 'Online').length;
		const sleep = devices.filter((d) => d.status === 'Sleep').length;
		const offline = devices.filter((d) => d.status === 'Offline').length;
		const optimal = devices.filter((d) => getDeviceSecurityCondition(d).ok).length;
		return { total, online, sleep, offline, optimal };
	}, [devices]);

	// Filtered rows
	const filteredUserLogs = useMemo(() => {
		const q = searchTerm.trim().toLowerCase();
		const cutoffMs = Date.now() - daysWindow * 86400 * 1000;
		return userLogs.filter((ev) => {
			if (ev.at) {
				const ts = Date.parse(ev.at);
				if (!Number.isNaN(ts) && ts < cutoffMs) return false;
			}
			const evType = (ev.type || '').toLowerCase();
			if (eventFilter !== 'ALL') {
				if (eventFilter === 'logoff') {
					if (evType !== 'logoff' && evType !== 'logout') return false;
				} else if (evType !== eventFilter) {
					return false;
				}
			}
			if (!q) return true;
			const meta = getEventMeta(ev.type, ev.detail);
			return [ev.userName, ev.userEmail, ev.empCode, ev.deviceName, ev.osUsername, ev.detail, meta.label]
				.filter(Boolean)
				.some((v) => String(v).toLowerCase().includes(q));
		});
	}, [userLogs, searchTerm, eventFilter, daysWindow]);

	const filteredDevices = useMemo(() => {
		const q = searchTerm.trim().toLowerCase();
		return devices.filter((d) => {
			if (deviceStatusFilter !== 'ALL' && (d.status || '').toLowerCase() !== deviceStatusFilter.toLowerCase()) {
				return false;
			}
			if (!q) return true;
			return [d.name, d.model, d.userName, d.user, d.empCode, d.ip, d.os, d.locationLabel]
				.filter(Boolean)
				.some((v) => String(v).toLowerCase().includes(q));
		});
	}, [devices, searchTerm, deviceStatusFilter]);

	const activeList = activeCard === 'user-logs' ? filteredUserLogs : filteredDevices;
	const totalPages = Math.max(1, Math.ceil(activeList.length / pageSize));
	const safePage = Math.min(currentPage, totalPages);
	const paginated = activeList.slice((safePage - 1) * pageSize, safePage * pageSize);

	const handleExportUserLogs = async () => {
		if (exportingKind) return;
		setExportingKind('user-logs');
		try {
			const headers = ['S.No', 'User Name', 'Employee Code', 'Email', 'Device Name', 'OS User', 'Event', 'Details', 'Timestamp'];
			const rows = filteredUserLogs.map((ev, idx) => {
				const meta = getEventMeta(ev.type, ev.detail);
				return [
					idx + 1,
					ev.userName || ev.osUsername || '—',
					ev.empCode || '—',
					ev.userEmail || '—',
					ev.deviceName || '—',
					ev.osUsername || '—',
					meta.label,
					meta.desc,
					formatDate(ev.at),
				];
			});
			const stamp = new Date().toISOString().slice(0, 10);
			exportStyledSheet('User Logs Report', `User_Logs_Report_${stamp}.xlsx`, headers, rows, [0, 2, 6]);
			notify(`Exported ${rows.length} user log entries to Excel.`);
		} catch {
			notify('Failed to export user logs.');
		} finally {
			setExportingKind(null);
		}
	};

	const handleExportDeviceReport = async () => {
		if (exportingKind) return;
		setExportingKind('device-report');
		try {
			const headers = ['S.No', 'Device Name', 'Assigned User', 'Employee Code', 'OS Version', 'Location', 'IP Address', 'Registered On', 'Network Usage', 'Condition', 'Status'];
			const rows = filteredDevices.map((dev, idx) => {
				const cond = getDeviceSecurityCondition(dev);
				return [
					idx + 1,
					dev.name || '—',
					dev.userName || dev.user || '—',
					dev.empCode || '—',
					dev.os || '—',
					dev.locationLabel || dev.city || dev.country || '—',
					dev.ip || '—',
					dev.registrationDate || '—',
					dev.networkTotal || '—',
					cond.label,
					dev.status || 'Offline',
				];
			});
			const stamp = new Date().toISOString().slice(0, 10);
			exportStyledSheet('Device Report', `Device_Report_${stamp}.xlsx`, headers, rows, [0, 3, 9, 10]);
			notify(`Exported ${rows.length} device report rows to Excel.`);
		} catch {
			notify('Failed to export device report.');
		} finally {
			setExportingKind(null);
		}
	};

	return (
		<div className="p-6 lg:p-10 space-y-6">
			{toast && (
				<div className="fixed bottom-6 right-6 z-[100000] bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border border-accent/30">
					<CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
					<span>{toast}</span>
				</div>
			)}

			{error && (
				<div className="bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl px-4 py-3 text-xs font-semibold">
					{error}
				</div>
			)}

			{/* Two Report Cards: User Logs & Device Report */}
			<section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Card 1: User Logs */}
				<div
					onClick={() => setActiveCard('user-logs')}
					className={`bg-background/95 backdrop-blur-xl rounded-2xl p-6 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-5 ${
						activeCard === 'user-logs'
							? 'border-2 border-accent shadow-lg shadow-accent/10 ring-2 ring-accent/15'
							: 'border border-border/80 shadow-sm hover:border-primary/40 hover:shadow-md'
					}`}
				>
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-start gap-4">
							<div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${activeCard === 'user-logs' ? 'bg-accent text-white shadow-md shadow-accent/25' : 'bg-primary/10 text-primary'}`}>
								<Users size={22} />
							</div>
							<div>
								<div className="flex items-center gap-2 flex-wrap">
									<h3 className="text-lg font-extrabold text-primary tracking-tight">User Logs</h3>
									{activeCard === 'user-logs' && (
										<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent border border-accent/25">
											Viewing
										</span>
									)}
								</div>
								<p className="text-xs text-muted-foreground mt-0.5">
									Login, logoff, screen lock/unlock, sleep, wake-up, and shutdown audit timeline across all users
								</p>
							</div>
						</div>
						<span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-primary/10 text-primary shrink-0">
							{logStats.total} logs
						</span>
					</div>

					<div className="grid grid-cols-4 gap-2.5">
						<div className="bg-slate-50/90 border border-border/60 rounded-xl px-3 py-2.5">
							<span className="text-[10px] font-bold uppercase text-muted-foreground block">Today</span>
							<span className="text-base font-black text-primary">{logStats.todayCount}</span>
						</div>
						<div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl px-3 py-2.5">
							<span className="text-[10px] font-bold uppercase text-emerald-700 block">Login / Wake</span>
							<span className="text-base font-black text-emerald-700">{logStats.loginCount}</span>
						</div>
						<div className="bg-indigo-50/60 border border-indigo-200/70 rounded-xl px-3 py-2.5">
							<span className="text-[10px] font-bold uppercase text-indigo-700 block">Sleep / Lock</span>
							<span className="text-base font-black text-indigo-700">{logStats.sleepWakeCount}</span>
						</div>
						<div className="bg-rose-50/60 border border-rose-200/70 rounded-xl px-3 py-2.5">
							<span className="text-[10px] font-bold uppercase text-rose-700 block">Shutdown</span>
							<span className="text-base font-black text-rose-700">{logStats.shutdownCount}</span>
						</div>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setActiveCard('user-logs');
								}}
								className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
									activeCard === 'user-logs'
										? 'bg-primary text-primary-foreground shadow-sm'
										: 'bg-slate-100 text-primary hover:bg-slate-200/80'
								}`}
							>
								<FileText size={14} /> View User Logs
							</button>
							<button
								type="button"
								disabled={exportingKind === 'user-logs'}
								onClick={(e) => {
									e.stopPropagation();
									handleExportUserLogs();
								}}
								className="px-3.5 py-2 rounded-xl text-xs font-bold bg-accent/10 text-accent hover:bg-accent hover:text-white border border-accent/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
							>
								{exportingKind === 'user-logs' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
								<span>Export Excel</span>
							</button>
						</div>
						{onNavigateTab && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onNavigateTab('users-logs');
								}}
								className="text-xs font-bold text-muted-foreground hover:text-accent flex items-center gap-1 cursor-pointer transition-colors"
							>
								Users Page <ArrowRight size={13} />
							</button>
						)}
					</div>
				</div>

				{/* Card 2: Device Report */}
				<div
					onClick={() => setActiveCard('device-report')}
					className={`bg-background/95 backdrop-blur-xl rounded-2xl p-6 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between gap-5 ${
						activeCard === 'device-report'
							? 'border-2 border-accent shadow-lg shadow-accent/10 ring-2 ring-accent/15'
							: 'border border-border/80 shadow-sm hover:border-primary/40 hover:shadow-md'
					}`}
				>
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-start gap-4">
							<div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${activeCard === 'device-report' ? 'bg-accent text-white shadow-md shadow-accent/25' : 'bg-primary/10 text-primary'}`}>
								<Monitor size={22} />
							</div>
							<div>
								<div className="flex items-center gap-2 flex-wrap">
									<h3 className="text-lg font-extrabold text-primary tracking-tight">Device Report</h3>
									{activeCard === 'device-report' && (
										<span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent/15 text-accent border border-accent/25">
											Viewing
										</span>
									)}
								</div>
								<p className="text-xs text-muted-foreground mt-0.5">
									Fleet live status, assigned users, location, network usage, and Defender health summary
								</p>
							</div>
						</div>
						<span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-primary/10 text-primary shrink-0">
							{deviceStats.total} devices
						</span>
					</div>

					<div className="grid grid-cols-4 gap-2.5">
						<div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl px-3 py-2.5">
							<span className="text-[10px] font-bold uppercase text-emerald-700 block">Online</span>
							<span className="text-base font-black text-emerald-700">{deviceStats.online}</span>
						</div>
						<div className="bg-amber-50/60 border border-amber-200/70 rounded-xl px-3 py-2.5">
							<span className="text-[10px] font-bold uppercase text-amber-700 block">Sleep</span>
							<span className="text-base font-black text-amber-700">{deviceStats.sleep}</span>
						</div>
						<div className="bg-rose-50/60 border border-rose-200/70 rounded-xl px-3 py-2.5">
							<span className="text-[10px] font-bold uppercase text-rose-700 block">Offline</span>
							<span className="text-base font-black text-rose-700">{deviceStats.offline}</span>
						</div>
						<div className="bg-slate-50/90 border border-border/60 rounded-xl px-3 py-2.5">
							<span className="text-[10px] font-bold uppercase text-muted-foreground block">Secured</span>
							<span className="text-base font-black text-primary">{deviceStats.optimal}</span>
						</div>
					</div>

					<div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									setActiveCard('device-report');
								}}
								className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
									activeCard === 'device-report'
										? 'bg-primary text-primary-foreground shadow-sm'
										: 'bg-slate-100 text-primary hover:bg-slate-200/80'
								}`}
							>
								<Monitor size={14} /> View Device Report
							</button>
							<button
								type="button"
								disabled={exportingKind === 'device-report'}
								onClick={(e) => {
									e.stopPropagation();
									handleExportDeviceReport();
								}}
								className="px-3.5 py-2 rounded-xl text-xs font-bold bg-accent/10 text-accent hover:bg-accent hover:text-white border border-accent/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
							>
								{exportingKind === 'device-report' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
								<span>Export Excel</span>
							</button>
						</div>
						{onNavigateTab && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onNavigateTab('devices-report');
								}}
								className="text-xs font-bold text-muted-foreground hover:text-accent flex items-center gap-1 cursor-pointer transition-colors"
							>
								Devices Report <ArrowRight size={13} />
							</button>
						)}
					</div>
				</div>
			</section>

			{/* Detailed Report Table */}
			<div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-sm overflow-hidden">
				<div className="p-6 border-b border-border/60 space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<h2 className="text-lg font-extrabold text-primary tracking-tight">
								{activeCard === 'user-logs' ? 'User Activity & Session Logs Report' : 'Fleet Device Compliance & Status Report'}
							</h2>
							<p className="text-xs text-muted-foreground mt-0.5">
								{activeCard === 'user-logs'
									? `Showing ${filteredUserLogs.length} session event(s) over the last ${daysWindow === 1 ? '24 hours' : `${daysWindow} days`}`
									: `Showing ${filteredDevices.length} of ${devices.length} enrolled endpoint device(s)`}
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<button
								type="button"
								onClick={() => loadAll(true, daysWindow)}
								className="px-3.5 py-2 bg-background border border-input text-primary hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
							>
								<RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
							</button>
							<button
								type="button"
								onClick={activeCard === 'user-logs' ? handleExportUserLogs : handleExportDeviceReport}
								disabled={!!exportingKind}
								className="px-4 py-2 bg-accent text-on-primary font-bold text-xs rounded-xl hover:bg-primary/90 hover:text-white transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-60"
							>
								{exportingKind ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
								<span>Export</span>
							</button>
						</div>
					</div>

					<div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
						<div className="relative flex-1">
							<Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
							<input
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder={
									activeCard === 'user-logs'
										? 'Search user, employee code, device, event type, or details...'
										: 'Search device name, assigned user, IP, OS, or city...'
								}
								className="w-full pl-9 pr-4 py-2 bg-slate-100/90 text-primary font-semibold text-xs border border-outline-variant/40 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground placeholder:font-medium"
							/>
						</div>

						{activeCard === 'user-logs' ? (
							<div className="flex flex-wrap items-center gap-2 shrink-0">
								<div className="flex items-center gap-1 bg-slate-100/90 border border-outline-variant/40 rounded-xl p-1">
									{[
										{ label: 'Today', val: 1 },
										{ label: '7 Days', val: 7 },
										{ label: '30 Days', val: 30 },
									].map((d) => (
										<button
											key={d.val}
											type="button"
											onClick={() => setDaysWindow(d.val)}
											className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
												daysWindow === d.val ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-primary'
											}`}
										>
											<Calendar size={11} /> {d.label}
										</button>
									))}
								</div>
								<select
									value={eventFilter}
									onChange={(e) => setEventFilter(e.target.value)}
									className="px-3 py-2 bg-slate-100/90 text-primary font-bold text-xs border border-outline-variant/40 rounded-xl outline-none cursor-pointer"
								>
									<option value="ALL">All Events</option>
									<option value="login">User Login</option>
									<option value="logoff">User Logoff</option>
									<option value="lock">Screen Locked</option>
									<option value="unlock">Screen Unlocked</option>
									<option value="sleep">Device Sleep</option>
									<option value="wake">Device Woke</option>
									<option value="device_on">Device On</option>
									<option value="shutdown">Device Shutdown</option>
								</select>
							</div>
						) : (
							<div className="flex items-center gap-1 bg-slate-100/90 border border-outline-variant/40 rounded-xl p-1 shrink-0">
								{['ALL', 'Online', 'Sleep', 'Offline'].map((st) => (
									<button
										key={st}
										type="button"
										onClick={() => setDeviceStatusFilter(st)}
										className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
											deviceStatusFilter === st ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-primary'
										}`}
									>
										{st === 'ALL' ? 'All Statuses' : st}
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				<div className="overflow-x-auto min-h-[360px]">
					{loading ? (
						<div className="py-16 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
							<RefreshCw size={15} className="animate-spin text-accent" /> Loading report data...
						</div>
					) : activeCard === 'user-logs' ? (
						<table className="w-full text-left border-collapse">
							<thead className="border-b border-border/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground bg-slate-100/80">
								<tr>
									<th className="px-4 py-3.5 w-12 text-center">#</th>
									<th className="px-5 py-3.5">User</th>
									<th className="px-5 py-3.5">Device</th>
									<th className="px-5 py-3.5">Event</th>
									<th className="px-5 py-3.5">Details</th>
									<th className="px-5 py-3.5 text-right">Time</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/40 text-xs">
								{paginated.length > 0 ? (
									paginated.map((ev, idx) => {
										const meta = getEventMeta(ev.type, ev.detail);
										const EvIcon = meta.icon;
										return (
											<tr key={ev.id ?? `${ev.deviceId}-${ev.at}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
												<td className="px-4 py-3.5 text-center font-mono text-[11px] text-muted-foreground font-bold">
													{(safePage - 1) * pageSize + idx + 1}
												</td>
												<td className="px-5 py-3.5">
													<span className="font-bold text-primary block">{ev.userName || ev.osUsername || '—'}</span>
													<span className="text-[11px] text-muted-foreground">{ev.empCode || ev.userEmail || ''}</span>
												</td>
												<td className="px-5 py-3.5">
													{ev.deviceId && onNavigateToDevice ? (
														<button
															type="button"
															onClick={() => onNavigateToDevice(ev.deviceId)}
															className="font-bold text-primary hover:text-accent underline-offset-2 hover:underline cursor-pointer text-left"
														>
															{ev.deviceName || ev.deviceId}
														</button>
													) : (
														<span className="font-semibold text-primary">{ev.deviceName || '—'}</span>
													)}
													{ev.osUsername && <span className="block text-[10px] text-muted-foreground font-mono">{ev.osUsername}</span>}
												</td>
												<td className="px-5 py-3.5">
													<span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${meta.badge}`}>
														<EvIcon size={12} /> {meta.label}
													</span>
												</td>
												<td className="px-5 py-3.5 text-muted-foreground max-w-xs truncate" title={meta.desc}>
													{meta.desc}
												</td>
												<td className="px-5 py-3.5 text-right">
													<span className="font-semibold text-primary block">{formatDate(ev.at)}</span>
													<span className="text-[10px] text-muted-foreground">{relativeTime(ev.at)}</span>
												</td>
											</tr>
										);
									})
								) : (
									<tr>
										<td colSpan={6} className="py-14 text-center text-muted-foreground">
											No user log events match the selected filters.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					) : (
						<table className="w-full text-left border-collapse">
							<thead className="border-b border-border/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground bg-slate-100/80">
								<tr>
									<th className="px-4 py-3.5 w-12 text-center">#</th>
									<th className="px-5 py-3.5">Device Name</th>
									<th className="px-5 py-3.5">Assigned User</th>
									<th className="px-5 py-3.5">Location & IP</th>
									<th className="px-5 py-3.5 text-center">Network Usage</th>
									<th className="px-5 py-3.5 text-center">Security</th>
									<th className="px-5 py-3.5 text-center">Status</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-border/40 text-xs">
								{paginated.length > 0 ? (
									paginated.map((dev, idx) => {
										const cond = getDeviceSecurityCondition(dev);
										const isOnline = dev.status === 'Online';
										const isSleep = dev.status === 'Sleep';
										return (
											<tr
												key={dev.id}
												onClick={() => onNavigateToDevice && onNavigateToDevice(dev.id)}
												className="hover:bg-slate-50/80 transition-colors cursor-pointer"
											>
												<td className="px-4 py-3.5 text-center font-mono text-[11px] text-muted-foreground font-bold">
													{(safePage - 1) * pageSize + idx + 1}
												</td>
												<td className="px-5 py-3.5">
													<span className="font-bold text-primary block">{dev.name}</span>
													<span className="text-[11px] text-muted-foreground">{dev.os || dev.model}</span>
												</td>
												<td className="px-5 py-3.5">
													<span className="font-semibold text-primary block">{dev.userName || dev.user || '—'}</span>
													<span className="text-[11px] text-muted-foreground">{dev.empCode || ''}</span>
												</td>
												<td className="px-5 py-3.5">
													<span className="font-medium text-primary block">{dev.locationLabel || dev.city || dev.country || '—'}</span>
													<span className="text-[10px] text-muted-foreground font-mono">{dev.ip || '—'}</span>
												</td>
												<td className="px-5 py-3.5 text-center font-semibold text-primary">
													{dev.networkTotal || '—'}
												</td>
												<td className="px-5 py-3.5 text-center">
													<span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cond.cls}`}>
														{cond.ok ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
														{cond.label}
													</span>
												</td>
												<td className="px-5 py-3.5 text-center">
													<span
														className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
															isOnline
																? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
																: isSleep
																? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
																: 'bg-slate-100 text-slate-600 border-slate-200'
														}`}
													>
														{isOnline ? <Wifi size={11} /> : isSleep ? <Moon size={11} /> : <WifiOff size={11} />}
														{dev.status || 'Offline'}
													</span>
												</td>
											</tr>
										);
									})
								) : (
									<tr>
										<td colSpan={7} className="py-14 text-center text-muted-foreground">
											No devices match the selected filters.
										</td>
									</tr>
								)}
							</tbody>
						</table>
					)}
				</div>

				{/* Footer Pagination */}
				<div className="p-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
					<span>
						Page <span className="font-bold text-primary">{safePage}</span> of{' '}
						<span className="font-bold text-primary">{totalPages}</span> ({activeList.length} records)
					</span>
					<div className="flex items-center gap-1.5">
						<button
							type="button"
							disabled={safePage <= 1}
							onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
							className="p-1.5 rounded-lg border border-border/70 text-primary hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
						>
							<ChevronLeft size={14} />
						</button>
						<button
							type="button"
							disabled={safePage >= totalPages}
							onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							className="p-1.5 rounded-lg border border-border/70 text-primary hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
						>
							<ChevronRight size={14} />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
