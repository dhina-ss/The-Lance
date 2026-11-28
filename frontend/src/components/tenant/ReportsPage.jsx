import React, { useState, useEffect, useMemo, useRef } from 'react';
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
	CheckCircle2,
	Loader2,
	ChevronLeft,
	ChevronRight,
	ChevronDown,
	Filter,
	Check,
	Calendar,
	X,
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

function formatDDMMYYYY(dateInput) {
	if (!dateInput || dateInput === '—') return '—';
	if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
		const [y, m, d] = dateInput.slice(0, 10).split('-');
		return `${d}-${m}-${y}`;
	}
	const d = new Date(dateInput);
	if (isNaN(d.getTime())) return String(dateInput);
	const day = String(d.getDate()).padStart(2, '0');
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const year = d.getFullYear();
	return `${day}-${month}-${year}`;
}

function toLocalDateStr(d = new Date()) {
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

const DATE_PRESETS = [
	{ id: 'today', label: 'Today' },
	{ id: 'yesterday', label: 'Yesterday' },
	{ id: '7d', label: 'Last 7 Days' },
	{ id: '30d', label: 'Last 30 Days' },
	{ id: 'this_month', label: 'This Month' },
	{ id: 'last_month', label: 'Last Month' },
	{ id: 'custom', label: 'Custom Range' },
];

function getPresetRange(preset) {
	const today = new Date();
	const todayStr = toLocalDateStr(today);
	if (preset === 'today') {
		return { start: todayStr, end: todayStr };
	}
	if (preset === 'yesterday') {
		const yest = new Date(today);
		yest.setDate(yest.getDate() - 1);
		const yestStr = toLocalDateStr(yest);
		return { start: yestStr, end: yestStr };
	}
	if (preset === '7d') {
		const d = new Date(today);
		d.setDate(d.getDate() - 6);
		return { start: toLocalDateStr(d), end: todayStr };
	}
	if (preset === '30d') {
		const d = new Date(today);
		d.setDate(d.getDate() - 29);
		return { start: toLocalDateStr(d), end: todayStr };
	}
	if (preset === 'this_month') {
		const first = new Date(today.getFullYear(), today.getMonth(), 1);
		return { start: toLocalDateStr(first), end: todayStr };
	}
	if (preset === 'last_month') {
		const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
		const last = new Date(today.getFullYear(), today.getMonth(), 0);
		return { start: toLocalDateStr(first), end: toLocalDateStr(last) };
	}
	return { start: todayStr, end: todayStr };
}

const MONTH_NAMES = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
];

const EVENT_FILTER_OPTIONS = [
	{ id: 'ALL', label: 'All Events', dot: 'bg-primary', icon: Filter },
	{ id: 'login', label: 'User Login', dot: 'bg-emerald-500', icon: LogIn },
	{ id: 'logoff', label: 'User Logoff', dot: 'bg-slate-500', icon: LogOut },
	{ id: 'lock', label: 'Screen Locked', dot: 'bg-amber-500', icon: Lock },
	{ id: 'unlock', label: 'Screen Unlocked', dot: 'bg-blue-500', icon: Unlock },
	{ id: 'sleep', label: 'Device Sleep', dot: 'bg-indigo-500', icon: Moon },
	{ id: 'wake', label: 'Device Woke', dot: 'bg-sky-500', icon: Sun },
	{ id: 'device_on', label: 'Device On', dot: 'bg-cyan-500', icon: Power },
	{ id: 'shutdown', label: 'Device Shutdown', dot: 'bg-rose-500', icon: Power },
];

