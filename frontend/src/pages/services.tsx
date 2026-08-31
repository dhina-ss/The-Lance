import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Globe, Smartphone, Cloud, Code2, CheckCircle2, ArrowRight } from 'lucide-react';
import { services } from 'virtual:content';
import { Heading3D } from '../components/Heading3D';

const serviceIcons = [Globe, Smartphone, Cloud, Code2];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const site = 'https://thelance.in';
const pageTitle = 'Services — The Lance';
const pageDescription =
    'Web development, mobile apps, cloud & DevOps, and custom software. The Lance delivers senior-engineered solutions built to scale.';

export default function ServicesPage() {
    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={`${site}/services`} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${site}/services`} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'WebPage',
                    '@id': `${site}/services#webpage`,
                    name: pageTitle,
                    url: `${site}/services`,
                    isPartOf: { '@id': `${site}/#website` },
                    about: { '@id': `${site}/#organization` },
                })}</script>
            </Helmet>

            <main>
                {/* ── HERO ── */}
                <section className="relative pt-32 bg-background overflow-hidden">
                    {/* Grid dot background */}
                    <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />
                    {/* Geometric Pattern — top right (Grid Axes & Split Spheres) */}
                    <div className="absolute top-0 right-0 w-[550px] h-[550px] pointer-events-none opacity-30 transform translate-x-16 -translate-y-12">
                        <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g opacity="0.9">
                                {/* Large Split Circle Sphere */}
                                <g transform="translate(250, 150)">
                                    <circle cx="0" cy="0" r="65" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
                                    <path d="M 0 -65 A 65 65 0 0 1 0 65 Z" fill="hsl(var(--accent))" fillOpacity="0.15" />
                                    <circle cx="0" cy="0" r="35" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.25" fill="none" />
                                    <circle cx="0" cy="0" r="8" fill="hsl(var(--accent))" fillOpacity="0.7" />
                                </g>

                                {/* Intersecting Grid Axes */}
                                <line x1="40" y1="150" x2="360" y2="150" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.15" />
                                <line x1="40" y1="162" x2="280" y2="162" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.25" />

                                <line x1="250" y1="30" x2="250" y2="340" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.2" />

                                {/* Stacked Pill wireframe */}
                                <rect x="80" y="220" width="120" height="60" rx="30" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.3" fill="none" />
                                <circle cx="110" cy="250" r="4" fill="hsl(var(--accent))" fillOpacity="0.6" />

                                {/* 4-Point Starburst Sparkles */}
                                <g transform="translate(100, 80)">
                                    <path d="M 0 -11 Q 0 0 11 0 Q 0 0 0 11 Q 0 0 -11 0 Q 0 0 0 -11 Z" fill="hsl(var(--accent))" fillOpacity="0.6" />
                                </g>
                                <g transform="translate(320, 280)">
                                    <path d="M 0 -9 Q 0 0 9 0 Q 0 0 0 9 Q 0 0 -9 0 Q 0 0 0 -9 Z" fill="hsl(var(--primary))" fillOpacity="0.4" />
                                </g>
                            </g>
                        </svg>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={stagger}
                            className="max-w-3xl"
                        >
                            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
                                <div className="h-px w-8 bg-accent" />
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">
                                    {services.hero.eyebrow}
                                </span>
                            </motion.div>
                            <Heading3D as="h1" className="text-5xl md:text-6xl font-bold text-primary tracking-tight leading-tight mb-6">
                                {services.hero.heading}
                            </Heading3D>
                            <motion.p variants={fadeUp} className="text-md text-muted-foreground leading-relaxed">
                                {services.hero.subheading}
                            </motion.p>
                        </motion.div>
                    </div>
                </section>

                {/* ── SERVICE CARDS ── */}
                <section className="py-20 bg-background">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="flex flex-col gap-8"
                        >
                            {services.services.map((svc, i) => {
                                const Icon = serviceIcons[i % serviceIcons.length];
                                const isEven = i % 2 === 0;
                                return (
                                    <motion.div
                                        key={svc.id}
                                        variants={fadeUp}
                                        className="group relative rounded-2xl border border-border bg-background hover:border-accent/40 transition-all duration-300 hover:shadow-xl overflow-hidden"
                                    >
                                        {/* Top accent bar */}
                                        <div className="absolute top-0 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                                        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-0 ${isEven ? '' : 'lg:flex-row-reverse'}`}>
                                            {/* Left — Info */}
                                            <div className="p-8 lg:p-12 flex flex-col justify-center">
                                                <div className="flex items-center gap-4 mb-5">
                                                    <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors duration-300">
                                                        <Icon size={22} className="text-primary group-hover:text-accent transition-colors duration-300" />
                                                    </div>
                                                    <span className="text-xs font-mono text-accent bg-accent/5 border border-accent/15 px-3 py-1 rounded-full">
                                                        {svc.tag}
                                                    </span>
                                                </div>
                                                <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight mb-2">
                                                    {svc.title}
                                                </h2>
                                                <p className="text-accent font-medium text-sm mb-4">{svc.tagline}</p>
                                                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                                                    {svc.description}
                                                </p>
                                                <div className="mt-6">
                                                    <Link
                                                        to="/contact"
                                                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors duration-200"
                                                    >
                                                        Start this project
                                                        <ArrowRight size={16} />
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Right — Features */}
                                            <div className="bg-muted/20 border-t lg:border-t-0 lg:border-l border-border p-8 lg:p-12 flex flex-col justify-center">
                                                <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-6">
                                                    What's included
                                                </h3>
                                                <ul className="flex flex-col gap-4">
                                                    {svc.features.map((feat) => (
                                                        <li key={feat.id} className="flex items-start gap-3">
                                                            <CheckCircle2 size={18} className="text-accent flex-shrink-0 mt-0.5" />
                                                            <span className="text-sm text-foreground leading-relaxed">{feat.text}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                {/* ── PROCESS ── */}
                <section className="py-24 bg-muted/30">
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
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Our Process</span>
                                <div className="h-px w-8 bg-accent" />
                            </motion.div>
                            <Heading3D as="h2" className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-4">
                                {services.process.heading}
                            </Heading3D>
                            <motion.p variants={fadeUp} className="text-md text-muted-foreground max-w-xl mx-auto">
                                {services.process.subheading}
                            </motion.p>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {services.process.steps.map((step, i) => (
                                <motion.div
                                    key={step.id}
                                    variants={fadeUp}
                                    className="relative bg-background rounded-xl p-8 border border-border hover:border-accent/30 transition-colors duration-300"
                                >
                                    {/* Connector line (desktop) */}
                                    {i < services.process.steps.length - 1 && (
                                        <div className="hidden lg:block absolute top-12 -right-3 w-6 h-px bg-accent/30 z-10" />
                                    )}
                                    <div className="text-4xl font-bold text-accent/20 mb-4 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                        {step.number}
                                    </div>
                                    <h3 className="text-lg font-bold text-primary mb-3 tracking-tight">{step.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                                </motion.div>
                            ))}
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
                    <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                        >
                            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-6">
                                <div className="h-px w-8 bg-accent" />
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Let's Build</span>
                                <div className="h-px w-8 bg-accent" />
                            </motion.div>
                            <Heading3D as="h2" className="text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight mb-4">
                                {services.cta.heading}
                            </Heading3D>
                            <motion.p variants={fadeUp} className="text-md text-primary-foreground/70 mb-10 max-w-xl mx-auto">
                                {services.cta.subheading}
                            </motion.p>
                            <motion.div variants={fadeUp}>
                                <Link
                                    to="/contact"
                                    className="inline-block px-8 py-4 bg-accent text-accent-foreground font-bold text-sm tracking-wide rounded transition-all duration-200 hover:opacity-90 hover:shadow-lg"
                                >
                                    {services.cta.button}
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </>
    );
}
