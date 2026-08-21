import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Mail, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { contact } from 'virtual:content';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const site = 'https://thelance.in';
const pageTitle = 'Contact — The Lance';
const pageDescription =
    'Start a project with The Lance. Tell us what you\'re building and we\'ll get back to you within 24 hours.';

export default function ContactPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const honeypotRef = useRef<HTMLInputElement>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // Honeypot check — abort silently if filled by a bot
        if (honeypotRef.current?.value) return;

        const form = e.currentTarget;
        const data = new FormData(form);

        const name = (data.get('name') as string).trim();
        const email = (data.get('email') as string).trim();
        const service = (data.get('service') as string) || '';
        const budget = (data.get('budget') as string) || '';
        const message = (data.get('message') as string).trim();

        setStatus('loading');
        setErrorMsg('');

        try {
            // Field mapping: only the message textarea goes in messages_attributes[0].body.
            // All other fields (dropdowns, radios, checkboxes) must be added to conversation.data as { "Label": value } pairs.
            const res = await fetch('/api/contact/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversation: {
                        messages_attributes: [{ body: message || 'New project inquiry' }],
                        data: {
                            __gd_contact_form_title: 'Start a Project',
                            'Service needed': service,
                            'Budget range': budget,
                        },
                    },
                    user: { email, name },
                }),
            });

            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.error || 'Submission failed');
            }
            setStatus('success');
            form.reset();
        } catch (err) {
            setStatus('error');
            setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        }
    }

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={`${site}/contact`} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${site}/contact`} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'ContactPage',
                    '@id': `${site}/contact#webpage`,
                    name: pageTitle,
                    url: `${site}/contact`,
                    isPartOf: { '@id': `${site}/#website` },
                    about: { '@id': `${site}/#organization` },
                })}</script>
            </Helmet>

            <main>
                {/* ── HERO ── */}
                <section className="relative pt-32 pb-16 bg-background overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-[0.04] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />
                    {/* Unique Geometric Pattern — top right (Contact: Grid Axes & Split Spheres) */}
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
                            className="max-w-2xl"
                        >
                            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
                                <div className="h-px w-8 bg-accent" />
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">
                                    {contact.hero.eyebrow}
                                </span>
                            </motion.div>
                            <motion.h1
                                variants={fadeUp}
                                className="text-5xl md:text-6xl font-bold text-primary tracking-tight leading-tight mb-5"
                            >
                                {contact.hero.heading}
                            </motion.h1>
                            <motion.p variants={fadeUp} className="text-xl text-muted-foreground leading-relaxed">
                                {contact.hero.subheading}
                            </motion.p>
                        </motion.div>
                    </div>
                </section>

                {/* ── FORM + INFO ── */}
                <section className="py-16 bg-background">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                            {/* ── FORM ── */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={stagger}
                                className="lg:col-span-2"
                            >
                                {status === 'success' ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.4, ease: 'easeOut' as const }}
                                        className="rounded-2xl border border-accent/30 bg-accent/5 p-12 flex flex-col items-start gap-5"
                                    >
                                        <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                                            <CheckCircle size={28} className="text-accent" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-primary mb-2 tracking-tight">Message sent!</h2>
                                            <p className="text-muted-foreground leading-relaxed">
                                                Thanks for reaching out. We'll review your project and get back to you within 24 hours.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setStatus('idle')}
                                            className="mt-2 text-sm font-semibold text-accent hover:opacity-80 transition-opacity"
                                        >
                                            Send another message
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        variants={stagger}
                                        onSubmit={handleSubmit}
                                        className="group relative rounded-2xl border border-border bg-background p-8 lg:p-10 hover:border-accent/40 hover:shadow-lg transition-all duration-300 overflow-hidden"
                                        noValidate
                                    >
                                        {/* Top accent bar */}
                                        <div className="absolute top-0 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                                        {/* Honeypot — positioned off-screen, never included in POST body */}
                                        <input
                                            ref={honeypotRef}
                                            type="text"
                                            name="_gotcha"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            style={{ position: 'absolute', left: '-9999px' }}
                                            aria-hidden="true"
                                        />

                                        <motion.h2 variants={fadeUp} className="text-xl font-bold text-primary tracking-tight mb-8">
                                            Tell us about your project
                                        </motion.h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            {/* Name */}
                                            <motion.div variants={fadeUp} className="flex flex-col gap-2">
                                                <label htmlFor="name" className="text-xs font-semibold tracking-wide text-foreground uppercase">
                                                    Your name <span className="text-accent">*</span>
                                                </label>
                                                <input
                                                    id="name"
                                                    name="name"
                                                    type="text"
                                                    required
                                                    placeholder="Alex Johnson"
                                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200"
                                                />
                                            </motion.div>

                                            {/* Email */}
                                            <motion.div variants={fadeUp} className="flex flex-col gap-2">
                                                <label htmlFor="email" className="text-xs font-semibold tracking-wide text-foreground uppercase">
                                                    Email address <span className="text-accent">*</span>
                                                </label>
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    placeholder="alex@company.com"
                                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200"
                                                />
                                            </motion.div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            {/* Service */}
                                            <motion.div variants={fadeUp} className="flex flex-col gap-2">
                                                <label htmlFor="service" className="text-xs font-semibold tracking-wide text-foreground uppercase">
                                                    Service needed
                                                </label>
                                                <select
                                                    id="service"
                                                    name="service"
                                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200 appearance-none"
                                                >
                                                    <option value="">Select a service…</option>
                                                    {contact.services_options.map((opt) => (
                                                        <option key={opt.id} value={opt.label}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </motion.div>

                                            {/* Budget */}
                                            <motion.div variants={fadeUp} className="flex flex-col gap-2">
                                                <label htmlFor="budget" className="text-xs font-semibold tracking-wide text-foreground uppercase">
                                                    Budget range
                                                </label>
                                                <select
                                                    id="budget"
                                                    name="budget"
                                                    className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200 appearance-none"
                                                >
                                                    <option value="">Select a range…</option>
                                                    <option value="Under $10k">Under $10k</option>
                                                    <option value="$10k – $25k">$10k – $25k</option>
                                                    <option value="$25k – $50k">$25k – $50k</option>
                                                    <option value="$50k – $100k">$50k – $100k</option>
                                                    <option value="$100k+">$100k+</option>
                                                    <option value="Not sure yet">Not sure yet</option>
                                                </select>
                                            </motion.div>
                                        </div>

                                        {/* Message */}
                                        <motion.div variants={fadeUp} className="flex flex-col gap-2 mb-8">
                                            <label htmlFor="message" className="text-xs font-semibold tracking-wide text-foreground uppercase">
                                                Project details <span className="text-accent">*</span>
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                required
                                                rows={5}
                                                placeholder="Tell us what you're building, the problem you're solving, and any relevant timeline or technical context…"
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200 resize-none"
                                            />
                                        </motion.div>

                                        {/* Error */}
                                        {status === 'error' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive text-sm"
                                            >
                                                <AlertCircle size={16} className="flex-shrink-0" />
                                                <span>{errorMsg || 'Something went wrong. Please try again.'}</span>
                                            </motion.div>
                                        )}

                                        <motion.div variants={fadeUp}>
                                            <button
                                                type="submit"
                                                disabled={status === 'loading'}
                                                className="px-8 py-3.5 bg-primary text-primary-foreground font-semibold text-sm tracking-wide rounded transition-all duration-200 hover:bg-accent hover:text-accent-foreground disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                {status === 'loading' ? 'Sending…' : 'Send Message'}
                                            </button>
                                        </motion.div>
                                    </motion.form>
                                )}
                            </motion.div>

                            {/* ── INFO SIDEBAR ── */}
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={stagger}
                                className="flex flex-col gap-6"
                            >
                                {/* Info cards */}
                                {[
                                    {
                                        icon: Mail,
                                        label: 'Email us',
                                        value: contact.info.email,
                                    },
                                    {
                                        icon: MapPin,
                                        label: 'Location',
                                        value: contact.info.location,
                                    },
                                    {
                                        icon: Clock,
                                        label: 'Response time',
                                        value: contact.info.response,
                                    },
                                ].map(({ icon: Icon, label, value }) => (
                                    <motion.div
                                        key={label}
                                        variants={fadeUp}
                                        className="flex items-start gap-4 p-6 rounded-xl border border-border bg-background hover:border-accent/30 transition-colors duration-300"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Icon size={18} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">{label}</p>
                                            <p className="text-sm font-medium text-foreground">{value}</p>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Navy accent card */}
                                <motion.div
                                    variants={fadeUp}
                                    className="relative rounded-xl bg-primary p-7 overflow-hidden mt-2"
                                >
                                    <div
                                        className="absolute inset-0 opacity-[0.06] pointer-events-none"
                                        style={{
                                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                                            backgroundSize: '24px 24px',
                                        }}
                                    />
                                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-accent rounded-tl-xl" />
                                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-accent rounded-br-xl" />
                                    <div className="relative">
                                        <p className="text-xs font-semibold tracking-widest text-accent uppercase mb-3">Limited availability</p>
                                        <p className="text-sm text-primary-foreground/80 leading-relaxed">
                                            We take on a select number of new projects each quarter to ensure every client gets our full attention.
                                        </p>
                                    </div>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