export default function ReportsPage({ onNavigateTab, onNavigateToDevice }) {
	const [activeCard, setActiveCard] = useState(null); // null | 'user-logs' | 'device-report'
	const [devices, setDevices] = useState([]);
	const [users, setUsers] = useState([]);
	const [userLogs, setUserLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState(null);
	const [toast, setToast] = useState(null);

	// Filters & pagination
	const [searchTerm, setSearchTerm] = useState('');
	const [datePreset, setDatePreset] = useState('7d');
	const [startDate, setStartDate] = useState(() => {
		const d = new Date();
		d.setDate(d.getDate() - 6);
		return toLocalDateStr(d);
	});
	const [endDate, setEndDate] = useState(() => toLocalDateStr(new Date()));
	const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
	const dateDropdownRef = useRef(null);
	const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
	const [calYear, setCalYear] = useState(() => new Date().getFullYear());
	const [selectPhase, setSelectPhase] = useState('start'); // 'start' | 'end'
	const [deviceDateFilterMode, setDeviceDateFilterMode] = useState('all'); // 'all' | 'range'

	const [eventFilter, setEventFilter] = useState('ALL');
	const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
	const eventDropdownRef = useRef(null);
	const [deviceStatusFilter, setDeviceStatusFilter] = useState('ALL');
	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 15;
	const [exportingKind, setExportingKind] = useState(null);

	useEffect(() => {
		const handleOutsideClick = (e) => {
			if (eventDropdownRef.current && !eventDropdownRef.current.contains(e.target)) {
				setIsEventDropdownOpen(false);
			}
			if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target)) {
				setIsDateDropdownOpen(false);
			}
		};
		document.addEventListener('mousedown', handleOutsideClick);
		return () => document.removeEventListener('mousedown', handleOutsideClick);
	}, []);

	const handleDayClick = (dayStr) => {
		setDatePreset('custom');
		if (selectPhase === 'start' || dayStr < startDate) {
			setStartDate(dayStr);
			setEndDate(dayStr);
			setSelectPhase('end');
		} else {
			setEndDate(dayStr);
			setSelectPhase('start');
		}
	};

	const handlePresetClick = (preset) => {
		setDatePreset(preset);
		if (preset !== 'custom') {
			const range = getPresetRange(preset);
			setStartDate(range.start);
			setEndDate(range.end);
			setSelectPhase('start');
			const s = new Date(range.start);
			if (!isNaN(s.getTime())) {
				setCalMonth(s.getMonth());
				setCalYear(s.getFullYear());
			}
			setIsDateDropdownOpen(false);
		}
	};

	const loadAll = async (silent = false, start = startDate, end = endDate) => {
		if (!silent) setLoading(true);
		else setRefreshing(true);
		try {
			const diffDays = Math.max(1, Math.ceil((new Date(`${end}T23:59:59`).getTime() - new Date(`${start}T00:00:00`).getTime()) / (1000 * 86400)));
			const [devs, usrs, logs] = await Promise.all([
				fetchDevices().catch(() => []),
				fetchUsers().catch(() => []),
				fetchAllUserLogs(diffDays, 1500, start, end).catch(() => []),
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
		loadAll(false, startDate, endDate);
		const timer = setInterval(() => loadAll(true, startDate, endDate), 30000);
		return () => clearInterval(timer);
	}, [startDate, endDate]);

	useEffect(() => {
		setCurrentPage(1);
	}, [activeCard, searchTerm, eventFilter, deviceStatusFilter, deviceDateFilterMode, startDate, endDate]);

	const notify = (msg) => {
		setToast(msg);
		setTimeout(() => setToast(null), 4000);
	};

	// Card summary stats
	const logStats = useMemo(() => {
		const todayPrefix = toLocalDateStr();
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

	// Filtered rows - strictly honors selected start and end dates
	const filteredUserLogs = useMemo(() => {
		const q = searchTerm.trim().toLowerCase();
		const startMs = new Date(`${startDate}T00:00:00`).getTime();
		const endMs = new Date(`${endDate}T23:59:59.999`).getTime();
		return userLogs.filter((ev) => {
			if (ev.at) {
				const ts = Date.parse(ev.at);
				if (!Number.isNaN(ts) && (ts < startMs || ts > endMs)) return false;
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
	}, [userLogs, searchTerm, eventFilter, startDate, endDate]);

	const filteredDevices = useMemo(() => {
		const q = searchTerm.trim().toLowerCase();
		return devices.filter((d) => {
			if (deviceStatusFilter !== 'ALL' && (d.status || '').toLowerCase() !== deviceStatusFilter.toLowerCase()) {
				return false;
			}
			if (deviceDateFilterMode === 'range') {
				const rawDate = d.registrationDate || d.createdDate || '';
				if (rawDate) {
					let formatted = rawDate.slice(0, 10);
					if (/^\d{2}-\d{2}-\d{4}$/.test(formatted)) {
						const [dd, mm, yyyy] = formatted.split('-');
						formatted = `${yyyy}-${mm}-${dd}`;
					}
					if (formatted < startDate || formatted > endDate) return false;
				}
			}
			if (!q) return true;
			return [d.name, d.model, d.userName, d.user, d.empCode, d.ip, d.os, d.locationLabel]
				.filter(Boolean)
				.some((v) => String(v).toLowerCase().includes(q));
		});
	}, [devices, searchTerm, deviceStatusFilter, deviceDateFilterMode, startDate, endDate]);

	const activeList = activeCard === 'user-logs'
		? filteredUserLogs
		: activeCard === 'device-report'
		? filteredDevices
		: [];
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
			const fileStartDate = formatDDMMYYYY(startDate);
			const fileEndDate = formatDDMMYYYY(endDate);
			const fileName = `User_Logs_Report_${fileStartDate}_to_${fileEndDate}.xlsx`;
			exportStyledSheet('User Logs Report', fileName, headers, rows, [0, 2, 6]);
			notify(`Exported ${rows.length} user log entries (${fileStartDate} to ${fileEndDate}) to Excel.`);
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
					formatDDMMYYYY(dev.registrationDate),
					dev.networkTotal || '—',
					cond.label,
					dev.status || 'Offline',
				];
			});
			const fileStartDate = formatDDMMYYYY(startDate);
			const fileEndDate = formatDDMMYYYY(endDate);
			const fileName = `Device_Report_${fileStartDate}_to_${fileEndDate}.xlsx`;
			exportStyledSheet('Device Report', fileName, headers, rows, [0, 3, 9, 10]);
			notify(`Exported ${rows.length} device report rows (${fileStartDate} to ${fileEndDate}) to Excel.`);
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
					onClick={() => setActiveCard((prev) => (prev === 'user-logs' ? null : 'user-logs'))}
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
				</div>

				{/* Card 2: Device Report */}
				<div
					onClick={() => setActiveCard((prev) => (prev === 'device-report' ? null : 'device-report'))}
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

				</div>
			</section>

			{/* Detailed Report Table (shown after selecting a card) */}
			{activeCard && (
			<div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-sm relative z-10">
				<div className="p-6 border-b border-border/60 space-y-4 relative z-20">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<h2 className="text-lg font-extrabold text-primary tracking-tight">
								{activeCard === 'user-logs' ? 'User Activity & Session Logs Report' : 'Fleet Device Compliance & Status Report'}
							</h2>
							<p className="text-xs text-muted-foreground mt-0.5">
								{activeCard === 'user-logs'
									? `Showing ${filteredUserLogs.length} session event(s) from ${formatDDMMYYYY(startDate)} to ${formatDDMMYYYY(endDate)}`
									: `Showing ${filteredDevices.length} of ${devices.length} enrolled endpoint device(s)${deviceDateFilterMode === 'range' ? ` (registered ${formatDDMMYYYY(startDate)} to ${formatDDMMYYYY(endDate)})` : ''}`}
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<button
								type="button"
								onClick={() => loadAll(true, startDate, endDate)}
								className="px-3.5 py-2 bg-background border border-input text-primary hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
							>
								<RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> Refresh
							</button>
							<button
								type="button"
								onClick={activeCard === 'user-logs' ? handleExportUserLogs : handleExportDeviceReport}
								disabled={!!exportingKind}
								className="px-4 py-2 bg-accent text-on-primary font-bold text-xs rounded-xl hover:bg-primary/90 hover:text-white transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-60"
								title={`Download ${activeCard === 'user-logs' ? 'user logs' : 'device report'} for ${formatDDMMYYYY(startDate)} to ${formatDDMMYYYY(endDate)}`}
							>
								{exportingKind ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
								<span>Export ({formatDDMMYYYY(startDate)} to {formatDDMMYYYY(endDate)})</span>
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

						<div className="flex flex-wrap items-center gap-2 shrink-0">
							{/* Modern Interactive Calendar Date Range Dropdown */}
							<div className="relative shrink-0 z-30" ref={dateDropdownRef}>
								<button
									type="button"
									onClick={() => setIsDateDropdownOpen((prev) => !prev)}
									className="px-3.5 py-2 bg-slate-100/90 hover:bg-slate-200/80 text-primary font-bold text-xs border border-outline-variant/40 rounded-xl transition-all cursor-pointer flex items-center gap-2.5 shadow-xs group"
									title="Filter by date range"
								>
									<div className="w-6 h-6 rounded-lg bg-accent/15 text-accent flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
										<Calendar size={13} />
									</div>
									<div className="flex flex-col text-left">
										<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-none">
											{DATE_PRESETS.find((p) => p.id === datePreset)?.label || 'Date Range'}
										</span>
										<span className="text-xs font-extrabold text-primary leading-tight mt-0.5">
											{formatDDMMYYYY(startDate)} to {formatDDMMYYYY(endDate)}
										</span>
									</div>
									<ChevronDown
										size={14}
										className={`transition-transform duration-200 text-muted-foreground ml-1 shrink-0 ${
											isDateDropdownOpen ? 'rotate-180 text-accent' : ''
										}`}
									/>
								</button>

								{isDateDropdownOpen && (
									<div className="absolute right-0 top-full mt-2 w-84 bg-background/95 backdrop-blur-2xl border border-border/90 rounded-3xl p-4 shadow-2xl z-[99999] space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
										{/* Quick Preset Chips */}
										<div className="flex flex-wrap gap-1 border-b border-border/60 pb-3">
											{DATE_PRESETS.filter((p) => p.id !== 'custom').map((p) => (
												<button
													key={p.id}
													type="button"
													onClick={() => handlePresetClick(p.id)}
													className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
														datePreset === p.id
															? 'bg-primary text-primary-foreground shadow-xs'
															: 'bg-slate-100 hover:bg-slate-200 text-muted-foreground hover:text-primary'
													}`}
												>
													{p.label}
												</button>
											))}
										</div>

										{/* Month & Year Navigation Header */}
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-1.5">
												<button
													type="button"
													onClick={() => {
														if (calMonth === 0) {
															setCalMonth(11);
															setCalYear((y) => y - 1);
														} else {
															setCalMonth((m) => m - 1);
														}
													}}
													className="p-1.5 rounded-xl hover:bg-slate-100 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
												>
													<ChevronLeft size={16} />
												</button>
												<span className="text-xs font-black text-primary uppercase tracking-wider px-1">
													{MONTH_NAMES[calMonth]} {calYear}
												</span>
												<button
													type="button"
													onClick={() => {
														if (calMonth === 11) {
															setCalMonth(0);
															setCalYear((y) => y + 1);
														} else {
															setCalMonth((m) => m + 1);
														}
													}}
													className="p-1.5 rounded-xl hover:bg-slate-100 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
												>
													<ChevronRight size={16} />
												</button>
											</div>
											<button
												type="button"
												onClick={() => setIsDateDropdownOpen(false)}
												className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-xl hover:bg-slate-100 cursor-pointer"
											>
												<X size={14} />
											</button>
										</div>

										{/* Weekday Labels */}
										<div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-muted-foreground uppercase tracking-wider">
											{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
												<span key={d} className="py-1">{d}</span>
											))}
										</div>

										{/* Days Matrix */}
										<div className="grid grid-cols-7 gap-1 text-xs font-semibold">
											{(() => {
												const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
												const totalDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
												const blanks = Array.from({ length: firstDayOfWeek });
												const days = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);
												const todayLocal = toLocalDateStr();

												return (
													<>
														{blanks.map((_, i) => (
															<span key={`b-${i}`} className="h-8" />
														))}
														{days.map((day) => {
															const dayStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
															const isStart = dayStr === startDate;
															const isEnd = dayStr === endDate;
															const inRange = dayStr > startDate && dayStr < endDate;
															const isToday = dayStr === todayLocal;

															return (
																<button
																	key={dayStr}
																	type="button"
																	onClick={() => handleDayClick(dayStr)}
																	className={`h-8 rounded-xl flex items-center justify-center font-semibold text-xs transition-all cursor-pointer relative ${
																		isStart || isEnd
																			? 'bg-primary text-primary-foreground font-black shadow-xs z-10'
																			: inRange
																			? 'bg-primary/10 text-primary font-bold rounded-none'
																			: isToday
																			? 'border border-accent text-accent font-bold hover:bg-accent/10'
																			: 'text-primary hover:bg-slate-100'
																	}`}
																>
																	{day}
																</button>
															);
														})}
													</>
												);
											})()}
										</div>

										{/* Footer with summary and Apply button */}
										<div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3">
											<div className="text-[11px] text-muted-foreground">
												<span className="font-bold text-primary">{formatDDMMYYYY(startDate)}</span> to{' '}
												<span className="font-bold text-primary">{formatDDMMYYYY(endDate)}</span>
											</div>
											<button
												type="button"
												onClick={() => setIsDateDropdownOpen(false)}
												className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
											>
												Apply
											</button>
										</div>
									</div>
								)}
							</div>

							{activeCard === 'user-logs' ? (
								(() => {
									const selectedOption = EVENT_FILTER_OPTIONS.find((o) => o.id === eventFilter) || EVENT_FILTER_OPTIONS[0];
									const SelectedIcon = selectedOption.icon;
									return (
										<div className="relative shrink-0" ref={eventDropdownRef}>
											<button
												type="button"
												onClick={() => setIsEventDropdownOpen((prev) => !prev)}
												className="px-3.5 py-2 bg-slate-100/90 text-primary font-bold text-xs border border-outline-variant/40 rounded-xl outline-none cursor-pointer flex items-center gap-2 hover:bg-slate-200/70 transition-all shadow-xs min-w-[155px] justify-between"
											>
												<span className="flex items-center gap-2">
													<span className={`w-2 h-2 rounded-full ${selectedOption.dot} shrink-0`} />
													<SelectedIcon size={13} className="text-muted-foreground shrink-0" />
													<span>{selectedOption.label}</span>
												</span>
												<ChevronDown
													size={14}
													className={`transition-transform duration-200 text-muted-foreground shrink-0 ${
														isEventDropdownOpen ? 'rotate-180 text-accent' : ''
													}`}
												/>
											</button>

											{isEventDropdownOpen && (
												<div className="absolute right-0 top-full mt-2 w-56 bg-background/95 backdrop-blur-2xl border border-border/90 rounded-2xl p-1.5 shadow-2xl z-50 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
													{EVENT_FILTER_OPTIONS.map((option) => {
														const isSelected = eventFilter === option.id;
														const OptIcon = option.icon;
														return (
															<button
																key={option.id}
																type="button"
																onClick={() => {
																	setEventFilter(option.id);
																	setIsEventDropdownOpen(false);
																}}
																className={`w-full px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer select-none transition-colors ${
																	isSelected
																		? 'bg-primary/10 text-primary font-bold'
																		: 'text-muted-foreground font-semibold hover:bg-slate-100 hover:text-primary'
																}`}
															>
																<span className="flex items-center gap-2.5">
																	<span className={`w-2 h-2 rounded-full ${option.dot} shrink-0`} />
																	<OptIcon size={13} className={isSelected ? 'text-primary' : 'text-muted-foreground'} />
																	<span>{option.label}</span>
																</span>
																{isSelected && <Check size={14} className="text-accent shrink-0" />}
															</button>
														);
													})}
												</div>
											)}
										</div>
									);
								})()
							) : (
								<>
									<div className="flex items-center gap-1 bg-slate-100/90 border border-outline-variant/40 rounded-xl p-1 shrink-0">
										<button
											type="button"
											onClick={() => setDeviceDateFilterMode('all')}
											className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
												deviceDateFilterMode === 'all' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-primary'
											}`}
										>
											All Fleet
										</button>
										<button
											type="button"
											onClick={() => setDeviceDateFilterMode('range')}
											className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
												deviceDateFilterMode === 'range' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-primary'
											}`}
											title="Only devices registered within selected date range"
										>
											Registered in Range
										</button>
									</div>

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
								</>
							)}
						</div>
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
			)}
		</div>
	);
}
