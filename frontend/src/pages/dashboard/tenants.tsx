import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    Building2,
    Plus,
    Search,
    Filter,
    Trash2,
    CheckCircle2,
    XCircle,
    ChevronRight,
    ChevronDown,
    X,
    Check,
    Globe,
    Mail,
    Layers,
    Activity,
    CreditCard,
    Calendar,
    Clock,
    Eye,
} from 'lucide-react';
import { getProduct, resolveIcon, PRODUCTS } from '../../lib/products';
import DashboardSidebar from '../../components/DashboardSidebar';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};

export interface TenantItem {
    id: string;
    productId: string;
    tenantName: string;
    domain: string;
    adminName: string;
    adminEmail: string;
    planType: 'Enterprise' | 'Professional' | 'Standard';
    subscriptionType: 'Annual Recurring' | 'Monthly Billing' | 'Perpetual License';
    status: 'Active' | 'Inactive' | 'Pending';
    createdAt: string;
    unitsManaged: number;
}

const initialTenantsList: TenantItem[] = [
    {
        id: 'tnt-1',
        productId: 'ems',
        tenantName: 'Nexus Global Tech',
        domain: 'nexusglobal.com',
        adminName: 'Alex Mercer',
        adminEmail: 'alex.m@nexusglobal.com',
        planType: 'Enterprise',
        subscriptionType: 'Annual Recurring',
        status: 'Active',
        createdAt: '2025-11-12',
        unitsManaged: 850,
    },
    {
        id: 'tnt-2',
        productId: 'ems',
        tenantName: 'Apex Health Systems',
        domain: 'apexhealth.org',
        adminName: 'Elena Rostova',
        adminEmail: 'elena.r@apexhealth.org',
        planType: 'Enterprise',
        subscriptionType: 'Annual Recurring',
        status: 'Active',
        createdAt: '2026-01-08',
        unitsManaged: 620,
    },
    {
        id: 'tnt-3',
        productId: 'ems',
        tenantName: 'CyberDyne Logistics',
        domain: 'cyberdyne-logistics.io',
        adminName: 'Marcus Vance',
        adminEmail: 'm.vance@cyberdyne.io',
        planType: 'Professional',
        subscriptionType: 'Monthly Billing',
        status: 'Active',
        createdAt: '2026-03-20',
        unitsManaged: 340,
    },
    {
        id: 'tnt-4',
        productId: 'ems',
        tenantName: 'Horizon Financial Group',
        domain: 'horizonfg.com',
        adminName: 'Sarah Chen',
        adminEmail: 'sarah.c@horizonfg.com',
        planType: 'Enterprise',
        subscriptionType: 'Perpetual License',
        status: 'Inactive',
        createdAt: '2026-04-15',
        unitsManaged: 590,
    },
    {
        id: 'tnt-5',
        productId: 'tickets',
        tenantName: 'TechFlow Solutions',
        domain: 'techflow.io',
        adminName: 'David Koster',
        adminEmail: 'david.k@techflow.io',
        planType: 'Enterprise',
        subscriptionType: 'Annual Recurring',
        status: 'Active',
        createdAt: '2026-02-10',
        unitsManaged: 64,
    },
    {
        id: 'tnt-6',
        productId: 'tickets',
        tenantName: 'CloudScale Enterprises',
        domain: 'cloudscale.net',
        adminName: 'Rachel Green',
        adminEmail: 'rachel@cloudscale.net',
        planType: 'Professional',
        subscriptionType: 'Monthly Billing',
        status: 'Active',
        createdAt: '2026-03-01',
        unitsManaged: 42,
    },
    {
        id: 'tnt-7',
        productId: 'tickets',
        tenantName: 'Acme Retail Group',
        domain: 'acmeretail.com',
        adminName: 'Jordan Lee',
        adminEmail: 'j.lee@acmeretail.com',
        planType: 'Standard',
        subscriptionType: 'Monthly Billing',
        status: 'Pending',
        createdAt: '2026-05-19',
        unitsManaged: 18,
    },
];

/* ── Custom Dropdown Component with Rounded Border Radius ── */
interface CustomSelectOption {
    value: string;
    label: string;
}

