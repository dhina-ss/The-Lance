import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { work } from 'virtual:content';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
};

const site = 'https://thelance.dev';
const pageTitle = 'Work — The Lance';
const pageDescription =
    'Case studies and projects from The Lance — fintech platforms, mobile apps, DevOps infrastructure, and more. Real outcomes for real clients.';

export default function WorkPage() {
    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={`${site}/work`} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${site}/work`} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'WebPage',
                    '@id': `${site}/work#webpage`,
                    name: pageTitle,
                    url: `${site}/work`,
                    isPartOf: { '@id': `${site}/#website` },
                    about: { '@id': `${site}/#organization` }
                })}</script>
            </Helmet>

            <main>
                {/* ── HERO ── */}
                <section className="relative pt-32 pb-20 bg-background overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }} />

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
                            className="max-w-3xl">

                            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
                                <div className="h-px w-8 bg-accent" />
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">
                                    {work.hero.eyebrow}
                                </span>
                            </motion.div>
                            <motion.h1
                                variants={fadeUp}
                                className="text-5xl md:text-6xl font-bold text-primary tracking-tight leading-tight mb-6">

                                {work.hero.heading}
                            </motion.h1>
                            <motion.p variants={fadeUp} className="text-xl text-muted-foreground leading-relaxed">
                                {work.hero.subheading}
                            </motion.p>
                        </motion.div>
                    </div>
                </section>

                {/* ── PROJECT GRID ── */}
                <section className="py-16 bg-background">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {work.projects.map((project, i) =>
                                <motion.div
                                    key={project.id}
                                    variants={fadeUp}
                                    className={`group relative rounded-2xl border border-border bg-background hover:border-accent/40 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${i === 0 ? 'lg:col-span-2' : ''}`}>

                                    {/* Top accent bar */}
                                    <div className="absolute top-0 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                                    <div className={`flex flex-col ${i === 0 ? 'lg:flex-row' : ''} flex-1`}>
                                        {/* Main content */}
                                        <div className={`p-8 lg:p-10 flex flex-col justify-between flex-1 ${i === 0 ? 'lg:w-3/5' : ''}`}>
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <span className="text-xs font-semibold tracking-widest text-accent uppercase">
                                                        {project.category}
                                                    </span>
                                                </div>
                                                <h2 className="text-2xl md:text-3xl font-bold text-primary tracking-tight mb-2">
                                                    {project.title}
                                                </h2>
                                                <p className="text-accent font-medium text-sm mb-4">{project.tagline}</p>
                                                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                                    {project.description}
                                                </p>
                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-2 mb-6">
                                                    {project.tags.map((tag) =>
                                                        <span
                                                            key={tag}
                                                            className="text-xs font-mono text-primary bg-primary/5 border border-primary/10 px-3 py-1 rounded-full">

                                                            {tag}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {project.id === 'project-1' || project.id === 'proj-ems' ?
                                                <Link
                                                    to="/products/ems-pricing"
                                                    className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:opacity-80 transition-opacity self-start duration-200">
                                                    View pricing
                                                    <ArrowRight size={15} />
                                                </Link> :

                                                <Link
                                                    to="/contact"
                                                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent transition-colors duration-200 self-start">

                                                    Start a similar project
                                                    <ArrowRight size={15} />
                                                </Link>
                                            }
                                        </div>

                                        {/* Outcomes panel */}
                                        <div className={`bg-primary/[0.03] border-t lg:border-t-0 lg:border-l border-border p-8 lg:p-10 flex flex-col justify-center gap-6 ${i === 0 ? 'lg:w-2/5' : ''}`}>
                                            <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2">
                                                Outcomes
                                            </h3>
                                            {project.outcomes.map((outcome) =>
                                                <div key={outcome.id} className="flex items-baseline gap-3">
                                                    <span className="text-3xl font-bold text-primary tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                                        {outcome.metric}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground">{outcome.label}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="relative py-24 bg-primary overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '40px 40px'
                        }} />

                    <div className="absolute left-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
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
                            variants={stagger}>

                            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-6">
                                <div className="h-px w-8 bg-accent" />
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Get Started</span>
                                <div className="h-px w-8 bg-accent" />
                            </motion.div>
                            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight mb-4">
                                {work.cta.heading}
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-lg text-primary-foreground/70 mb-10 max-w-xl mx-auto">
                                {work.cta.subheading}
                            </motion.p>
                            <motion.div variants={fadeUp}>
                                <Link
                                    to="/contact"
                                    className="inline-block px-8 py-4 bg-accent text-accent-foreground font-bold text-sm tracking-wide rounded transition-all duration-200 hover:opacity-90 hover:shadow-lg">

                                    {work.cta.button}
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </>);

}