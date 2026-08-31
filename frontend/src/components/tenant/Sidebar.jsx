import React, { useState, useEffect } from 'react';
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
	FileText,
} from 'lucide-react';

const defaultNavItems = [
	{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
	{
		id: 'devices',
		label: 'Devices',
		icon: Monitor,
		subItems: [
			{ id: 'devices-monitor', label: 'Monitor', icon: Activity },
			{ id: 'devices-control', label: 'Control', icon: Sliders },
			{ id: 'devices-report', label: 'Report', icon: FileText },
		],
	},
	{
		id: 'users',
		label: 'Users',
		icon: Users,
		subItems: [
			{ id: 'users-logs', label: 'Logs', icon: FileText },
			{ id: 'users-monitor', label: 'Monitor', icon: Activity },
			{ id: 'users-report', label: 'Report', icon: BarChart3 },
		],
	},
	{ id: 'alerts', label: 'Alerts', icon: Bell },
	{ id: 'reports', label: 'Reports', icon: BarChart3 },
	{ id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab: externalActiveTab, setActiveTab: externalSetActiveTab, onDownloadClick }) {
	const navigate = useNavigate();
	const activeTab = externalActiveTab || 'dashboard';
	const setActiveTab = externalSetActiveTab || (() => { });

	const [openSubmenu, setOpenSubmenu] = useState(() => {
		if (activeTab.startsWith('devices')) return 'devices';
		if (activeTab.startsWith('users')) return 'users';
		return null;
	});

	useEffect(() => {
		if (activeTab.startsWith('devices')) {
			setOpenSubmenu('devices');
		} else if (activeTab.startsWith('users')) {
			setOpenSubmenu('users');
		}
	}, [activeTab]);

	const toggleSubmenu = (itemId) => {
		setOpenSubmenu((prev) => (prev === itemId ? null : itemId));
	};

	// Dynamic user profile from login session
	const storedUser = React.useMemo(() => {
		try {
			const u = localStorage.getItem('user_profile');
			return u ? JSON.parse(u) : null;
		} catch {
			return null;
		}
	}, []);

	const userName = storedUser?.name || 'Tenant Admin';
	const userEmail = storedUser?.email || 'admin@gmail.com';
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
					<div className="w-full bg-accent rounded-lg px-2 py-1.5">
						<p className="text-[12px] text-primary text-center font-bold tracking-wide uppercase">Tenant Console</p>
					</div>
				</div>

				{/* Navigation Menu */}
				<div className="space-y-1.5">
					<p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/70 mb-2">
						Default Features
					</p>
					{defaultNavItems.map((item) => {
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
							<p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
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