function CustomSelect({
    value,
    onChange,
    options,
    placeholder = 'Select option',
    fullWidth = false,
    openUp = false,
}: {
    value: string;
    onChange: (val: string) => void;
    options: CustomSelectOption[];
    placeholder?: string;
    fullWidth?: boolean;
    openUp?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);

    return (
        <div className={`relative inline-block text-left ${fullWidth ? 'w-full' : ''}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`px-3.5 py-2 bg-background border border-input rounded-xl text-xs font-semibold text-primary focus:outline-none focus:border-accent hover:border-accent/60 transition-all flex items-center justify-between gap-2 shadow-sm ${
                    fullWidth ? 'w-full' : 'min-w-[150px]'
                }`}
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute rounded-xl bg-background border border-border/80 shadow-2xl z-[100] p-1.5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden ${
                    openUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                } ${
                    fullWidth ? 'w-full left-0' : 'w-56 left-0 sm:left-auto sm:right-0'
                }`}>
                    <div className="space-y-0.5 max-h-60 overflow-y-auto py-0.5">
                        {options.map((opt) => {
                            const isSelected = opt.value === value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                        isSelected
                                            ? 'bg-accent/15 text-accent font-bold'
                                            : 'text-primary hover:bg-slate-100 hover:text-accent'
                                    }`}
                                >
                                    <span>{opt.label}</span>
                                    {isSelected && <Check size={13} className="text-accent shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TenantListPage() {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();

    const selectedProduct = getProduct(productId ?? '');
    const isAllScope = !selectedProduct;

    const [tenants, setTenants] = useState<TenantItem[]>(initialTenantsList);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [planFilter, setPlanFilter] = useState<string>('All');
    const [subFilter, setSubFilter] = useState<string>('All');

    // Add Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formTenantName, setFormTenantName] = useState('');
    const [formDomain, setFormDomain] = useState('');
    const [formAdminName, setFormAdminName] = useState('');
    const [formAdminEmail, setFormAdminEmail] = useState('');
    const [formProductId, setFormProductId] = useState(selectedProduct?.id || 'ems');
    const [formPlanType, setFormPlanType] = useState<'Enterprise' | 'Professional' | 'Standard'>('Enterprise');
    const [formSubSubscriptionType, setFormSubscriptionType] = useState<'Annual Recurring' | 'Monthly Billing' | 'Perpetual License'>('Annual Recurring');
    const [formStatus, setFormStatus] = useState<'Active' | 'Inactive' | 'Pending'>('Active');

    // Filter tenants
    const scopedTenants = isAllScope
        ? tenants
        : tenants.filter((t) => t.productId === selectedProduct.id);

    const filteredTenants = scopedTenants.filter((t) => {
        const matchesSearch =
            t.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.adminName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
        const matchesPlan = planFilter === 'All' || t.planType === planFilter;
        const matchesSub = subFilter === 'All' || t.subscriptionType === subFilter;
        return matchesSearch && matchesStatus && matchesPlan && matchesSub;
    });

    const activeCount = scopedTenants.filter((t) => t.status === 'Active').length;
    const pendingCount = scopedTenants.filter((t) => t.status === 'Pending').length;

    function handleAddTenant(e: React.FormEvent) {
        e.preventDefault();
        if (!formTenantName.trim() || !formDomain.trim()) return;

        const newTenant: TenantItem = {
            id: `tnt-${Date.now()}`,
            productId: formProductId,
            tenantName: formTenantName.trim(),
            domain: formDomain.trim(),
            adminName: formAdminName.trim() || 'Admin User',
            adminEmail: formAdminEmail.trim() || `admin@${formDomain.trim()}`,
            planType: formPlanType,
            subscriptionType: formSubSubscriptionType,
            status: formStatus,
            createdAt: new Date().toISOString().split('T')[0],
            unitsManaged: 100,
        };

        setTenants((prev) => [newTenant, ...prev]);
        setIsModalOpen(false);
        setFormTenantName('');
        setFormDomain('');
        setFormAdminName('');
        setFormAdminEmail('');
    }

    function handleToggleStatus(id: string) {
        setTenants((prev) =>
            prev.map((t) => {
                if (t.id === id) {
                    const nextStatus = t.status === 'Active' ? 'Inactive' : 'Active';
                    return { ...t, status: nextStatus };
                }
                return t;
            })
        );
    }

    return (
        <>
            <Helmet>
                <title>{`${selectedProduct ? selectedProduct.name : 'All Products'} — Tenant Management | The Lance`}</title>
                <meta name="description" content="View and manage organization tenants, subscription plans, and status." />
            </Helmet>

            <div className="relative h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
                <DashboardSidebar activeItem="products" />

                <main className="w-full lg:w-[80%] flex-1 relative h-screen p-6 lg:p-10 overflow-y-auto overflow-x-hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />

                    <div className="relative w-full z-10 space-y-8">
                        <motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">

                            {/* Header Section */}
                            <motion.div variants={fadeUp} className="space-y-4">
                                <button
                                    onClick={() => navigate('/dashboard/products')}
                                    className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
                                >
                                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                                    <span>Back to Products Console</span>
                                </button>

                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
                                    <div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-2">
                                            <Building2 size={14} className="text-accent" />
                                            <span onClick={() => navigate('/dashboard/products')} className="hover:underline cursor-pointer">Products</span>
                                            <ChevronRight size={12} className="text-border" />
                                            <span className="text-primary font-semibold">
                                                {selectedProduct ? selectedProduct.name : 'All Products'}
                                            </span>
                                        </div>

                                        <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                                            {selectedProduct ? `${selectedProduct.name} Tenants` : 'Tenant Management'}
                                        </h1>
                                        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                                            Manage provisioned organization tenants, subscription tier plans, billing types, and operational status.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 flex items-center gap-2"
                                        >
                                            <Plus size={16} />
                                            <span>Add New Tenant</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* KPI Metrics */}
                            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Tenants</span>
                                        <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                            <Building2 size={16} />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-extrabold text-primary">{scopedTenants.length}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Configured organizations</p>
                                </div>

                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Tenants</span>
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-extrabold text-primary">{activeCount}</div>
                                    <p className="text-xs text-emerald-600 font-semibold mt-1">
                                        {Math.round((activeCount / (scopedTenants.length || 1)) * 100)}% operational
                                    </p>
                                </div>

                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Pending Setup</span>
                                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                            <Clock size={16} />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-extrabold text-primary">{pendingCount}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
                                </div>

                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">System Status</span>
                                        <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                            <Activity size={16} />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-extrabold text-emerald-500">99.98%</div>
                                    <p className="text-xs text-muted-foreground mt-1">SLA Uptime guarantee</p>
                                </div>
                            </motion.div>

                            {/* Search & Custom Filter Toolbar */}
                            <motion.div variants={fadeUp} className="relative z-30 bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm space-y-4">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    {/* Search Box */}
                                    <div className="relative w-full md:w-80">
                                        <input
                                            type="text"
                                            placeholder="Search tenant name, domain, admin..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full px-4 py-2.5 pl-10 bg-background border border-input rounded-xl text-xs font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                                        />
                                        <Search size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
                                    </div>

                                    {/* Custom Dropdown Filters with Rounded Border Radius Options */}
                                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                        <div className="flex items-center gap-2">
                                            <CustomSelect
                                                value={planFilter}
                                                onChange={setPlanFilter}
                                                options={[
                                                    { value: 'All', label: 'All Plans' },
                                                    { value: 'Enterprise', label: 'Enterprise' },
                                                    { value: 'Professional', label: 'Professional' },
                                                    { value: 'Standard', label: 'Standard' },
                                                ]}
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <CustomSelect
                                                value={subFilter}
                                                onChange={setSubFilter}
                                                options={[
                                                    { value: 'All', label: 'All Subscriptions' },
                                                    { value: 'Annual Recurring', label: 'Annual Recurring' },
                                                    { value: 'Monthly Billing', label: 'Monthly Billing' },
                                                    { value: 'Perpetual License', label: 'Perpetual License' },
                                                ]}
                                            />
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <CustomSelect
                                                value={statusFilter}
                                                onChange={setStatusFilter}
                                                options={[
                                                    { value: 'All', label: 'All Statuses' },
                                                    { value: 'Active', label: 'Active' },
                                                    { value: 'Inactive', label: 'Inactive' },
                                                    { value: 'Pending', label: 'Pending' },
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* TENANT TABLE SECTION */}
                            <motion.div variants={fadeUp} className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-border bg-muted-foreground/5 text-foreground/70 font-semibold uppercase tracking-wider text-[11px]">
                                                <th className="py-4 px-6">Tenant Name</th>
                                                <th className="py-4 px-6">Plan Type</th>
                                                <th className="py-4 px-6">Subscription Type</th>
                                                <th className="py-4 px-6 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {filteredTenants.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="py-12 text-center text-muted-foreground font-medium">
                                                        No tenants found matching the selected filter criteria.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredTenants.map((t) => {
                                                    const tenantProd = getProduct(t.productId);

                                                    return (
                                                        <tr
                                                            key={t.id}
                                                            onClick={() => navigate(`/dashboard/tenant/${t.productId}/${t.id}`)}
                                                            className="hover:bg-slate-100/80 transition-colors cursor-pointer"
                                                        >
                                                            {/* Tenant Name & Domain */}
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-xl ${tenantProd?.bgColor || 'bg-accent/10'} ${tenantProd?.accentColor || 'text-accent'} border ${tenantProd?.borderColor || 'border-accent/20'} flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm`}>
                                                                        {t.tenantName.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-primary text-sm hover:text-accent transition-colors">
                                                                            {t.tenantName}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono mt-0.5">
                                                                            <Globe size={11} />
                                                                            <span>{t.domain}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Plan Type */}
                                                            <td className="py-4 px-6">
                                                                <span
                                                                    className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                                                                        t.planType === 'Enterprise'
                                                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                                                            : t.planType === 'Professional'
                                                                            ? 'bg-accent/15 text-accent border border-accent/30'
                                                                            : 'bg-muted text-muted-foreground'
                                                                    }`}
                                                                >
                                                                    {t.planType} Tier
                                                                </span>
                                                            </td>

                                                            {/* Subscription Type */}
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-1.5 font-semibold text-primary">
                                                                    <CreditCard size={13} className="text-accent shrink-0" />
                                                                    <span>{t.subscriptionType}</span>
                                                                </div>
                                                            </td>

                                                            {/* Status */}
                                                            <td className="py-4 px-6 text-center">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleToggleStatus(t.id);
                                                                    }}
                                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                                                                        t.status === 'Active'
                                                                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20'
                                                                            : t.status === 'Pending'
                                                                            ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20'
                                                                            : 'bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20'
                                                                    }`}
                                                                >
                                                                    {t.status === 'Active' ? (
                                                                        <CheckCircle2 size={12} />
                                                                    ) : t.status === 'Pending' ? (
                                                                        <Clock size={12} />
                                                                    ) : (
                                                                        <XCircle size={12} />
                                                                    )}
                                                                    <span>{t.status}</span>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>

                        </motion.div>
                    </div>

                    {/* Add Tenant Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-background border border-border rounded-2xl shadow-2xl max-w-[40%] w-full p-6 space-y-6 my-8"
                            >
                                <div className="flex items-center justify-between pb-4 border-b border-border">
                                    <div>
                                        <h3 className="text-xl font-bold text-primary">Provision New Tenant</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">Enter organization details & subscription plan</p>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-1 rounded-full bg-muted-foreground/10 text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleAddTenant} className="space-y-4 text-xs">
                                    <div>
                                        <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                            Tenant / Organization Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Nexus Global Tech"
                                            value={formTenantName}
                                            onChange={(e) => setFormTenantName(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-background border border-input rounded-xl font-medium text-primary focus:outline-none focus:border-accent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                            Primary Domain <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. nexusglobal.com"
                                            value={formDomain}
                                            onChange={(e) => setFormDomain(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-background border border-input rounded-xl font-medium text-primary focus:outline-none focus:border-accent"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                Admin Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Alex Mercer"
                                                value={formAdminName}
                                                onChange={(e) => setFormAdminName(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-background border border-input rounded-xl font-medium text-primary focus:outline-none focus:border-accent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                Admin Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                placeholder="admin@company.com"
                                                value={formAdminEmail}
                                                onChange={(e) => setFormAdminEmail(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-background border border-input rounded-xl font-medium text-primary focus:outline-none focus:border-accent"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 relative z-40">
                                        <div className="relative z-20">
                                            <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                Status <span className="text-red-500">*</span>
                                            </label>
                                            <CustomSelect
                                                value={formStatus}
                                                onChange={(val) => setFormStatus(val as any)}
                                                options={[
                                                    { value: 'Active', label: 'Active' },
                                                    { value: 'Pending', label: 'Pending' },
                                                    { value: 'Inactive', label: 'Inactive' },
                                                ]}
                                                fullWidth
                                                openUp
                                            />
                                        </div>

                                        <div className="relative z-40">
                                            <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                Plan Type <span className="text-red-500">*</span>
                                            </label>
                                            <CustomSelect
                                                value={formPlanType}
                                                onChange={(val) => setFormPlanType(val as any)}
                                                options={[
                                                    { value: 'Enterprise', label: 'Enterprise' },
                                                    { value: 'Professional', label: 'Professional' },
                                                    { value: 'Standard', label: 'Standard' },
                                                ]}
                                                fullWidth
                                                openUp
                                            />
                                        </div>

                                        <div className="relative z-30">
                                            <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                Subscription Type <span className="text-red-500">*</span>
                                            </label>
                                            <CustomSelect
                                                value={formSubSubscriptionType}
                                                onChange={(val) => setFormSubscriptionType(val as any)}
                                                options={[
                                                    { value: 'Annual Recurring', label: 'Annual Recurring' },
                                                    { value: 'Monthly Billing', label: 'Monthly Billing' },
                                                    { value: 'Perpetual License', label: 'Perpetual License' },
                                                ]}
                                                fullWidth
                                                openUp
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-muted"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1.5"
                                        >
                                            <Check size={14} />
                                            <span>Add Tenant</span>
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
