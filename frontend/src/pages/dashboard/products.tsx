import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Layers,
    Plus,
    X,
    Check,
    FolderPlus,
    Building2,
    Zap,
    CheckCircle2,
    Search,
    UploadCloud,
    Package,
    Loader2,
} from 'lucide-react';
import { resolveIcon, PRODUCTS, ProductConfig } from '../../lib/products';
import DashboardSidebar from '../../components/DashboardSidebar';
import { credentialHeaders } from '../../api/client';
import { fetchInstallerInfo, uploadInstaller, formatBytes } from '../../api/ems';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

/* ── Custom Select Option Interface & Dropdown Component ── */
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
                if (isOpen) setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const selectedOption = options.find((opt) => opt.value === value);

    const toggleOpen = () => {
        setIsOpen((prev) => !prev);
    };

    return (
        <div className={`relative inline-block text-left ${fullWidth ? 'w-full' : ''}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleOpen}
                className={`px-3.5 py-2.5 bg-background border border-input rounded-xl text-xs font-semibold text-primary focus:outline-none focus:border-accent hover:border-accent/60 transition-all flex items-center justify-between gap-2 shadow-sm ${
                    fullWidth ? 'w-full' : 'min-w-[140px]'
                }`}
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute rounded-xl bg-background border border-border/80 shadow-2xl z-[100] p-1.5 animate-in fade-in zoom-in-95 duration-150 overflow-hidden ${
                    openUp ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                } ${
                    fullWidth ? 'w-full left-0' : 'w-44 left-0'
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

/* ── Agent Installer management (super-admin uploads the .exe tenants download) ── */
function AgentInstallerCard() {
    const [info, setInfo] = useState<{ fileName: string; version: string | null; sizeBytes: number; uploadedAt: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [version, setVersion] = useState('');
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const load = () => {
        setLoading(true);
        fetchInstallerInfo()
            .then((i: any) => setInfo(i))
            .catch(() => setInfo(null))
            .finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const handleFile = async (file: File) => {
        if (!file.name.toLowerCase().endsWith('.exe')) {
            setMsg({ ok: false, text: 'Please choose a .exe installer file.' });
            return;
        }
        setUploading(true);
        setMsg(null);
        try {
            const res: any = await uploadInstaller(file, version);
            setMsg({ ok: true, text: `Uploaded ${file.name} (${formatBytes(res.sizeBytes || file.size)}). Tenants now download this build.` });
            setVersion('');
            load();
        } catch (err: any) {
            setMsg({ ok: false, text: err?.message || 'Upload failed.' });
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    const uploadedText = info?.uploadedAt ? new Date(info.uploadedAt).toLocaleString() : '';

    return (
        <motion.div variants={fadeUp} className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-accent/10 text-accent shrink-0">
                        <Package size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Agent Installer</h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5 max-w-md">
                            The <span className="font-semibold text-primary">TheLanceEMSSetup.exe</span> that every tenant downloads. Upload a new build to roll it out to all tenants instantly.
                        </p>
                        <div className="mt-2 text-xs text-muted-foreground">
                            {loading ? (
                                <span className="inline-flex items-center gap-1.5"><Loader2 size={12} className="animate-spin" /> Loading…</span>
                            ) : info ? (
                                <span>
                                    Current: <span className="font-bold text-primary">v{info.version || 'unknown'}</span>
                                    {' · '}{formatBytes(info.sizeBytes)}{uploadedText ? <> · uploaded {uploadedText}</> : null}
                                </span>
                            ) : (
                                <span className="text-rose-600 font-semibold">No installer uploaded yet.</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <input
                        type="text"
                        placeholder="Version (e.g. 1.0.19)"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        className="w-36 px-3 py-2.5 bg-background border border-input rounded-xl text-xs font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    />
                    <input
                        ref={fileRef}
                        type="file"
                        accept=".exe"
                        className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                    />
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                        className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                        <span>{uploading ? 'Uploading…' : 'Upload New Installer'}</span>
                    </button>
                </div>
            </div>
            {msg && (
                <div className={`mt-3 text-xs font-medium px-3 py-2 rounded-lg ${msg.ok ? 'bg-emerald-500/10 text-emerald-700' : 'bg-rose-500/10 text-rose-700'}`}>
                    {msg.text}
                </div>
            )}
        </motion.div>
    );
}

export default function ProductConsolePage() {
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

    const [productsList, setProductsList] = useState<ProductConfig[]>(PRODUCTS);
    const [tenants, setTenants] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state - Project Name, Tagline, Description
    const [formName, setFormName] = useState('');
    const [formTagline, setFormTagline] = useState('');
    const [formDescription, setFormDescription] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset pagination to page 1 on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    useEffect(() => {
        fetch('/api/tenants', { headers: credentialHeaders })
            .then((res) => (res.ok ? res.json() : []))
            .then((data) => {
                if (Array.isArray(data)) setTenants(data);
            })
            .catch(() => {});
    }, []);

    function getTenantCount(prodId: string): number {
        if (!tenants || tenants.length === 0) {
            return prodId === 'ems' ? 4 : 1;
        }
        const count = tenants.filter(
            (t: any) =>
                (t.productName || 'ems').toLowerCase() === prodId.toLowerCase() ||
                (prodId === 'ems' && (!t.productName || t.productName.toLowerCase().includes('ems')))
        ).length;
        return count || 1;
    }

    function handleAddProject(e: React.FormEvent) {
        e.preventDefault();
        if (!formName.trim() || !formTagline.trim()) return;

        const id = formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `proj-${Date.now()}`;

        const newProduct: ProductConfig = {
            id,
            name: formName.trim(),
            tagline: formTagline.trim(),
            description:
                formDescription.trim() ||
                `${formName.trim()} provides unified controls, compliance reporting, and operational monitoring for your organization.`,
            iconName: 'Server',
            accentColor: 'text-accent',
            bgColor: 'bg-accent/10',
            borderColor: 'border-accent/20',
            dotColor: 'bg-accent',
            badge: 'Enterprise',
            features: ['Automated provisioning', 'Role-based access control', 'Real-time telemetry'],
            stats: [
                { label: 'Active Tenants', value: '1', iconName: 'Globe' },
                { label: 'Uptime', value: '99.99%', iconName: 'Zap' },
                { label: 'Policies', value: '12', iconName: 'Shield' },
            ],
            href: `#`,
        };

        setProductsList((prev) => [newProduct, ...prev]);
        setIsModalOpen(false);

        // Reset form
        setFormName('');
        setFormTagline('');
        setFormDescription('');
    }

    // Filter products
    const filteredProducts = productsList.filter((prod) => {
        const matchesSearch =
            prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prod.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prod.badge.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All' || statusFilter === 'Active';
        return matchesSearch && matchesStatus;
    });

    // Pagination Slicing
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const totalTenantsCount = tenants.length > 0 ? tenants.length : 5;

    return (
        <>
            <Helmet>
                <title>Products Console — Licensed Platforms | The Lance</title>
                <meta name="description" content="View and manage licensed products and tenant platforms across your organization." />
            </Helmet>

            <div className="relative h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
                <DashboardSidebar activeItem="products" />

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

                            {/* Header Section */}
                            <motion.div variants={fadeUp} className="space-y-4">

                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
                                    <div>

                                        <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                                            Products Console
                                        </h1>
                                        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
                                            Explore, manage, and monitor licensed product platforms and provisioned tenants across your organization.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 flex items-center gap-2 cursor-pointer"
                                        >
                                            <Plus size={16} />
                                            <span>Add New Project</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Summary Analysis Cards */}
                            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span className="text-xs font-bold uppercase tracking-wider">Total Products</span>
                                        <div className="p-2 rounded-xl bg-accent/10 text-accent">
                                            <Layers size={18} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-extrabold text-primary">
                                        {productsList.length}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">Licensed platform systems</p>
                                </div>

                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span className="text-xs font-bold uppercase tracking-wider">Provisioned Tenants</span>
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                            <Building2 size={18} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-extrabold text-primary">
                                        {totalTenantsCount}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">Active Organization Accounts</p>
                                </div>

                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span className="text-xs font-bold uppercase tracking-wider">Platform Status</span>
                                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                                            <Zap size={18} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-extrabold text-emerald-600 flex items-center gap-2">
                                        100% <span className="text-xs font-bold text-muted-foreground uppercase">Operational</span>
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">All services running smoothly</p>
                                </div>
                            </motion.div>

                            {/* Agent Installer management */}
                            <AgentInstallerCard />

                            {/* Search & Status Filter Toolbar */}
                            <motion.div variants={fadeUp} className="bg-background/90 backdrop-blur-xl border border-border/80 p-4 rounded-2xl shadow-sm">
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full sm:w-auto">
                                    {/* Search Bar */}
                                    <div className="relative w-full sm:w-80">
                                        <input
                                            type="text"
                                            placeholder="Search product name, badge, tagline..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full px-4 py-2.5 pl-10 bg-background border border-input rounded-xl text-xs font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                                        />
                                        <Search size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
                                    </div>

                                    {/* Status Filter Dropdown */}
                                    <div className="w-full sm:w-auto">
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
                            </motion.div>

                            {/* PRODUCTS TABLE SECTION */}
                            <motion.div variants={fadeUp} className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                                <div className="overflow-x-auto min-h-[380px]">
                                    <table className="w-full text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-border bg-muted-foreground/5 text-foreground/70 font-semibold uppercase tracking-wider text-[11px]">
                                                <th className="py-4 px-6">Product Name</th>
                                                <th className="py-4 px-6 text-center">Tenant Count</th>
                                                <th className="py-4 px-6 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {filteredProducts.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="py-12 text-center text-muted-foreground font-medium">
                                                        No products found matching criteria.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedProducts.map((prod) => {
                                                    const prodIcon = resolveIcon(prod.iconName, 22);
                                                    const count = getTenantCount(prod.id);

                                                    return (
                                                        <tr key={prod.id} className="hover:bg-slate-100/80 transition-colors">
                                                            {/* Product Name */}
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-3.5">
                                                                    <div className={`w-11 h-11 rounded-xl ${prod.bgColor} ${prod.accentColor} border ${prod.borderColor} flex items-center justify-center shrink-0 shadow-sm`}>
                                                                        {prodIcon}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-primary text-sm">{prod.name}</span>
                                                                            <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-accent/10 text-accent border border-accent/20">
                                                                                {prod.badge}
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                                                                            {prod.tagline}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* Tenant Count */}
                                                            <td className="py-4 px-6 text-center">
                                                                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-xl bg-primary/5 text-primary border border-primary/10 font-bold text-xs">
                                                                    <Building2 size={13} className="text-accent" />
                                                                    <span>{count} {count === 1 ? 'Tenant' : 'Tenants'}</span>
                                                                </div>
                                                            </td>

                                                            {/* Status */}
                                                            <td className="py-4 px-6 text-center">
                                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                                                                    <CheckCircle2 size={12} />
                                                                    <span>Active</span>
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer Pagination Bar */}
                                <div className="p-4 bg-slate-50/80 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs select-none">
                                    <div className="text-muted-foreground font-medium">
                                        Showing{' '}
                                        <span className="font-bold text-primary">
                                            {filteredProducts.length === 0 ? 0 : startIndex + 1}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-bold text-primary">
                                            {Math.min(endIndex, filteredProducts.length)}
                                        </span>{' '}
                                        of <span className="font-bold text-primary">{filteredProducts.length}</span> entries
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                            className="h-8 w-8 flex justify-center items-center rounded-xl border border-input bg-background font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                                <button
                                                    key={pageNum}
                                                    type="button"
                                                    onClick={() => setCurrentPage(pageNum)}
                                                    className={`h-8 w-8 rounded-xl font-bold transition-all cursor-pointer ${
                                                        currentPage === pageNum
                                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                                            : 'bg-background border border-input text-primary hover:bg-slate-100'
                                                    }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            type="button"
                                            disabled={currentPage === totalPages || filteredProducts.length === 0}
                                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                            className="h-8 w-8 flex justify-center items-center rounded-xl border border-input bg-background font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                        </motion.div>
                    </div>

                    {/* Add Project / Platform Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-background border border-border rounded-2xl shadow-2xl max-w-xl w-full p-6 lg:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto"
                            >
                                <div className="flex items-center justify-between pb-4 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
                                            <FolderPlus size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-primary">Provision New Project Platform</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">Configure platform identity, icon, and tier badge</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-1.5 rounded-full bg-slate-100 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleAddProject} className="space-y-5 text-xs">
                                    {/* Project Name */}
                                    <div>
                                        <label className="block font-bold text-primary uppercase tracking-wider mb-1">
                                            Project / Platform Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Cloud Compute Manager"
                                            value={formName}
                                            onChange={(e) => setFormName(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-background border border-input rounded-xl font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                                        />
                                    </div>

                                    {/* Tagline */}
                                    <div>
                                        <label className="block font-bold text-primary uppercase tracking-wider mb-1">
                                            Tagline / Subtitle <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Scalable infrastructure control"
                                            value={formTagline}
                                            onChange={(e) => setFormTagline(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-background border border-input rounded-xl font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block font-bold text-primary uppercase tracking-wider mb-1">
                                            Platform Description
                                        </label>
                                        <textarea
                                            rows={3}
                                            placeholder="Overview of the product features, compliance controls, and tenant management scope..."
                                            value={formDescription}
                                            onChange={(e) => setFormDescription(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-background border border-input rounded-xl font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                                        <button
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="px-4 py-2.5 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-slate-100 transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                                        >
                                            <Check size={14} />
                                            <span>Create Project Platform</span>
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
