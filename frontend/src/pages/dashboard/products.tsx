import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    ArrowLeft,
    ChevronRight,
    Layers,
    Plus,
    X,
    Check,
    FolderPlus,
    Server,
    TicketCheck,
    Globe,
    Zap,
    Shield,
    Clock,
    Users,
    Activity,
    Building2,
    Cpu,
    Cloud,
} from 'lucide-react';
import { resolveIcon, PRODUCTS, ProductConfig } from '../../lib/products';
import DashboardSidebar from '../../components/DashboardSidebar';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

export default function ProductConsolePage() {
    const navigate = useNavigate();

    const [productsList, setProductsList] = useState<ProductConfig[]>(PRODUCTS);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state - Project Name, Tagline, Description
    const [formName, setFormName] = useState('');
    const [formTagline, setFormTagline] = useState('');
    const [formDescription, setFormDescription] = useState('');

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
            href: `/dashboard/tenants/${id}`,
        };

        setProductsList((prev) => [newProduct, ...prev]);
        setIsModalOpen(false);

        // Reset form
        setFormName('');
        setFormTagline('');
        setFormDescription('');
    }

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
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
                                >
                                    <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                                    <span>Back to Dashboard</span>
                                </button>

                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
                                    <div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-2">
                                            <Layers size={14} className="text-accent" />
                                            <span>Console</span>
                                            <ChevronRight size={12} className="text-border" />
                                            <span className="text-primary font-semibold">Products Overview</span>
                                        </div>

                                        <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                                            Products Console
                                        </h1>
                                        <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                                            Explore, manage, and monitor licensed product platforms and provisioned tenants across your organization.
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <button
                                            onClick={() => setIsModalOpen(true)}
                                            className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 flex items-center gap-2"
                                        >
                                            <Plus size={16} />
                                            <span>Add New Project</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Product List Cards */}
                            <motion.div variants={fadeUp} className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                                    <h2 className="text-base font-extrabold text-primary flex items-center gap-2">
                                        <Layers size={18} className="text-accent" />
                                        Licensed Platforms & Products
                                    </h2>
                                    <span className="text-xs font-semibold text-muted-foreground">
                                        {productsList.length} Active Platforms
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {productsList.map((prod) => {
                                        const prodIcon = resolveIcon(prod.iconName, 26);

                                        return (
                                            <div
                                                key={prod.id}
                                                onClick={() => navigate(`/dashboard/tenants/${prod.id}`)}
                                                className="group bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all flex flex-col justify-between space-y-6 cursor-pointer"
                                            >
                                                <div className="space-y-4">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex items-center gap-3.5">
                                                            <div className={`w-14 h-14 rounded-2xl ${prod.bgColor} ${prod.accentColor} border ${prod.borderColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                                                                {prodIcon}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <h3 className="text-base font-bold text-primary group-hover:text-accent transition-colors">
                                                                        {prod.name}
                                                                    </h3>
                                                                    <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-accent/10 text-accent border border-accent/20">
                                                                        {prod.badge}
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-0.5">{prod.tagline}</p>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} className="text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                                                    </div>

                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        {prod.description}
                                                    </p>
                                                </div>

                                                {/* Card Footer Action */}
                                                <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                                                    <span className="text-xs text-muted-foreground font-medium">Click to view tenant list table</span>
                                                    <span className="text-xs font-bold text-accent group-hover:underline underline-offset-2 transition-colors">
                                                        Manage Tenants Table →
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
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
                                        className="p-1.5 rounded-full bg-slate-100 text-muted-foreground hover:text-primary transition-colors"
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
                                            className="px-4 py-2.5 border border-input text-xs font-semibold rounded-xl text-primary hover:bg-slate-100 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-1.5 shadow-md"
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

