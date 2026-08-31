import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, useRef, useEffect, useMemo } from 'react';
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
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Lock,
    Key,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    X,
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
    Eye,
    EyeOff,
    CreditCard,
    AlertCircle,
} from 'lucide-react';
import { getProduct } from '../../lib/products';
import DashboardSidebar from '../../components/DashboardSidebar';
import { credentialHeaders, jsonHeaders } from '../../api/client';

export function generateLicenseKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) {
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

export function formatLicenseKey(key: string): string {
    const clean = (key || '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const parts = clean.match(/.{1,4}/g);
    return parts ? parts.join('-') : clean;
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
        id: 'usb-blocking',
        name: 'USB Blocking',
        description: 'Block unauthorized USB storage drives, external flash drives, and unverified peripheral devices.',
        category: 'Device Control',
        enabled: true,
    },
    {
        id: 'installed-apps',
        name: 'Installed Applications',
        description: 'Inventory, audit, and track all software packages installed across organization endpoints.',
        category: 'Software Inventory',
        enabled: true,
    },
    {
        id: 'used-apps',
        name: 'Used Applications',
        description: 'Monitor application usage statistics, active runtime hours, and foreground app activity analytics.',
        category: 'App Analytics',
        enabled: true,
    },
    {
        id: 'website-blocking',
        name: 'Website Blocking',
        description: 'Enforce web content filtering to block malicious, unapproved, or high-risk URLs and web domains.',
        category: 'Web Security',
        enabled: true,
    },
    {
        id: 'install-uninstall-apps',
        name: 'Install / Uninstall Apps',
        description: 'Remotely push software installations or silently uninstall prohibited packages across managed devices.',
        category: 'App Deployment',
        enabled: true,
    },
    {
        id: 'location-tracking',
        name: 'Location Tracking',
        description: 'Real-time GPS and network geo-location mapping for company-owned endpoints and mobile assets.',
        category: 'Asset Tracking',
        enabled: true,
    },
    {
        id: 'login-device-on',
        name: 'Login When Device Turn On',
        description: 'Enforce mandatory user login authentication and capture session events when device turns on.',
        category: 'Access Control',
        enabled: true,
    },
];

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
    onOpenChange,
}: {
    value: string;
    onChange: (val: string) => void;
    options: CustomSelectOption[];
    placeholder?: string;
    fullWidth?: boolean;
    openUp?: boolean;
    onOpenChange?: (open: boolean) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                if (isOpen) {
                    setIsOpen(false);
                    onOpenChange?.(false);
                }
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onOpenChange]);

    const selectedOption = options.find((opt) => opt.value === value);

    const toggleOpen = () => {
        setIsOpen((prev) => {
            const next = !prev;
            onOpenChange?.(next);
            return next;
        });
    };

    return (
        <div className={`relative inline-block text-left ${fullWidth ? 'w-full' : ''}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={toggleOpen}
                className={`px-3.5 py-2.5 bg-background border border-input rounded-xl text-xs font-semibold text-primary focus:outline-none focus:border-accent hover:border-accent/60 transition-all flex items-center justify-between gap-2 shadow-sm cursor-pointer ${
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
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

/* ── Days Remaining Calculation Helper ── */
function getDaysRemaining(expiryDateStr: string): { days: number; text: string; colorClass: string } {
    if (!expiryDateStr) return { days: 0, text: 'Expired', colorClass: 'bg-rose-500/10 text-rose-600 border-rose-500/30' };

    const parts = expiryDateStr.split('-');
    let expiryDate: Date;
    if (parts.length === 3) {
        expiryDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    } else {
        expiryDate = new Date(expiryDateStr);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { days: diffDays, text: 'Expired', colorClass: 'bg-rose-500/10 text-rose-600 border-rose-500/20' };
    } else if (diffDays === 0) {
        return { days: 0, text: 'Expires Today', colorClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    } else if (diffDays === 1) {
        return { days: 1, text: '1 day left', colorClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    } else if (diffDays <= 30) {
        return { days: diffDays, text: `${diffDays} days left`, colorClass: 'bg-amber-500/10 text-amber-600 border-amber-500/20' };
    } else {
        return { days: diffDays, text: `${diffDays} days left`, colorClass: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' };
    }
}

/* ── Modern Calendar Date Picker Component ── */
function getDaysInMonth(year: number, month: number) {
    const days = [];
    const firstDayIndex = new Date(year, month, 1).getDay();
    const prevMonthLastDate = new Date(year, month, 0).getDate();

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        days.push({
            day: prevMonthLastDate - i,
            isCurrentMonth: false,
            dateObj: new Date(year, month - 1, prevMonthLastDate - i),
        });
    }

    // Current month days
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDate; i++) {
        days.push({
            day: i,
            isCurrentMonth: true,
            dateObj: new Date(year, month, i),
        });
    }

    // Next month padding days to complete calendar grid
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
        days.push({
            day: i,
            isCurrentMonth: false,
            dateObj: new Date(year, month + 1, i),
        });
    }

    return days;
}

interface ModernDatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (val: string) => void;
    placeholder?: string;
    openUp?: boolean;
    disablePast?: boolean;
}

function ModernDatePicker({
    value,
    onChange,
    placeholder = 'Select expiry date',
    openUp = false,
    disablePast = true,
}: ModernDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const todayStr = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    const parsedDate = useMemo(() => {
        if (!value) return new Date();
        const parts = value.split('-');
        if (parts.length === 3) {
            const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
            const iso = `${parts[0]}-${parts[1]}-${parts[2]}`;
            if (disablePast && iso < todayStr) return new Date();
            return d;
        }
        return new Date();
    }, [value, disablePast, todayStr]);

    const [viewDate, setViewDate] = useState<Date>(parsedDate);

    // Sync viewDate when value changes or when opening
    useEffect(() => {
        if (value) {
            const parts = value.split('-');
            if (parts.length === 3) {
                setViewDate(new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
            }
        }
    }, [value, isOpen]);

    const daysGrid = useMemo(() => {
        return getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    }, [viewDate]);

    const isPrevMonthDisabled = useMemo(() => {
        if (!disablePast) return false;
        const now = new Date();
        return (
            viewDate.getFullYear() < now.getFullYear() ||
            (viewDate.getFullYear() === now.getFullYear() && viewDate.getMonth() <= now.getMonth())
        );
    }, [disablePast, viewDate]);

    function formatISO(d: Date) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function formatDisplay(isoStr: string) {
        if (!isoStr) return '';
        const parts = isoStr.split('-');
        if (parts.length !== 3) return isoStr;
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        return `${day}-${month}-${year}`;
    }

    function handleSelectDate(d: Date) {
        const iso = formatISO(d);
        if (disablePast && iso < todayStr) return;
        onChange(iso);
        setIsOpen(false);
    }

    function handleAddDays(daysToAdd: number) {
        const current = value && (!disablePast || value >= todayStr) ? new Date(value) : new Date();
        current.setDate(current.getDate() + daysToAdd);
        const iso = formatISO(current);
        if (disablePast && iso < todayStr) return;
        onChange(iso);
        setViewDate(current);
        setIsOpen(false);
    }

    return (
        <div className="relative" ref={containerRef}>
            {/* Custom Input Trigger */}
            <div
                onClick={() => setIsOpen((o) => !o)}
                className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-xs font-semibold text-primary flex items-center justify-between cursor-pointer hover:border-accent transition-all shadow-sm"
            >
                <div className="flex items-center gap-2">
                    <Calendar className="text-accent shrink-0" size={15} />
                    <span className={value ? 'text-primary font-bold font-mono text-sm' : 'text-muted-foreground'}>
                        {value ? formatDisplay(value) : placeholder}
                    </span>
                </div>
                <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-150 ${isOpen ? 'rotate-180 text-accent' : ''}`} />
            </div>

            {/* Floating Modern Calendar Dropdown */}
            {isOpen && (
                <div className={`absolute left-0 z-[100] w-72 bg-background border border-border/90 rounded-2xl shadow-2xl p-4 text-xs select-none animate-in fade-in zoom-in-95 duration-150 ${
                    openUp ? 'bottom-full mb-2' : 'top-full mt-1.5'
                }`}>
                    {/* Header Controls */}
                    <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-border">
                        <div className="font-extrabold text-primary text-sm flex items-center gap-1.5">
                            <span>{viewDate.toLocaleString('default', { month: 'long' })}</span>
                            <span className="text-accent">{viewDate.getFullYear()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={isPrevMonthDisabled}
                                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                                className={`p-1 rounded-lg transition-colors ${
                                    isPrevMonthDisabled
                                        ? 'text-muted-foreground/30 cursor-not-allowed'
                                        : 'text-muted-foreground hover:text-primary hover:bg-slate-100 cursor-pointer'
                                }`}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                                className="p-1 text-muted-foreground hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Day Names Header */}
                    <div className="grid grid-cols-7 text-center font-extrabold text-[10px] uppercase text-muted-foreground mb-1.5 tracking-wider">
                        <span>Su</span>
                        <span>Mo</span>
                        <span>Tu</span>
                        <span>We</span>
                        <span>Th</span>
                        <span>Fr</span>
                        <span>Sa</span>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center font-medium mb-3">
                        {daysGrid.map((cell, idx) => {
                            const cellISO = formatISO(cell.dateObj);
                            const isSelected = value === cellISO;
                            const isPast = disablePast && cellISO < todayStr;

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    disabled={isPast}
                                    onClick={() => handleSelectDate(cell.dateObj)}
                                    className={`h-8 w-8 mx-auto flex items-center justify-center rounded-xl text-xs transition-all ${
                                        isPast
                                            ? 'text-muted-foreground/30 opacity-40 cursor-not-allowed pointer-events-none line-through'
                                            : isSelected
                                            ? 'bg-accent text-accent-foreground font-bold shadow-md scale-105'
                                            : cell.isCurrentMonth
                                            ? 'text-primary hover:bg-accent/15 hover:text-accent font-semibold cursor-pointer'
                                            : 'text-muted-foreground/30 hover:bg-slate-100 cursor-pointer'
                                    }`}
                                >
                                    {cell.day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Presets & Controls */}
                    <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-semibold">
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => handleAddDays(30)}
                                className="px-2.5 py-1 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors cursor-pointer font-bold"
                            >
                                +30 Days
                            </button>
                            <button
                                type="button"
                                onClick={() => handleAddDays(365)}
                                className="px-2.5 py-1 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors cursor-pointer font-bold"
                            >
                                +1 Year
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                onChange(formatISO(today));
                                setViewDate(today);
                                setIsOpen(false);
                            }}
                            className="text-accent hover:underline cursor-pointer font-bold"
                        >
                            Today
                        </button>
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
    orgId: 'ORG-99482-NX',
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
    licenseKey: 'TL9K-8F7E-6D5C-4B3A',
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
            orgId: 'ORG-88310-TF',
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
            licenseKey: 'TL8B-7C6D-5E4F-3G2H',
        }
        : mockTenantData;

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

    // Tenant State
    const [tenant, setTenant] = useState(initialTenant);
    const [modules, setModules] = useState<ModuleConfig[]>(initialModules);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs);

    useEffect(() => {
        const targetId = tenantId || productId;
        if (!targetId) return;

        fetch(`/api/tenants/${targetId}`, { headers: credentialHeaders })
            .then((res) => {
                if (res.ok) return res.json();
                return fetch('/api/tenants', { headers: credentialHeaders }).then((r) => r.json()).then((list: any[]) => {
                    return list.find((t) => String(t.id) === String(targetId) || t.tenantName.toLowerCase() === targetId.toLowerCase());
                });
            })
            .then((d: any) => {
                if (d && d.tenantName) {
                    const parsedMaxUsers = d.maxUsers !== undefined && d.maxUsers !== null ? Number(d.maxUsers) : 100;
                    setTenant({
                        id: String(d.id),
                        productId: (d.productName || 'ems').toLowerCase(),
                        companyName: d.tenantName,
                        domain: d.tenantMail ? (d.tenantMail.includes('@') ? d.tenantMail.split('@')[1] : d.tenantMail) : 'domain.com',
                        orgId: formatTenantId(d.id),
                        address: d.address || '100 Innovation Way, Suite 400',
                        city: 'San Francisco, CA',
                        country: 'United States',
                        adminName: d.adminName || (d.adminMail ? (d.adminMail.includes('@') ? d.adminMail.split('@')[0] : d.adminMail) : 'Admin'),
                        adminEmail: d.adminMail || 'admin@domain.com',
                        adminPhone: d.mobileNumber || '+1 (555) 382-9102',
                        status: (d.status || 'Active') as any,
                        plan: (d.planType === 'Pro' ? 'Professional' : (d.planType || 'Enterprise')) as any,
                        startDate: '2025-11-12',
                        expiryDate: d.expiryDate || '2026-11-12',
                        activeUsersCount: Math.min(100, parsedMaxUsers),
                        maxUsers: parsedMaxUsers,
                        licenseKey: d.licenseKey || '',
                    });
                    if (d.featureModules) {
                        let mappedModules = initialModules;
                        if (Array.isArray(d.featureModules)) {
                            const enabledSet = new Set(
                                d.featureModules.map((item: any) =>
                                    (typeof item === 'string' ? item : (item && (item.name || item.id)) || '').toLowerCase()
                                )
                            );
                            mappedModules = initialModules.map((m) => ({
                                ...m,
                                enabled: enabledSet.has(m.id.toLowerCase()) || enabledSet.has(m.name.toLowerCase()),
                            }));
                        } else if (typeof d.featureModules === 'object') {
                            const dict = d.featureModules as Record<string, boolean>;
                            mappedModules = initialModules.map((m) => {
                                if (m.name in dict) return { ...m, enabled: Boolean(dict[m.name]) };
                                if (m.id in dict) return { ...m, enabled: Boolean(dict[m.id]) };
                                return m;
                            });
                        }
                        setModules(mappedModules);
                    }
                }
            })
            .catch((err) => console.log('Error fetching tenant details from DB:', err));
    }, [tenantId, productId]);

    // Active Tab state
    const [activeTab, setActiveTab] = useState<'overview' | 'modules' | 'security' | 'audit'>('overview');

    // UI Feedback states
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Reset Password Modal state
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(true);
    const [passwordCopied, setPasswordCopied] = useState(false);

    // Suspend Modal state
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [suspendReason, setSuspendReason] = useState('');

    // Edit Tenant Details Modal (3-Step Wizard Flow) state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editStep, setEditStep] = useState<number>(1);
    const [showEditSuccessCard, setShowEditSuccessCard] = useState(false);

    // Step 1: Company Info
    const [editName, setEditName] = useState('');
    const [editDomain, setEditDomain] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // Step 2: Plan Details
    const [editLicenseKey, setEditLicenseKey] = useState('');
    const [editCopiedLicenseKey, setEditCopiedLicenseKey] = useState(false);
    const [editSelectedProducts, setEditSelectedProducts] = useState<string[]>(['EMS']);
    const [isEditProductDropdownOpen, setIsEditProductDropdownOpen] = useState(false);
    const [editStatus, setEditStatus] = useState<'Active' | 'Pending' | 'Inactive' | 'Suspended'>('Active');
    const [editPlan, setEditPlan] = useState<'Standard' | 'Professional' | 'Enterprise'>('Enterprise');
    const [editSubscriptionType, setEditSubscriptionType] = useState<'Annual Recurring' | 'Monthly Billing' | 'Perpetual License'>('Annual Recurring');
    const [editExpiryDate, setEditExpiryDate] = useState('');
    const [editMaxUsers, setEditMaxUsers] = useState<number | string>(100);
    const [editActiveOpenDropdown, setEditActiveOpenDropdown] = useState<'none' | 'product' | 'status' | 'plan' | 'sub'>('none');

    // Step 3: Admin Details
    const [editAdminName, setEditAdminName] = useState('');
    const [editAdminEmail, setEditAdminEmail] = useState('');
    const [editAdminPassword, setEditAdminPassword] = useState('');
    const [editAdminConfirmPassword, setEditAdminConfirmPassword] = useState('');
    const [editPasswordError, setEditPasswordError] = useState<string | null>(null);
    const [showEditAdminPassword, setShowEditAdminPassword] = useState(false);
    const [showEditAdminConfirmPassword, setShowEditAdminConfirmPassword] = useState(false);

    function handleOpenEditModal() {
        setEditStep(1);
        setShowEditSuccessCard(false);
        setEditPasswordError(null);
        setEditName(tenant.companyName);
        setEditDomain(tenant.domain);
        setEditAddress(tenant.address);
        setEditPhone(tenant.adminPhone ? tenant.adminPhone.replace(/\D/g, '') : '');
        setEditLicenseKey((tenant as any).licenseKey || generateLicenseKey());
        setEditCopiedLicenseKey(false);
        setEditSelectedProducts([tenant.productId.toUpperCase()]);
        setIsEditProductDropdownOpen(false);
        setEditStatus(tenant.status as any);
        setEditPlan(tenant.plan);
        setEditSubscriptionType('Annual Recurring');
        setEditExpiryDate(tenant.expiryDate);
        setEditMaxUsers(tenant.maxUsers);
        setEditAdminName(tenant.adminName);
        setEditAdminEmail(tenant.adminEmail);
        setEditAdminPassword('');
        setEditAdminConfirmPassword('');
        setShowEditAdminPassword(false);
        setShowEditAdminConfirmPassword(false);
        setEditActiveOpenDropdown('none');
        setIsEditModalOpen(true);
    }

    function handleGoToStep2() {
        if (!editName.trim()) {
            showToast('Tenant Company Name is required');
            return;
        }
        if (!editAddress.trim()) {
            showToast('Tenant Address is required');
            return;
        }
        if (!editDomain.trim()) {
            showToast('Primary Domain is required');
            return;
        }
        if (!editPhone.trim()) {
            showToast('Mobile Number is required');
            return;
        }
        setEditStep(2);
    }

    function handleGoToStep3() {
        if (!editLicenseKey.trim()) {
            showToast('License Key is required');
            return;
        }
        if (editSelectedProducts.length === 0) {
            showToast('Select at least one product platform');
            return;
        }
        setEditStep(3);
    }

    function handleCopyEditLicenseKey() {
        navigator.clipboard.writeText(formatLicenseKey(editLicenseKey));
        setEditCopiedLicenseKey(true);
        showToast('License Key copied to clipboard');
        setTimeout(() => setEditCopiedLicenseKey(false), 2000);
    }

    function handleSaveEditTenant(e: React.FormEvent) {
        e.preventDefault();

        if (!editAdminPassword.trim()) {
            setEditPasswordError('Admin password is required');
            showToast('Admin password is required');
            return;
        }

        if (!editAdminConfirmPassword.trim()) {
            setEditPasswordError('Please confirm admin password');
            showToast('Please confirm admin password');
            return;
        }

        if (editAdminPassword !== editAdminConfirmPassword) {
            setEditPasswordError('Passwords do not match');
            showToast('Passwords do not match');
            return;
        }

        setEditPasswordError(null);

        const payload = {
            tenantName: editName.trim(),
            productName: editSelectedProducts.join(', ') || tenant.productId.toUpperCase(),
            planType: editPlan,
            subscriptionType: editSubscriptionType,
            expiryDate: editExpiryDate,
            hasTrial: 'None',
            tenantMail: `contact@${editDomain.trim()}`,
            adminMail: editAdminEmail.trim(),
            adminName: editAdminName.trim(),
            status: editStatus,
            address: editAddress.trim(),
            mobileNumber: editPhone.trim(),
            maxUsers: Number(editMaxUsers) || 100,
            licenseKey: formatLicenseKey(editLicenseKey),
        };

        fetch(`/api/tenants/${tenant.id}`, {
            method: 'PUT',
            headers: jsonHeaders,
            body: JSON.stringify(payload),
        })
            .then((res) => {
                if (res.ok) {
                    setTenant((prev) => ({
                        ...prev,
                        companyName: editName.trim(),
                        domain: editDomain.trim(),
                        address: editAddress.trim(),
                        adminPhone: editPhone.trim(),
                        adminName: editAdminName.trim(),
                        adminEmail: editAdminEmail.trim(),
                        status: editStatus as any,
                        plan: editPlan as any,
                        expiryDate: editExpiryDate,
                        maxUsers: Number(editMaxUsers) || 100,
                    }));
                    setShowEditSuccessCard(true);
                    addAuditLog('Updated tenant details', 'Status');
                    showToast('Tenant details updated successfully');
                } else {
                    throw new Error('Failed to update tenant');
                }
            })
            .catch((err) => {
                console.error('Error updating tenant details in DB:', err);
                setTenant((prev) => ({
                    ...prev,
                    companyName: editName.trim(),
                    domain: editDomain.trim(),
                    address: editAddress.trim(),
                    adminPhone: editPhone.trim(),
                    adminName: editAdminName.trim(),
                    adminEmail: editAdminEmail.trim(),
                    status: editStatus as any,
                    plan: editPlan as any,
                    expiryDate: editExpiryDate,
                    maxUsers: Number(editMaxUsers) || 100,
                }));
                setShowEditSuccessCard(true);
                showToast('Tenant details updated locally');
            });
    }

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
        setModules((prev) => {
            const nextModules = prev.map((m) => {
                if (m.id === modId) {
                    const nextVal = !m.enabled;
                    addAuditLog(`${nextVal ? 'Enabled' : 'Disabled'} module: ${m.name}`, 'Module');
                    showToast(`${m.name} module ${nextVal ? 'enabled' : 'disabled'}`);
                    return { ...m, enabled: nextVal };
                }
                return m;
            });

            // Construct Dict object { "USB Blocking": true, "Website Blocking": false, ... }
            const modulesDict: Record<string, boolean> = {};
            nextModules.forEach((m) => {
                modulesDict[m.name] = m.enabled;
            });

            const targetTenantId = tenant.id || tenantId || '1';

            // Save to Neon DB tenant-wise (stores Dict of module_name: boolean)
            fetch(`/api/tenants/${targetTenantId}/modules`, {
                method: 'PUT',
                headers: jsonHeaders,
                body: JSON.stringify({ featureModules: modulesDict }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log('Successfully saved modules to Neon DB for tenant:', targetTenantId, data);
                })
                .catch((err) => console.error('Error saving tenant feature modules to DB:', err));

            // Save to tenant-specific localStorage key as fallback
            try {
                localStorage.setItem(`tenant_${targetTenantId}_enabled_modules`, JSON.stringify(modulesDict));
            } catch {}
            return nextModules;
        });
    }

    function handleGenerateNewPassword() {
        const generated = 'Nx$' + Math.random().toString(36).slice(-8) + '!2026';
        setNewPassword(generated);
        setPasswordCopied(false);
    }

    function handleOpenResetPasswordModal() {
        handleGenerateNewPassword();
        setShowPassword(true);
        setIsPasswordModalOpen(true);
    }

    function handleSavePassword() {
        if (!newPassword.trim()) {
            showToast('Password cannot be empty');
            return;
        }
        addAuditLog(`Reset company admin password for ${tenant.adminEmail}`, 'Security', 'Warning');
        showToast('Admin password updated successfully');
        setIsPasswordModalOpen(false);
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

    // Audit Log Pagination State
    const [logPage, setLogPage] = useState(1);
    const logsPerPage = 5;

    useEffect(() => {
        setLogPage(1);
    }, [logSearch, logCategoryFilter]);

    const totalLogPages = Math.max(1, Math.ceil(filteredLogs.length / logsPerPage));
    const logStartIndex = (logPage - 1) * logsPerPage;
    const logEndIndex = logStartIndex + logsPerPage;
    const paginatedLogs = filteredLogs.slice(logStartIndex, logEndIndex);

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

            <div className="relative h-screen bg-background flex flex-col lg:flex-row overflow-hidden dashboard-page">
                <DashboardSidebar activeItem="tenants" />

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
                                                onClick={() => navigate(`/dashboard/tenants/${product?.id || 'ems'}`)} 
                                                className="hover:underline cursor-pointer"
                                            >
                                                Tenants
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
                                    {/* Common Edit Tenant Option */}
                                    <button
                                        onClick={handleOpenEditModal}
                                        className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                                    >
                                        <Edit3 size={14} />
                                        <span>Edit Tenant</span>
                                    </button>
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
                                    <div className="flex items-center justify-between pb-3 border-b border-border">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                                <Building2 size={16} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Company Information</h3>
                                                <p className="text-[11px] text-muted-foreground">General tenant profile details</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 text-xs">
                                        <div>
                                            <span className="text-muted-foreground font-medium block mb-1">Company Name</span>
                                            <div className="font-bold text-primary text-sm flex items-center gap-2">
                                                <Building2 size={14} className="text-accent shrink-0" />
                                                <span>{tenant.companyName}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-muted-foreground font-medium block mb-1">Domain</span>
                                            <div className="font-mono text-primary font-semibold flex items-center gap-2">
                                                <Globe size={13} className="text-accent shrink-0" />
                                                <span>{tenant.domain}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-muted-foreground font-medium block mb-1">Office Address</span>
                                            <div className="text-primary font-medium flex items-start gap-2">
                                                <MapPin size={14} className="text-accent shrink-0 mt-0.5" />
                                                <span>{tenant.address}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-muted-foreground font-medium block mb-1">Contact Number</span>
                                            <div className="font-mono text-primary font-semibold flex items-center gap-2">
                                                <Phone size={13} className="text-accent shrink-0" />
                                                <span>{tenant.adminPhone || 'N/A'}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-muted-foreground font-medium block mb-1">Primary Admin</span>
                                            <div className="font-bold text-primary flex items-center gap-2">
                                                <User size={14} className="text-accent shrink-0" />
                                                <span>{tenant.adminName}</span>
                                            </div>
                                            <div className="text-muted-foreground font-mono flex items-center gap-2 mt-1 pl-5">
                                                <Mail size={12} className="text-muted-foreground shrink-0" />
                                                <span>{tenant.adminEmail}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Subscription & Capacity Controls Card (Read-Only Display) */}
                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 space-y-6 shadow-sm lg:col-span-2">
                                    <div className="flex items-center justify-between pb-4 border-b border-border">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                                                <Calendar size={16} />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Subscription & User Limits</h3>
                                                <p className="text-[11px] text-muted-foreground">Current plan tier, license duration, and capacity limit</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subscription Overview Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl border border-border bg-slate-50/50 space-y-1">
                                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Subscription Start Date</span>
                                            <div className="font-mono text-sm font-extrabold text-primary flex items-center gap-2">
                                                <Calendar size={14} className="text-accent shrink-0" />
                                                <span>{tenant.startDate}</span>
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl border border-border bg-slate-50/50 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Subscription Expiry Date</span>
                                                {(() => {
                                                    const rem = getDaysRemaining(tenant.expiryDate);
                                                    return (
                                                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${rem.colorClass}`}>
                                                            {rem.text}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                            <div className="font-mono text-sm font-extrabold text-primary flex items-center gap-2 pt-0.5">
                                                <Clock size={14} className="text-emerald-600 shrink-0" />
                                                <span>{tenant.expiryDate}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* User Seats Capacity Display */}
                                    <div className="p-4 rounded-xl border border-border bg-slate-50/50 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Maximum User Seat Capacity</span>
                                            <span className="text-xs font-bold text-accent">{tenant.maxUsers} Managed Seats</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-extrabold text-primary">{tenant.maxUsers}</span>
                                            <span className="text-xs text-muted-foreground font-medium">total allowed users ({tenant.activeUsersCount} currently active)</span>
                                        </div>
                                    </div>

                                    {/* Selected Subscription Plan Tier Display */}
                                    <div className="pt-2 space-y-3">
                                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">Active License Plan Tier</span>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            {[
                                                { id: 'Standard', desc: 'Core endpoint management & basic reporting' },
                                                { id: 'Professional', desc: 'Advanced automation, SLAs, & 24/7 support' },
                                                { id: 'Enterprise', desc: 'Full suite, unlimited logs, AI, & dedicated TAM' },
                                            ].map((plan) => {
                                                const isCurrent = tenant.plan === plan.id;
                                                return (
                                                    <div
                                                        key={plan.id}
                                                        className={`p-4 rounded-xl border transition-all relative ${
                                                            isCurrent
                                                                ? 'border-accent bg-accent/10 shadow-sm'
                                                                : 'border-border/60 bg-background opacity-60'
                                                        }`}
                                                    >
                                                        {isCurrent && (
                                                            <span className="absolute top-3 right-3 text-accent">
                                                                <CheckCircle2 size={16} />
                                                            </span>
                                                        )}
                                                        <div className="font-bold text-primary text-sm">{plan.id}</div>
                                                        <p className="text-[11px] text-muted-foreground mt-1 leading-snug">{plan.desc}</p>
                                                    </div>
                                                );
                                            })}
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
                                                onClick={handleOpenResetPasswordModal}
                                                className="w-full py-2.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                            <motion.div variants={fadeUp} className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
                                <div className="p-6 space-y-5">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                                        <div>
                                            <h3 className="text-base font-bold text-primary">System-Level Audit Logs</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Immutable record of security events, administrative changes, and status updates.
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
                                    <div className="overflow-x-auto min-h-[280px]">
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
                                                    paginatedLogs.map((log) => (
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
                                </div>

                                {/* Footer Pagination Bar */}
                                <div className="p-4 bg-slate-50/80 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs select-none">
                                    <div className="text-muted-foreground font-medium">
                                        Showing{' '}
                                        <span className="font-bold text-primary">
                                            {filteredLogs.length === 0 ? 0 : logStartIndex + 1}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-bold text-primary">
                                            {Math.min(logEndIndex, filteredLogs.length)}
                                        </span>{' '}
                                        of <span className="font-bold text-primary">{filteredLogs.length}</span> entries
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            disabled={logPage === 1}
                                            onClick={() => setLogPage((prev) => Math.max(prev - 1, 1))}
                                            className="h-8 w-8 flex justify-center items-center rounded-xl border border-input bg-background font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            <ChevronLeft size={14} />
                                        </button>

                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalLogPages }, (_, i) => i + 1).map((pageNum) => (
                                                <button
                                                    key={pageNum}
                                                    type="button"
                                                    onClick={() => setLogPage(pageNum)}
                                                    className={`h-8 w-8 rounded-xl font-bold transition-all cursor-pointer ${
                                                        logPage === pageNum
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
                                            disabled={logPage === totalLogPages || filteredLogs.length === 0}
                                            onClick={() => setLogPage((prev) => Math.min(prev + 1, totalLogPages))}
                                            className="h-8 w-8 flex justify-center items-center rounded-xl border border-input bg-background font-semibold text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-all flex items-center gap-1 cursor-pointer"
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
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
                                    className="p-1 text-muted-foreground hover:text-primary bg-slate-100 rounded-full transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Set password for admin <strong className="text-primary">{tenant.adminEmail}</strong>. An auto-generated password is populated by default, or you can type your own custom password below:
                            </p>

                            {/* Editable Password Input Box */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Admin Password
                                </label>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => {
                                                setNewPassword(e.target.value);
                                                setPasswordCopied(false);
                                            }}
                                            placeholder="Type custom password..."
                                            className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-input rounded-xl font-mono text-sm font-bold text-primary focus:outline-none focus:border-accent focus:bg-background transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((s) => !s)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary bg-slate-100 rounded-full transition-colors cursor-pointer"
                                            title={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    {/* Copy Button */}
                                    <button
                                        type="button"
                                        onClick={handleCopyPassword}
                                        className="px-3 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                                        title="Copy password"
                                    >
                                        {passwordCopied ? <Check size={14} /> : <Copy size={14} />}
                                        <span>{passwordCopied ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Auto Generate Helper */}
                            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-border/60 text-xs">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Zap size={14} className="text-accent shrink-0" />
                                    <span>Need a new random password?</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleGenerateNewPassword}
                                    className="px-3 py-1.5 bg-background border border-input text-xs font-bold text-primary rounded-lg hover:border-accent hover:text-accent transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                                >
                                    <RefreshCw size={13} />
                                    <span>Auto Generate</span>
                                </button>
                            </div>

                            {/* Footer Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordModalOpen(false)}
                                    className="px-4 py-2 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSavePassword}
                                    className="px-5 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
                                >
                                    Save Password
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
                                    className="p-1 text-muted-foreground hover:text-primary bg-slate-100 rounded-full transition-colors cursor-pointer"
                                >
                                    <X size={18} />
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

                {/* EDIT TENANT DETAILS MODAL (3-STEP WIZARD FLOW) */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`bg-background border border-border rounded-2xl shadow-2xl ${showEditSuccessCard ? 'max-w-md' : 'max-w-2xl'} w-full p-6 lg:p-8 space-y-6 my-8 overflow-visible relative`}
                        >
                            {showEditSuccessCard ? (
                                <div className="text-center py-4 space-y-6 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                                        <CheckCircle2 size={36} />
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-primary">Tenant Details Updated!</h3>
                                        <p className="text-xs text-muted-foreground">
                                            Organization profile, subscription parameters, and admin credentials for <strong className="text-primary">{editName}</strong> have been updated successfully.
                                        </p>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowEditSuccessCard(false);
                                                setIsEditModalOpen(false);
                                                setEditStep(1);
                                            }}
                                            className="w-full py-3 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Check size={16} />
                                            <span>Done & Close</span>
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between pb-4 border-b border-border">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
                                        <Edit3 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-primary">
                                            Edit Tenant Details
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Update company profile, subscription plan details, and administrator credentials
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setEditStep(1);
                                    }}
                                    className="p-1 text-muted-foreground hover:text-primary bg-slate-100 rounded-full transition-colors cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* 3-Step Wizard Stepper Bar */}
                            <div className="flex items-center justify-between pb-3 border-b border-border/80 text-xs font-semibold select-none">
                                <button
                                    type="button"
                                    onClick={() => setEditStep(1)}
                                    className={`flex items-center gap-2.5 text-left transition-all ${
                                        editStep === 1 ? 'text-accent font-bold cursor-pointer' : 'text-muted-foreground font-medium hover:text-primary cursor-pointer'
                                    }`}
                                >
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        editStep === 1 ? 'bg-accent text-white shadow-md' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                        1
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider">Step 1</div>
                                        <div className="text-[11px] text-muted-foreground">Company Info</div>
                                    </div>
                                </button>

                                <div className="flex-1 max-w-[60px] mx-2 flex items-center gap-1">
                                    <div className={`h-0.5 w-full rounded-full transition-all ${editStep >= 2 ? 'bg-accent' : 'bg-slate-200'}`} />
                                    <ChevronRight size={14} className={editStep >= 2 ? 'text-accent' : 'text-slate-400'} />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (editName.trim() && editAddress.trim() && editDomain.trim() && editPhone.trim()) {
                                            handleGoToStep2();
                                        }
                                    }}
                                    className={`flex items-center gap-2.5 text-left transition-all ${
                                        editStep === 2 ? 'text-accent font-bold cursor-pointer' : 'text-muted-foreground font-medium hover:text-primary cursor-pointer'
                                    }`}
                                >
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        editStep === 2 ? 'bg-accent text-white shadow-md' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                        2
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider">Step 2</div>
                                        <div className="text-[11px] text-muted-foreground">Plan Details</div>
                                    </div>
                                </button>

                                <div className="flex-1 max-w-[60px] mx-2 flex items-center gap-1">
                                    <div className={`h-0.5 w-full rounded-full transition-all ${editStep === 3 ? 'bg-accent' : 'bg-slate-200'}`} />
                                    <ChevronRight size={14} className={editStep === 3 ? 'text-accent' : 'text-slate-400'} />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (editName.trim() && editAddress.trim() && editDomain.trim() && editPhone.trim()) {
                                            handleGoToStep3();
                                        }
                                    }}
                                    className={`flex items-center gap-2.5 text-left transition-all ${
                                        editStep === 3 ? 'text-accent font-bold cursor-pointer' : 'text-muted-foreground font-medium hover:text-primary cursor-pointer'
                                    }`}
                                >
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        editStep === 3 ? 'bg-accent text-white shadow-md' : 'bg-slate-200 text-slate-700'
                                    }`}>
                                        3
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider">Step 3</div>
                                        <div className="text-[11px] text-muted-foreground">Admin Details</div>
                                    </div>
                                </button>
                            </div>

                            <form onSubmit={handleSaveEditTenant} className="space-y-6 text-xs max-h-[75vh] overflow-y-auto pr-1 slim-scrollbar-x">
                                {/* ── STEP 1: COMPANY INFORMATION ── */}
                                {editStep === 1 && (
                                    <div className="bg-slate-50/60 border border-border/70 rounded-xl p-4 space-y-4 animate-in fade-in duration-150">
                                        <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                                            <div className="p-1.5 rounded-lg bg-accent/10 text-accent">
                                                <Building2 size={16} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                    Tenant Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Nexus Global Tech"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-background border border-input rounded-xl font-medium text-primary focus:outline-none focus:border-accent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                    Tenant ID (Auto-Generated)
                                                </label>
                                                <div className="px-4 py-2.5 bg-slate-100/90 border border-input/80 rounded-xl font-mono text-xs font-extrabold text-accent flex items-center justify-between select-none cursor-not-allowed">
                                                    <span>{formatTenantId(tenant.id)}</span>
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
                                                placeholder="e.g. 100 Innovation Way, Suite 400"
                                                value={editAddress}
                                                onChange={(e) => setEditAddress(e.target.value)}
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
                                                    value={editDomain}
                                                    onChange={(e) => setEditDomain(e.target.value)}
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
                                                    value={editPhone}
                                                    onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ''))}
                                                    className="w-full px-4 py-2.5 bg-background border border-input rounded-xl font-medium text-primary focus:outline-none focus:border-accent"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 2: PLAN & SUBSCRIPTION DETAILS ── */}
                                {editStep === 2 && (
                                    <div className="bg-slate-50/60 border border-border/70 rounded-xl p-4 space-y-4 animate-in fade-in duration-150">
                                        <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                                            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                                                <CreditCard size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Step 2: Plan & Subscription Details</h4>
                                                <p className="text-[11px] text-muted-foreground">Product platforms, license key, billing plan tier, and user capacity</p>
                                            </div>
                                        </div>

                                        {/* License Key (16-Digit Auto-Generated) */}
                                        <div>
                                            <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                License Key (16-Digit Auto-Generated) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <div className="w-full px-4 py-2 bg-background border border-input rounded-xl font-mono text-xs font-extrabold text-primary flex items-center justify-between select-none">
                                                    <div className="flex items-center gap-2">
                                                        <Key size={14} className="text-accent" />
                                                        <span>{formatLicenseKey(editLicenseKey)}</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleCopyEditLicenseKey}
                                                    className="p-2.5 bg-background border border-input rounded-xl text-muted-foreground hover:text-accent hover:border-accent transition-colors cursor-pointer shrink-0"
                                                    title="Copy License Key to Clipboard"
                                                >
                                                    {editCopiedLicenseKey ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditLicenseKey(generateLicenseKey())}
                                                    className="p-2.5 bg-background border border-input rounded-xl text-muted-foreground hover:text-accent hover:border-accent transition-colors cursor-pointer shrink-0"
                                                    title="Generate New 16-Digit License Key"
                                                >
                                                    <RefreshCw size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Row 2: Product Name & Status on SAME ROW */}
                                        <div className={`grid grid-cols-2 gap-4 relative ${['product', 'status'].includes(editActiveOpenDropdown) ? 'z-[100]' : 'z-30'}`}>
                                            {/* Product Name (Multiple Select Dropdown) */}
                                            <div className={`relative ${editActiveOpenDropdown === 'product' ? 'z-[100]' : 'z-20'}`}>
                                                <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                    Product Name <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const next = !isEditProductDropdownOpen;
                                                            setIsEditProductDropdownOpen(next);
                                                            setEditActiveOpenDropdown(next ? 'product' : 'none');
                                                        }}
                                                        className="w-full min-h-[42px] px-3.5 py-2 bg-background border border-input rounded-xl text-xs font-semibold text-primary focus:outline-none focus:border-accent hover:border-accent/60 transition-all flex items-center justify-between gap-2 shadow-sm cursor-pointer"
                                                    >
                                                        <div className="flex flex-wrap gap-1.5 min-w-0">
                                                            {editSelectedProducts.length === 0 ? (
                                                                <span className="text-muted-foreground font-normal">Select Products...</span>
                                                            ) : (
                                                                editSelectedProducts.map((p) => (
                                                                    <span key={p} className="px-2 py-0.5 bg-accent/15 text-accent font-bold text-[11px] rounded-md flex items-center gap-1 border border-accent/20">
                                                                        {p}
                                                                    </span>
                                                                ))
                                                            )}
                                                        </div>
                                                        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-200 shrink-0 ${isEditProductDropdownOpen ? 'rotate-180 text-accent' : ''}`} />
                                                    </button>

                                                    {isEditProductDropdownOpen && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-40"
                                                                onClick={() => {
                                                                    setIsEditProductDropdownOpen(false);
                                                                    setEditActiveOpenDropdown('none');
                                                                }}
                                                            />
                                                            <div className="absolute top-full mt-1.5 left-0 w-full bg-background border border-border/80 rounded-xl shadow-2xl z-50 p-2 space-y-1">
                                                                {[
                                                                    { id: 'EMS', name: 'Endpoint Management (EMS)' },
                                                                    { id: 'TICKETS', name: 'Ticket & Asset Management' },
                                                                    { id: 'PETTY CASH', name: 'Petty Cash Management' },
                                                                    { id: 'DAYBOOK', name: 'Daybook Management' },
                                                                ].map((product) => {
                                                                    const isSelected = editSelectedProducts.includes(product.id);
                                                                    return (
                                                                        <button
                                                                            key={product.id}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                if (isSelected) {
                                                                                    setEditSelectedProducts(editSelectedProducts.filter((item) => item !== product.id));
                                                                                } else {
                                                                                    setEditSelectedProducts([...editSelectedProducts, product.id]);
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
                                                    value={editStatus}
                                                    onChange={(val) => setEditStatus(val as any)}
                                                    options={[
                                                        { value: 'Active', label: 'Active' },
                                                        { value: 'Pending', label: 'Pending' },
                                                        { value: 'Inactive', label: 'Inactive' },
                                                        { value: 'Suspended', label: 'Suspended' },
                                                    ]}
                                                    fullWidth
                                                    openUp
                                                    onOpenChange={(open) => setEditActiveOpenDropdown(open ? 'status' : 'none')}
                                                />
                                            </div>
                                        </div>

                                        {/* Row 3: Plan Type & Subscription Type */}
                                        <div className={`grid grid-cols-2 gap-4 relative ${['plan', 'sub'].includes(editActiveOpenDropdown) ? 'z-[100]' : 'z-20'}`}>
                                            <div className="relative">
                                                <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                    Plan Type <span className="text-red-500">*</span>
                                                </label>
                                                <CustomSelect
                                                    value={editPlan}
                                                    onChange={(val) => setEditPlan(val as any)}
                                                    options={[
                                                        { value: 'Enterprise', label: 'Enterprise' },
                                                        { value: 'Professional', label: 'Professional' },
                                                        { value: 'Standard', label: 'Standard' },
                                                    ]}
                                                    fullWidth
                                                    openUp
                                                    onOpenChange={(open) => setEditActiveOpenDropdown(open ? 'plan' : 'none')}
                                                />
                                            </div>

                                            <div className="relative">
                                                <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                    Subscription Type <span className="text-red-500">*</span>
                                                </label>
                                                <CustomSelect
                                                    value={editSubscriptionType}
                                                    onChange={(val) => setEditSubscriptionType(val as any)}
                                                    options={[
                                                        { value: 'Annual Recurring', label: 'Annual Recurring' },
                                                        { value: 'Monthly Billing', label: 'Monthly Billing' },
                                                        { value: 'Perpetual License', label: 'Perpetual License' },
                                                    ]}
                                                    fullWidth
                                                    openUp
                                                    onOpenChange={(open) => setEditActiveOpenDropdown(open ? 'sub' : 'none')}
                                                />
                                            </div>
                                        </div>

                                        {/* Row 4: Max Users Count & Expiry Date */}
                                        <div className="grid grid-cols-2 gap-4 relative z-10">
                                            <div>
                                                <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                    Max Users Count <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    required
                                                    placeholder="e.g. 100"
                                                    value={editMaxUsers}
                                                    onChange={(e) => setEditMaxUsers(e.target.value)}
                                                    className="w-full px-4 py-2.5 bg-background border border-input rounded-xl font-medium text-primary focus:outline-none focus:border-accent"
                                                />
                                            </div>

                                            <div>
                                                <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                    Subscription Expiry Date <span className="text-red-500">*</span>
                                                </label>
                                                <ModernDatePicker
                                                    value={editExpiryDate}
                                                    onChange={(val) => setEditExpiryDate(val)}
                                                    placeholder="Select expiry date"
                                                    openUp={false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 3: ADMIN DETAILS ── */}
                                {editStep === 3 && (
                                    <div className="bg-slate-50/60 border border-border/70 rounded-xl p-4 space-y-4 animate-in fade-in duration-150">
                                        <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                                            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Step 3: Admin Details</h4>
                                                <p className="text-[11px] text-muted-foreground">Primary administrator credentials and contact information</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                    Admin Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Alex Mercer"
                                                    value={editAdminName}
                                                    onChange={(e) => setEditAdminName(e.target.value)}
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
                                                    value={editAdminEmail}
                                                    onChange={(e) => setEditAdminEmail(e.target.value)}
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
                                                        type={showEditAdminPassword ? 'text' : 'password'}
                                                        required
                                                        placeholder="Enter admin password"
                                                        value={editAdminPassword}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setEditAdminPassword(val);
                                                            if (editAdminConfirmPassword && val !== editAdminConfirmPassword) {
                                                                setEditPasswordError('Passwords do not match');
                                                            } else {
                                                                setEditPasswordError(null);
                                                            }
                                                        }}
                                                        className={`w-full pl-4 pr-10 py-2.5 bg-background border rounded-xl font-medium text-primary focus:outline-none transition-colors ${
                                                            editPasswordError
                                                                ? 'border-rose-500 text-rose-600 focus:border-rose-500'
                                                                : 'border-input focus:border-accent'
                                                        }`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowEditAdminPassword(!showEditAdminPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                                        title={showEditAdminPassword ? 'Hide Password' : 'Show Password'}
                                                    >
                                                        {showEditAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block font-semibold text-primary uppercase tracking-wider mb-1">
                                                    Confirm Password <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showEditAdminConfirmPassword ? 'text' : 'password'}
                                                        required
                                                        placeholder="Confirm admin password"
                                                        value={editAdminConfirmPassword}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            setEditAdminConfirmPassword(val);
                                                            if (editAdminPassword && val !== editAdminPassword) {
                                                                setEditPasswordError('Passwords do not match');
                                                            } else {
                                                                setEditPasswordError(null);
                                                            }
                                                        }}
                                                        className={`w-full pl-4 pr-10 py-2.5 bg-background border rounded-xl font-medium text-primary focus:outline-none transition-colors ${
                                                            editPasswordError
                                                                ? 'border-rose-500 text-rose-600 focus:border-rose-500'
                                                                : 'border-input focus:border-accent'
                                                        }`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowEditAdminConfirmPassword(!showEditAdminConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                                        title={showEditAdminConfirmPassword ? 'Hide Password' : 'Show Password'}
                                                    >
                                                        {showEditAdminConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                {editPasswordError && (
                                                    <p className="text-[11px] text-rose-500 font-semibold mt-1.5 flex items-center gap-1">
                                                        <AlertCircle size={13} className="shrink-0" />
                                                        <span>{editPasswordError}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    {editStep === 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditModalOpen(false);
                                                    setEditStep(1);
                                                }}
                                                className="px-4 py-2 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-slate-100 cursor-pointer"
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

                                    {editStep === 2 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setEditStep(1)}
                                                className="px-4 py-2 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                                            >
                                                <ChevronLeft size={15} />
                                                <span>Back: Company Info</span>
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

                                    {editStep === 3 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setEditStep(2)}
                                                className="px-4 py-2 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                                            >
                                                <ChevronLeft size={15} />
                                                <span>Back: Plan Details</span>
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                                            >
                                                <Check size={15} />
                                                <span>Save Changes</span>
                                            </button>
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
