import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    BarChart3,
    Globe,
    TicketCheck,
    Users,
    TrendingUp,
    Building2,
    ShieldCheck,
    ArrowUpRight,
    Plus,
    Activity,
    Server,
    Zap,
    Clock,
    DollarSign,
    Layers,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
} from 'lucide-react';
import { PRODUCTS, resolveIcon } from '../lib/products';
import DashboardSidebar from '../components/DashboardSidebar';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const site = 'https://thelance.dev';
const pageTitle = 'Overview Dashboard — The Lance';
const pageDescription =
    'Real-time analytics, user adoption, product health, and tenant metrics across The Lance platform.';

// Chart Data — 6 Month MAU trend
const monthlyData = [
    { month: 'Jan', emsUsers: 1400, ticketUsers: 850, total: 2250 },
    { month: 'Feb', emsUsers: 1650, ticketUsers: 980, total: 2630 },
    { month: 'Mar', emsUsers: 1900, ticketUsers: 1120, total: 3020 },
    { month: 'Apr', emsUsers: 2100, ticketUsers: 1350, total: 3450 },
    { month: 'May', emsUsers: 2350, ticketUsers: 1580, total: 3930 },
    { month: 'Jun', emsUsers: 2780, ticketUsers: 2040, total: 4820 },
];

// Plan distribution
const planDistribution = [
    { name: 'Enterprise', percentage: 65, count: '3,133 users', color: 'bg-primary', border: 'border-primary' },
    { name: 'Professional', percentage: 25, count: '1,205 users', color: 'bg-accent', border: 'border-accent' },
    { name: 'Standard', percentage: 10, count: '482 users', color: 'bg-slate-400', border: 'border-slate-400' },
];

// Recent Audit Logs
const recentActivity = [
    { id: 1, action: 'Tenant Provisioned', entity: 'Apex Health Systems', product: 'EMS', time: '12 mins ago', type: 'success' },
    { id: 2, action: 'Plan Upgraded', entity: 'CyberDyne Logistics', product: 'Ticket Mgmt', time: '1 hour ago', type: 'info' },
    { id: 3, action: 'User Limit Reached', entity: 'Horizon Financial', product: 'EMS', time: '3 hours ago', type: 'warning' },
    { id: 4, action: 'Admin Password Reset', entity: 'TechFlow Solutions', product: 'Ticket Mgmt', time: '5 hours ago', type: 'info' },
];

