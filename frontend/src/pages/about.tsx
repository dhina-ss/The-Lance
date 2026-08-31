import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ShieldCheck, Users, Telescope } from 'lucide-react';
import { about } from 'virtual:content';
import { Heading3D } from '../components/Heading3D';

const valueIcons = [Sparkles, ShieldCheck, Users, Telescope];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const site = 'https://thelance.in';
const pageTitle = 'About — The Lance';
const pageDescription =
    'Meet the team behind The Lance. Senior engineers building precise, scalable software since 2018. Our story, values, and mission.';

export default function AboutPage() {
    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={`${site}/about`} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${site}/about`} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'AboutPage',
                    '@id': `${site}/about#webpage`,
                    name: pageTitle,
                    url: `${site}/about`,
                    isPartOf: { '@id': `${site}/#website` },
                    about: { '@id': `${site}/#organization` },
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
                                    {about.hero.eyebrow}
                                </span>
                            </motion.div>
                            <Heading3D as="h1" className="text-5xl md:text-6xl font-bold text-primary tracking-tight leading-tight mb-6">
                                {about.hero.heading}
                            </Heading3D>
                            <motion.p variants={fadeUp} className="text-md text-muted-foreground leading-relaxed">
                                {about.hero.subheading}
                            </motion.p>
                        </motion.div>
                    </div>
                </section>

                {/* ── STORY ── */}
                <section className="py-20 bg-muted/20">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={stagger}
                            >
                                <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                                    <div className="h-px w-8 bg-accent" />
                                    <span className="text-xs font-semibold tracking-widest text-accent uppercase">Our Story</span>
                                </motion.div>
                                <Heading3D as="h2" className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-8">
                                    {about.story.heading}
                                </Heading3D>
                                {about.story.paragraphs.map((p) => (
                                    <motion.p key={p.id} variants={fadeUp} className="text-base text-muted-foreground leading-relaxed mb-5">
                                        {p.text}
                                    </motion.p>
                                ))}
                            </motion.div>

                            {/* Mission statement card */}
                            <motion.div
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, ease: 'easeOut' as const, delay: 0.15 }}
                                className="relative rounded-2xl bg-primary p-10 overflow-hidden"
                            >
                                {/* Dot grid */}
                                <div
                                    className="absolute inset-0 opacity-[0.06] pointer-events-none"
                                    style={{
                                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                        backgroundSize: '28px 28px',
                                    }}
                                />
                                {/* Corner accents */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent rounded-tl-2xl" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent rounded-br-2xl" />

                                <div className="relative">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-px w-8 bg-accent" />
                                        <span className="text-xs font-semibold tracking-widest text-accent uppercase">Mission</span>
                                    </div>
                                    <p className="text-2xl md:text-3xl font-bold text-primary-foreground leading-snug tracking-tight">
                                        {about.mission.statement}
                                    </p>
                                    <div className="mt-8 flex items-center gap-2">
                                        <div className="h-px w-12 bg-accent" />
                                        <div className="h-2 w-2 rounded-full bg-accent" />
                                        <div className="h-px w-6 bg-accent opacity-40" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── VALUES ── */}
                <section className="py-24 bg-background">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="mb-14"
                        >
                            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                                <div className="h-px w-8 bg-accent" />
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Values</span>
                            </motion.div>
                            <Heading3D as="h2" className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
                                {about.mission.heading}
                            </Heading3D>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {about.mission.values.map((val, i) => {
                                const Icon = valueIcons[i % valueIcons.length];
                                return (
                                    <motion.div
                                        key={val.id}
                                        variants={fadeUp}
                                        className="group relative rounded-xl border border-border bg-background p-8 hover:border-accent/40 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                                        <div className="flex items-start gap-5">
                                            <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors duration-300">
                                                <Icon size={20} className="text-primary group-hover:text-accent transition-colors duration-300" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-primary mb-2 tracking-tight">{val.title}</h3>
                                                <p className="text-sm text-muted-foreground leading-relaxed">{val.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </div>
                </section>

                {/* ── TEAM ── */}
                <section className="py-24 bg-muted/20">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="mb-14"
                        >
                            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                                <div className="h-px w-8 bg-accent" />
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Team</span>
                            </motion.div>
                            <Heading3D as="h2" className="text-4xl md:text-5xl font-bold text-primary tracking-tight mb-4">
                                {about.team.heading}
                            </Heading3D>
                            <motion.p variants={fadeUp} className="text-md text-muted-foreground max-w-xl">
                                {about.team.subheading}
                            </motion.p>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {about.team.members.map((member) => (
                                <motion.div
                                    key={member.id}
                                    variants={fadeUp}
                                    className="group rounded-xl border border-border bg-background p-8 hover:border-accent/30 hover:shadow-md transition-all duration-300"
                                >
                                    {/* Avatar placeholder */}
                                    <div className="flex items-center gap-5 mb-5">
                                        <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                                            <span className="text-lg font-bold text-accent tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                                {member.name.split(' ').map((n) => n[0]).join('')}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-primary tracking-tight">{member.name}</h3>
                                            <p className="text-sm text-accent font-medium">{member.role}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
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
                    <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
                        <svg width="100%" height="100%" viewBox="0 0 400 500" fill="none">
                            <rect x="40" y="40" width="280" height="280" rx="2" stroke="white" strokeWidth="1" />
                            <rect x="80" y="80" width="200" height="200" rx="2" stroke="white" strokeWidth="1" />
                            <circle cx="180" cy="180" r="80" stroke="white" strokeWidth="1" />
                        </svg>
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
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">Work With Us</span>
                            </motion.div>
                            <Heading3D as="h2" className="text-4xl md:text-5xl font-bold text-primary-foreground tracking-tight leading-tight mb-4">
                                {about.cta.heading}
                            </Heading3D>
                            <motion.p variants={fadeUp} className="text-md text-primary-foreground/70 mb-10 leading-relaxed">
                                {about.cta.subheading}
                            </motion.p>
                            <motion.div variants={fadeUp}>
                                <Link
                                    to="/contact"
                                    className="inline-block px-8 py-4 bg-accent text-accent-foreground font-bold text-sm tracking-wide rounded transition-all duration-200 hover:opacity-90 hover:shadow-lg"
                                >
                                    {about.cta.button}
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </>
    );
}
