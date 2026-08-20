import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Layers,
    Settings,
    LogOut,
} from 'lucide-react';

interface DashboardSidebarProps {
    activeItem?: 'overview' | 'products' | 'ems' | 'tickets' | 'settings';
}

export default function DashboardSidebar({ activeItem = 'overview' }: DashboardSidebarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        {
            id: 'overview',
            label: 'Overview',
            icon: LayoutDashboard,
            href: '/dashboard',
            badge: null,
        },
        {
            id: 'products',
            label: 'Products',
            icon: Layers,
            href: '/dashboard/products',
            badge: '2 Active',
        },
    ];

    return (
        <aside className="w-full lg:w-[20%] lg:h-screen lg:sticky lg:top-0 lg:min-w-[240px] bg-background/95 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-border/80 p-5 lg:p-6 flex flex-col justify-between shrink-0 z-20 overflow-y-auto">
            <div className="space-y-8">
                {/* Brand Header */}
                <div 
                    onClick={() => navigate('/')} 
                    className="flex flex-col gap-3 items-start group"
                >
                    <img
                        src="/assets/images/logo/logo-logo.webp"
                        alt="TL Logo Mark"
                        className="block h-10 md:h-10 w-auto object-contain shrink-0"
                    />
                    <div className=' w-full bg-accent rounded-lg px-2 py-1.5'>
                        <p className="text-[12px] text-primary text-center font-semibold">Control Center</p>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="space-y-1.5">
                    <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/70 mb-3">
                        Navigation
                    </p>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive =
                            activeItem === item.id ||
                            (item.href === '/dashboard' && location.pathname === '/dashboard') ||
                            (item.href === location.pathname);

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.href)}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10'
                                        : 'text-muted-foreground hover:text-primary hover:bg-slate-200'
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

            {/* User Profile & Sign Out Footer */}
            <div className="pt-6 border-t border-border/80 space-y-3 mt-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center shrink-0 border border-accent/30">
                            AD
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-primary truncate">Admin User</p>
                            <p className="text-[10px] text-muted-foreground truncate">admin@gmail.com</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="p-2 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Sign Out"
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
