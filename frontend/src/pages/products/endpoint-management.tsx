import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
    Monitor,
    Activity,
    Users,
    Bell,
    Usb,
    Globe,
    AppWindow,
    BarChart2,
    Package,
    CheckCircle2,
    ArrowRight,
    ShieldCheck,
} from 'lucide-react';
import { endpoint_management } from 'virtual:content';

const featureIcons = [Monitor, Activity, Users, Bell, Usb, Globe, AppWindow, BarChart2, Package];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const site = 'https://thelance.dev';
const pageTitle = 'Endpoint Management System — The Lance';
const pageDescription =
    'Complete endpoint visibility and control. Device inventory, live monitoring, USB & website blocking, application management, and more. $500 per user/year.';

export default function EndpointManagementPage() {
    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={`${site}/products/endpoint-management`} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${site}/products/endpoint-management`} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'SoftwareApplication',
                    '@id': `${site}/products/endpoint-management#product`,
                    name: 'Endpoint Management System',
                    applicationCategory: 'SecurityApplication',
                    operatingSystem: 'Windows, macOS, Linux',
                    offers: {
                        '@type': 'Offer',
                        price: '500',
                        priceCurrency: 'USD',
                        priceSpecification: {
                            '@type': 'UnitPriceSpecification',
                            price: '500',
                            priceCurrency: 'USD',
                            unitText: 'per user per year',
                        },
                    },
                    url: `${site}/products/endpoint-management`,
                    isPartOf: { '@id': `${site}/#website` },
                })}</script>
            </Helmet>

            <main>
                {/* ── HERO ── */}
                <section className="relative pt-32 pb-24 bg-background overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />
                    {/* Geometric accent — right */}
                    <div className="absolute top-0 right-0 w-[480px] h-full pointer-events-none opacity-[0.06]">
                        <svg width="100%" height="100%" viewBox="0 0 480 600" fill="none">
                            <rect x="60" y="60" width="360" height="360" rx="2" stroke="hsl(var(--accent))" strokeWidth="1.5" />
                            <rect x="110" y="110" width="260" height="260" rx="2" stroke="hsl(var(--accent))" strokeWidth="1" />
                            <rect x="160" y="160" width="160" height="160" rx="2" stroke="hsl(var(--accent))" strokeWidth="1" />
                            <circle cx="240" cy="240" r="70" stroke="hsl(var(--accent))" strokeWidth="1" />
                            <circle cx="60" cy="60" r="6" fill="hsl(var(--accent))" />
                            <circle cx="420" cy="60" r="6" fill="hsl(var(--accent))" />
                            <circle cx="60" cy="420" r="6" fill="hsl(var(--accent))" />
                            <circle cx="420" cy="420" r="6" fill="hsl(var(--accent))" />
                            <circle cx="240" cy="240" r="8" fill="hsl(var(--accent))" />
                        </svg>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            {/* Left */}
                            <motion.div initial="hidden" animate="visible" variants={stagger}>
                                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
                                    <div className="h-px w-8 bg-accent" />
                                    <span className="text-xs font-semibold tracking-widest text-accent uppercase">
                                        {endpoint_management.hero.eyebrow}
                                    </span>
                                </motion.div>
                                <motion.h1
                                    variants={fadeUp}
                                    className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight leading-tight mb-5"
                                >
                                    {endpoint_management.hero.heading}
                                </motion.h1>
                                <motion.p variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed mb-10">
                                    {endpoint_management.hero.subheading}
                                </motion.p>
                                <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                                    <Link
                                        to="/products/ems-pricing"
                                        className="px-7 py-3.5 bg-primary text-primary-foreground font-bold text-sm tracking-wide rounded transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
                                    >
                                        {endpoint_management.hero.cta_primary}
                                    </Link>
                                    <a
                                        href="#features"
                                        className="px-7 py-3.5 border border-primary text-primary font-semibold text-sm tracking-wide rounded transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                                    >
                                        {endpoint_management.hero.cta_secondary}
                                    </a>
                                </motion.div>
                            </motion.div>

                            {/* Right — stat cards */}
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={stagger}
                                className="hidden lg:grid grid-cols-2 gap-4"
                            >
                                {[
                                    { value: '9', label: 'Feature Modules' },
                                    { value: 'Real-time', label: 'Live Monitoring' },
                                    { value: '99.9%', label: 'Uptime SLA' },
                                    { value: '$500', label: 'Per User / Year' },
                                ].map((stat) => (
                                    <motion.div
                                        key={stat.label}
                                        variants={fadeUp}
                                        className="rounded-xl border border-border bg-background p-6 hover:border-accent/30 transition-colors duration-300"
                                    >
                                        <div className="text-3xl font-bold text-primary tracking-tight mb-1" style={{ fontFamily: 'var(--font-heading)' }}>
                                            {stat.value}
                                        </div>
                                        <div className="text-xs text-muted-foreground tracking-wide">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── FEATURES ── */}
                <section id="features" className="py-24 bg-muted/20">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="mb-16 text-center"
                        >
                            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-4">
                                <div className="h-px w-8 bg-accent" />
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Features</span>
                                <div className="h-px w-8 bg-accent" />
                            </motion.div>
                            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-4">
                                Everything you need to manage endpoints
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Nine purpose-built modules covering every aspect of endpoint visibility, security, and control.
                            </motion.p>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {endpoint_management.features.map((feature, i) => {
                                const Icon = featureIcons[i % featureIcons.length];
                                return (
                                    <motion.div
                                        key={feature.id}
                                        variants={fadeUp}
                                        className="group relative rounded-xl border border-border bg-background p-7 hover:border-accent/40 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                        <div className="w-11 h-11 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center mb-5 group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors duration-300">
                                            <Icon size={20} className="text-primary group-hover:text-accent transition-colors duration-300" />
                                        </div>
                                        <h3 className="text-base font-bold text-primary mb-2 tracking-tight">{feature.title}</h3>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                {/* ── PRICING ── */}
                <section id="pricing" className="py-24 bg-background">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="mb-14 text-center"
                        >
                            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-4">
                                <div className="h-px w-8 bg-accent" />
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Pricing</span>
                                <div className="h-px w-8 bg-accent" />
                            </motion.div>
                            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-4">
                                {endpoint_management.pricing.heading}
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-lg text-muted-foreground">
                                {endpoint_management.pricing.subheading}
                            </motion.p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, ease: 'easeOut' as const }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="relative rounded-2xl border-2 border-accent bg-background overflow-hidden shadow-2xl">
                                {/* Top accent bar */}
                                <div className="h-1 w-full bg-accent" />

                                {/* Badge */}
                                <div className="absolute top-6 right-6">
                                    <span className="text-xs font-bold tracking-widest text-accent-foreground bg-accent px-3 py-1 rounded-full uppercase">
                                        All features included
                                    </span>
                                </div>

                                <div className="p-10 md:p-12">
                                    {/* Price */}
                                    <div className="mb-8">
                                        <div className="flex items-end gap-2 mb-1">
                                            <span className="text-6xl font-bold text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                                {endpoint_management.pricing.price}
                                            </span>
                                            <span className="text-muted-foreground text-base mb-3">{endpoint_management.pricing.period}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{endpoint_management.pricing.note}</p>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-px w-full bg-border mb-8" />

                                    {/* Includes */}
                                    <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-5">
                                        {endpoint_management.pricing.includes_heading}
                                    </h3>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
                                        {endpoint_management.pricing.includes.map((item) => (
                                            <li key={item.id} className="flex items-center gap-3">
                                                <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                                                <span className="text-sm text-foreground">{item.text}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA */}
                                    <Link
                                        to="/products/ems-pricing"
                                        className="block w-full text-center px-8 py-4 bg-primary text-primary-foreground font-bold text-sm tracking-wide rounded-lg transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-lg"
                                    >
                                        {endpoint_management.pricing.cta}
                                    </Link>
                                    <p className="text-center text-xs text-muted-foreground mt-3">{endpoint_management.pricing.cta_sub}</p>
                                </div>
                            </div>

                            {/* Trust badges */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={stagger}
                                className="flex flex-wrap justify-center gap-6 mt-10"
                            >
                                {['SOC 2 Type II', '99.9% Uptime SLA', 'Volume discounts available', '48-hr onboarding'].map((badge) => (
                                    <motion.div key={badge} variants={fadeUp} className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <ShieldCheck size={15} className="text-accent" />
                                        <span>{badge}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="relative py-24 bg-primary overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />
                    <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
                        <svg width="100%" height="100%" viewBox="0 0 400 500" fill="none">
                            <rect x="40" y="40" width="280" height="280" rx="2" stroke="white" strokeWidth="1" />
                            <rect x="80" y="80" width="200" height="200" rx="2" stroke="white" strokeWidth="1" />
                            <circle cx="180" cy="180" r="80" stroke="white" strokeWidth="1" />
                        </svg>
                    </div>
                    <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                        >
                            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-6">
                                <div className="h-px w-8 bg-accent" />
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Get Started</span>
                                <div className="h-px w-8 bg-accent" />
                            </motion.div>
                            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight mb-4">
                                {endpoint_management.cta.heading}
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-lg text-primary-foreground/70 mb-10 max-w-xl mx-auto">
                                {endpoint_management.cta.subheading}
                            </motion.p>
                            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
                                <Link
                                    to="/products/ems-pricing"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-bold text-sm tracking-wide rounded transition-all duration-200 hover:opacity-90 hover:shadow-lg"
                                >
                                    {endpoint_management.cta.button}
                                    <ArrowRight size={16} />
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </>
    );
}
