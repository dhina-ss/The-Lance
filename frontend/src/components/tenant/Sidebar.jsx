import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	LayoutDashboard,
	Monitor,
	Users,
	Bell,
	BarChart3,
	Settings,
	HelpCircle,
	LogOut,
	ShieldAlert,
	Package,
	Activity,
	Globe,
	Sliders,
	MapPin,
	Power,
	Layers,
	Download,
} from 'lucide-react';

const defaultNavItems = [
	{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
	{ id: 'devices', label: 'Devices', icon: Monitor },
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
				<div
					onClick={() => navigate('/')}
					className="flex flex-col gap-3 items-start group cursor-pointer"
				>
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
						const isActive = activeTab === item.id;

						return (
							<button
								key={item.id}
								onClick={() => setActiveTab(item.id)}
								className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group cursor-pointer ${isActive
									? 'bg-primary text-primary-foreground shadow-md shadow-primary/10 font-bold'
									: 'text-muted-foreground hover:text-primary hover:bg-slate-200/80'
									}`}
							>
								<div className="flex items-center gap-3">
									<Icon
										size={16}
										className={isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-primary transition-colors'}
									/>
									<span>{item.label}</span>
								</div>
							</button>
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

