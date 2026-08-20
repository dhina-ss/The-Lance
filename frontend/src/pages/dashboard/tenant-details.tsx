import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    Building2,
    Globe,
    Mail,
    Phone,
    MapPin,
    User,
    Check,
    ChevronRight,
    Lock,
    Key,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Calendar,
    Users,
    Shield,
    ToggleLeft,
    ToggleRight,
    RefreshCw,
    Clock,
    Zap,
    Download,
    Search,
    Filter,
    Edit3,
    Copy,
    ChevronDown,
} from 'lucide-react';
import { getProduct } from '../../lib/products';
import DashboardSidebar from '../../components/DashboardSidebar';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

/* ── Mock Audit Log Data ── */
interface AuditLog {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    category: 'Status' | 'Subscription' | 'Security' | 'Module' | 'Admin';
    ipAddress: string;
    status: 'Success' | 'Warning' | 'Failed';
}

const mockAuditLogs: AuditLog[] = [
    {
        id: 'log-101',
        timestamp: '2026-08-10 18:42:10',
        action: 'Extended subscription expiry date by +30 days',
        actor: 'super.admin@thelance.dev',
        category: 'Subscription',
        ipAddress: '192.168.1.45',
        status: 'Success',
    },
    {
        id: 'log-102',
        timestamp: '2026-08-09 14:15:33',
        action: 'Enabled module: Remote Desktop Access',
        actor: 'system.operator@thelance.dev',
        category: 'Module',
        ipAddress: '10.0.4.112',
        status: 'Success',
    },
    {
        id: 'log-103',
        timestamp: '2026-08-08 09:30:22',
        action: 'Reset primary admin password for alex.m@nexusglobal.com',
        actor: 'security.admin@thelance.dev',
        category: 'Security',
        ipAddress: '172.16.0.88',
        status: 'Warning',
    },
    {
        id: 'log-104',
        timestamp: '2026-08-01 11:05:00',
        action: 'Upgraded subscription plan from Professional to Enterprise',
        actor: 'billing.mgr@thelance.dev',
        category: 'Subscription',
        ipAddress: '192.168.1.12',
        status: 'Success',
    },
    {
        id: 'log-105',
        timestamp: '2026-07-25 16:20:45',
        action: 'Increased maximum user capacity limit to 1,000 users',
        actor: 'super.admin@thelance.dev',
        category: 'Admin',
        ipAddress: '192.168.1.45',
        status: 'Success',
    },
    {
        id: 'log-106',
        timestamp: '2026-07-15 08:12:19',
        action: 'Failed login attempt for admin credentials',
        actor: 'alex.m@nexusglobal.com',
        category: 'Security',
        ipAddress: '203.0.113.195',
        status: 'Failed',
    },
];

/* ── Module Config Type ── */
interface ModuleConfig {
    id: string;
    name: string;
    description: string;
    category: string;
    enabled: boolean;
}

const initialModules: ModuleConfig[] = [
    {
        id: 'mod-ems-core',
        name: 'Real-Time Endpoint Monitoring',
        description: 'Continuously track system health, RAM, CPU, and disk metrics across all endpoints.',
        category: 'Endpoint Security',
        enabled: true,
    },
    {
        id: 'mod-patch-mgmt',
        name: 'Automated Patch Management',
        description: 'Schedule OS and third-party software security patch deployment automatically.',
        category: 'Compliance',
        enabled: true,
    },
    {
        id: 'mod-remote-control',
        name: 'Remote Desktop Control',
        description: 'Encrypted, low-latency remote screen sharing and terminal control.',
        category: 'Remote Ops',
        enabled: true,
    },
    {
        id: 'mod-ticket-routing',
        name: 'Smart Ticket Auto-Routing',
        description: 'AI-powered helpdesk ticket tagging, prioritization, and technician assignment.',
        category: 'Helpdesk Ops',
        enabled: true,
    },
    {
        id: 'mod-sla-tracking',
        name: 'SLA Escalation Alerts',
        description: 'Automated SLA breach warning notifications via Webhooks, Slack, and SMS.',
        category: 'Helpdesk Ops',
        enabled: false,
    },
    {
        id: 'mod-audit-vault',
        name: 'Immutable Audit Vault',
        description: 'Store tamper-proof security audit trails for regulatory compliance.',
        category: 'Compliance',
        enabled: true,
    },
];