export default function DashboardPage() {
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

    const [selectedProductFilter, setSelectedProductFilter] = useState<'all' | 'ems' | 'tickets'>('all');
    const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

    const maxChartValue = 5000;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={`${site}/dashboard`} />
            </Helmet>

            <div className="relative h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
                {/* 20% Width Sidebar */}
                <DashboardSidebar activeItem="overview" />

                {/* Main Content */}
                <main className="w-full lg:w-[80%] flex-1 relative h-screen p-6 lg:p-10 overflow-y-auto overflow-x-hidden">
                    {/* Background Grid Pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />

                    <div className="relative w-full z-10 space-y-8">
                        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">

                            {/* Top Page Header */}
                            <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl md:text-3xl font-extrabold text-primary tracking-tight">
                                            Platform Overview
                                        </h1>
                                        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Live Metrics
                                        </span>
                                    </div>
                                    <p className="text-xs md:text-sm text-muted-foreground mt-1">
                                        Analytics, user adoption, product usage, and tenant health across your ecosystem.
                                    </p>
                                </div>

                            </motion.div>

                            {/* 4 Analysis KPI Cards */}
                            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                                {/* Total Active Users */}
                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Active Users</span>
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <Users size={18} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <div className="text-3xl font-black text-primary">4,820</div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                            <TrendingUp size={12} />
                                            +12.4%
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-2">74.1% of allocated 6,500 total seats</p>
                                    <div className="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-primary h-full rounded-full w-[74%]" />
                                    </div>
                                </div>

                                {/* Active Products */}
                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-accent/40 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Products</span>
                                        <div className="w-9 h-9 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                            <Layers size={18} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <div className="text-3xl font-black text-primary">2 / 2</div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                            <ShieldCheck size={12} />
                                            100% Online
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-2">EMS & Ticket Management Console</p>
                                    <div className="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-accent h-full rounded-full w-[100%]" />
                                    </div>
                                </div>

                                {/* Managed Tenants */}
                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Provisioned Tenants</span>
                                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                            <Building2 size={18} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <div className="text-3xl font-black text-primary">24</div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                            +3 this mo
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-2">22 Active, 2 Suspended companies</p>
                                    <div className="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden flex gap-0.5">
                                        <div className="bg-emerald-500 h-full rounded-l-full w-[91%]" />
                                        <div className="bg-rose-500 h-full rounded-r-full w-[9%]" />
                                    </div>
                                </div>

                                {/* Monthly Revenue (MRR) */}
                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Est. Monthly Revenue</span>
                                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <DollarSign size={18} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline justify-between">
                                        <div className="text-3xl font-black text-primary">$142.8k</div>
                                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                                            <ArrowUpRight size={12} />
                                            +8.5%
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-2">Avg. $5,950 per tenant subscription</p>
                                    <div className="w-full bg-muted h-1.5 rounded-full mt-3 overflow-hidden">
                                        <div className="bg-primary h-full rounded-full w-[82%]" />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Main Interactive Charts Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* User Growth & Product Adoption Chart (2 cols) */}
                                <motion.div variants={fadeUp} className="lg:col-span-2 bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
                                        <div>
                                            <h3 className="text-base font-extrabold text-primary flex items-center gap-2">
                                                <BarChart3 size={18} className="text-primary" />
                                                User Growth & Adoption Trend
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Monthly active users (MAU) breakdown by product (Jan - Jun 2026)
                                            </p>
                                        </div>

                                        {/* Product Filter Buttons */}
                                        <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-xl">
                                            <button
                                                onClick={() => setSelectedProductFilter('all')}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                                    selectedProductFilter === 'all'
                                                        ? 'bg-background text-primary shadow-sm'
                                                        : 'text-muted-foreground hover:text-primary'
                                                }`}
                                            >
                                                All Products
                                            </button>
                                            <button
                                                onClick={() => setSelectedProductFilter('ems')}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                                    selectedProductFilter === 'ems'
                                                        ? 'bg-primary text-white shadow-sm'
                                                        : 'text-muted-foreground hover:text-primary'
                                                }`}
                                            >
                                                EMS
                                            </button>
                                            <button
                                                onClick={() => setSelectedProductFilter('tickets')}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                                                    selectedProductFilter === 'tickets'
                                                        ? 'bg-accent text-primary shadow-sm'
                                                        : 'text-muted-foreground hover:text-primary'
                                                }`}
                                            >
                                                Ticket Mgmt
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bar Chart Visualization */}
                                    <div className="h-64 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2 relative">
                                        {/* Background Grid Lines */}
                                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                                            <div className="border-b border-muted-foreground/30 w-full" />
                                            <div className="border-b border-muted-foreground/30 w-full" />
                                            <div className="border-b border-muted-foreground/30 w-full" />
                                            <div className="border-b border-muted-foreground/30 w-full" />
                                        </div>

                                        {monthlyData.map((d, index) => {
                                            const emsHeight = (d.emsUsers / maxChartValue) * 100;
                                            const ticketHeight = (d.ticketUsers / maxChartValue) * 100;
                                            const isHovered = hoveredMonth === index;

                                            return (
                                                <div
                                                    key={d.month}
                                                    onMouseEnter={() => setHoveredMonth(index)}
                                                    onMouseLeave={() => setHoveredMonth(null)}
                                                    className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer z-10"
                                                >
                                                    {/* Tooltip on hover */}
                                                    {isHovered && (
                                                        <div className="absolute -top-16 bg-primary text-primary-foreground text-[11px] font-medium py-1.5 px-3 rounded-xl shadow-xl z-30 whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                                                            <p className="font-bold text-xs mb-0.5">{d.month} Analytics</p>
                                                            {selectedProductFilter !== 'tickets' && (
                                                                <p className="text-accent font-semibold">EMS: {d.emsUsers.toLocaleString()} users</p>
                                                            )}
                                                            {selectedProductFilter !== 'ems' && (
                                                                <p className="text-emerald-400 font-semibold">Tickets: {d.ticketUsers.toLocaleString()} users</p>
                                                            )}
                                                            <p className="border-t border-white/20 mt-1 pt-0.5 font-bold">Total: {d.total.toLocaleString()} users</p>
                                                        </div>
                                                    )}

                                                    {/* Bar Stack */}
                                                    <div className="w-full max-w-[48px] flex items-end justify-center gap-1.5 h-full">
                                                        {(selectedProductFilter === 'all' || selectedProductFilter === 'ems') && (
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: `${emsHeight}%` }}
                                                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                                                className={`w-full bg-primary rounded-t-lg transition-all duration-200 ${
                                                                    isHovered ? 'brightness-125 shadow-lg shadow-primary/30' : ''
                                                                }`}
                                                            />
                                                        )}
                                                        {(selectedProductFilter === 'all' || selectedProductFilter === 'tickets') && (
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: `${ticketHeight}%` }}
                                                                transition={{ duration: 0.5, delay: index * 0.05 + 0.1 }}
                                                                className={`w-full bg-accent rounded-t-lg transition-all duration-200 ${
                                                                    isHovered ? 'brightness-125 shadow-lg shadow-accent/30' : ''
                                                                }`}
                                                            />
                                                        )}
                                                    </div>

                                                    <span className={`text-xs font-bold mt-3 transition-colors ${isHovered ? 'text-primary' : 'text-muted-foreground'}`}>
                                                        {d.month}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Chart Legend */}
                                    <div className="flex items-center justify-center gap-6 pt-2 border-t border-border/40">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                            <span className="w-3 h-3 rounded-md bg-primary inline-block" />
                                            <span>Endpoint Management System (EMS)</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                                            <span className="w-3 h-3 rounded-md bg-accent inline-block" />
                                            <span>Ticket Management Platform</span>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Plan & User Breakdown (1 col) */}
                                <motion.div variants={fadeUp} className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm space-y-6 flex flex-col justify-between">
                                    <div>
                                        <div className="pb-4 border-b border-border/60">
                                            <h3 className="text-base font-extrabold text-primary flex items-center gap-2">
                                                <TrendingUp size={18} className="text-accent" />
                                                Subscription Breakdown
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                User allocation across active tier plans
                                            </p>
                                        </div>

                                        <div className="space-y-5 pt-4">
                                            {planDistribution.map((plan) => (
                                                <div key={plan.name} className="space-y-2">
                                                    <div className="flex items-center justify-between text-xs font-bold">
                                                        <span className="text-primary">{plan.name} Tier</span>
                                                        <span className="text-muted-foreground">{plan.count} ({plan.percentage}%)</span>
                                                    </div>
                                                    <div className="w-full bg-muted/20 h-2.5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${plan.percentage}%` }}
                                                            transition={{ duration: 0.6, ease: 'easeOut' }}
                                                            className={`h-full rounded-full ${plan.color}`}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tenant Quick Summary Card */}
                                    <div className="p-4 rounded-xl bg-muted/20 border border-border/60 space-y-2.5 mt-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-primary">System Capacity</span>
                                            <span className="text-xs font-extrabold text-accent">74% Capacity Used</span>
                                        </div>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                                            1,680 available user seats remaining across licensed product tiers.
                                        </p>
                                        <button
                                            onClick={() => navigate('/dashboard/products')}
                                            className="w-full py-2 bg-background border border-input rounded-lg text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-1"
                                        >
                                            <span>Upgrade Allocation</span>
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Product Cards & Audit Log Stream */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* Products Health List (2 cols) */}
                                <motion.div variants={fadeUp} className="lg:col-span-2 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-extrabold text-primary">Licensed Products</h3>
                                        <button
                                            onClick={() => navigate('/dashboard/products')}
                                            className="text-xs font-bold text-accent hover:underline flex items-center gap-1"
                                        >
                                            View All Companies <ChevronRight size={14} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {PRODUCTS.map((product) => (
                                            <div
                                                key={product.id}
                                                className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-11 h-11 rounded-xl ${product.bgColor} ${product.accentColor} border ${product.borderColor} flex items-center justify-center shrink-0`}>
                                                            {resolveIcon(product.iconName, 22)}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-primary">{product.name}</h4>
                                                            <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{product.tagline}</p>
                                                        </div>
                                                    </div>
                                                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                                        Active
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-3 gap-2 py-2 border-t border-border/50 text-center">
                                                    {product.stats.map((stat) => (
                                                        <div key={stat.label}>
                                                            <p className="text-[10px] font-bold uppercase text-muted-foreground">{stat.label}</p>
                                                            <p className="text-sm font-extrabold text-primary mt-0.5">{stat.value}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* System Audit Log Stream (1 col) */}
                                <motion.div variants={fadeUp} className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-border/60">
                                        <h3 className="text-base font-extrabold text-primary flex items-center gap-2">
                                            <Activity size={18} className="text-primary" />
                                            System Audit Log
                                        </h3>
                                        <span className="text-[11px] font-bold text-muted-foreground">Real-time</span>
                                    </div>

                                    <div className="space-y-3.5">
                                        {recentActivity.map((log) => (
                                            <div key={log.id} className="flex items-start gap-3 text-xs p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
                                                <div className="mt-0.5">
                                                    {log.type === 'success' ? (
                                                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                                    ) : log.type === 'warning' ? (
                                                        <AlertCircle size={16} className="text-amber-500 shrink-0" />
                                                    ) : (
                                                        <Activity size={16} className="text-accent shrink-0" />
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold text-primary truncate">{log.action}</p>
                                                    <p className="text-[11px] text-muted-foreground truncate">{log.entity} • <span className="font-semibold text-primary">{log.product}</span></p>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground shrink-0">{log.time}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => navigate('/dashboard/tenant/ems/tnt-1')}
                                        className="w-full py-2.5 border border-input rounded-xl text-xs font-bold text-primary hover:bg-muted transition-colors"
                                    >
                                        View Full System Logs
                                    </button>
                                </motion.div>
                            </div>

                        </motion.div>
                    </div>
                </main>
            </div>
        </>
    );
}
