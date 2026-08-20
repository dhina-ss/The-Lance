import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, ShieldCheck, ArrowRight, Users, ChevronDown } from 'lucide-react';
import { ems_pricing } from 'virtual:content';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const site = 'https://thelance.dev';
const pageTitle = 'Pricing — Endpoint Management System | The Lance';
const pageDescription =
    'Endpoint Management System pricing. $500/user/year or $50/user/month. Volume discount to $450/user/year for teams over 10 users. All features included.';

export default function EmsPricingPage() {
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('yearly');
    const [userCount, setUserCount] = useState(5);
    const [openFaq, setOpenFaq] = useState<string | null>(null);

    const p = ems_pricing.plans;
    const isVolume = userCount > p.volume_threshold;

    const unitPrice =
        billing === 'yearly'
            ? isVolume
                ? p.price_volume_yearly
                : p.price_yearly
            : isVolume
                ? p.price_volume_monthly
                : p.price_monthly;

    const totalPrice = unitPrice * userCount;

    const annualEquivalent =
        billing === 'monthly'
            ? (isVolume ? p.price_volume_monthly : p.price_monthly) * 12
            : null;

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={`${site}/products/ems-pricing`} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${site}/products/ems-pricing`} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
            </Helmet>

            <main>
                {/* ── HERO ── */}
                <section className="relative pt-32 pb-16 bg-background overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-[0.035] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }}
                    />
                    <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
                        <motion.div initial="hidden" animate="visible" variants={stagger}>
                            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-5">
                                <div className="h-px w-8 bg-accent" />
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">
                                    {ems_pricing.hero.eyebrow}
                                </span>
                                <div className="h-px w-8 bg-accent" />
                            </motion.div>
                            <motion.h1
                                variants={fadeUp}
                                className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary tracking-tight mb-5"
                            >
                                {ems_pricing.hero.heading}
                            </motion.h1>
                            <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                {ems_pricing.hero.subheading}
                            </motion.p>
                        </motion.div>
                    </div>
                </section>

                {/* ── BILLING TOGGLE + CALCULATOR ── */}
                <section className="py-16 bg-background">
                    <div className="max-w-4xl mx-auto px-6 lg:px-8">

                        {/* Toggle */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: 'easeOut' as const }}
                            className="flex justify-center mb-12"
                        >
                            <div className="relative flex items-center bg-primary/10 rounded-full p-1 gap-1">
                                <button
                                    onClick={() => setBilling('monthly')}
                                    className={`relative z-10 px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${billing === 'monthly'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {p.monthly_label}
                                </button>
                                <button
                                    onClick={() => setBilling('yearly')}
                                    className={`relative z-10 flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${billing === 'yearly'
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {p.yearly_label}
                                    <span className="text-xs font-bold bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                                        {p.yearly_badge}
                                    </span>
                                </button>
                            </div>
                        </motion.div>

                        {/* Pricing card */}
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: 'easeOut' as const }}
                            className="relative rounded-2xl border-2 border-accent bg-background overflow-hidden shadow-2xl"
                        >
                            <div className="h-1 w-full bg-accent" />

                            {/* Volume badge */}
                            <AnimatePresence>
                                {isVolume && (
                                    <motion.div
                                        key="volume-badge"
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.85 }}
                                        transition={{ duration: 0.25 }}
                                        className="absolute top-5 right-5"
                                    >
                                        <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-accent-foreground bg-accent px-3 py-1.5 rounded-full uppercase">
                                            <Users size={12} />
                                            Volume discount applied
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="p-8 md:p-12">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                                    {/* Left — price + calculator */}
                                    <div>
                                        {/* Price display */}
                                        <div className="mb-8">
                                            <div className="flex items-end gap-2 mb-1">
                                                <AnimatePresence mode="wait">
                                                    <motion.span
                                                        key={`${billing}-${isVolume}`}
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="text-6xl font-bold text-primary tracking-tight"
                                                        style={{ fontFamily: 'var(--font-heading)' }}
                                                    >
                                                        {p.currency}{unitPrice}
                                                    </motion.span>
                                                </AnimatePresence>
                                                <span className="text-muted-foreground text-sm mb-3">
                                                    {billing === 'yearly' ? p.period_yearly : p.period_monthly}
                                                </span>
                                            </div>

                                            {/* Strikethrough for volume */}
                                            <AnimatePresence>
                                                {isVolume && (
                                                    <motion.p
                                                        key="strikethrough"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="text-sm text-muted-foreground mb-1"
                                                    >
                                                        <span className="line-through mr-2">
                                                            {p.currency}{billing === 'yearly' ? p.price_yearly : p.price_monthly}
                                                        </span>
                                                        <span className="text-accent font-semibold">Volume rate</span>
                                                    </motion.p>
                                                )}
                                            </AnimatePresence>

                                            {annualEquivalent && (
                                                <p className="text-xs text-muted-foreground">
                                                    Equivalent to {p.currency}{annualEquivalent}/user/year billed monthly
                                                </p>
                                            )}
                                        </div>

                                        {/* User count slider */}
                                        <div className="mb-8">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                    <Users size={15} className="text-accent" />
                                                    Number of users
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setUserCount(Math.max(1, userCount - 1))}
                                                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-sm font-bold text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                                                    >
                                                        −
                                                    </button>
                                                    <span className="w-10 text-center text-lg font-bold text-primary tabular-nums">
                                                        {userCount}
                                                    </span>
                                                    <button
                                                        onClick={() => setUserCount(Math.min(500, userCount + 1))}
                                                        className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-sm font-bold text-muted-foreground hover:border-accent hover:text-accent transition-colors"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                            <input
                                                type="range"
                                                min={1}
                                                max={200}
                                                value={userCount}
                                                onChange={(e) => setUserCount(Number(e.target.value))}
                                                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                                                style={{
                                                    background: `linear-gradient(to right, hsl(var(--accent)) 0%, hsl(var(--accent)) ${(userCount / 200) * 100}%, hsl(var(--border)) ${(userCount / 200) * 100}%, hsl(var(--border)) 100%)`,
                                                }}
                                            />
                                            <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                                <span>1</span>
                                                <span className="text-accent font-semibold">10+ = volume rate</span>
                                                <span>200</span>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="rounded-xl bg-primary/[0.04] border border-primary/10 p-5 mb-8">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-muted-foreground">
                                                    {userCount} user{userCount !== 1 ? 's' : ''} × {p.currency}{unitPrice} / {billing === 'yearly' ? 'year' : 'month'}
                                                </span>
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <AnimatePresence mode="wait">
                                                    <motion.span
                                                        key={`total-${billing}-${userCount}`}
                                                        initial={{ opacity: 0, y: -6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: 6 }}
                                                        transition={{ duration: 0.18 }}
                                                        className="text-3xl font-bold text-primary"
                                                        style={{ fontFamily: 'var(--font-heading)' }}
                                                    >
                                                        {p.currency}{totalPrice.toLocaleString()}
                                                    </motion.span>
                                                </AnimatePresence>
                                                <span className="text-muted-foreground text-sm mb-1">
                                                    / {billing === 'yearly' ? 'year' : 'month'}
                                                </span>
                                            </div>
                                            {isVolume && (
                                                <p className="text-xs text-accent mt-1 font-medium">
                                                    You save {p.currency}{(billing === 'yearly' ? (p.price_yearly - p.price_volume_yearly) : (p.price_monthly - p.price_volume_monthly)) * userCount} with volume pricing
                                                </p>
                                            )}
                                        </div>

                                        {/* CTA */}
                                        <Link
                                            to="/contact"
                                            className="block w-full text-center px-8 py-4 bg-primary text-primary-foreground font-bold text-sm tracking-wide rounded-lg transition-all duration-200 hover:bg-accent hover:text-accent-foreground hover:shadow-lg"
                                        >
                                            {p.cta}
                                        </Link>
                                        <p className="text-center text-xs text-muted-foreground mt-2">{p.cta_sub}</p>
                                    </div>

                                    {/* Right — feature list */}
                                    <div>
                                        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-5">
                                            {ems_pricing.includes_heading}
                                        </h3>
                                        <ul className="space-y-3">
                                            {ems_pricing.includes.map((item) => (
                                                <li key={item.id} className="flex items-center gap-3">
                                                    <CheckCircle2 size={15} className="text-accent flex-shrink-0" />
                                                    <span className="text-sm text-foreground">{item.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Trust badges */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="flex flex-wrap justify-center gap-6 mt-8"
                        >
                            {['SOC 2 Type II', '99.9% Uptime SLA', '14-day free trial', '48-hr onboarding'].map((badge) => (
                                <motion.div key={badge} variants={fadeUp} className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ShieldCheck size={14} className="text-accent" />
                                    <span>{badge}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section className="py-20 bg-muted/20">
                    <div className="max-w-3xl mx-auto px-6 lg:px-8">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="mb-12 text-center"
                        >
                            <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-4">
                                <div className="h-px w-8 bg-accent" />
                                <span className="text-xs font-semibold tracking-widest text-accent uppercase">FAQ</span>
                                <div className="h-px w-8 bg-accent" />
                            </motion.div>
                            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                                Common questions
                            </motion.h2>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={stagger}
                            className="space-y-3"
                        >
                            {ems_pricing.faq.map((item) => (
                                <motion.div
                                    key={item.id}
                                    variants={fadeUp}
                                    className="rounded-xl border border-border bg-background overflow-hidden"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/30 transition-colors duration-200"
                                    >
                                        <span className="text-sm font-semibold text-primary pr-4">{item.question}</span>
                                        <ChevronDown
                                            size={16}
                                            className={`text-muted-foreground flex-shrink-0 transition-transform duration-300 ${openFaq === item.id ? 'rotate-180' : ''}`}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === item.id && (
                                            <motion.div
                                                key="answer"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25, ease: 'easeOut' as const }}
                                                className="overflow-hidden"
                                            >
                                                <p className="px-6 pt-4 pb-6 text-sm text-muted-foreground leading-relaxed">
                                                    {item.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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
                    <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
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
                                {ems_pricing.cta.heading}
                            </motion.h2>
                            <motion.p variants={fadeUp} className="text-lg text-primary-foreground/70 mb-10 max-w-xl mx-auto">
                                {ems_pricing.cta.subheading}
                            </motion.p>
                            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-bold text-sm tracking-wide rounded transition-all duration-200 hover:opacity-90 hover:shadow-lg"
                                >
                                    {ems_pricing.cta.button}
                                    <ArrowRight size={16} />
                                </Link>
                                <Link
                                    to="/contact"
                                    className="inline-flex items-center gap-2 px-8 py-4 border border-primary-foreground/30 text-primary-foreground font-semibold text-sm tracking-wide rounded transition-all duration-200 hover:bg-primary-foreground/10"
                                >
                                    {ems_pricing.cta.button_secondary}
                                </Link>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>
            </main>
        </>
    );
}
