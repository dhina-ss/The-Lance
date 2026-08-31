import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import Sidebar from '../components/tenant/Sidebar';
import Header from '../components/tenant/Header';
import DownloadModal from '../components/tenant/DownloadModal';
import MetricCard from '../components/tenant/MetricCard';
import PerformanceMatrix from '../components/tenant/PerformanceMatrix';
import OsDistribution from '../components/tenant/OsDistribution';
import ActivityLog from '../components/tenant/ActivityLog';
import CriticalAlerts from '../components/tenant/CriticalAlerts';
import AntivirusStatus from '../components/tenant/AntivirusStatus';
import DevicesPage from '../components/tenant/DevicesPage';
import UsersPage from '../components/tenant/UsersPage';
import SettingsPage from '../components/tenant/SettingsPage';
import { fetchDevices, fetchOverview } from '../api/ems';
import { API_BASE, getAuthHeaders } from '../api/client';
import { Sparkles, Clock, AlertTriangle, FileBarChart, Settings as SettingsIcon } from 'lucide-react';

const fadeUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.08 } },
};

const site = 'https://thelance.dev';
const pageTitle = 'Tenant Management Dashboard — The Lance';
const pageDescription =
	'Real-time device monitoring, user management, system activity logs, and endpoint control.';

export default function TenantDashboardPage() {
	const navigate = useNavigate();

	useEffect(() => {
		try {
			const u = localStorage.getItem('user_profile') || localStorage.getItem('auth_token');
			if (!u) {
				navigate('/login', { replace: true });
			}
		} catch {
			navigate('/login', { replace: true });
		}
	}, [navigate]);

	const [activeTab, setActiveTab] = useState('dashboard');
	const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
	const [stats, setStats] = useState({ total: 0, online: 0, sleep: 0, offline: 0 });
	const [overview, setOverview] = useState<{ osDistribution: any[]; performance: any[]; activity: any[]; alerts: any[]; antivirus: any }>({ osDistribution: [], performance: [], activity: [], alerts: [], antivirus: null });
	const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

	const handleNavigateToDevice = (deviceId: string) => {
		setSelectedDeviceId(deviceId);
		setActiveTab('devices');
	};

	// Download the installer zip directly — no key prompt. The backend resolves
	// this tenant from the session and bundles its license.key inside the zip.
	const [downloading, setDownloading] = useState(false);
	const [downloadError, setDownloadError] = useState<string | null>(null);

	const handleDirectDownload = async () => {
		if (downloading) return;
		setDownloading(true);
		setDownloadError(null);
		try {
			const res = await fetch(`${API_BASE}/api/download-file`, { headers: getAuthHeaders() });
			if (!res.ok) {
				const body = await res.json().catch(() => null);
				setDownloadError(body?.error || 'No license is linked to your account. Contact your administrator.');
				return;
			}
			const blob = await res.blob();
			const cd = res.headers.get('Content-Disposition') || '';
			const match = cd.match(/filename="?([^";]+)"?/i);
			const name = match ? match[1].trim() : 'TheLanceEndpoint.zip';
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = name;
			a.rel = 'noopener';
			document.body.appendChild(a);
			a.click();
			// Revoke the blob URL AFTER the browser has started the download.
			// Revoking it synchronously here aborts a large-file download in
			// Firefox (and can in other browsers), so defer the cleanup.
			setTimeout(() => {
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}, 2000);
		} catch (err) {
			setDownloadError(
				err instanceof Error && /fetch|network/i.test(err.message)
					? 'Could not reach the server. The installer service may be waking up — please try again in a minute.'
					: 'The installer could not be downloaded. Please try again or contact your administrator.'
			);
		} finally {
			setDownloading(false);
		}
	};

	useEffect(() => {
		const load = async () => {
			try {
				const devices = await fetchDevices();
				setStats({
					total: devices.length,
					online: devices.filter((d: any) => d.status === 'Online').length,
					sleep: devices.filter((d: any) => d.status === 'Sleep').length,
					offline: devices.filter((d: any) => d.status === 'Offline').length,
				});
			} catch {
				// Overview counts are best-effort
			}
			try {
				const ov = await fetchOverview();
				setOverview({
					osDistribution: ov.osDistribution || [],
					performance: ov.performance || [],
					activity: ov.activity || [],
					alerts: ov.alerts || [],
					antivirus: ov.antivirus || null,
				});
			} catch {
				// Overview panels are best-effort
			}
		};
		load();
		const timer = setInterval(load, 30000);
		return () => clearInterval(timer);
	}, []);

	const titleMap: Record<string, string> = {
		dashboard: 'Dashboard Overview',
		devices: 'Device Management',
		users: 'User Management',
		alerts: 'Critical Alerts Stream',
		reports: 'Reports & Analytics',
		settings: 'System Settings',
		'usb-blocking': 'USB Blocking Security Rules',
		'installed-apps': 'Installed Applications Inventory',
		'used-apps': 'Used Applications & Runtime Analytics',
		'website-blocking': 'Website Content Filtering & URL Blocking',
		'install-uninstall-apps': 'App Deployment & Uninstall Manager',
		'location-tracking': 'Device Geo-Location Tracking',
		'login-device-on': 'Device Startup & Login Authentication Logs',
	};

	return (
		<>
			<Helmet>
				<title>{pageTitle}</title>
				<meta name="description" content={pageDescription} />
				<link rel="canonical" href={`${site}/tenant-dashboard`} />
			</Helmet>

			<div className="relative min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden dashboard-page">
				{/* Sidebar Component */}
				<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onDownloadClick={handleDirectDownload} />

				{/* Main Content Area */}
				<main className="w-full lg:w-[80%] lg:ml-[20%] min-h-screen flex flex-col bg-background relative transition-colors duration-300">
					{/* Radial Grid Background Pattern */}
					<div
						className="absolute inset-0 opacity-[0.03] pointer-events-none"
						style={{
							backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
							backgroundSize: '40px 40px',
						}}
					/>

					{/* Top Header */}
					<Header pageTitle={titleMap[activeTab] || 'Dashboard Overview'} onDownloadClick={handleDirectDownload} downloading={downloading} />

					{/* Download License Key Modal */}
					<DownloadModal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} />

					{/* Custom Error Card Overlay */}
					{downloadError && (
						<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
							<div className="relative w-full max-w-md bg-background border border-rose-500/30 rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-200 overflow-hidden">
								<div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
								<div className="flex items-start gap-3.5">
									<div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 flex items-center justify-center shrink-0">
										<AlertTriangle size={20} />
									</div>
									<div className="flex-1 space-y-1">
										<h3 className="text-base font-bold text-primary">License Error</h3>
										<p className="text-xs text-muted-foreground leading-relaxed">{downloadError}</p>
									</div>
								</div>
								<div className="pt-2 flex justify-end">
									<button
										onClick={() => setDownloadError(null)}
										className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
									>
										Dismiss
									</button>
								</div>
							</div>
						</div>
					)}




					{/* Content Canvas */}
					{activeTab === 'devices' ? (
						<div className="relative z-10">
							<DevicesPage initialDeviceId={selectedDeviceId} onClearInitialDevice={() => setSelectedDeviceId(null)} />
						</div>
					) : activeTab === 'users' ? (
						<div className="relative z-10">
							<UsersPage onNavigateToDevice={handleNavigateToDevice} />
						</div>
					) : activeTab === 'settings' ? (
						<div className="relative z-10">
							<SettingsPage />
						</div>
					) : activeTab === 'alerts' || activeTab === 'reports' ? (
						<ComingSoonView tab={activeTab} title={titleMap[activeTab] || 'Feature'} />
					) : activeTab !== 'dashboard' ? (
						<FeatureModuleView moduleId={activeTab} />
					) : (
						<div className="relative z-10 p-6 lg:p-10 space-y-8">
							<motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
								{/* Summary Metric Cards */}
								<motion.section variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
									<MetricCard
										title="Total Devices"
										value={String(stats.total)}
										icon="devices"
										iconBgColor="bg-primary/10"
										iconTextColor="text-primary"
										trendValue="32.5%"
										trendIsUp={true}
										trendColor="text-emerald-600"
										trendBg="bg-emerald-50"
										timeframe="Active fleet count"
									/>
									<MetricCard
										title="Online Devices"
										value={String(stats.online)}
										icon="sensors"
										iconBgColor="bg-accent/10"
										iconTextColor="text-accent"
										trendValue="100% Live"
										trendIsUp={true}
										trendColor="text-emerald-600"
										trendBg="bg-emerald-50"
										timeframe="Real-time heartbeat"
									/>
									<MetricCard
										title="Locked / Sleep"
										value={String(stats.sleep)}
										icon="bedtime"
										iconBgColor="bg-amber-500/10"
										iconTextColor="text-amber-500"
										trendValue="Standby"
										trendIsUp={false}
										trendColor="text-amber-600"
										trendBg="bg-amber-50"
										timeframe="Idle power state"
									/>
									<MetricCard
										title="Offline Devices"
										value={String(stats.offline)}
										icon="cloud_off"
										iconBgColor="bg-rose-500/10"
										iconTextColor="text-rose-500"
										trendValue="> 3m idle"
										trendIsUp={false}
										trendColor="text-rose-600"
										trendBg="bg-rose-50"
										timeframe="Not reachable"
									/>
								</motion.section>

								{/* Antivirus Protection status */}
								<motion.div variants={fadeUp} className="grid grid-cols-12 gap-6">
									<AntivirusStatus data={overview.antivirus} />
								</motion.div>

								{/* Main Charts & Grid Area */}
								<motion.div variants={fadeUp} className="grid grid-cols-12 gap-6">
									<PerformanceMatrix data={overview.performance} />
									<OsDistribution items={overview.osDistribution} />
								</motion.div>

								<motion.div variants={fadeUp} className="grid grid-cols-12 gap-6">
									<ActivityLog items={overview.activity} />
								</motion.div>

								<motion.div variants={fadeUp} className="grid grid-cols-12 gap-6">
									<div className="col-span-12 flex flex-col">
										<CriticalAlerts items={overview.alerts} />
									</div>
								</motion.div>
							</motion.div>
						</div>
					)}
				</main>
			</div>
		</>
	);
}

