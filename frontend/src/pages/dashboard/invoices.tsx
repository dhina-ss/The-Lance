import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Receipt,
    Plus,
    X,
    Check,
    Search,
    Download,
    DollarSign,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Building2,
    FileText,
    Eye,
    Printer,
    Trash2,
    Pencil,
    Calendar,
    MapPin,
    Phone,
    Globe,
} from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';
import { jsonHeaders, credentialHeaders } from '../../api/client';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

interface InvoiceItem {
    id: string;
    description: string;
    rate: number;
    qty: number;
}

interface Invoice {
    id: string; // Invoice Number e.g. TL260001
    billedTo: string;
    clientName: string;
    date: string;
    udhayamRegNo: string;
    items: InvoiceItem[];
    tax: number;
    subtotal: number;
    total: number;
    status: 'Paid' | 'Pending' | 'Overdue';
}

export default function InvoicesPage() {
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

    const [invoices, setInvoices] = useState<Invoice[]>([]);

    useEffect(() => {
        fetch('/api/invoices', { headers: credentialHeaders })
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error('API fetch failed');
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setInvoices(data);
                }
            })
            .catch((err) => console.log('Error loading invoices from database:', err));
    }, []);
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);
    const [rangeViewDate, setRangeViewDate] = useState(() => new Date());
    const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Overdue'>('All');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Active Invoice being previewed, edited, or deleted
    const [activePreviewInvoice, setActivePreviewInvoice] = useState<Invoice | null>(null);
    const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
    const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);

    // Form fields for New/Edit Invoice
    const [billedTo, setBilledTo] = useState('');
    const [invoiceNo, setInvoiceNo] = useState('');
    const [date, setDate] = useState('12-08-2026');
    const [udhayamRegNo, setUdhayamRegNo] = useState('UDYAM-TN-22-0125179');
    const tax = 0;
    const [formItems, setFormItems] = useState<InvoiceItem[]>([
        { id: '1', description: '', rate: 0, qty: 1 },
    ]);

    // Reset pagination to page 1 on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, startDate, endDate]);

    // Calculate subtotal & total for form
    const formSubtotal = formItems.reduce((acc, item) => acc + (Number(item.rate) || 0) * (Number(item.qty) || 0), 0);
    const formTotal = formSubtotal;

    // Filtered list
    const filteredInvoices = invoices.filter((inv) => {
        const matchesSearch =
            inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.billedTo.toLowerCase().includes(searchQuery.toLowerCase());

        const invISODate = formatDisplayDateToISO(inv.date);
        const matchesStartDate = !startDate || (invISODate >= startDate);
        const matchesEndDate = !endDate || (invISODate <= endDate);

        return matchesSearch && matchesStartDate && matchesEndDate;
    });

    // Pagination Slicing
    const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

    function getTodayFormatted(): string {
        const d = new Date();
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function getISODateString(d: Date): string {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function handleRangeCalendarClick(dObj: Date) {
        const iso = getISODateString(dObj);
        if (!startDate || (startDate && endDate)) {
            setStartDate(iso);
            setEndDate('');
        } else if (startDate && !endDate) {
            if (iso < startDate) {
                setEndDate(startDate);
                setStartDate(iso);
            } else {
                setEndDate(iso);
            }
        }
    }

    function getRangeCalendarDays() {
        const year = rangeViewDate.getFullYear();
        const month = rangeViewDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days = [];

        // Previous month overflow days
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const dObj = new Date(year, month - 1, daysInPrevMonth - i);
            days.push({
                day: daysInPrevMonth - i,
                isCurrentMonth: false,
                dateObj: dObj,
            });
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const dObj = new Date(year, month, d);
            days.push({
                day: d,
                isCurrentMonth: true,
                dateObj: dObj,
            });
        }

        // Next month overflow days (up to 42 cells)
        const remainingCells = 42 - days.length;
        for (let d = 1; d <= remainingCells; d++) {
            const dObj = new Date(year, month + 1, d);
            days.push({
                day: d,
                isCurrentMonth: false,
                dateObj: dObj,
            });
        }

        return days;
    }

    function formatDisplayDateToISO(displayDate: string): string {
        if (!displayDate) return '';
        if (displayDate.includes('T')) {
            return displayDate.split('T')[0];
        }
        const parts = displayDate.split(/[-/]/);
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            } else if (parts[2].length === 4) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }
        return displayDate;
    }

    function formatISODateToDisplay(isoDate: string): string {
        if (!isoDate) return '';
        const parts = isoDate.split(/[-/]/);
        if (parts.length === 3) {
            if (parts[0].length === 4) {
                return `${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}-${parts[0]}`;
            }
        }
        return isoDate;
    }

    // Custom Date Picker Popover State
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => new Date());

    function parseDisplayDate(dateStr: string): Date | null {
        if (!dateStr) return null;
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                return new Date(year, month, day);
            }
        }
        return null;
    }

    function formatDateToDisplay(d: Date): string {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function handleSelectCalendarDate(dateObj: Date) {
        setDate(formatDateToDisplay(dateObj));
        setIsDatePickerOpen(false);
    }

    function getCalendarDays() {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days = [];

        // Previous month overflow days
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
            const dObj = new Date(year, month - 1, daysInPrevMonth - i);
            days.push({
                day: daysInPrevMonth - i,
                isCurrentMonth: false,
                dateObj: dObj,
            });
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const dObj = new Date(year, month, d);
            days.push({
                day: d,
                isCurrentMonth: true,
                dateObj: dObj,
            });
        }

        // Next month overflow days (up to 42 cells)
        const remainingCells = 42 - days.length;
        for (let d = 1; d <= remainingCells; d++) {
            const dObj = new Date(year, month + 1, d);
            days.push({
                day: d,
                isCurrentMonth: false,
                dateObj: dObj,
            });
        }

        return days;
    }

    const selectedDateObj = parseDisplayDate(date);

    function generateNextInvoiceNo(existingInvoices: Invoice[]): string {
        const yearShort = new Date().getFullYear().toString().slice(-2);
        const prefix = `TL${yearShort}`;
        let maxNum = 0;
        for (const inv of existingInvoices) {
            if (inv.id && inv.id.startsWith(prefix)) {
                const numPart = parseInt(inv.id.slice(prefix.length), 10);
                if (!isNaN(numPart) && numPart > maxNum) {
                    maxNum = numPart;
                }
            }
        }
        const nextNum = maxNum + 1;
        return `${prefix}${String(nextNum).padStart(4, '0')}`;
    }

    function handleOpenCreateModal() {
        setEditingInvoiceId(null);
        setBilledTo('');
        setInvoiceNo(generateNextInvoiceNo(invoices));
        setDate(getTodayFormatted());
        setUdhayamRegNo('UDYAM-TN-22-0125179');
        setFormItems([
            { id: '1', description: '', rate: 0, qty: 1 },
        ]);
        setIsFormModalOpen(true);
    }

    function handleOpenEditModal(inv: Invoice) {
        setEditingInvoiceId(inv.id);
        setBilledTo(inv.billedTo);
        setInvoiceNo(inv.id);
        setDate(inv.date);
        setUdhayamRegNo(inv.udhayamRegNo);
        setFormItems(inv.items.map((item) => ({ ...item })));
        setIsFormModalOpen(true);
    }

    // Item handlers
    function handleAddItem() {
        const newItem: InvoiceItem = {
            id: Date.now().toString(),
            description: '',
            rate: 0,
            qty: 1,
        };
        setFormItems([...formItems, newItem]);
    }

    function handleRemoveItem(id: string) {
        if (formItems.length <= 1) return;
        setFormItems(formItems.filter((item) => item.id !== id));
    }

    function handleItemChange(id: string, field: keyof InvoiceItem, value: string | number) {
        setFormItems(
            formItems.map((item) => {
                if (item.id === id) {
                    return { ...item, [field]: value };
                }
                return item;
            })
        );
    }

    // Extract client first line
    function extractClientName(text: string): string {
        const lines = text.trim().split('\n').filter(Boolean);
        return lines[0] || 'Client Name';
    }

    // Build Current Form Invoice object for preview
    function getFormInvoiceObject(): Invoice {
        return {
            id: invoiceNo.trim() || 'TL260001',
            billedTo: billedTo.trim(),
            clientName: extractClientName(billedTo),
            date: date.trim() || '12-08-2026',
            udhayamRegNo: udhayamRegNo.trim() || 'UDYAM-TN-22-0125179',
            items: formItems.map((item) => ({
                id: item.id,
                description: item.description || 'Service Description',
                rate: Number(item.rate) || 0,
                qty: Number(item.qty) || 1,
            })),
            tax: Number(tax) || 0,
            subtotal: formSubtotal,
            total: formTotal,
            status: 'Pending',
        };
    }

    useEffect(() => {
        fetch('/api/invoices', { headers: credentialHeaders })
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error('Failed to load invoices');
            })
            .then((data: Invoice[]) => {
                if (Array.isArray(data) && data.length > 0) {
                    setInvoices(data);
                }
            })
            .catch((err) => console.log('Using local state for invoices:', err));
    }, []);

    function handlePreviewFromForm() {
        const currentInv = getFormInvoiceObject();
        setActivePreviewInvoice(currentInv);
        setIsPreviewModalOpen(true);
    }

    async function handleSaveInvoice(e: React.FormEvent) {
        e.preventDefault();
        const currentInv = getFormInvoiceObject();

        if (editingInvoiceId) {
            setInvoices(invoices.map((inv) => (inv.id === editingInvoiceId ? { ...currentInv, status: inv.status } : inv)));
            try {
                await fetch(`/api/invoices/${editingInvoiceId}`, {
                    method: 'PUT',
                    headers: jsonHeaders,
                    body: JSON.stringify(currentInv),
                });
            } catch (err) {
                console.error('Error updating invoice:', err);
            }
        } else {
            setInvoices([currentInv, ...invoices]);
            try {
                await fetch('/api/invoices', {
                    method: 'POST',
                    headers: jsonHeaders,
                    body: JSON.stringify(currentInv),
                });
            } catch (err) {
                console.error('Error saving invoice:', err);
            }
        }

        setIsFormModalOpen(false);
        setEditingInvoiceId(null);
    }

    async function handleConfirmDelete() {
        if (!deletingInvoice) return;
        const targetId = deletingInvoice.id;
        setInvoices(invoices.filter((inv) => inv.id !== targetId));
        setDeletingInvoice(null);
        try {
            await fetch(`/api/invoices/${targetId}`, { method: 'DELETE', headers: credentialHeaders });
        } catch (err) {
            console.error('Error deleting invoice:', err);
        }
    }

    function formatINR(val: number): string {
        return `₹${val.toLocaleString('en-IN')}`;
    }

    return (
        <>
            <Helmet>
                <title>The Lance | Invoices & Billing</title>
                <meta name="description" content="Generate and preview client invoices matching exact official PDF template." />
            </Helmet>

            <div className="relative h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
                <DashboardSidebar activeItem="invoices" />

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
                                            Invoices Console
                                        </h1>
                                        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
                                            Generate custom billing statements with line items and preview/download PDF matching official template.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            onClick={handleOpenCreateModal}
                                            className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 flex items-center gap-2 cursor-pointer"
                                        >
                                            <Plus size={16} />
                                            <span>Create New Invoice</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Summary Metrics */}
                            <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span className="text-xs font-bold uppercase tracking-wider">Total Invoices</span>
                                        <div className="p-2 rounded-xl bg-accent/10 text-accent">
                                            <FileText size={18} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-extrabold text-primary">
                                        {invoices.length}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                        {invoices.length === 1 ? '1 Invoice generated' : `${invoices.length} Invoices generated`}
                                    </p>
                                </div>

                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span className="text-xs font-bold uppercase tracking-wider">Total Billed</span>
                                        <div className="p-2 rounded-xl bg-accent/10 text-accent">
                                            <DollarSign size={18} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-extrabold text-primary">
                                        {formatINR(invoices.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0))}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">Across all generated statements</p>
                                </div>


                                <div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-5 shadow-sm space-y-2">
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span className="text-xs font-bold uppercase tracking-wider">Udhayam Reg No</span>
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                            <Building2 size={18} />
                                        </div>
                                    </div>
                                    <p className="text-xs font-mono font-bold text-primary truncate">UDYAM-TN-22-0125179</p>
                                    <p className="text-[11px] text-muted-foreground">Registered MSME Studio</p>
                                </div>
                            </motion.div>

                            {/* Invoices List Table */}
                            <motion.div variants={fadeUp} className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-sm overflow-hidden">
                                {/* Search & Date Range Filters */}
                                <div className="p-6 border-b border-border/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                                    <div className="relative flex-1 max-w-md">
                                        <input
                                            type="text"
                                            placeholder="Search by invoice number, client or GSTIN..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-xl text-xs font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                                        />
                                        <Search className="absolute left-3.5 top-2.5 text-muted-foreground" size={16} />
                                    </div>

                                    {/* Modern Date Range Filter Popover */}
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsDateRangePickerOpen(!isDateRangePickerOpen)}
                                            className={`px-4 py-2 bg-background border border-input rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-sm hover:border-accent transition-all cursor-pointer ${
                                                startDate || endDate ? 'border-accent ring-1 ring-accent text-accent' : 'text-primary'
                                            }`}
                                        >
                                            <Calendar size={16} className="text-accent shrink-0" />
                                            <span>
                                                {!startDate && !endDate
                                                    ? 'Select Date Range'
                                                    : startDate && endDate
                                                    ? `${formatISODateToDisplay(startDate)} to ${formatISODateToDisplay(endDate)}`
                                                    : startDate
                                                    ? `From ${formatISODateToDisplay(startDate)}`
                                                    : `Until ${formatISODateToDisplay(endDate)}`}
                                            </span>
                                            <ChevronDown size={14} className="text-muted-foreground ml-1" />
                                        </button>

                                        {isDateRangePickerOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setIsDateRangePickerOpen(false)}
                                                />
                                                <div className="absolute right-0 top-full mt-2 z-50 w-72 sm:w-80 bg-background border border-border/90 rounded-2xl shadow-2xl p-4 text-xs select-none">
                                                    {/* Month/Year Header & Nav */}
                                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-border">
                                                        <span className="font-bold text-primary text-sm">
                                                            {rangeViewDate.toLocaleString('default', { month: 'long' })}, {rangeViewDate.getFullYear()}
                                                        </span>

                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => setRangeViewDate(new Date(rangeViewDate.getFullYear(), rangeViewDate.getMonth() - 1, 1))}
                                                                className="p-1 text-muted-foreground hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                <ChevronLeft size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setRangeViewDate(new Date(rangeViewDate.getFullYear(), rangeViewDate.getMonth() + 1, 1))}
                                                                className="p-1 text-muted-foreground hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                                            >
                                                                <ChevronRight size={16} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Day Names Header */}
                                                    <div className="grid grid-cols-7 text-center font-extrabold text-[11px] text-muted-foreground mb-2">
                                                        <span>Su</span>
                                                        <span>Mo</span>
                                                        <span>Tu</span>
                                                        <span>We</span>
                                                        <span>Th</span>
                                                        <span>Fr</span>
                                                        <span>Sa</span>
                                                    </div>

                                                    {/* Calendar Days Grid */}
                                                    <div className="grid grid-cols-7 gap-1 text-center font-medium">
                                                        {getRangeCalendarDays().map((cell, idx) => {
                                                            const cellIso = getISODateString(cell.dateObj);
                                                            const isStart = startDate && cellIso === startDate;
                                                            const isEnd = endDate && cellIso === endDate;
                                                            const isInRange = startDate && endDate && cellIso > startDate && cellIso < endDate;

                                                            let styleClasses = 'text-primary hover:bg-accent/15 rounded-lg';

                                                            if (isStart || isEnd) {
                                                                styleClasses = 'bg-accent text-accent-foreground font-bold rounded-lg shadow-sm';
                                                            } else if (isInRange) {
                                                                styleClasses = 'bg-accent/20 text-accent font-semibold rounded-none';
                                                            } else if (!cell.isCurrentMonth) {
                                                                styleClasses = 'text-muted-foreground/30 hover:bg-slate-100 rounded-lg';
                                                            }

                                                            return (
                                                                <button
                                                                    key={idx}
                                                                    type="button"
                                                                    onClick={() => handleRangeCalendarClick(cell.dateObj)}
                                                                    className={`h-8 w-8 mx-auto flex items-center justify-center text-xs transition-all cursor-pointer ${styleClasses}`}
                                                                >
                                                                    {cell.day}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Selection Helper Text & Action Controls */}
                                                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-border text-xs font-semibold">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setStartDate('');
                                                                setEndDate('');
                                                            }}
                                                            className="text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                                                        >
                                                            Clear Range
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={() => setIsDateRangePickerOpen(false)}
                                                            className="px-3.5 py-1.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-accent transition-colors cursor-pointer"
                                                        >
                                                            Done
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Table Container with Minimum Height */}
                                <div className="overflow-x-auto min-h-[400px] flex flex-col justify-between">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-100 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider">
                                            <tr>
                                                <th className="p-4 pl-6 w-12 text-center">#</th>
                                                <th className="p-4">Invoice No</th>
                                                <th className="p-4">Date</th>
                                                <th className="p-4">Billed To / Client</th>
                                                <th className="p-4 text-right">Total Amount</th>
                                                <th className="p-4 pr-6 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/60 font-medium">
                                            {paginatedInvoices.length > 0 ? (
                                                paginatedInvoices.map((inv, index) => (
                                                    <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                                                        <td className="p-4 pl-6 text-center font-bold text-xs text-muted-foreground">
                                                            {startIndex + index + 1}
                                                        </td>
                                                        <td className="p-4 font-bold text-primary">
                                                            <span>{inv.id}</span>
                                                        </td>
                                                        <td className="p-4 text-muted-foreground">{inv.date}</td>
                                                        <td className="p-4 text-primary font-semibold">
                                                            <span>{inv.clientName}</span>
                                                        </td>
                                                        <td className="p-4 font-bold text-primary text-right">{formatINR(inv.total)}.00</td>
                                                        <td className="p-4 pr-6 text-right space-x-1.5 whitespace-nowrap">
                                                            <button
                                                                onClick={() => {
                                                                    setActivePreviewInvoice(inv);
                                                                    setIsPreviewModalOpen(true);
                                                                }}
                                                                className="p-2 text-accent hover:bg-accent/15 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer"
                                                                title="Preview Invoice Format"
                                                            >
                                                                <Eye size={15} />
                                                            </button>

                                                            <button
                                                                onClick={() => handleOpenEditModal(inv)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer"
                                                                title="Edit Invoice"
                                                            >
                                                                <Pencil size={15} />
                                                            </button>

                                                            <button
                                                                onClick={() => setDeletingInvoice(inv)}
                                                                className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer"
                                                                title="Delete Invoice"
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={6} className="p-12 text-center text-muted-foreground font-medium">
                                                        No invoices found matching your criteria.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer Pagination Bar */}
                                <div className="p-4 bg-slate-50/80 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs select-none">
                                    <div className="text-muted-foreground font-medium">
                                        Showing{' '}
                                        <span className="font-bold text-primary">
                                            {filteredInvoices.length === 0 ? 0 : startIndex + 1}
                                        </span>{' '}
                                        to{' '}
                                        <span className="font-bold text-primary">
                                            {Math.min(endIndex, filteredInvoices.length)}
                                        </span>{' '}
                                        of <span className="font-bold text-primary">{filteredInvoices.length}</span> entries
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
                                            disabled={currentPage === totalPages || filteredInvoices.length === 0}
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

                    {/* ── CREATE NEW INVOICE FORM MODAL ── */}
                    {isFormModalOpen && (
                        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-background border border-border rounded-2xl shadow-2xl max-w-4xl w-full p-6 lg:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto"
                                style={{ fontFamily: "'Open Sans', sans-serif" }}
                            >
                                <div className="flex items-center justify-between pb-4 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
                                            <Receipt size={20} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-primary">
                                                {editingInvoiceId ? `Edit Invoice (${editingInvoiceId})` : 'New Invoice Generator'}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">Fill in billing metadata and item details below</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsFormModalOpen(false)}
                                        className="p-1.5 rounded-full bg-slate-100 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>

                                <form onSubmit={handleSaveInvoice} className="space-y-6 text-xs">
                                    {/* Top Row — Billed To & Metadata */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Billed To */}
                                        <div className="space-y-1">
                                            <label className="block font-bold text-primary uppercase tracking-wider">
                                                Billed To <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                required
                                                rows={6}
                                                value={billedTo}
                                                onChange={(e) => setBilledTo(e.target.value)}
                                                placeholder="Client name, street address, city, state, pin code, GSTIN..."
                                                className="w-full px-3.5 py-2.5 bg-background border border-input rounded-xl font-mono text-xs text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors leading-relaxed h-[170px]"
                                            />
                                        </div>

                                        {/* Invoice Meta Controls */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block font-bold text-primary uppercase tracking-wider mb-1">
                                                    Invoice Number <span className="text-muted-foreground font-normal text-[10px] lowercase">(auto-generated)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    disabled
                                                    readOnly
                                                    value={invoiceNo}
                                                    className="w-full px-3.5 py-2 bg-slate-100/80 border border-input rounded-xl font-mono text-xs font-bold text-muted-foreground cursor-not-allowed select-none"
                                                />
                                            </div>

                                            <div>
                                                <label className="block font-bold text-primary uppercase tracking-wider mb-1">
                                                    Invoice Date <span className="text-red-500">*</span>
                                                </label>
                                                <div className="relative">
                                                    <div
                                                        onClick={() => {
                                                            if (selectedDateObj) setViewDate(selectedDateObj);
                                                            setIsDatePickerOpen(!isDatePickerOpen);
                                                        }}
                                                        className="w-full px-3.5 py-2 bg-background border border-input rounded-xl text-xs font-semibold text-primary flex items-center justify-between cursor-pointer hover:border-accent transition-colors shadow-sm"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="text-accent" size={16} />
                                                            <span>{date || 'Select Date...'}</span>
                                                        </div>
                                                        <ChevronDown size={14} className="text-muted-foreground" />
                                                    </div>

                                                    {/* Floating Modern Calendar Popup */}
                                                    {isDatePickerOpen && (
                                                        <>
                                                            <div
                                                                className="fixed inset-0 z-40"
                                                                onClick={() => setIsDatePickerOpen(false)}
                                                            />
                                                            <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-background border border-border/90 rounded-2xl shadow-2xl p-4 text-xs select-none">
                                                                {/* Header */}
                                                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                                                                    <div className="flex items-center gap-1 font-bold text-primary text-sm">
                                                                        <span>{viewDate.toLocaleString('default', { month: 'long' })}, {viewDate.getFullYear()}</span>
                                                                    </div>

                                                                    <div className="flex items-center gap-1">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                                                                            className="p-1 text-muted-foreground hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
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
                                                                <div className="grid grid-cols-7 text-center font-extrabold text-[11px] text-muted-foreground mb-2">
                                                                    <span>Su</span>
                                                                    <span>Mo</span>
                                                                    <span>Tu</span>
                                                                    <span>We</span>
                                                                    <span>Th</span>
                                                                    <span>Fr</span>
                                                                    <span>Sa</span>
                                                                </div>

                                                                {/* Calendar Days Grid */}
                                                                <div className="grid grid-cols-7 gap-1 text-center font-medium">
                                                                    {getCalendarDays().map((cell, idx) => {
                                                                        const isSelected = selectedDateObj &&
                                                                            selectedDateObj.getDate() === cell.day &&
                                                                            selectedDateObj.getMonth() === cell.dateObj.getMonth() &&
                                                                            selectedDateObj.getFullYear() === cell.dateObj.getFullYear();

                                                                        return (
                                                                            <button
                                                                                key={idx}
                                                                                type="button"
                                                                                onClick={() => handleSelectCalendarDate(cell.dateObj)}
                                                                                className={`h-8 w-8 mx-auto flex items-center justify-center rounded-lg text-xs transition-all cursor-pointer ${isSelected
                                                                                        ? 'bg-accent text-accent-foreground font-bold shadow-sm'
                                                                                        : cell.isCurrentMonth
                                                                                            ? 'text-primary hover:bg-accent/15'
                                                                                            : 'text-muted-foreground/30 hover:bg-slate-100'
                                                                                    }`}
                                                                            >
                                                                                {cell.day}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                </div>

                                                                {/* Footer Controls */}
                                                                <div className="flex items-center justify-between pt-3 mt-3 border-t border-border text-xs font-semibold">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setDate('');
                                                                            setIsDatePickerOpen(false);
                                                                        }}
                                                                        className="text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                                                                    >
                                                                        Clear
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const today = new Date();
                                                                            setViewDate(today);
                                                                            handleSelectCalendarDate(today);
                                                                        }}
                                                                        className="text-accent hover:underline font-bold cursor-pointer"
                                                                    >
                                                                        Today
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block font-bold text-primary uppercase tracking-wider mb-1">
                                                    Udhayam Reg No
                                                </label>
                                                <input
                                                    type="text"
                                                    value={udhayamRegNo}
                                                    onChange={(e) => setUdhayamRegNo(e.target.value)}
                                                    className="w-full px-3.5 py-2 bg-background border border-input rounded-xl font-mono text-xs text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line Items Section */}
                                    <div className="space-y-3 pt-4 border-t border-border">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-extrabold text-primary uppercase tracking-wider">
                                                Invoice Line Items
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={handleAddItem}
                                                className="px-3 py-1.5 bg-accent/10 text-accent font-bold rounded-lg hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1 cursor-pointer"
                                            >
                                                <Plus size={14} />
                                                <span>Add Line Item</span>
                                            </button>
                                        </div>

                                        <div className="border border-border/80 rounded-xl overflow-hidden shadow-sm">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead className="bg-slate-100 border-b border-border text-primary font-bold uppercase tracking-wider text-[11px]">
                                                    <tr>
                                                        <th className="py-2.5 px-4 w-[50%]">DESCRIPTION</th>
                                                        <th className="py-2.5 px-4 text-right w-[25%]">PRICE (RATE ₹)</th>
                                                        <th className="py-2.5 px-4 text-center w-[15%]">QTY</th>
                                                        <th className="py-2.5 px-4 text-center w-[10%]">ACTION</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/60 bg-background">
                                                    {formItems.map((item) => (
                                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                                            <td className="p-2.5">
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    placeholder="Item or service description..."
                                                                    value={item.description}
                                                                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                                                                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-primary focus:outline-none focus:border-accent"
                                                                />
                                                            </td>
                                                            <td className="p-2.5">
                                                                <input
                                                                    type="number"
                                                                    required
                                                                    min={0}
                                                                    placeholder="Rate ₹"
                                                                    value={item.rate || ''}
                                                                    onWheel={(e) => e.currentTarget.blur()}
                                                                    onChange={(e) => handleItemChange(item.id, 'rate', Number(e.target.value))}
                                                                    className="w-full px-3 py-2 bg-background border border-input rounded-lg text-xs text-right font-semibold text-primary focus:outline-none focus:border-accent"
                                                                />
                                                            </td>
                                                            <td className="p-2.5">
                                                                <input
                                                                    type="number"
                                                                    required
                                                                    min={1}
                                                                    placeholder="Qty"
                                                                    value={item.qty || ''}
                                                                    onWheel={(e) => e.currentTarget.blur()}
                                                                    onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))}
                                                                    className="w-full px-2 py-2 bg-background border border-input rounded-lg text-xs text-center font-semibold text-primary focus:outline-none focus:border-accent"
                                                                />
                                                            </td>
                                                            <td className="p-2.5 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveItem(item.id)}
                                                                    disabled={formItems.length <= 1}
                                                                    className="p-1.5 text-muted-foreground hover:text-rose-600 disabled:opacity-30 cursor-pointer"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Subtotal & Total Preview */}
                                        <div className="pt-3 flex flex-col items-end space-y-1.5 text-xs">
                                            <div className="flex items-center justify-between w-56 text-muted-foreground">
                                                <span className="text-right flex-1 pr-4">Subtotal:</span>
                                                <span className="font-bold text-primary font-mono text-right">{formatINR(formSubtotal)}</span>
                                            </div>
                                            <div className="flex items-center justify-between w-56 text-muted-foreground">
                                                <span className="text-right flex-1 pr-4">Tax:</span>
                                                <span className="font-semibold text-primary font-mono text-right">0.00</span>
                                            </div>
                                            <div className="flex items-center justify-between w-56 pt-2 border-t border-border font-bold text-sm text-primary">
                                                <span className="text-right flex-1 pr-4">Total:</span>
                                                <span className="text-accent font-mono text-right">{formatINR(formTotal)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between pt-4 border-t border-border">
                                        <button
                                            type="button"
                                            onClick={handlePreviewFromForm}
                                            className="px-5 py-2.5 bg-accent/15 text-accent border border-accent/30 font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-2 cursor-pointer"
                                        >
                                            <Eye size={16} />
                                            <span>Preview Invoice Format</span>
                                        </button>

                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsFormModalOpen(false)}
                                                className="px-4 py-2.5 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-slate-100 transition-colors cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                                            >
                                                <Check size={14} />
                                                <span>{editingInvoiceId ? 'Update Invoice' : 'Save Invoice'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}

                    {/* ── DELETE CONFIRMATION MODAL ── */}
                    {deletingInvoice && (
                        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-background border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5"
                                style={{ fontFamily: "'Open Sans', sans-serif" }}
                            >
                                <div className="flex items-center gap-3 text-rose-600">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shrink-0">
                                        <AlertTriangle size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-primary">Delete Invoice?</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">Confirm permanent removal</p>
                                    </div>
                                </div>

                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Are you sure you want to delete invoice <strong className="text-primary">{deletingInvoice.id}</strong> issued to <strong className="text-primary">{deletingInvoice.clientName}</strong>? This action cannot be undone.
                                </p>

                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={() => setDeletingInvoice(null)}
                                        className="px-4 py-2 text-xs font-semibold rounded-xl border border-input text-primary hover:bg-slate-100 transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleConfirmDelete}
                                        className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                                    >
                                        <Trash2 size={14} />
                                        <span>Delete Invoice</span>
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* ── EXACT A4 PDF PREVIEW MODAL ── */}
                    {isPreviewModalOpen && activePreviewInvoice && (
                        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
                            {/* CSS for Native A4 Page Print */}
                            <style>{`
                                @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap');

                                #printable-invoice-a4, #printable-invoice-a4 * {
                                    font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                                }

                                @media print {
                                    @page {
                                        size: A4 portrait;
                                        margin: 0;
                                    }
                                    html, body {
                                        background: #ffffff !important;
                                        overflow: visible !important;
                                        height: auto !important;
                                        margin: 0 !important;
                                        padding: 0 !important;
                                    }
                                    body * {
                                        visibility: hidden !important;
                                    }
                                    .no-print, .no-print * {
                                        display: none !important;
                                    }
                                    #printable-invoice-a4, #printable-invoice-a4 * {
                                        visibility: visible !important;
                                        font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                                    }
                                    #printable-invoice-a4 {
                                        position: fixed !important;
                                        left: 0 !important;
                                        top: 0 !important;
                                        width: 210mm !important;
                                        height: 297mm !important;
                                        padding: 15mm 18mm !important;
                                        box-shadow: none !important;
                                        border: none !important;
                                        margin: 0 !important;
                                        background: #ffffff !important;
                                        color: #000000 !important;
                                        z-index: 99999999 !important;
                                        overflow: visible !important;
                                    }
                                }
                            `}</style>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-5xl w-full my-6 overflow-hidden border border-slate-700 max-h-[92vh] flex flex-col"
                            >
                                {/* Top Modal Action Bar (Hidden when printing) */}
                                <div className="no-print bg-slate-600 text-white px-6 py-4 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <FileText size={18} className="text-accent" />
                                        <span className="font-bold text-sm">A4 Invoice Sheet Preview ({activePreviewInvoice.id})</span>
                                        <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-800 text-slate-300 rounded border border-slate-700">
                                            210mm × 297mm (A4)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => window.print()}
                                            className="px-4 py-1.5 bg-accent text-accent-foreground text-xs font-bold rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                                        >
                                            <Printer size={14} />
                                            <span>Print PDF</span>
                                        </button>
                                        <button
                                            onClick={() => setIsPreviewModalOpen(false)}
                                            className="p-1.5 rounded-full bg-slate-400 text-slate-800 hover:text-white transition-colors cursor-pointer"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Printable A4 Sheet Container */}
                                <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 flex justify-center">
                                    <div
                                        id="printable-invoice-a4"
                                        className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-8 sm:p-12 md:p-[20mm] shadow-2xl rounded-sm border border-slate-300 flex flex-col justify-between space-y-8 font-normal"
                                        style={{ fontFamily: "'Open Sans', sans-serif" }}
                                    >

                                        {/* Header Row */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src="/assets/images/logo/logo-logo.webp"
                                                    alt="The Lance Logo"
                                                    className="h-14 w-auto object-contain"
                                                />
                                            </div>

                                            <div>
                                                <h1 className="text-4xl font-bold text-[#0B2545] tracking-wider uppercase">INVOICE</h1>
                                            </div>
                                        </div>

                                        {/* Billed To & Invoice Metadata Row */}
                                        <div className="flex justify-between items-start gap-8 text-sm !mt-3">
                                            {/* Left: Billed To */}
                                            <div className="space-y-2 max-w-[60%]">
                                                <p className="font-bold text-xs text-slate-900 tracking-wider uppercase">BILLED TO:</p>
                                                <div className="whitespace-pre-line text-slate-700 leading-relaxed font-normal">
                                                    {activePreviewInvoice.billedTo}
                                                </div>
                                            </div>

                                            {/* Right: Invoice Metadata */}
                                            <div className="space-y-2 text-right shrink-0">
                                                <div className="flex justify-end items-center gap-4 text-xs">
                                                    <span className="font-bold text-slate-900 tracking-wider uppercase">INVOICE NO:</span>
                                                    <span className="font-bold text-slate-800">{activePreviewInvoice.id}</span>
                                                </div>

                                                <div className="flex justify-end items-center gap-4 text-xs">
                                                    <span className="font-bold text-slate-900 tracking-wider uppercase">DATE:</span>
                                                    <span className="text-slate-800 font-semibold">{activePreviewInvoice.date}</span>
                                                </div>

                                                <div className="flex justify-end items-center gap-4 text-xs pt-1">
                                                    <span className="font-bold text-slate-900 tracking-wider uppercase">UDHAYAM REG NO:</span>
                                                    <span className="text-slate-800 font-semibold">{activePreviewInvoice.udhayamRegNo}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Line Items Table */}
                                        <div className="!mt-0 pt-2">
                                            <table className="w-full text-left text-xs border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-500 text-slate-900 font-bold uppercase tracking-wider">
                                                        <th className="py-3 pr-4">DESCRIPTION</th>
                                                        <th className="py-3 px-4 text-right">PRICE</th>
                                                        <th className="py-3 px-4 text-center">QTY</th>
                                                        <th className="py-3 pl-4 text-right">TOTAL</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="font-normal text-slate-800 text-sm">
                                                    {activePreviewInvoice.items.map((item) => {
                                                        const rowTotal = (item.rate || 0) * (item.qty || 0);
                                                        return (
                                                            <tr key={item.id}>
                                                                <td className="py-3 pr-4 leading-relaxed">{item.description}</td>
                                                                <td className="py-3 px-4 text-right">{formatINR(item.rate)}</td>
                                                                <td className="py-3 px-4 text-center">{item.qty}</td>
                                                                <td className="py-3 pl-4 text-right font-semibold">{formatINR(rowTotal)}.00</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>

                                            {/* Subtotal & Total */}
                                            <div className="pt-4 flex flex-col items-end space-y-2 text-sm border-t border-slate-500">
                                                <div className="flex items-center justify-between w-64 text-xs font-semibold text-slate-700">
                                                    <span>SUBTOTAL</span>
                                                    <span className="font-bold text-slate-900 text-sm">{formatINR(activePreviewInvoice.subtotal)}.00</span>
                                                </div>

                                                <div className="flex items-center justify-between w-64 text-xs text-slate-600">
                                                    <span>Tax</span>
                                                    <span>{activePreviewInvoice.tax || 0}.00</span>
                                                </div>

                                                <div className="flex items-center justify-between w-64 pt-2 border-t border-slate-500 font-bold text-slate-900 text-lg">
                                                    <span>TOTAL</span>
                                                    <span>{formatINR(activePreviewInvoice.total)}.00</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            {/* Thank You Note */}
                                            <div className="text-center pt-8">
                                                <p className="text-slate-800 font-medium text-sm">Thank you for your business!</p>
                                            </div>

                                            {/* Bottom Grey Banner Footer */}
                                            <div className="bg-slate-200 text-slate-700 font-medium text-xs rounded-xl px-6 py-4 flex items-center justify-between gap-3 mt-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={14} className="text-slate-600" />
                                                    <span>Coimbatore, Tamilnadu, IN</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} className="text-slate-600" />
                                                    <span>+91 97919 55479</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Globe size={14} className="text-slate-600" />
                                                    <span>www.thelance.in</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}

                </main>
            </div>
        </>
    );
}
