import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	LayoutDashboard,
	Monitor,
	Users,
	Bell,
	BarChart3,
	Settings,
	LogOut,
	ChevronDown,
	ChevronRight,
	Activity,
	Sliders,
} from 'lucide-react';
import { getStoredTenantRoles, ALL_SUBRULE_IDS } from './tenantRoles';

const defaultNavItems = [
	{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
	{
		id: 'devices',
		label: 'Devices',
		icon: Monitor,
		subItems: [
			{ id: 'devices-monitor', label: 'Monitor', icon: Activity },
			{ id: 'devices-control', label: 'Control', icon: Sliders },
		],
	},
	{ id: 'users', label: 'Users', icon: Users },
	{ id: 'alerts', label: 'Alerts', icon: Bell },
	{ id: 'reports', label: 'Reports', icon: BarChart3 },
	{ id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab: externalActiveTab, setActiveTab: externalSetActiveTab, onDownloadClick }) {
	const navigate = useNavigate();
	const activeTab = externalActiveTab || 'dashboard';
	const setActiveTab = externalSetActiveTab || (() => { });

	// Dynamic user profile from login session
	const storedUser = useMemo(() => {
		try {
			const u = localStorage.getItem('user_profile');
			return u ? JSON.parse(u) : null;
		} catch {
			return null;
		}
	}, []);

	const userName = storedUser?.name || 'Tenant Admin';
	const userEmail = storedUser?.email || 'admin@gmail.com';
	const userRole = storedUser?.role || (storedUser?.type === 'own' ? 'Super Admin' : 'Tenant Admin');
	const isSuperAdmin =
		userRole.toLowerCase() === 'super admin' ||
		userRole.toLowerCase() === 'superadmin' ||
		(storedUser?.type || '').toLowerCase() === 'own' ||
		(storedUser?.type || '').toLowerCase() === 'superadmin';

	const activeRules = useMemo(() => {
		if (isSuperAdmin) {
			return ALL_SUBRULE_IDS;
		}
		if (Array.isArray(storedUser?.rules) && storedUser.rules.length > 0) {
			return storedUser.rules;
		}
		const roles = getStoredTenantRoles();
		const matchedRole = roles.find((r) => r.name.toLowerCase() === userRole.toLowerCase());
		if (matchedRole && Array.isArray(matchedRole.rules)) {
			return matchedRole.rules;
		}
		return [];
	}, [isSuperAdmin, userRole, storedUser]);

	const isItemAllowed = useCallback((itemId) => {
		if (isSuperAdmin) return true;
		const rules = activeRules;

		switch (itemId) {
			case 'dashboard':
				return true;

			case 'devices-monitor':
				return rules.some((r) =>
					r === 'telemetry_monitoring' ||
					r === 'perf:realtime' ||
					r === 'device:hardware_identity' ||
					r === 'device:os_build' ||
					r === 'device:network_telemetry' ||
					r === 'device:precise_location' ||
					r === 'device:app_usage'
				);

			case 'devices-control':
				return rules.some((r) =>
					r === 'security_controls' ||
					r === 'control:startup_login' ||
					r === 'security:usb_control' ||
					r === 'security:website_filter' ||
					r === 'security:antivirus_threat'
				);

			case 'devices':
				return (
					isItemAllowed('devices-monitor') ||
					isItemAllowed('devices-control')
				);

			case 'users':
			case 'users-logs':
				return rules.some((r) => r === 'user_auditing' || r === 'users:user_logs');

			case 'alerts':
				return rules.some((r) =>
					r === 'security_controls' ||
					r === 'security:antivirus_threat'
				);

			case 'reports':
				return rules.some((r) =>
					r === 'telemetry_monitoring' ||
					r === 'software_mgmt' ||
					r === 'user_auditing' ||
					r === 'users:user_logs' ||
					r.startsWith('device:') ||
					r.startsWith('software:')
				);

			case 'settings':
				return isSuperAdmin || userRole.toLowerCase() === 'admin' || rules.includes('settings');

			default:
				return true;
		}
	}, [isSuperAdmin, activeRules, userRole]);

	const visibleNavItems = useMemo(() => {
		return defaultNavItems
			.map((item) => {
				if (item.subItems) {
					const filteredSubItems = item.subItems.filter((sub) => isItemAllowed(sub.id));
					if (filteredSubItems.length === 0) return null;
					return { ...item, subItems: filteredSubItems };
				}
				if (!isItemAllowed(item.id)) return null;
				return item;
			})
			.filter(Boolean);
	}, [isItemAllowed]);

	const [openSubmenu, setOpenSubmenu] = useState(() => {
		if (activeTab.startsWith('devices')) return 'devices';
		return null;
	});

	useEffect(() => {
		if (activeTab.startsWith('devices')) {
			setOpenSubmenu('devices');
		}
	}, [activeTab]);

	useEffect(() => {
		if (visibleNavItems.length > 0) {
			const isCurrentAllowed = isItemAllowed(activeTab);
			if (!isCurrentAllowed) {
				const firstItem = visibleNavItems[0];
				const targetId = firstItem.subItems ? firstItem.subItems[0].id : firstItem.id;
				setActiveTab(targetId);
			}
		}
	}, [activeTab, visibleNavItems, isItemAllowed, setActiveTab]);

	const toggleSubmenu = (itemId) => {
		setOpenSubmenu((prev) => (prev === itemId ? null : itemId));
	};

	const initials = userName
		.split(' ')
		.filter(Boolean)
		.map((n) => n[0])
		.join('')
		.substring(0, 2)
		.toUpperCase() || 'TA';

	return (
		<aside className="w-full lg:w-[20%] lg:h-screen lg:fixed lg:top-0 lg:left-0 lg:min-w-[240px] bg-background/95 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-border/80 p-5 lg:p-6 flex flex-col justify-between shrink-0 z-50 overflow-y-auto">
			<div className="space-y-6">
				{/* Brand Header */}
				<div className="flex flex-col gap-3 items-start group">
					<img
						src="/assets/images/logo/logo-logo.webp"
						alt="TL Logo Mark"
						className="block h-10 md:h-10 w-auto object-contain shrink-0"
					/>
					<div className="w-full bg-accent rounded-lg px-2.5 py-1.5 flex items-center justify-between">
						<p className="text-[11px] text-primary font-bold tracking-wide uppercase">Tenant Console</p>
						<span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold truncate max-w-[100px]" title={userRole}>
							{userRole}
						</span>
					</div>
				</div>

				{/* Navigation Menu */}
				<div className="space-y-1.5">
					<p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/70 mb-2">
						{isSuperAdmin ? 'All Feature Modules' : 'Assigned Feature Modules'}
					</p>
					{visibleNavItems.map((item) => {
						const Icon = item.icon;
						const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
						const isParentActive = activeTab === item.id || activeTab.startsWith(item.id + '-');
						const isOpen = openSubmenu === item.id;

						return (
							<div key={item.id} className="space-y-1">
								<button
									onClick={() => {
										if (hasSubItems) {
											toggleSubmenu(item.id);
											if (!isParentActive) {
												setActiveTab(item.subItems[0].id);
											}
										} else {
											setActiveTab(item.id);
										}
									}}
									className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group cursor-pointer ${
										isParentActive
											? 'bg-primary text-primary-foreground shadow-md shadow-primary/10 font-bold'
											: 'text-muted-foreground hover:text-primary hover:bg-slate-200/80'
									}`}
								>
									<div className="flex items-center gap-3">
										<Icon
											size={16}
											className={isParentActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary transition-colors'}
										/>
										<span>{item.label}</span>
									</div>
									{hasSubItems && (
										<span className="shrink-0 transition-transform duration-200">
											{isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
										</span>
									)}
								</button>

								{/* Submenu items */}
								{hasSubItems && isOpen && (
									<div className="pl-4 space-y-1 border-l-2 border-primary/20 ml-4 py-1">
										{item.subItems.map((sub) => {
											const SubIcon = sub.icon;
											const isSubActive = activeTab === sub.id;

											return (
												<button
													key={sub.id}
													onClick={() => setActiveTab(sub.id)}
													className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
														isSubActive
															? 'bg-accent text-accent-foreground font-bold shadow-xs'
															: 'text-muted-foreground hover:text-primary hover:bg-slate-100'
													}`}
												>
													<SubIcon size={14} className={isSubActive ? 'text-white' : 'text-muted-foreground'} />
													<span>{sub.label}</span>
												</button>
											);
										})}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* User Profile & Download Footer */}
			<div className="pt-4 border-t border-border/80 space-y-3 mt-6">
				<div className="flex items-center justify-between px-2 pt-1">
					<div className="flex items-center gap-2.5 min-w-0">
						<div className="w-8 h-8 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center shrink-0 border border-accent/30">
							{initials}
						</div>
						<div className="min-w-0 flex-1">
							<p className="text-xs font-bold text-primary truncate">{userName}</p>
							<div className="flex items-center gap-1.5 mt-0.5">
								<span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-accent/15 text-accent border border-accent/25 truncate max-w-[95px]" title={userRole}>
									{userRole}
								</span>
								<span className="text-[10px] text-muted-foreground truncate">{userEmail}</span>
							</div>
						</div>
					</div>
					<button
						onClick={() => {
							try {
								localStorage.removeItem('user_profile');
								localStorage.removeItem('auth_token');
							} catch { }
							navigate('/login', { replace: true });
						}}
						className="p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
						title="Sign Out"
					>
						<LogOut size={16} />
					</button>
				</div>
			</div>
		</aside>
	);
}