function FeatureModuleView({ moduleId }: { moduleId: string }) {
	const moduleConfigMap: Record<string, { title: string; subtitle: string; items: any[] }> = {
		'usb-blocking': {
			title: 'USB Blocking Security Rules',
			subtitle: 'Enforce Mass Storage device restrictions and audit external drive connection logs.',
			items: [
				{ id: 'usb-1', name: 'Kingston DataTraveler 3.0', user: 'Alex Mercer (DEV-LAP-04)', status: 'Blocked', time: '2026-08-24 12:45:10' },
				{ id: 'usb-2', name: 'SanDisk Ultra Dual Drive', user: 'Sarah Jenkins (FIN-DESK-02)', status: 'Blocked', time: '2026-08-24 11:20:05' },
				{ id: 'usb-3', name: 'Samsung T7 Shield SSD (Whitelisted)', user: 'David Koster (IT-ADMIN-01)', status: 'Allowed', time: '2026-08-24 09:15:44' },
				{ id: 'usb-4', name: 'Generic USB Storage Flash', user: 'Mark Vance (OPS-PC-09)', status: 'Blocked', time: '2026-08-23 18:02:19' },
			],
		},
		'installed-apps': {
			title: 'Installed Applications Inventory',
			subtitle: 'Track and audit all registered software packages across organization endpoints.',
			items: [
				{ id: 'app-1', name: 'Google Chrome', vendor: 'Google LLC (v128.0)', status: 'Authorized', time: '342 Endpoints' },
				{ id: 'app-2', name: 'Visual Studio Code', vendor: 'Microsoft Corp (v1.92)', status: 'Authorized', time: '185 Endpoints' },
				{ id: 'app-3', name: 'BitTorrent Desktop Client', vendor: 'Rainberry Inc. (v7.10)', status: 'Flagged / Prohibited', time: '4 Endpoints' },
				{ id: 'app-4', name: 'Slack WorkSpace', vendor: 'Salesforce (v4.39)', status: 'Authorized', time: '290 Endpoints' },
				{ id: 'app-5', name: 'Wireshark Network Analyzer', vendor: 'Wireshark Foundation', status: 'Restricted Access', time: '12 Endpoints' },
			],
		},
		'used-apps': {
			title: 'Used Applications & Runtime Analytics',
			subtitle: 'Monitor foreground application activity hours, execution counts, and usage stats.',
			items: [
				{ id: 'uapp-1', name: 'Microsoft Teams', vendor: 'Communication', status: 'Active (284 Users)', time: '342.5 hrs/day' },
				{ id: 'uapp-2', name: 'Figma Design Desktop', vendor: 'Design', status: 'Active (42 Users)', time: '189.2 hrs/day' },
				{ id: 'uapp-3', name: 'IntelliJ IDEA Ultimate', vendor: 'Development', status: 'Active (38 Users)', time: '154.0 hrs/day' },
				{ id: 'uapp-4', name: 'Microsoft Excel 365', vendor: 'Productivity', status: 'Active (195 Users)', time: '120.4 hrs/day' },
			],
		},
		'website-blocking': {
			title: 'Website Content Filtering & URL Blocking',
			subtitle: 'Filter network web requests and restrict unapproved, phishing, or high-risk domains.',
			items: [
				{ id: 'web-1', name: '*.gambling-casino-online.net', vendor: 'Gambling', status: 'Blocked Always', time: '1,420 Hits' },
				{ id: 'web-2', name: '*.unverified-file-sharing.xyz', vendor: 'Malware / P2P', status: 'Blocked Always', time: '890 Hits' },
				{ id: 'web-3', name: '*.crypto-miner-pool.org', vendor: 'Security Threat', status: 'Blocked Always', time: '412 Hits' },
				{ id: 'web-4', name: '*.social-video-stream.tv', vendor: 'Bandwidth Limit', status: 'Schedule Blocked', time: '2,310 Hits' },
			],
		},
		'install-uninstall-apps': {
			title: 'Remote App Deployment & Uninstall Manager',
			subtitle: 'Push silent software installations or remove blacklisted applications remotely.',
			items: [
				{ id: 'pkg-1', name: 'Cisco AnyConnect VPN (v4.10)', vendor: 'All Windows Endpoints', status: 'Completed', time: '342 / 342 Devices' },
				{ id: 'pkg-2', name: 'CrowdStrike Falcon Sensor (v7.15)', vendor: 'All Fleet Devices', status: 'Completed', time: '340 / 342 Devices' },
				{ id: 'pkg-3', name: 'uTorrent Classic (v3.5.5)', vendor: 'Flagged Devices', status: 'Uninstall Completed', time: '4 / 4 Devices' },
				{ id: 'pkg-4', name: 'Node.js LTS v20.17', vendor: 'Engineering Group', status: 'In Progress', time: '38 / 45 Devices' },
			],
		},
		'location-tracking': {
			title: 'Device Geo-Location Tracking',
			subtitle: 'Monitor real-time GPS and IP geolocation mappings for organizational assets.',
			items: [
				{ id: 'loc-1', name: 'DEV-LAP-04 (Alex Mercer)', vendor: 'San Francisco, CA, USA', status: 'Active GPS', time: 'IP: 192.168.1.45' },
				{ id: 'loc-2', name: 'FIN-DESK-02 (Sarah Jenkins)', vendor: 'Austin, TX, USA', status: 'IP Geolocation', time: 'IP: 10.0.4.112' },
				{ id: 'loc-3', name: 'EXEC-MAC-01 (David Koster)', vendor: 'New York, NY, USA', status: 'Active GPS', time: 'IP: 172.16.0.88' },
				{ id: 'loc-4', name: 'OPS-PC-09 (Mark Vance)', vendor: 'Coimbatore, TN, India', status: 'Cellular / Wi-Fi', time: 'IP: 103.14.22.8' },
			],
		},
		'login-device-on': {
			title: 'Device Startup & Login Authentication Logs',
			subtitle: 'Audit device power-on events, boot duration, and user login authentication.',
			items: [
				{ id: 'log-1', name: 'DEV-LAP-04 (alex.m@nexusglobal.com)', vendor: 'Boot Duration: 12.4s', status: 'MFA Verified', time: '2026-08-24 08:30:12' },
				{ id: 'log-2', name: 'FIN-DESK-02 (sarah.j@nexusglobal.com)', vendor: 'Boot Duration: 18.1s', status: 'Domain Login OK', time: '2026-08-24 08:45:00' },
				{ id: 'log-3', name: 'EXEC-MAC-01 (david.k@techflow.io)', vendor: 'Boot Duration: 8.2s', status: 'TouchID / SSO', time: '2026-08-24 09:00:22' },
				{ id: 'log-4', name: 'OPS-PC-09 (mark.v@nexusglobal.com)', vendor: 'Boot Duration: 22.0s', status: 'Domain Login OK', time: '2026-08-24 09:12:40' },
			],
		},
	};

	const config = moduleConfigMap[moduleId] || {
		title: 'Feature Module',
		subtitle: 'Module configuration and activity records',
		items: [],
	};

	return (
		<div className="relative z-10 p-6 lg:p-10 space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
				<div>
					<h2 className="text-2xl font-extrabold text-primary tracking-tight">{config.title}</h2>
					<p className="text-xs text-muted-foreground mt-1">{config.subtitle}</p>
				</div>
				<div className="flex items-center gap-2">
					<span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
						<span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
						Module Active
					</span>
				</div>
			</div>

			<div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-bold text-primary uppercase tracking-wider">Active Policy & Audit Records</h3>
					<span className="text-xs font-semibold text-muted-foreground">{config.items.length} Active Records</span>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead>
							<tr className="border-b border-border/80 text-muted-foreground uppercase tracking-wider text-[11px]">
								<th className="py-3 px-4">Item / Device / Domain</th>
								<th className="py-3 px-4">Details / Target</th>
								<th className="py-3 px-4">Enforcement / Status</th>
								<th className="py-3 px-4 text-right">Timestamp / Metrics</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/40">
							{config.items.map((item: any) => (
								<tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
									<td className="py-3.5 px-4 font-bold text-primary font-mono">{item.name}</td>
									<td className="py-3.5 px-4 text-muted-foreground">{item.vendor}</td>
									<td className="py-3.5 px-4">
										<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
											(item.status || '').includes('Blocked') || (item.status || '').includes('Prohibited') || (item.status || '').includes('Flagged')
												? 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
												: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
										}`}>
											{item.status}
										</span>
									</td>
									<td className="py-3.5 px-4 text-right font-mono text-muted-foreground">{item.time}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

function ComingSoonView({ tab, title }: { tab: string; title: string }) {
	const iconMap: Record<string, any> = {
		alerts: AlertTriangle,
		reports: FileBarChart,
		settings: SettingsIcon,
	};
	const IconComponent = iconMap[tab] || Clock;

	const descMap: Record<string, string> = {
		alerts: 'Real-time incident streaming, automated push notifications, and webhook alert triggers are under active development.',
		reports: 'Custom automated PDF/Excel export schedules, fleet compliance analytics, and executive summary reports are coming soon.',
		settings: 'Centralized tenant security policy configuration, role-based access controls, and custom branding settings are coming soon.',
	};

	return (
		<div className="relative z-10 p-6 lg:p-10 min-h-[75vh] flex items-center justify-center">
			<div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-3xl p-10 max-w-xl w-full text-center shadow-xl relative overflow-hidden space-y-6">
				{/* Background Glow */}
				<div className="absolute -top-20 -right-20 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
				<div className="absolute -bottom-20 -left-20 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

				<div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent border border-accent/30 flex items-center justify-center mx-auto shadow-inner">
					<IconComponent size={32} />
				</div>

				<div className="space-y-2">
					<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent/10 text-accent border border-accent/20">
						<Sparkles size={13} className="animate-pulse" />
						Coming Soon
					</span>
					<h2 className="text-2xl lg:text-3xl font-extrabold text-primary tracking-tight">{title}</h2>
					<p className="text-xs lg:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
						{descMap[tab] || 'This feature is currently being crafted and will be available in an upcoming release.'}
					</p>
				</div>

				<div className="pt-4 border-t border-border/60 flex items-center justify-center gap-2 text-xs font-semibold text-muted-foreground">
					<span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
					<span>Module in progress</span>
				</div>
			</div>
		</div>
	);
}
