import React, { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import Sidebar from '../components/tenant/Sidebar';
import Header from '../components/tenant/Header';
import MetricCard from '../components/tenant/MetricCard';
import PerformanceMatrix from '../components/tenant/PerformanceMatrix';
import OsDistribution from '../components/tenant/OsDistribution';
import ActivityLog from '../components/tenant/ActivityLog';
import CriticalAlerts from '../components/tenant/CriticalAlerts';
import DevicesPage from '../components/tenant/DevicesPage';
import UsersPage from '../components/tenant/UsersPage';
import { fetchDevices } from '../api/ems';

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
	const [activeTab, setActiveTab] = useState('dashboard');
	const [stats, setStats] = useState({ total: 0, online: 0, sleep: 0, offline: 0 });

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
	};

	return (
		<>
			<Helmet>
				<title>{pageTitle}</title>
				<meta name="description" content={pageDescription} />
				<link rel="canonical" href={`${site}/tenant-dashboard`} />
			</Helmet>

			<div className="relative min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
				{/* Sidebar Component */}
				<Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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
					<Header pageTitle={titleMap[activeTab] || 'Dashboard Overview'} />

					{/* Content Canvas */}
					{activeTab === 'devices' ? (
						<div className="relative z-10">
							<DevicesPage />
						</div>
					) : activeTab === 'users' ? (
						<div className="relative z-10">
							<UsersPage />
						</div>
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
										title="Suspended / Sleep"
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

								{/* Main Charts & Grid Area */}
								<motion.div variants={fadeUp} className="grid grid-cols-12 gap-6">
									<PerformanceMatrix />
									<OsDistribution />
								</motion.div>

								<motion.div variants={fadeUp} className="grid grid-cols-12 gap-6">
									<ActivityLog />
								</motion.div>

								<motion.div variants={fadeUp} className="grid grid-cols-12 gap-6">
									<div className="col-span-12 flex flex-col">
										<CriticalAlerts />
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
