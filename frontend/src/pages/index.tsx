import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import { motion, useInView, animate } from 'motion/react';
import { CheckCircle, Globe, Smartphone, Cloud, Code2, Quote, Rocket, ShieldCheck } from 'lucide-react';
import { home } from 'virtual:content';
import { Heading3D } from '../components/Heading3D';

const serviceIcons = [Globe, Smartphone, Cloud, Code2];

function AnimatedNumber({ value }: { value: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-20px' });
    const match = value.match(/^(\d+)(.*)$/);
    const targetNum = match ? parseInt(match[1], 10) : 0;
    const suffix = match ? match[2] : value;

    const [currentCount, setCurrentCount] = useState(0);

    useEffect(() => {
        if (!isInView || targetNum === 0) return;

        const controls = animate(0, targetNum, {
            duration: 2.5,
            ease: [0.16, 1, 0.3, 1],
            onUpdate(val) {
                setCurrentCount(Math.round(val));
            },
        });

        return () => controls.stop();
    }, [isInView, targetNum]);

    return (
        <span ref={ref}>
            {match ? `${currentCount}${suffix}` : value}
        </span>
    );
}

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const site = 'https://thelance.in';
const pageTitle = 'The Lance — Software Development Studio';
const pageDescription =
    'The Lance builds scalable web apps, mobile products, and cloud infrastructure for ambitious businesses. Senior engineers, transparent process, built to last.';

export default function HomePage() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = useCallback((direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const scrollAmount = 400;
        if (direction === 'left') {
            if (container.scrollLeft <= 10) {
                container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            }
        } else {
            if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 20) {
                container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    }, []);

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={site} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={site} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@graph': [
                        { '@type': 'WebSite', '@id': `${site}/#website`, name: 'The Lance', url: `${site}/` },
                        { '@type': 'Organization', '@id': `${site}/#organization`, name: 'The Lance', url: `${site}/` },
                        {
                            '@type': 'WebPage',
                            '@id': `${site}/#webpage`,
                            url: `${site}/`,
                            isPartOf: { '@id': `${site}/#website` },
                            about: { '@id': `${site}/#organization` },
                            datePublished: '2026-08-06',
                            dateModified: '2026-08-06',
                        },
                    ],
                })}</script>
            </Helmet>

            <main>
                {/* ── HERO ── */}
                <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
                    {/* Geometric background accents */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Grid dots */}
                        <div
                            className="absolute inset-0 opacity-[0.04]"
                            style={{
                                backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                            }}
                        />
                        {/* Sleek Tech Background Accents — right side */}
                        <div className="absolute top-12 -right-12 w-1/2 h-full pointer-events-none transform lg:translate-x-12 opacity-70">
                            <svg width="100%" height="100%" viewBox="0 0 600 700" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="300" cy="280" r="180" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="6 6" />
                                <circle cx="300" cy="280" r="120" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.08" />
                                <line x1="60" y1="280" x2="540" y2="280" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.1" />
                                <line x1="300" y1="40" x2="300" y2="520" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.08" />
                                <circle cx="300" cy="100" r="4" fill="hsl(var(--accent))" fillOpacity="0.4" />
                                <circle cx="300" cy="460" r="4" fill="hsl(var(--accent))" fillOpacity="0.4" />
                                <circle cx="120" cy="280" r="4" fill="hsl(var(--accent))" fillOpacity="0.4" />
                                <circle cx="480" cy="280" r="4" fill="hsl(var(--accent))" fillOpacity="0.4" />
                            </svg>
                        </div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-6 lg:px-8 w-full py-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            {/* Left — Text */}
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={stagger}
                            >
                                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                                    <div className="h-px w-8 bg-accent" />
                                    <span className="text-xs font-semibold tracking-widest text-accent uppercase">
                                        Software Development Studio
                                    </span>
                                </motion.div>

                                <Heading3D as="h1" className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-[1.05] tracking-tight mb-6">
                                    {home.hero.headline}
                                </Heading3D>

                                <motion.p
                                    variants={fadeUp}
                                    className="text-md text-muted-foreground leading-relaxed max-w-lg mb-10"
                                >
                                    {home.hero.subheadline}
                                </motion.p>

                                <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                                    <Link
                                        to="/contact"
                                        className="px-7 py-3.5 bg-primary text-primary-foreground font-semibold text-sm tracking-wide rounded transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
                                    >
                                        {home.hero.cta_primary}
                                    </Link>
                                    <Link
                                        to="/services"
                                        className="px-7 py-3.5 border border-primary text-primary font-semibold text-sm tracking-wide rounded transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                                    >
                                        {home.hero.cta_secondary}
                                    </Link>
                                </motion.div>
                            </motion.div>

                            {/* Right — Glassmorphic UI Cards composition (desktop only) */}
                            <div className="hidden lg:flex items-center justify-center">
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    className="relative w-[420px] h-[420px] flex items-center justify-center"
                                >
                                    {/* Soft background ambient glow */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 0.25, scale: 1 }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                        className="absolute inset-4 rounded-full bg-accent/20 blur-3xl pointer-events-none"
                                    />

                                    {/* Outer Orbit Wireframe Ring */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 1.15 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                                        className="absolute inset-4 rounded-3xl border border-primary/10 bg-primary/[0.02]"
                                    />

                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                                        className="absolute inset-16 rounded-2xl border border-accent/20"
                                    />

                                    {/* 1. Top-Left Glass Card: Live System Metric */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -40, y: -30 }}
                                        animate={{ opacity: 1, x: 0, y: 0 }}
                                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
                                        className="absolute -top-2 left-2 z-20"
                                    >
                                        <motion.div
                                            animate={{
                                                y: [0, -10, 0, 6, 0],
                                                x: [0, 4, 0, -4, 0],
                                                rotate: [0, 1.5, 0, -1.5, 0],
                                            }}
                                            transition={{
                                                duration: 5.5,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            }}
                                            whileHover={{ scale: 1.06, y: -4 }}
                                            className="bg-background/80 backdrop-blur-md border border-emerald-500/30 p-3 px-4 rounded-2xl shadow-xl flex items-center gap-3 cursor-pointer hover:border-emerald-500/60 hover:shadow-emerald-500/10 transition-colors"
                                        >
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">System Status</p>
                                                <p className="text-xs font-bold text-primary">99.9% Production Ready</p>
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                    {/* 2. Top-Right Glass Card: Code Snippet */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 40, y: -30 }}
                                        animate={{ opacity: 1, x: 0, y: 0 }}
                                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.5 }}
                                        className="absolute top-6 -right-6 z-20"
                                    >
                                        <motion.div
                                            animate={{
                                                y: [0, 8, 0, -10, 0],
                                                x: [0, -5, 0, 5, 0],
                                                rotate: [0, -2, 0, 2, 0],
                                            }}
                                            transition={{
                                                duration: 6.2,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                                delay: 0.3,
                                            }}
                                            whileHover={{ scale: 1.06, y: -4 }}
                                            className="bg-primary/95 text-primary-foreground p-3.5 px-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md max-w-[210px] cursor-pointer hover:border-white/20 transition-colors"
                                        >
                                            <div className="flex items-center gap-1.5 mb-2 border-b border-white/10 pb-1.5">
                                                <div className="w-2 h-2 rounded-full bg-rose-400" />
                                                <div className="w-2 h-2 rounded-full bg-amber-400" />
                                                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                                <span className="text-[10px] font-mono opacity-50 ml-1">app.config.ts</span>
                                            </div>
                                            <p className="font-mono text-[11px] leading-relaxed">
                                                <span className="text-accent">const</span> studio = <span className="text-emerald-400">'The Lance'</span>;
                                            </p>
                                        </motion.div>
                                    </motion.div>

                                    {/* 3. Bottom-Left Glass Card: Fast Delivery */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -40, y: 30 }}
                                        animate={{ opacity: 1, x: 0, y: 0 }}
                                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.6 }}
                                        className="absolute bottom-6 -left-6 z-20"
                                    >
                                        <motion.div
                                            animate={{
                                                y: [0, -8, 0, 10, 0],
                                                x: [0, 6, 0, -3, 0],
                                                rotate: [0, -1, 0, 1.5, 0],
                                            }}
                                            transition={{
                                                duration: 5.8,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                                delay: 0.5,
                                            }}
                                            whileHover={{ scale: 1.06, y: -4 }}
                                            className="bg-background/85 backdrop-blur-md border border-accent/30 p-3 px-4 rounded-2xl shadow-xl flex items-center gap-3 cursor-pointer hover:border-accent/60 hover:shadow-accent/10 transition-colors"
                                        >
                                            <motion.div
                                                animate={{ y: [0, -2, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                                className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0"
                                            >
                                                <Rocket size={18} />
                                            </motion.div>
                                            <div>
                                                <p className="text-xs font-bold text-primary">Agile Sprints</p>
                                                <p className="text-[10px] text-muted-foreground">Rapid Deployment</p>
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                    {/* 4. Bottom-Right Glass Card: Senior Engineers */}
                                    <motion.div
                                        initial={{ opacity: 0, x: 40, y: 30 }}
                                        animate={{ opacity: 1, x: 0, y: 0 }}
                                        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.7 }}
                                        className="absolute -bottom-2 right-2 z-20"
                                    >
                                        <motion.div
                                            animate={{
                                                y: [0, 10, 0, -6, 0],
                                                x: [0, -4, 0, 4, 0],
                                                rotate: [0, 2, 0, -1, 0],
                                            }}
                                            transition={{
                                                duration: 6.5,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                                delay: 0.2,
                                            }}
                                            whileHover={{ scale: 1.06, y: -4 }}
                                            className="bg-background/85 backdrop-blur-md border border-primary/15 p-3 px-4 rounded-2xl shadow-xl flex items-center gap-3 cursor-pointer hover:border-primary/40 hover:shadow-primary/10 transition-colors"
                                        >
                                            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-primary">Senior Talent Only</p>
                                                <p className="text-[10px] text-muted-foreground">Clean Architecture</p>
                                            </div>
                                        </motion.div>
                                    </motion.div>

                                    {/* Central Logo Glassmorphic Card */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.4, rotate: -6 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        transition={{ duration: 0.7, ease: [0.175, 0.885, 0.32, 1.275], delay: 0.3 }}
                                        className="z-10"
                                    >
                                        <motion.div
                                            animate={{
                                                y: [0, -5, 0, 5, 0],
                                                scale: [1, 1.03, 1, 0.98, 1],
                                            }}
                                            transition={{
                                                duration: 5,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                            }}
                                            whileHover={{ scale: 1.1, rotate: 3 }}
                                            className="w-28 h-28 rounded-3xl bg-white/90 backdrop-blur-xl flex items-center justify-center shadow-2xl border border-accent/30 p-5 ring-1 ring-black/5 cursor-pointer"
                                        >
                                            <img
                                                src="/assets/images/logo/logo.png"
                                                alt="The Lance Logo Icon"
                                                className="h-20 w-auto object-contain drop-shadow"
                                            />
                                        </motion.div>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>

                        {/* Stats row */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="mt-20 pt-10 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-8"
                        >
                            {home.stats.map((stat) => (
                                <motion.div key={stat.id} variants={fadeUp} className="text-center md:text-left">
                                    <div className="text-4xl font-bold text-primary tracking-tight">
                                        <AnimatedNumber value={stat.value} />
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1 tracking-wide">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* ── SERVICES ── */}
                <section className="py-28 bg-muted/30">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="mb-16"
                        >
                            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                                <div className="h-px w-8 bg-accent" />
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Services</span>
                            </motion.div>
                            <Heading3D as="h2" className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-4">
                                {home.services.heading}
                            </Heading3D>
                            <motion.p variants={fadeUp} className="text-md text-muted-foreground max-w-xl">
                                {home.services.subheading}
                            </motion.p>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {home.services.items.map((svc, i) => {
                                const Icon = serviceIcons[i % serviceIcons.length];
                                return (
                                    <motion.div
                                        key={svc.id}
                                        variants={fadeUp}
                                        className="group relative bg-background rounded-xl p-8 border border-border hover:border-accent transition-all duration-300 hover:shadow-lg overflow-hidden"
                                    >
                                        {/* Hover teal accent */}
                                        <div className="absolute top-0 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                                        <div className="flex items-start gap-5">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors duration-300">
                                                <Icon size={22} className="text-primary group-hover:text-accent transition-colors duration-300" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-bold text-primary mb-2 tracking-tight">{svc.title}</h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{svc.description}</p>
                                                <span className="inline-block text-xs font-mono text-accent bg-accent/5 border border-accent/15 px-3 py-1 rounded-full">
                                                    {svc.tag}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                {/* ── ABOUT / WHY US ── */}
                <section className="py-28 bg-background">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            {/* Left */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={stagger}
                            >
                                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                                    <div className="h-px w-8 bg-accent" />
                                    <span className="text-xs font-semibold tracking-widest text-accent uppercase">Why The Lance</span>
                                </motion.div>
                                <Heading3D as="h2" className="text-4xl md:text-5xl font-bold text-primary tracking-tight leading-tight mb-6">
                                    {home.about.heading}
                                </Heading3D>
                                {home.about.body.map((p) => (
                                    <motion.p key={p.id} variants={fadeUp} className="text-md text-muted-foreground leading-relaxed">
                                        {p.text}
                                    </motion.p>
                                ))}
                                {/* Geometric accent */}
                                <motion.div variants={fadeUp} className="mt-10 flex items-center gap-2">
                                    <div className="h-px w-12 bg-accent" />
                                    <div className="h-2 w-2 rounded-full bg-accent" />
                                    <div className="h-px w-6 bg-accent opacity-40" />
                                </motion.div>
                            </motion.div>

                            {/* Right — Points */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={stagger}
                                className="flex flex-col gap-5"
                            >
                                {home.about.points.map((pt) => (
                                    <motion.div
                                        key={pt.id}
                                        variants={fadeUp}
                                        className="flex items-start gap-4 p-5 rounded-xl border border-border bg-muted/20 hover:border-accent/30 transition-colors duration-300"
                                    >
                                        <CheckCircle size={20} className="text-accent flex-shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium text-foreground leading-relaxed">{pt.text}</span>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── TESTIMONIALS ── */}
                <section className="py-28 bg-muted/20 overflow-hidden relative">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={stagger}
                                className="text-left max-w-xl"
                            >
                                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                                    <div className="h-px w-8 bg-accent" />
                                    <span className="text-xs font-semibold tracking-widest text-accent uppercase">Testimonials</span>
                                </motion.div>
                                <Heading3D as="h2" className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-4">
                                    {home.testimonials.heading}
                                </Heading3D>
                                <motion.p variants={fadeUp} className="text-md text-muted-foreground">
                                    {home.testimonials.subheading}
                                </motion.p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Scrollable track — hidden scrollbar */}
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto max-w-7xl mx-auto px-6 lg:px-8 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {home.testimonials.items.map((t: any) => (
                            <div
                                key={t.id}
                                className="group relative bg-background rounded-xl border border-border p-8 hover:border-accent/40 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col flex-shrink-0 snap-start w-[85vw] sm:w-[420px] lg:w-[380px]"
                            >
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                <Quote size={28} className="text-accent/20 mb-5 flex-shrink-0" />
                                <p className="text-sm text-foreground leading-relaxed flex-1 mb-7">
                                    {t.quote}
                                </p>
                                <div className="flex items-center gap-4 pt-5 border-t border-border">
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-primary-foreground">
                                            {t.name.split(' ').map((n: string) => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-primary">{t.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {t.title}<span className="mx-1.5">·</span>{t.company}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="relative py-28 bg-primary overflow-hidden">
                    {/* Geometric accents — Constructivist & Bauhaus pattern */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div
                            className="absolute inset-0 opacity-[0.04]"
                            style={{
                                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                backgroundSize: '40px 40px',
                            }}
                        />
                        {/* Constructivist & Bauhaus geometric pattern overlay — above footer */}
                        <div className="absolute right-0 top-0 w-full lg:w-1/2 h-full opacity-25 pointer-events-none transform lg:translate-x-12">
                            <svg width="100%" height="100%" viewBox="0 0 650 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g opacity="0.9">
                                    {/* --- Concentric Arches (Bauhaus / Boho Arch motif) --- */}
                                    <path d="M 160 260 A 90 90 0 0 1 340 260" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
                                    <path d="M 180 260 A 70 70 0 0 1 320 260" stroke="white" strokeWidth="1" strokeOpacity="0.3" fill="none" />
                                    <path d="M 200 260 A 50 50 0 0 1 300 260" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.35" fill="none" strokeDasharray="4 4" />
                                    
                                    {/* Arch vertical drop lines */}
                                    <line x1="160" y1="260" x2="160" y2="380" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.3" />
                                    <line x1="180" y1="260" x2="180" y2="380" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
                                    <line x1="320" y1="260" x2="320" y2="380" stroke="white" strokeWidth="1" strokeOpacity="0.2" />
                                    <line x1="340" y1="260" x2="340" y2="380" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.3" />

                                    {/* --- Multi-layered Lance Triangles with Parallel Hatching --- */}
                                    <g transform="translate(250, 90)">
                                        <polygon points="0,-55 50,30 -50,30" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeOpacity="0.45" fill="hsl(var(--accent))" fillOpacity="0.06" />
                                        <polygon points="0,-35 32,20 -32,20" stroke="white" strokeWidth="1" strokeOpacity="0.3" fill="none" />
                                        <line x1="-25" y1="12" x2="25" y2="12" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.35" />
                                        <line x1="-15" y1="0" x2="15" y2="0" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.35" />
                                        <line x1="-8" y1="-12" x2="8" y2="-12" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.35" />
                                    </g>

                                    {/* --- Constructivist Intersecting Axis Grid Lines & Terminal Nodes --- */}
                                    <line x1="60" y1="150" x2="520" y2="150" stroke="white" strokeWidth="1" strokeOpacity="0.18" />
                                    <line x1="60" y1="160" x2="420" y2="160" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.25" />
                                    
                                    <line x1="420" y1="30" x2="420" y2="440" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.25" />
                                    <line x1="430" y1="60" x2="430" y2="410" stroke="white" strokeWidth="1" strokeOpacity="0.15" />

                                    {/* --- Split Circles (Constructivist Dual-Tone motif) --- */}
                                    <g transform="translate(110, 150)">
                                        <circle cx="0" cy="0" r="24" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
                                        <path d="M 0 -24 A 24 24 0 0 1 0 24 Z" fill="hsl(var(--accent))" fillOpacity="0.25" />
                                        <circle cx="0" cy="0" r="4" fill="white" fillOpacity="0.8" />
                                    </g>

                                    <g transform="translate(460, 220)">
                                        <circle cx="0" cy="0" r="30" stroke="white" strokeWidth="1" strokeOpacity="0.25" fill="none" />
                                        <path d="M -30 0 A 30 30 0 0 1 30 0 Z" fill="white" fillOpacity="0.1" />
                                        <circle cx="0" cy="0" r="14" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.4" fill="none" />
                                        <circle cx="0" cy="0" r="4" fill="hsl(var(--accent))" fillOpacity="0.8" />
                                    </g>

                                    {/* --- 4-Point Starburst Sparkles --- */}
                                    <g transform="translate(360, 70)">
                                        <path d="M 0 -12 Q 0 0 12 0 Q 0 0 0 12 Q 0 0 -12 0 Q 0 0 0 -12 Z" fill="hsl(var(--accent))" fillOpacity="0.6" />
                                    </g>
                                    <g transform="translate(90, 320)">
                                        <path d="M 0 -10 Q 0 0 10 0 Q 0 0 0 10 Q 0 0 -10 0 Q 0 0 0 -10 Z" fill="hsl(var(--accent))" fillOpacity="0.5" />
                                    </g>
                                    <g transform="translate(490, 360)">
                                        <path d="M 0 -10 Q 0 0 10 0 Q 0 0 0 10 Q 0 0 -10 0 Q 0 0 0 -10 Z" fill="white" fillOpacity="0.4" />
                                    </g>

                                    {/* --- Directional Arrow Vectors & Terminal Dots --- */}
                                    <g transform="translate(200, 400)">
                                        <line x1="0" y1="0" x2="150" y2="0" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeOpacity="0.35" />
                                        <polygon points="150,0 138,-5 138,5" fill="hsl(var(--accent))" fillOpacity="0.5" />
                                        <circle cx="0" cy="0" r="4" fill="white" fillOpacity="0.7" />
                                        <circle cx="50" cy="0" r="3" fill="hsl(var(--accent))" fillOpacity="0.5" />
                                    </g>

                                    {/* Geometric Corner Frames & Accent Dots */}
                                    <rect x="70" y="30" width="400" height="400" rx="4" stroke="white" strokeWidth="1" strokeOpacity="0.08" />
                                    <circle cx="70" cy="30" r="3" fill="hsl(var(--accent))" fillOpacity="0.6" />
                                    <circle cx="470" cy="30" r="3" fill="hsl(var(--accent))" fillOpacity="0.6" />
                                    <circle cx="70" cy="430" r="3" fill="hsl(var(--accent))" fillOpacity="0.6" />
                                    <circle cx="470" cy="430" r="3" fill="hsl(var(--accent))" fillOpacity="0.6" />
                                </g>
                            </svg>
                        </div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="max-w-2xl"
                        >
                            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                                <div className="h-px w-8 bg-accent" />
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Get Started</span>
                            </motion.div>
                            <Heading3D as="h2" className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground tracking-tight leading-tight mb-6">
                                {home.cta.heading}
                            </Heading3D>
                            <motion.p variants={fadeUp} className="text-md text-primary-foreground/70 mb-10 leading-relaxed">
                                {home.cta.subheading}
                            </motion.p>
                            <motion.div variants={fadeUp}>
                                <Link
                                    to="/contact"
                                    className="inline-block px-8 py-4 bg-accent text-accent-foreground font-bold text-sm tracking-wide rounded transition-all duration-200 hover:opacity-90 hover:shadow-lg"
                                >
                                    {home.cta.button}
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </>
    );
}