/* ── Audit Category Filter Dropdown ── */
const AUDIT_CATEGORIES = ['All', 'Status', 'Subscription', 'Security', 'Module', 'Admin'] as const;

function AuditCategorySelect({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const label = value === 'All' ? 'All Categories' : value;

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                className="flex items-center gap-2 px-3.5 py-2 bg-background border border-input rounded-xl text-xs font-semibold text-primary focus:outline-none focus:border-accent hover:border-accent/60 transition-all shadow-sm min-w-[140px] justify-between"
            >
                <span>{label}</span>
                <ChevronDown size={13} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-background border border-border/80 shadow-2xl z-[100] p-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="space-y-0.5">
                        {AUDIT_CATEGORIES.map((cat) => {
                            const isSelected = value === cat;
                            const display = cat === 'All' ? 'All Categories' : cat;
                            return (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => { onChange(cat); setIsOpen(false); }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                        isSelected
                                            ? 'bg-accent/15 text-accent'
                                            : 'text-primary hover:bg-slate-100 hover:text-accent'
                                    }`}
                                >
                                    <span>{display}</span>
                                    {isSelected && <Check size={12} className="text-accent shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Initial Mock Tenant Details ── */
const mockTenantData = {
    id: 'tnt-1',
    productId: 'ems',
    companyName: 'Nexus Global Tech',
    domain: 'nexusglobal.com',
    industry: 'Technology',
    region: 'North America',
    orgId: 'ORG-99482-NX',
    taxId: 'US-94827103',
    address: '100 Innovation Way, Suite 400',
    city: 'San Francisco, CA',
    country: 'United States',
    adminName: 'Alex Mercer',
    adminEmail: 'admin@gmail.com',
    adminPhone: '+1 (555) 382-9102',
    status: 'Active' as 'Active' | 'Inactive' | 'Suspended',
    plan: 'Enterprise' as 'Standard' | 'Professional' | 'Enterprise',
    startDate: '2025-11-12',
    expiryDate: '2026-11-12',
    activeUsersCount: 742,
    maxUsers: 1000,
};

export default function TenantDetailsPage() {
    const { productId, tenantId } = useParams<{ productId?: string; tenantId?: string }>();
    const navigate = useNavigate();

    const activeProductId = productId || (tenantId && getProduct(tenantId) ? tenantId : 'ems');
    const product = getProduct(activeProductId);

    const initialTenant = activeProductId === 'tickets'
        ? {
            id: 'tnt-5',
            productId: 'tickets',
            companyName: 'TechFlow Solutions',
            domain: 'techflow.io',
            industry: 'Technology',
            region: 'North America',
            orgId: 'ORG-88310-TF',
            taxId: 'US-8831054',
            address: '450 Cyber Way, Suite 1200',
            city: 'Austin, TX',
            country: 'United States',
            adminName: 'David Koster',
            adminEmail: 'david.k@techflow.io',
            adminPhone: '+1 (555) 742-9901',
            status: 'Active' as const,
            plan: 'Enterprise' as const,
            startDate: '2026-02-10',
            expiryDate: '2027-02-10',
            activeUsersCount: 340,
            maxUsers: 500,
        }
        : mockTenantData;

    // Tenant State
    const [tenant, setTenant] = useState(initialTenant);
    const [modules, setModules] = useState<ModuleConfig[]>(initialModules);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);

    // Active Tab state
    const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'security' | 'audit'>('overview');

    // UI Feedback states
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Reset Password Modal state
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [passwordCopied, setPasswordCopied] = useState(false);

    // Suspend Modal state
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');

    // Audit log search & category filter
    const [logSearch, setLogSearch] = useState('');
    const [logCategoryFilter, setLogCategoryFilter] = useState<string>('All');

    function showToast(msg: string) {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3000);
    }

    function addAuditLog(action: string, category: AuditLog['category'], status: AuditLog['status'] = 'Success') {
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            action,
            actor: 'admin@gmail.com',
            category,
            ipAddress: '192.168.1.100',
            status,
        };
        setAuditLogs((prev) => [newLog, ...prev]);
    }

    // Handlers
    function handleToggleActive() {
        const nextStatus = tenant.status === 'Active' ? 'Inactive' : 'Active';
        setTenant((prev) => ({ ...prev, status: nextStatus }));
        addAuditLog(`Changed company status to ${nextStatus}`, 'Status');
        showToast(`Company status updated to ${nextStatus}`);
    }

    function handleSuspendCompany() {
        if (!suspendReason.trim()) return;
        setTenant((prev) => ({ ...prev, status: 'Suspended' }));
        addAuditLog(`Suspended company. Reason: ${suspendReason}`, 'Status', 'Warning');
        setIsSuspendModalOpen(false);
        setSuspendReason('');
        showToast('Company has been suspended');
    }

    function handleUnsuspendCompany() {
        setTenant((prev) => ({ ...prev, status: 'Active' }));
        addAuditLog('Reactivated suspended company', 'Status');
        showToast('Company unsuspended and reactivated');
    }

    function handleExtendSubscription(days: number) {
        const currentExp = new Date(tenant.expiryDate);
        currentExp.setDate(currentExp.getDate() + days);
        const newExpStr = currentExp.toISOString().split('T')[0];
        setTenant((prev) => ({ ...prev, expiryDate: newExpStr }));
        addAuditLog(`Extended subscription by +${days} days (New Expiry: ${newExpStr})`, 'Subscription');
        showToast(`Subscription extended by +${days} days to ${newExpStr}`);
    }

    function handleToggleModule(modId: string) {
        setModules((prev) =>
            prev.map((m) => {
                if (m.id === modId) {
                    const nextVal = !m.enabled;
                    addAuditLog(`${nextVal ? 'Enabled' : 'Disabled'} module: ${m.name}`, 'Module');
                    showToast(`${m.name} module ${nextVal ? 'enabled' : 'disabled'}`);
                    return { ...m, enabled: nextVal };
                }
                return m;
            })
        );
    }

    function handleGenerateNewPassword() {
        const generated = 'Nx$' + Math.random().toString(36).slice(-8) + '!2026';
        setNewPassword(generated);
        setPasswordCopied(false);
        addAuditLog(`Reset company admin password for ${tenant.adminEmail}`, 'Security', 'Warning');
    }

    function handleCopyPassword() {
        navigator.clipboard.writeText(newPassword);
        setPasswordCopied(true);
        setTimeout(() => setPasswordCopied(false), 2000);
    }

    function handlePlanChange(newPlan: 'Standard' | 'Professional' | 'Enterprise') {
        const oldPlan = tenant.plan;
        setTenant((prev) => ({ ...prev, plan: newPlan }));
        addAuditLog(`Changed subscription plan from ${oldPlan} to ${newPlan}`, 'Subscription');
        showToast(`Plan updated to ${newPlan}`);
    }

    // Filter audit logs
    const filteredLogs = auditLogs.filter((log) => {
        const matchesSearch = log.action.toLowerCase().includes(logSearch.toLowerCase()) || log.actor.toLowerCase().includes(logSearch.toLowerCase());
        const matchesCat = logCategoryFilter === 'All' || log.category === logCategoryFilter;
        return matchesSearch && matchesCat;
    });

    return (
        <>
            <Helmet>
                <title>{`${tenant.companyName} — Tenant Details | The Lance`}</title>
                <meta name="description" content={`Manage tenant parameters, subscriptions, users, and audit logs for ${tenant.companyName}.`} />
            </Helmet>

            {/* Notification Toast */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground px-5 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
                    <CheckCircle2 size={16} className="text-accent" />
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="relative h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
                <DashboardSidebar activeItem="products" />

                <main className="w-full lg:w-[80%] flex-1 relative h-screen p-6 lg:p-10 overflow-y-auto overflow-x-hidden">
                    {/* Dot Grid Backdrop */}
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />

                    {/* Geometric Accent */}
                    <div className="absolute top-0 right-0 w-[550px] h-[550px] pointer-events-none opacity-20 transform translate-x-16 -translate-y-12">
                        <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g opacity="0.9">
                                <g transform="translate(250, 150)">
                                    <circle cx="0" cy="0" r="65" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
                                    <path d="M 0 -65 A 65 65 0 0 1 0 65 Z" fill="hsl(var(--accent))" fillOpacity="0.15" />
                                    <circle cx="0" cy="0" r="35" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.25" fill="none" />
                                </g>
                                <line x1="40" y1="150" x2="360" y2="150" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.15" />
                                <line x1="250" y1="30" x2="250" y2="340" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.2" />
                            </g>
                        </svg>
                    </div>

                    <div className="relative w-full z-10 space-y-8">
                    <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">

                        {/* Top Navigation & Quick Actions */}
                        <motion.div variants={fadeUp} className="space-y-4">
                            <button
                                onClick={() => navigate(`/dashboard/tenants/${product?.id || 'ems'}`)}
                                className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
                            >
                                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                                Back to Tenants List
                            </button>

                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-3">
                                        {/* Breadcrumb */}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                            <Building2 size={14} className="text-accent" />
                                            <span 
                                                onClick={() => navigate('/dashboard/products')} 
                                                className="hover:underline cursor-pointer"
                                            >
                                                Products
                                            </span>
                                            <ChevronRight size={12} className="text-border" />
                                            <span 
                                                onClick={() => navigate(`/dashboard/tenants/${product?.id || 'ems'}`)} 
                                                className="hover:underline cursor-pointer"
                                            >
                                                {product?.name || 'Product'}
                                            </span>
                                            <ChevronRight size={12} className="text-border" />
                                            <span className="text-primary font-semibold">{tenant.companyName}</span>
                                        </div>

                                        {/* Status Badge */}
                                        <span className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-bold ${
                                            tenant.status === 'Active'
                                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30'
                                                : tenant.status === 'Suspended'
                                                ? 'bg-rose-500/10 text-rose-600 border border-rose-500/30'
                                                : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                                        }`}>
                                            {tenant.status === 'Active' ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                                            <span>{tenant.status}</span>
                                        </span>
                                    </div>

                                    <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight flex items-center gap-3">
                                        {tenant.companyName}
                                    </h1>
                                    <p className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                                        <Globe size={12} />
                                        <span>{tenant.domain}</span>
                                        <span className="text-border">•</span>
                                        <span>Org ID: {tenant.orgId}</span>
                                    </p>
                                </div>

                                {/* Header Action Toolbar */}
                                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                                    {/* Activate / Deactivate */}
                                    <button
                                        onClick={handleToggleActive}
                                        className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                                            tenant.status === 'Active'
                                                ? 'border-input hover:bg-slate-100 text-primary'
                                                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                                        }`}
                                    >
                                        {tenant.status === 'Active' ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                                        <span>{tenant.status === 'Active' ? 'Deactivate Company' : 'Activate Company'}</span>
                                    </button>

                                    {/* Reset Password */}
                                    <button
                                        onClick={() => { setIsPasswordModalOpen(true); handleGenerateNewPassword(); }}
                                        className="px-4 py-2 text-xs font-semibold rounded-xl border border-input bg-background text-primary hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                                    >
                                        <Key size={14} />
                                        <span>Reset Admin Password</span>
                                    </button>

                                    {/* Suspend / Unsuspend */}
                                    {tenant.status === 'Suspended' ? (
                                        <button
                                            onClick={handleUnsuspendCompany}
                                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow"
                                        >
                                            <CheckCircle2 size={14} />
                                            <span>Unsuspend Company</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setIsSuspendModalOpen(true)}
                                            className="px-4 py-2 text-xs font-semibold rounded-xl border border-rose-200 text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
                                        >
                                            <AlertTriangle size={14} />
                                            <span>Suspend Company</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Top Key Metrics Banner */}
                        <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Active Users Counter */}
                            <div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Users</span>
                                    <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                        <Users size={16} />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-extrabold text-primary">{tenant.activeUsersCount}</span>
                                    <span className="text-xs text-muted-foreground font-semibold">/ {tenant.maxUsers} max</span>
                                </div>
                                <div className="w-full bg-muted h-2 rounded-full mt-3 overflow-hidden">
                                    <div
                                        className="bg-accent h-full rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(100, Math.round((tenant.activeUsersCount / tenant.maxUsers) * 100))}%` }}
                                    />
                                </div>
                            </div>

                            {/* Current Plan */}
                            <div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subscription Plan</span>
                                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                        <Zap size={16} />
                                    </div>
                                </div>
                                <div className="text-2xl font-extrabold text-primary mb-1">{tenant.plan} Tier</div>
                                <p className="text-xs text-accent font-semibold">Licensed Platform</p>
                            </div>

                            {/* Subscription Expiry */}
                            <div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Subscription Expiry</span>
                                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                        <Calendar size={16} />
                                    </div>
                                </div>
                                <div className="text-2xl font-extrabold text-primary mb-1">{tenant.expiryDate}</div>
                                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>Active License</span>
                                </p>
                            </div>

                            {/* Active Feature Modules */}
                            <div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Enabled Modules</span>
                                    <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                        <Shield size={16} />
                                    </div>
                                </div>
                                <div className="text-3xl font-extrabold text-primary">
                                    {modules.filter((m) => m.enabled).length} / {modules.length}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Feature capabilities active</p>
                            </div>
                        </motion.div>

                        {/* Navigation Tabs */}
                        <motion.div variants={fadeUp} className="flex border-b border-border gap-6 text-sm font-semibold">
                            {[
                                { id: 'overview', label: 'Overview & Subscription', icon: <Building2 size={16} /> },
                                { id: 'modules', label: 'Feature Modules', icon: <Shield size={16} /> },
                                { id: 'security', label: 'Admin & Security', icon: <Lock size={16} /> },
                                { id: 'audit', label: 'System Audit Logs', icon: <Clock size={16} /> },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`pb-3.5 flex items-center gap-2 transition-colors relative ${
                                        activeTab === tab.id
                                            ? 'text-primary font-bold'
                                            : 'text-muted-foreground hover:text-primary'
                                    }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTabUnderline"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </motion.div>

                        {/* TAB 1: OVERVIEW & SUBSCRIPTION */}
                        {activeTab === 'overview' && (
                            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* Company Information Card */}
                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 space-y-5 shadow-sm lg:col-span-1">
                                    <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                                        <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                            <Building2 size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Company Information</h3>
                                            <p className="text-[11px] text-muted-foreground">General tenant profile details</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 text-xs">
                                        <div>
                                            <span className="text-muted-foreground font-medium block mb-1">Company Name</span>
                                            <div className="font-bold text-primary text-sm">{tenant.companyName}</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-muted-foreground font-medium block mb-1">Domain</span>
                                                <div className="font-mono text-primary font-semibold">{tenant.domain}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground font-medium block mb-1">Industry</span>
                                                <div className="font-semibold text-primary">{tenant.industry}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-muted-foreground font-medium block mb-1">Region</span>
                                                <div className="font-semibold text-primary">{tenant.region}</div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground font-medium block mb-1">Tax ID</span>
                                                <div className="font-mono text-primary font-semibold">{tenant.taxId}</div>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-muted-foreground font-medium block mb-1">Office Address</span>
                                            <div className="text-primary font-medium">{tenant.address}, {tenant.city}, {tenant.country}</div>
                                        </div>

                                        <div>
                                            <span className="text-muted-foreground font-medium block mb-1">Primary Admin</span>
                                            <div className="font-bold text-primary">{tenant.adminName}</div>
                                            <div className="text-muted-foreground font-mono">{tenant.adminEmail}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Subscription & Capacity Controls Card */}
                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 space-y-6 shadow-sm lg:col-span-2">
                                    <div className="flex items-center justify-between pb-3 border-b border-border">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                                <Calendar size={16} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Subscription & User Limits</h3>
                                                <p className="text-[11px] text-muted-foreground">Modify dates, user capacity, and subscription plan</p>
                                            </div>
                                        </div>

                                        {/* Quick Extension Buttons */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleExtendSubscription(30)}
                                                className="px-3 py-1.5 bg-accent/10 text-accent border border-accent/20 rounded-lg text-xs font-bold hover:bg-accent/20 transition-colors flex items-center gap-1"
                                            >
                                                <RefreshCw size={12} />
                                                <span>+30 Days</span>
                                            </button>
                                            <button
                                                onClick={() => handleExtendSubscription(365)}
                                                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1"
                                            >
                                                <Zap size={12} />
                                                <span>+1 Year</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subscription Dates Form */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                                                Subscription Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={tenant.startDate}
                                                onChange={(e) => {
                                                    setTenant((prev) => ({ ...prev, startDate: e.target.value }));
                                                    addAuditLog(`Updated start date to ${e.target.value}`, 'Subscription');
                                                }}
                                                className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-xs font-medium text-primary focus:outline-none focus:border-accent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                                                Subscription Expiry Date
                                            </label>
                                            <input
                                                type="date"
                                                value={tenant.expiryDate}
                                                onChange={(e) => {
                                                    setTenant((prev) => ({ ...prev, expiryDate: e.target.value }));
                                                    addAuditLog(`Updated expiry date to ${e.target.value}`, 'Subscription');
                                                }}
                                                className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-xs font-medium text-primary focus:outline-none focus:border-accent"
                                            />
                                        </div>
                                    </div>

                                    {/* Maximum Users Limit */}
                                    <div className="pt-2">
                                        <label className="block text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">
                                            Maximum User Limit
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="number"
                                                min="1"
                                                max="10000"
                                                value={tenant.maxUsers}
                                                onChange={(e) => {
                                                    const val = Number(e.target.value);
                                                    setTenant((prev) => ({ ...prev, maxUsers: val }));
                                                    addAuditLog(`Updated maximum user capacity to ${val}`, 'Admin');
                                                }}
                                                className="w-full sm:w-48 px-4 py-2.5 bg-background border border-input rounded-xl text-xs font-medium text-primary focus:outline-none focus:border-accent"
                                            />
                                            <span className="text-xs text-muted-foreground font-medium">
                                                Currently using <strong className="text-primary">{tenant.activeUsersCount}</strong> seats
                                            </span>
                                        </div>
                                    </div>

                                    {/* Plan Selection (Upgrade / Downgrade) */}
                                    <div className="pt-4 border-t border-border space-y-3">
                                        <label className="block text-xs font-semibold text-primary uppercase tracking-wider">
                                            Select Subscription Tier (Upgrade / Downgrade)
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {[
                                                { id: 'Standard', desc: 'Core endpoint management & basic reporting' },
                                                { id: 'Professional', desc: 'Advanced automation, SLAs, & 24/7 support' },
                                                { id: 'Enterprise', desc: 'Full suite, unlimited logs, AI, & dedicated TAM' },
                                            ].map((plan) => (
                                                <button
                                                    key={plan.id}
                                                    type="button"
                                                    onClick={() => handlePlanChange(plan.id as any)}
                                                    className={`p-4 rounded-xl border text-left transition-all relative ${
                                                        tenant.plan === plan.id
                                                            ? 'border-accent bg-accent/10 shadow-sm'
                                                            : 'border-input hover:border-accent/40 bg-background'
                                                    }`}
                                                >
                                                    {tenant.plan === plan.id && (
                                                        <span className="absolute top-3 right-3 text-accent">
                                                            <CheckCircle2 size={16} />
                                                        </span>
                                                    )}
                                                    <div className="font-bold text-primary text-sm">{plan.id}</div>
                                                    <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{plan.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 2: ENABLE / DISABLE MODULES */}
                        {activeTab === 'modules' && (
                            <motion.div variants={fadeUp} className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 space-y-6 shadow-sm">
                                <div className="flex items-center justify-between pb-4 border-b border-border">
                                    <div>
                                        <h3 className="text-base font-bold text-primary">Feature Modules & Capabilities</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Enable or disable platform features for <span className="font-semibold text-primary">{tenant.companyName}</span> in real time.
                                        </p>
                                    </div>
                                    <span className="text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full border border-accent/20">
                                        {modules.filter((m) => m.enabled).length} Enabled
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {modules.map((mod) => (
                                        <div
                                            key={mod.id}
                                            className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                                                mod.enabled
                                                    ? 'border-accent/30 bg-accent/5'
                                                    : 'border-border bg-background opacity-75'
                                            }`}
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent px-2 py-0.5 rounded bg-accent/10">
                                                        {mod.category}
                                                    </span>
                                                    <h4 className="font-bold text-primary text-sm">{mod.name}</h4>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
                                            </div>

                                            <button
                                                onClick={() => handleToggleModule(mod.id)}
                                                className="shrink-0 text-accent transition-transform hover:scale-105"
                                            >
                                                {mod.enabled ? (
                                                    <ToggleRight size={36} className="text-accent" />
                                                ) : (
                                                    <ToggleLeft size={36} className="text-muted-foreground" />
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 3: ADMIN & SECURITY */}
                        {activeTab === 'security' && (
                            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Admin Credentials & Security Card */}
                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 space-y-5 shadow-sm">
                                    <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                                        <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                            <Key size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Primary Admin Credentials</h3>
                                            <p className="text-[11px] text-muted-foreground">Manage admin access and security credentials</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 text-xs">
                                        <div>
                                            <label className="block font-semibold text-primary uppercase tracking-wider mb-1">Admin Full Name</label>
                                            <input
                                                type="text"
                                                value={tenant.adminName}
                                                onChange={(e) => setTenant((prev) => ({ ...prev, adminName: e.target.value }))}
                                                className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-xs font-medium text-primary focus:outline-none focus:border-accent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-primary uppercase tracking-wider mb-1">Admin Email Address</label>
                                            <input
                                                type="email"
                                                value={tenant.adminEmail}
                                                onChange={(e) => setTenant((prev) => ({ ...prev, adminEmail: e.target.value }))}
                                                className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-xs font-medium text-primary focus:outline-none focus:border-accent"
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="button"
                                                onClick={() => { setIsPasswordModalOpen(true); handleGenerateNewPassword(); }}
                                                className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-center gap-2"
                                            >
                                                <Key size={14} />
                                                <span>Reset & Issue New Admin Password</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone / Suspension Card */}
                                <div className="bg-background/90 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-6 space-y-5 shadow-sm">
                                    <div className="flex items-center gap-2.5 pb-3 border-b border-rose-500/20">
                                        <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                            <AlertTriangle size={16} />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider">Danger Zone & Access Control</h3>
                                            <p className="text-[11px] text-muted-foreground">Emergency tenant suspension controls</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 text-xs">
                                        <p className="text-muted-foreground leading-relaxed">
                                            Suspending a company tenant immediately revokes access for all enrolled users, halts API webhooks, and pauses automated policies.
                                        </p>

                                        {tenant.status === 'Suspended' ? (
                                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-3">
                                                <div className="font-bold text-rose-600 flex items-center gap-2">
                                                    <AlertTriangle size={16} />
                                                    <span>This company is currently SUSPENDED</span>
                                                </div>
                                                <button
                                                    onClick={handleUnsuspendCompany}
                                                    className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
                                                >
                                                    <CheckCircle2 size={14} />
                                                    <span>Reactivate & Unsuspend Company</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setIsSuspendModalOpen(true)}
                                                className="w-full py-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 font-bold rounded-xl hover:bg-rose-500/20 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <AlertTriangle size={14} />
                                                <span>Suspend {tenant.companyName}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 4: SYSTEM-LEVEL AUDIT LOGS */}
                        {activeTab === 'audit' && (
                            <motion.div variants={fadeUp} className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 space-y-5 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                                    <div>
                                        <h3 className="text-base font-bold text-primary">System-Level Audit Logs</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Immutable record of security events, administrative changes, and status updates for {tenant.companyName}.
                                        </p>
                                    </div>

                                    {/* Search & Category Filter */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="relative w-full sm:w-64">
                                            <input
                                                type="text"
                                                placeholder="Search audit log..."
                                                value={logSearch}
                                                onChange={(e) => setLogSearch(e.target.value)}
                                                className="w-full px-3.5 py-2 pl-9 bg-background border border-input rounded-xl text-xs font-medium text-primary focus:outline-none focus:border-accent"
                                            />
                                            <Search size={14} className="absolute left-3 top-2.5 text-muted-foreground" />
                                        </div>

                                        <AuditCategorySelect
                                            value={logCategoryFilter}
                                            onChange={setLogCategoryFilter}
                                        />
                                    </div>
                                </div>

                                {/* Audit Log Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/30 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                                                <th className="py-3 px-4">Timestamp</th>
                                                <th className="py-3 px-4">Category</th>
                                                <th className="py-3 px-4">Action Performed</th>
                                                <th className="py-3 px-4">Actor</th>
                                                <th className="py-3 px-4">IP Address</th>
                                                <th className="py-3 px-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {filteredLogs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="py-10 text-center text-muted-foreground font-medium">
                                                        No audit logs found matching query.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredLogs.map((log) => (
                                                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">
                                                            {log.timestamp}
                                                        </td>
                                                        <td className="py-3 px-4 font-bold">
                                                            <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-accent/10 text-accent">
                                                                {log.category}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4 font-medium text-primary">
                                                            {log.action}
                                                        </td>
                                                        <td className="py-3 px-4 font-mono text-muted-foreground">
                                                            {log.actor}
                                                        </td>
                                                        <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">
                                                            {log.ipAddress}
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                                log.status === 'Success'
                                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                                    : log.status === 'Warning'
                                                                    ? 'bg-amber-500/10 text-amber-600'
                                                                    : 'bg-rose-500/10 text-rose-600'
                                                            }`}>
                                                                {log.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}

                    </motion.div>
                </div>

                {/* MODAL 1: Password Reset Modal */}
                {isPasswordModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-background border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                                    <Key size={18} className="text-accent" />
                                    <span>Reset Admin Password</span>
                                </h3>
                                <button
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="p-1 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                                >
                                    <XCircle size={18} />
                                </button>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Generated temporary password for admin <strong className="text-primary">{tenant.adminEmail}</strong>:
                            </p>

                            <div className="flex items-center gap-2 p-3 bg-muted rounded-xl border border-input font-mono text-sm font-bold text-primary">
                                <span className="flex-1 select-all">{newPassword}</span>
                                <button
                                    onClick={handleCopyPassword}
                                    className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1.5 shrink-0"
                                >
                                    {passwordCopied ? <Check size={14} /> : <Copy size={14} />}
                                    <span>{passwordCopied ? 'Copied!' : 'Copy'}</span>
                                </button>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                                <button
                                    onClick={() => handleGenerateNewPassword()}
                                    className="px-4 py-2 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-muted"
                                >
                                    Re-generate
                                </button>
                                <button
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* MODAL 2: Suspend Company Modal */}
                {isSuspendModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-background border border-rose-500/40 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-border">
                                <h3 className="text-lg font-bold text-rose-600 flex items-center gap-2">
                                    <AlertTriangle size={18} />
                                    <span>Confirm Company Suspension</span>
                                </h3>
                                <button
                                    onClick={() => setIsSuspendModalOpen(false)}
                                    className="p-1 text-muted-foreground hover:text-primary rounded-lg transition-colors"
                                >
                                    <XCircle size={18} />
                                </button>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                                You are about to suspend access for <strong className="text-primary">{tenant.companyName}</strong>. Please state the reason for suspension:
                            </p>

                            <textarea
                                rows={3}
                                required
                                placeholder="e.g. Non-payment of subscription invoice, terms violation..."
                                value={suspendReason}
                                onChange={(e) => setSuspendReason(e.target.value)}
                                className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-xs font-medium text-primary focus:outline-none focus:border-rose-500"
                            />

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                                <button
                                    onClick={() => setIsSuspendModalOpen(false)}
                                    className="px-4 py-2 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-muted"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSuspendCompany}
                                    disabled={!suspendReason.trim()}
                                    className="px-5 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50"
                                >
                                    Confirm Suspension
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </main>
            </div>
        </>
    );
}
