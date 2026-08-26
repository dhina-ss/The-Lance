import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, useRef, useEffect, useMemo } from 'react';
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
    ChevronLeft,
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
    EyeOff,
    RefreshCw,
    Key,
    User,
    Copy,
    AlertCircle,
} from 'lucide-react';
import { getProduct, resolveIcon, PRODUCTS } from '../../lib/products';
import DashboardSidebar from '../../components/DashboardSidebar';
import { credentialHeaders, jsonHeaders } from '../../api/client';

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
    planType: string;
    subscriptionType: 'Annual Recurring' | 'Monthly Billing' | 'Perpetual License';
    status: 'Active' | 'Inactive' | 'Pending';
    createdAt: string;
    unitsManaged: number;
    licenseKey?: string;
}

export function formatLicenseKey(key: string): string {
    if (!key) return '';
    const clean = key.replace(/[^A-Za-z0-9]/g, '');
    const parts = clean.match(/.{1,4}/g);
    return parts ? parts.join('-') : key;
}

export function generateLicenseKey(): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomPart = '';
    for (let i = 0; i < 14; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return formatLicenseKey(`TL${randomPart}`);
}

export function formatTenantId(id: string | number): string {
    if (!id) return 'TL-TNT260001';
    const str = String(id).trim();
    if (/^TL-TNT\d{6}$/i.test(str)) {
        return str.toUpperCase();
    }
    const numericMatch = str.match(/\d+/);
    const num = numericMatch ? parseInt(numericMatch[0], 10) : 1;
    const yearStr = new Date().getFullYear().toString().slice(-2);
    const seqStr = String(num).padStart(4, '0');
    return `TL-TNT${yearStr}${seqStr}`;
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
        licenseKey: 'TL9K-8F7E-6D5C-4B3A',
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
        licenseKey: 'TL7A-6B5C-4D3E-2F1G',
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
        licenseKey: 'TL4M-3N2P-1Q0R-9S8T',
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
        licenseKey: 'TL2U-1V0W-9X8Y-7Z6A',
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
        licenseKey: 'TL8B-7C6D-5E4F-3G2H',
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
        licenseKey: 'TL6I-5J4K-3L2M-1N0P',
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
        licenseKey: 'TL9Q-8R7S-6T5U-4V3W',
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
    onOpenChange,
}: {
    value: string;
    onChange: (val: string) => void;
    options: CustomSelectOption[];
    placeholder?: string;
    fullWidth?: boolean;
    openUp?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                if (isOpen) {
                    setIsOpen(false);
                    if (onOpenChange) onOpenChange(false);
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onOpenChange]);

    const selectedOption = options.find((opt) => opt.value === value);

    const toggleOpen = () => {
        const next = !isOpen;
        setIsOpen(next);
        if (onOpenChange) onOpenChange(next);
    };

    return (
        <div className={`relative inline-block text-left ${fullWidth ? 'w-full' : ''}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleOpen}
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
                                        if (onOpenChange) onOpenChange(false);
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

    const [tenants, setTenants] = useState<TenantItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [planFilter, setPlanFilter] = useState<string>('All');
    const [subFilter, setSubFilter] = useState<string>('All');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    // Reset pagination to page 1 on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, planFilter, subFilter]);

    useEffect(() => {
        fetch('/api/tenants', { headers: credentialHeaders })
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error('API fetch failed');
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    const mapped: TenantItem[] = data.map((d: any) => ({
                        id: String(d.id),
                        productId: (d.productName || 'ems').toLowerCase(),
                        tenantName: d.tenantName,
                        domain: d.tenantMail ? (d.tenantMail.includes('@') ? d.tenantMail.split('@')[1] : d.tenantMail) : 'domain.com',
                        adminName: d.adminMail ? (d.adminMail.includes('@') ? d.adminMail.split('@')[0] : d.adminMail) : 'Admin',
                        adminEmail: d.adminMail,
                        planType: d.hasTrial && d.hasTrial !== 'None' ? `${d.planType || 'Enterprise'} (${d.hasTrial} Trial)` : (d.planType || 'Enterprise'),
                        subscriptionType: (d.subscriptionType as any) || 'Annual Recurring',
                        status: d.status || 'Active',
                        createdAt: d.expiryDate || new Date().toISOString().split('T')[0],
                        unitsManaged: d.maxUsers !== undefined && d.maxUsers !== null ? Number(d.maxUsers) : 100,
                        licenseKey: d.licenseKey || '',
                    }));
                    setTenants(mapped);
                }
            })
            .catch((err) => console.error('Error fetching tenants from DB:', err));
    }, []);

    // Add Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showCreateSuccessCard, setShowCreateSuccessCard] = useState(false);
    const [createdTenantSummary, setCreatedTenantSummary] = useState<{
        id: string;
        tenantName: string;
        domain: string;
        productName: string;
        licenseKey: string;
        status: string;
        planType: string;
    } | null>(null);
    const [formTenantName, setFormTenantName] = useState('');
    const [formDomain, setFormDomain] = useState('');
    const [formAdminName, setFormAdminName] = useState('');
    const [formAdminEmail, setFormAdminEmail] = useState('');
    const [formAddress, setFormAddress] = useState('');
    const [formMobile, setFormMobile] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<string[]>(['EMS']);
    const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
    const [activeOpenDropdown, setActiveOpenDropdown] = useState<'none' | 'product' | 'status' | 'plan' | 'sub' | 'trial'>('none');
    const [formProductId, setFormProductId] = useState(selectedProduct?.id || 'ems');
    const [formPlanType, setFormPlanType] = useState<'Enterprise' | 'Professional' | 'Standard'>('Enterprise');
    const [formSubSubscriptionType, setFormSubscriptionType] = useState<'Annual Recurring' | 'Monthly Billing' | 'Perpetual License'>('Annual Recurring');
    const [formStatus, setFormStatus] = useState<'Active' | 'Inactive' | 'Pending'>('Active');
    const [formMaxUsers, setFormMaxUsers] = useState<number | string>(100);
    const [formTrialPeriod, setFormTrialPeriod] = useState<'None' | '14 Days' | '30 Days'>('None');
    const [formLicenseKey, setFormLicenseKey] = useState(() => generateLicenseKey());
    const [formAdminPassword, setFormAdminPassword] = useState('');
    const [formAdminConfirmPassword, setFormAdminConfirmPassword] = useState('');
    const [formPasswordError, setFormPasswordError] = useState<string | null>(null);
    const [showAdminPassword, setShowAdminPassword] = useState(false);
    const [showAdminConfirmPassword, setShowAdminConfirmPassword] = useState(false);
    const [copiedLicenseKey, setCopiedLicenseKey] = useState(false);
    const [copiedRowKeyId, setCopiedRowKeyId] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    function showToast(msg: string) {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 5000);
    }

    // Track highest assigned tenant sequence so deleted IDs are NEVER reused
    const [highestSequence, setHighestSequence] = useState<number>(() => {
        try {
            const saved = localStorage.getItem('tl_max_tenant_seq');
            return saved ? parseInt(saved, 10) : 0;
        } catch {
            return 0;
        }
    });

    const nextTenantNumber = useMemo(() => {
        let maxInList = 0;
        tenants.forEach((t) => {
            const num = parseInt(String(t.id).replace(/\D/g, ''), 10);
            if (!isNaN(num) && num > maxInList) {
                maxInList = num;
            }
        });
        const currentMax = Math.max(maxInList, highestSequence);
        return currentMax + 1;
    }, [tenants, highestSequence]);

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

    // Pagination Slicing
    const totalPages = Math.max(1, Math.ceil(filteredTenants.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTenants = filteredTenants.slice(startIndex, endIndex);

    const activeCount = scopedTenants.filter((t) => t.status === 'Active').length;
    const pendingCount = scopedTenants.filter((t) => t.status === 'Pending').length;

    function handleGoToStep2(e?: React.FormEvent | React.MouseEvent) {
        if (e) e.preventDefault();
        if (!formTenantName.trim() || !formAddress.trim() || !formDomain.trim() || !formMobile.trim()) {
            const formEl = document.getElementById('tenant-modal-form') as HTMLFormElement;
            if (formEl) formEl.reportValidity();
            return;
        }
        setCurrentStep(2);
    }

    function handleGoToStep3(e?: React.FormEvent | React.MouseEvent) {
        if (e) e.preventDefault();
        if (selectedProducts.length === 0 || !formMaxUsers) {
            const formEl = document.getElementById('tenant-modal-form') as HTMLFormElement;
            if (formEl) formEl.reportValidity();
            return;
        }
        setCurrentStep(3);
    }

    function handleCopyLicenseKey() {
        if (!formLicenseKey) return;
        const formatted = formatLicenseKey(formLicenseKey);
        navigator.clipboard.writeText(formatted);
        setCopiedLicenseKey(true);
        showToast('License Key copied to clipboard');
        setTimeout(() => setCopiedLicenseKey(false), 2000);
    }

    function handleCopyRowLicenseKey(rawKey: string, tenantId: string) {
        if (!rawKey) return;
        const formatted = formatLicenseKey(rawKey);
        navigator.clipboard.writeText(formatted);
        setCopiedRowKeyId(tenantId);
        showToast('License Key copied to clipboard');
        setTimeout(() => setCopiedRowKeyId(null), 2000);
    }

    function handleAddTenant(e: React.FormEvent) {
        e.preventDefault();
        if (!formTenantName.trim() || !formDomain.trim()) return;

        if (!formAdminPassword.trim()) {
            setFormPasswordError('Admin password is required');
            return;
        }

        if (formAdminPassword !== formAdminConfirmPassword) {
            setFormPasswordError('Passwords do not match');
            return;
        }

        setFormPasswordError(null);

        const prodNameStr = selectedProducts.length > 0 ? selectedProducts.join(', ') : 'EMS';

        let expiryDays = 365;
        if (formTrialPeriod === '14 Days') {
            expiryDays = 14;
        } else if (formTrialPeriod === '30 Days') {
            expiryDays = 30;
        }

        const calculatedExpiryDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const payload = {
            tenantName: formTenantName.trim(),
            productName: prodNameStr,
            expiryDate: calculatedExpiryDate,
            planType: formPlanType,
            subscriptionType: formSubSubscriptionType,
            hasTrial: formTrialPeriod,
            tenantMail: `contact@${formDomain.trim()}`,
            adminMail: formAdminEmail.trim() || `admin@${formDomain.trim()}`,
            status: formStatus,
            address: formAddress.trim(),
            mobileNumber: formMobile.trim(),
            maxUsers: Number(formMaxUsers) || 100,
            licenseKey: formLicenseKey,
            featureModules: ['USB Blocking', 'Installed Applications', 'Used Applications', 'Website Blocking', 'Install / Uninstall Apps', 'Location Tracking', 'Login When Device Turn On'],
        };

        fetch('/api/tenants', {
            method: 'POST',
            headers: jsonHeaders,
            body: JSON.stringify(payload),
        })
            .then((res) => res.json())
            .then((resData) => {
                const assignedId = resData.tenant?.id ? String(resData.tenant.id) : String(nextTenantNumber);
                const assignedNum = parseInt(assignedId, 10) || nextTenantNumber;

                setHighestSequence((prev) => {
                    const updated = Math.max(prev, assignedNum, nextTenantNumber);
                    try {
                        localStorage.setItem('tl_max_tenant_seq', String(updated));
                    } catch {}
                    return updated;
                });

                const newTenant: TenantItem = {
                    id: assignedId,
                    productId: formProductId,
                    tenantName: formTenantName.trim(),
                    domain: formDomain.trim(),
                    adminName: formAdminName.trim() || 'Admin User',
                    adminEmail: formAdminEmail.trim() || `admin@${formDomain.trim()}`,
                    planType: formTrialPeriod !== 'None' ? `${formPlanType} (${formTrialPeriod} Trial)` : formPlanType,
                    subscriptionType: formSubSubscriptionType,
                    status: formStatus,
                    createdAt: calculatedExpiryDate,
                    unitsManaged: Number(formMaxUsers) || 100,
                    licenseKey: formLicenseKey,
                };
                setTenants((prev) => [newTenant, ...prev]);

                setCreatedTenantSummary({
                    id: assignedId,
                    tenantName: formTenantName.trim(),
                    domain: formDomain.trim(),
                    productName: prodNameStr,
                    licenseKey: formatLicenseKey(formLicenseKey),
                    status: formStatus,
                    planType: formPlanType,
                });
                setShowCreateSuccessCard(true);
            })
            .catch((err) => {
                console.error('Error saving tenant to database:', err);
                const fallbackId = String(nextTenantNumber);
                setHighestSequence((prev) => {
                    const updated = Math.max(prev, nextTenantNumber);
                    try {
                        localStorage.setItem('tl_max_tenant_seq', String(updated));
                    } catch {}
                    return updated;
                });

                const newTenant: TenantItem = {
                    id: fallbackId,
                    productId: formProductId,
                    tenantName: formTenantName.trim(),
                    domain: formDomain.trim(),
                    adminName: formAdminName.trim() || 'Admin User',
                    adminEmail: formAdminEmail.trim() || `admin@${formDomain.trim()}`,
                    planType: formTrialPeriod !== 'None' ? `${formPlanType} (${formTrialPeriod} Trial)` : formPlanType,
                    subscriptionType: formSubSubscriptionType,
                    status: formStatus,
                    createdAt: calculatedExpiryDate,
                    unitsManaged: Number(formMaxUsers) || 100,
                    licenseKey: formLicenseKey,
                };
                setTenants((prev) => [newTenant, ...prev]);

                setCreatedTenantSummary({
                    id: fallbackId,
                    tenantName: formTenantName.trim(),
                    domain: formDomain.trim(),
                    productName: prodNameStr,
                    licenseKey: formatLicenseKey(formLicenseKey),
                    status: formStatus,
                    planType: formPlanType,
                });
                setShowCreateSuccessCard(true);
            });
    }

    function resetAddTenantForm() {
        setCurrentStep(1);
        setFormTenantName('');
        setFormDomain('');
        setFormAdminName('');
        setFormAdminPassword('');
        setFormAdminConfirmPassword('');
        setFormPasswordError(null);
        setShowAdminPassword(false);
        setShowAdminConfirmPassword(false);
        setFormLicenseKey(generateLicenseKey());
        setFormAdminEmail('');
        setFormAddress('');
        setFormMobile('');
        setSelectedProducts(['EMS']);
        setFormMaxUsers(100);
        setFormTrialPeriod('None');
        setShowCreateSuccessCard(false);
        setCreatedTenantSummary(null);
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

            {/* Notification Toast */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-[100] bg-primary text-primary-foreground px-5 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
                    <CheckCircle2 size={16} className="text-accent" />
                    <span>{toastMessage}</span>
                </div>
            )}

            <div className="relative h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
                <DashboardSidebar activeItem="tenants" />

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

                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
                                    <div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                                            Tenant Management
                                        </h1>
                                        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
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
                            <motion.div variants={fadeUp} className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                                <div className="overflow-x-auto min-h-[420px] slim-scrollbar-x pb-2">
                                    <table className="w-full min-w-[1500px] text-left border-collapse text-xs">
                                        <thead>
                                            <tr className="border-b border-border bg-muted-foreground/5 text-foreground/70 font-semibold uppercase tracking-wider text-[11px]">
                                                <th className="py-4 px-6 w-[24%] min-w-[300px]">Tenant Name</th>
                                                <th className="py-4 px-6 w-[16%] min-w-[240px]">License Key</th>
                                                <th className="py-4 px-6 w-[16%] min-w-[180px]">Product Name</th>
                                                <th className="py-4 px-6 w-[15%] min-w-[180px]">Subscription Type</th>
                                                <th className="py-4 px-6 w-[10%] min-w-[120px] text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60">
                                            {filteredTenants.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} className="py-12 text-center text-muted-foreground font-medium">
                                                        No tenants found matching the selected filter criteria.
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedTenants.map((t) => {
                                                    const tenantProd = getProduct(t.productId);

                                                    return (
                                                        <tr
                                                            key={t.id}
                                                            onClick={() => navigate(`/dashboard/tenant/${t.productId}/${t.id}`)}
                                                            className="hover:bg-slate-100/80 transition-colors cursor-pointer"
                                                        >
                                                            {/* Tenant Name & ID */}
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-xl ${tenantProd?.bgColor || 'bg-accent/10'} ${tenantProd?.accentColor || 'text-accent'} border ${tenantProd?.borderColor || 'border-accent/20'} flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm`}>
                                                                        {t.tenantName.charAt(0)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-primary text-sm hover:text-accent transition-colors">
                                                                            {t.tenantName}
                                                                        </div>
                                                                        <div className="mt-1">
                                                                            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md bg-slate-100/90 text-accent border border-accent/20">
                                                                                {formatTenantId(t.id)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </td>

                                                            {/* License Key */}
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono text-[11px] font-extrabold text-primary bg-slate-100/90 border border-border/80 px-2.5 py-1 rounded-lg select-all">
                                                                        {formatLicenseKey(t.licenseKey || `TL8X${String(t.id).replace(/\D/g, '').padStart(14, '0')}`)}
                                                                    </span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleCopyRowLicenseKey(t.licenseKey || `TL8X${String(t.id).replace(/\D/g, '').padStart(14, '0')}`, t.id);
                                                                        }}
                                                                        className="p-1.5 text-muted-foreground hover:text-accent hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                                                                        title="Copy License Key to Clipboard"
                                                                    >
                                                                        {copiedRowKeyId === t.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                                                    </button>
                                                                </div>
                                                            </td>

                                                            {/* Product Name */}
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-1.5 font-bold text-primary">
                                                                    <div className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${tenantProd?.bgColor || 'bg-slate-100'} ${tenantProd?.accentColor || 'text-primary'} ${tenantProd?.borderColor || 'border-slate-200'}`}>
                                                                        <Layers size={13} className="shrink-0" />
                                                                        <span>{tenantProd?.name || 'EMS'}</span>
                                                                    </div>
                                                                </div>
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

                                {/* Footer Pagination Bar */}
                                <div className="p-4 bg-slate-50/80 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs select-none">
                                    <div className="text-muted-foreground font-medium">
                                        Showing{' '}
                                        <span className="font-bold text-primary">
                                            {filteredTenants.length === 0 ? 0 : startIndex + 1}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-bold text-primary">
                                            {Math.min(endIndex, filteredTenants.length)}
                                        </span>{' '}
                                        of <span className="font-bold text-primary">{filteredTenants.length}</span> entries
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
                                            disabled={currentPage === totalPages || filteredTenants.length === 0}
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

                    {/* Add Tenant Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`bg-background border border-border rounded-2xl shadow-2xl ${showCreateSuccessCard ? 'max-w-md' : 'max-w-[50%]'} w-full p-6 space-y-6 my-8`}
                            >
                                {showCreateSuccessCard && createdTenantSummary ? (
                                    <div className="text-center py-4 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                                            <CheckCircle2 size={36} />
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-bold text-primary">Tenant Created Successfully!</h3>
                                            <p className="text-xs text-muted-foreground">
                                                New organization profile for <strong className="text-primary">{createdTenantSummary.tenantName}</strong> has been provisioned and configured.
                                            </p>
                                        </div>

                                        <div className="col-span-2 bg-background p-3 rounded-xl border border-border flex items-center justify-between shadow-sm">
                                            <div>
                                                <span className="text-muted-foreground block text-[10px] font-medium uppercase tracking-wider mb-0.5">Generated License Key</span>
                                                <span className="font-mono text-xs font-bold text-primary tracking-wide">{createdTenantSummary.licenseKey}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(createdTenantSummary.licenseKey);
                                                    showToast('License Key copied to clipboard');
                                                }}
                                                className="w-9 h-9 px-3 py-1.5 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-lg transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                                            >
                                                <Copy size={13} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    resetAddTenantForm();
                                                    setIsModalOpen(false);
                                                }}
                                                className="py-3 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-slate-100 transition-colors cursor-pointer"
                                            >
                                                Done & Close
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const targetTenantId = createdTenantSummary.id;
                                                    const prodId = createdTenantSummary.productName.toLowerCase().includes('ticket') ? 'tickets' : 'ems';
                                                    resetAddTenantForm();
                                                    setIsModalOpen(false);
                                                    navigate(`/dashboard/tenant/${prodId}/${targetTenantId}`);
                                                }}
                                                className="py-3 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                            >
                                                <span>View Tenant Details</span>
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
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

                                <form id="tenant-modal-form" onSubmit={handleAddTenant} className="space-y-5 text-xs">
                                    {/* ── Multi-Step Wizard Indicator (Step 1 -> Step 2 -> Step 3) ── */}
                                    <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border border-border/80 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setCurrentStep(1)}
                                            className={`flex items-center gap-2.5 text-left transition-all cursor-pointer ${
                                                currentStep === 1 ? 'text-accent font-bold' : 'text-muted-foreground font-medium hover:text-primary'
                                            }`}
                                        >
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                currentStep === 1 ? 'bg-accent text-white shadow-md' : 'bg-slate-200 text-slate-700'
                                            }`}>
                                                1
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold uppercase tracking-wider">Step 1</div>
                                                <div className="text-[11px] text-muted-foreground">Company Info</div>
                                            </div>
                                        </button>

                                        <div className="flex-1 max-w-[60px] mx-2 flex items-center gap-1">
                                            <div className={`h-0.5 w-full rounded-full transition-all ${currentStep >= 2 ? 'bg-accent' : 'bg-slate-200'}`} />
                                            <ChevronRight size={14} className={currentStep >= 2 ? 'text-accent' : 'text-slate-400'} />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleGoToStep2()}
                                            className={`flex items-center gap-2.5 text-left transition-all ${
                                                currentStep === 2 ? 'text-accent font-bold cursor-pointer' : 'text-muted-foreground font-medium hover:text-primary cursor-pointer'
                                            }`}
                                        >
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                currentStep === 2 ? 'bg-accent text-white shadow-md' : 'bg-slate-200 text-slate-700'
                                            }`}>
                                                2
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold uppercase tracking-wider">Step 2</div>
                                                <div className="text-[11px] text-muted-foreground">Plan Details</div>
                                            </div>
                                        </button>

                                        <div className="flex-1 max-w-[60px] mx-2 flex items-center gap-1">
                                            <div className={`h-0.5 w-full rounded-full transition-all ${currentStep === 3 ? 'bg-accent' : 'bg-slate-200'}`} />
                                            <ChevronRight size={14} className={currentStep === 3 ? 'text-accent' : 'text-slate-400'} />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (formTenantName.trim() && formAddress.trim() && formDomain.trim() && formMobile.trim()) {
                                                    handleGoToStep3();
                                                }
                                            }}
                                            className={`flex items-center gap-2.5 text-left transition-all ${
                                                currentStep === 3 ? 'text-accent font-bold cursor-pointer' : 'text-muted-foreground font-medium hover:text-primary cursor-pointer'
                                            }`}
                                        >
                                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                currentStep === 3 ? 'bg-accent text-white shadow-md' : 'bg-slate-200 text-slate-700'
                                            }`}>
                                                3
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold uppercase tracking-wider">Step 3</div>
                                                <div className="text-[11px] text-muted-foreground">Admin Details</div>
                                            </div>
                                        </button>
                                    </div>

                                    {/* ── STEP 1: COMPANY INFORMATION ── */}
                                    {currentStep === 1 && (
                                        <div className="bg-slate-50/60 border border-border/70 rounded-xl p-6 space-y-4 animate-in fade-in duration-150">

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                        Tenant Name <span className="text-red-500">*</span>
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
                                                        Tenant ID (Auto-Generated)
                                                    </label>
                                                    <div className="px-4 py-2.5 bg-slate-100/90 border border-input/80 rounded-xl font-mono text-xs font-extrabold text-accent flex items-center justify-between select-none cursor-not-allowed">
                                                        <span>{formatTenantId(nextTenantNumber)}</span>
                                                        <span className="text-[10px] text-muted-foreground font-sans font-semibold bg-background px-2 py-0.5 rounded border border-border">Read-Only</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                    Tenant Address <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. 13 Netaji Rd, Coimbatore"
                                                    value={formAddress}
                                                    onChange={(e) => setFormAddress(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-background border border-input rounded-xl font-medium text-primary focus:outline-none focus:border-accent"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
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

                                                <div>
                                                    <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                        Mobile Number <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        required
                                                        placeholder="e.g. 9876543210"
                                                        value={formMobile}
                                                        onChange={(e) => setFormMobile(e.target.value.replace(/\D/g, ''))}
                                                        className="w-full px-4 py-2.5 bg-background border border-input rounded-xl font-medium text-primary focus:outline-none focus:border-accent"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── STEP 2: PLAN & SUBSCRIPTION DETAILS ── */}
                                    {currentStep === 2 && (
                                        <div className="bg-slate-50/60 border border-border/70 rounded-xl p-6 space-y-4 animate-in fade-in duration-150">

                                            {/* License Key (16-Digit Auto-Generated) */}
                                            <div>
                                                <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                    License Key (16-Digit Auto-Generated) <span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-full px-4 py-2 bg-background border border-input rounded-xl font-mono text-xs font-extrabold text-primary flex items-center justify-between select-none">
                                                        <div className="flex items-center gap-2">
                                                            <Key size={14} className="text-accent" />
                                                            <span>{formatLicenseKey(formLicenseKey)}</span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleCopyLicenseKey}
                                                        className="p-2.5 bg-background border border-input rounded-xl text-muted-foreground hover:text-accent hover:border-accent transition-colors cursor-pointer shrink-0"
                                                        title="Copy License Key to Clipboard"
                                                    >
                                                        {copiedLicenseKey ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormLicenseKey(generateLicenseKey())}
                                                        className="p-2.5 bg-background border border-input rounded-xl text-muted-foreground hover:text-accent hover:border-accent transition-colors cursor-pointer shrink-0"
                                                        title="Generate New 16-Digit License Key"
                                                    >
                                                        <RefreshCw size={15} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Row 2: Product Name & Status on the SAME ROW */}
                                            <div className={`grid grid-cols-2 gap-4 relative ${['product', 'status'].includes(activeOpenDropdown) ? 'z-[100]' : 'z-30'}`}>
                                                {/* Product Name (Multiple Select Dropdown) */}
                                                <div className={`relative ${activeOpenDropdown === 'product' ? 'z-[100]' : 'z-20'}`}>
                                                    <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                        Product Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const next = !isProductDropdownOpen;
                                                                setIsProductDropdownOpen(next);
                                                                setActiveOpenDropdown(next ? 'product' : 'none');
                                                            }}
                                                            className="w-full min-h-[42px] px-3.5 py-2 bg-background border border-input rounded-xl text-xs font-semibold text-primary focus:outline-none focus:border-accent hover:border-accent/60 transition-all flex items-center justify-between gap-2 shadow-sm cursor-pointer"
                                                        >
                                                            <div className="flex flex-wrap gap-1.5 min-w-0">
                                                                {selectedProducts.length === 0 ? (
                                                                    <span className="text-muted-foreground font-normal">Select Products...</span>
                                                                ) : (
                                                                    selectedProducts.map((p) => (
                                                                        <span key={p} className="px-2 py-0.5 bg-accent/15 text-accent font-bold text-[11px] rounded-md flex items-center gap-1 border border-accent/20">
                                                                            {p}
                                                                        </span>
                                                                    ))
                                                                )}
                                                            </div>
                                                            <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${isProductDropdownOpen ? 'rotate-180 text-accent' : ''}`} />
                                                        </button>

                                                        {isProductDropdownOpen && (
                                                            <>
                                                                <div
                                                                    className="fixed inset-0 z-40"
                                                                    onClick={() => {
                                                                        setIsProductDropdownOpen(false);
                                                                        setActiveOpenDropdown('none');
                                                                    }}
                                                                />
                                                                <div className="absolute top-full mt-1.5 left-0 w-full bg-background border border-border/80 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                                                                    {[
                                                                        { id: 'EMS', name: 'Endpoint Management (EMS)' },
                                                                        { id: 'Ticket & Asset', name: 'Ticket & Asset Management' },
                                                                        { id: 'Petty Cash', name: 'Petty Cash Management' },
                                                                        { id: 'Daybook', name: 'Daybook Management' },
                                                                    ].map((product) => {
                                                                        const isSelected = selectedProducts.includes(product.id);
                                                                        return (
                                                                            <button
                                                                                key={product.id}
                                                                                type="button"
                                                                                onClick={() => {
                                                                                    if (isSelected) {
                                                                                        setSelectedProducts(selectedProducts.filter((item) => item !== product.id));
                                                                                    } else {
                                                                                        setSelectedProducts([...selectedProducts, product.id]);
                                                                                    }
                                                                                }}
                                                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                                                                    isSelected ? 'bg-accent/15 text-accent font-bold' : 'text-primary hover:bg-slate-100'
                                                                                }`}
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-accent border-accent text-white' : 'border-input'}`}>
                                                                                        {isSelected && <Check size={12} />}
                                                                                    </div>
                                                                                    <span>{product.name}</span>
                                                                                </div>
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Status Dropdown */}
                                                <div className="relative">
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
                                                        onOpenChange={(open) => setActiveOpenDropdown(open ? 'status' : 'none')}
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 3: Plan Type & Subscription Type */}
                                            <div className={`grid grid-cols-2 gap-4 relative ${['plan', 'sub'].includes(activeOpenDropdown) ? 'z-[100]' : 'z-20'}`}>
                                                <div className="relative">
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
                                                        onOpenChange={(open) => setActiveOpenDropdown(open ? 'plan' : 'none')}
                                                    />
                                                </div>

                                                <div className="relative">
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
                                                        onOpenChange={(open) => setActiveOpenDropdown(open ? 'sub' : 'none')}
                                                    />
                                                </div>
                                            </div>

                                            {/* Row 4: Max Users Count & Trial Period */}
                                            <div className={`grid grid-cols-2 gap-4 relative ${activeOpenDropdown === 'trial' ? 'z-[100]' : 'z-10'}`}>
                                                <div>
                                                    <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                        Max Users Count <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min={1}
                                                        required
                                                        placeholder="e.g. 100"
                                                        value={formMaxUsers}
                                                        onChange={(e) => setFormMaxUsers(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-background border border-input rounded-xl font-medium text-primary focus:outline-none focus:border-accent"
                                                    />
                                                </div>

                                                <div className="relative">
                                                    <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                        Trial Period (If Any)
                                                    </label>
                                                    <CustomSelect
                                                        value={formTrialPeriod}
                                                        onChange={(val) => setFormTrialPeriod(val as any)}
                                                        options={[
                                                            { value: 'None', label: 'None (Regular Expiry)' },
                                                            { value: '14 Days', label: '14 Days Trial' },
                                                            { value: '30 Days', label: '30 Days Trial' },
                                                        ]}
                                                        fullWidth
                                                        openUp
                                                        onOpenChange={(open) => setActiveOpenDropdown(open ? 'trial' : 'none')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* ── STEP 3: ADMIN DETAILS ── */}
                                    {currentStep === 3 && (
                                        <div className="bg-slate-50/60 border border-border/70 rounded-xl p-6 space-y-4 animate-in fade-in duration-150">

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                        Admin Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
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
                                                        required
                                                        placeholder="admin@company.com"
                                                        value={formAdminEmail}
                                                        onChange={(e) => setFormAdminEmail(e.target.value)}
                                                        className="w-full px-4 py-2.5 bg-background border border-input rounded-xl font-medium text-primary focus:outline-none focus:border-accent"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                        Password <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showAdminPassword ? 'text' : 'password'}
                                                            required
                                                            placeholder="••••••••"
                                                            value={formAdminPassword}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setFormAdminPassword(val);
                                                                if (formAdminConfirmPassword && val !== formAdminConfirmPassword) {
                                                                    setFormPasswordError('Passwords do not match');
                                                                } else {
                                                                    setFormPasswordError(null);
                                                                }
                                                            }}
                                                            className={`w-full pl-4 pr-10 py-2.5 bg-background border rounded-xl font-medium text-primary focus:outline-none transition-colors ${
                                                                formPasswordError
                                                                    ? 'border-rose-500 text-rose-600 focus:border-rose-500'
                                                                    : 'border-input focus:border-accent'
                                                            }`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAdminPassword(!showAdminPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                                            title={showAdminPassword ? 'Hide Password' : 'Show Password'}
                                                        >
                                                            {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                        Confirm Password <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type={showAdminConfirmPassword ? 'text' : 'password'}
                                                            required
                                                            placeholder="••••••••"
                                                            value={formAdminConfirmPassword}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                setFormAdminConfirmPassword(val);
                                                                if (formAdminPassword && val !== formAdminPassword) {
                                                                    setFormPasswordError('Passwords do not match');
                                                                } else {
                                                                    setFormPasswordError(null);
                                                                }
                                                            }}
                                                            className={`w-full pl-4 pr-10 py-2.5 bg-background border rounded-xl font-medium text-primary focus:outline-none transition-colors ${
                                                                formPasswordError
                                                                    ? 'border-rose-500 text-rose-600 focus:border-rose-500'
                                                                    : 'border-input focus:border-accent'
                                                            }`}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowAdminConfirmPassword(!showAdminConfirmPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                                            title={showAdminConfirmPassword ? 'Hide Password' : 'Show Password'}
                                                        >
                                                            {showAdminConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                    {formPasswordError && (
                                                        <p className="text-[11px] text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                                                            <AlertCircle size={13} className="shrink-0" />
                                                            <span>{formPasswordError}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons Footer */}
                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        {currentStep === 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsModalOpen(false);
                                                        setCurrentStep(1);
                                                    }}
                                                    className="px-4 py-2 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-muted cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleGoToStep2}
                                                    className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                                                >
                                                    <span>Next: Plan Details</span>
                                                    <ChevronRight size={15} />
                                                </button>
                                            </>
                                        )}

                                        {currentStep === 2 && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentStep(1)}
                                                    className="px-4 py-2.5 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                                                >
                                                    <ChevronLeft size={15} />
                                                    <span>Back to Company Info</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleGoToStep3}
                                                    className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                                                >
                                                    <span>Next: Admin Details</span>
                                                    <ChevronRight size={15} />
                                                </button>
                                            </>
                                        )}

                                        {currentStep === 3 && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentStep(2)}
                                                    className="px-4 py-2.5 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
                                                >
                                                    <ChevronLeft size={15} />
                                                    <span>Back to Plan Details</span>
                                                </button>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setIsModalOpen(false);
                                                            setCurrentStep(1);
                                                        }}
                                                        className="px-4 py-2 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-muted cursor-pointer"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                                                    >
                                                        <Check size={14} />
                                                        <span>Add Tenant</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </form>
                            </>
                        )}
                            </motion.div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
