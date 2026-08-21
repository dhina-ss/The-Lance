import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const site = 'https://thelance.in';
const pageTitle = 'Login — The Lance';
const pageDescription =
    'Log in to your account at The Lance to access client portals, project dashboards, and engineering resources.';

export default function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('superadmin@gmail.com');
    const [password, setPassword] = useState('Admin@123');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus('loading');
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => {
                if (email.toLowerCase().trim() === 'superadmin@gmail.com') {
                    navigate('/dashboard');
                } else {
                    navigate('/tenant-dashboard');
                }
            }, 800);
        }, 1000);
    }

    function handleSocialLogin() {
        setStatus('loading');
        setTimeout(() => {
            navigate('/dashboard');
        }, 800);
    }

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <link rel="canonical" href={`${site}/login`} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${site}/login`} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
            </Helmet>

            <main className="relative h-screen bg-background overflow-hidden flex items-center justify-center">
                {/* Radial grid dot background */}
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(circle, hsl(var(--primary)) 1px, transparent 1px)',
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* Geometric Pattern Overlay — top right */}
                <div className="absolute top-0 right-0 w-[550px] h-[550px] pointer-events-none opacity-30 transform translate-x-16 -translate-y-12">
                    <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.9">
                            <g transform="translate(250, 150)">
                                <circle cx="0" cy="0" r="65" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
                                <path d="M 0 -65 A 65 65 0 0 1 0 65 Z" fill="hsl(var(--accent))" fillOpacity="0.15" />
                                <circle cx="0" cy="0" r="35" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.25" fill="none" />
                                <circle cx="0" cy="0" r="8" fill="hsl(var(--accent))" fillOpacity="0.7" />
                            </g>
                            <line x1="40" y1="150" x2="360" y2="150" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.15" />
                            <line x1="40" y1="162" x2="280" y2="162" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.25" />
                            <line x1="250" y1="30" x2="250" y2="340" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.2" />
                            <rect x="80" y="220" width="120" height="60" rx="30" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.3" fill="none" />
                            <circle cx="110" cy="250" r="4" fill="hsl(var(--accent))" fillOpacity="0.6" />
                            <g transform="translate(100, 80)">
                                <path d="M 0 -11 Q 0 0 11 0 Q 0 0 0 11 Q 0 0 -11 0 Q 0 0 0 -11 Z" fill="hsl(var(--accent))" fillOpacity="0.6" />
                            </g>
                            <g transform="translate(320, 280)">
                                <path d="M 0 -9 Q 0 0 9 0 Q 0 0 0 9 Q 0 0 -9 0 Q 0 0 0 -9 Z" fill="hsl(var(--primary))" fillOpacity="0.4" />
                            </g>
                        </g>
                    </svg>
                </div>

                {/* Geometric Pattern Overlay — bottom left (reversed) */}
                <div className="absolute bottom-0 left-0 w-[550px] h-[550px] pointer-events-none opacity-30 transform -translate-x-16 translate-y-12 rotate-180">
                    <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g opacity="0.9">
                            <g transform="translate(250, 150)">
                                <circle cx="0" cy="0" r="65" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />
                                <path d="M 0 -65 A 65 65 0 0 1 0 65 Z" fill="hsl(var(--accent))" fillOpacity="0.15" />
                                <circle cx="0" cy="0" r="35" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.25" fill="none" />
                                <circle cx="0" cy="0" r="8" fill="hsl(var(--accent))" fillOpacity="0.7" />
                            </g>
                            <line x1="40" y1="150" x2="360" y2="150" stroke="hsl(var(--primary))" strokeWidth="1" strokeOpacity="0.15" />
                            <line x1="40" y1="162" x2="280" y2="162" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.25" />
                            <line x1="250" y1="30" x2="250" y2="340" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.2" />
                            <rect x="80" y="220" width="120" height="60" rx="30" stroke="hsl(var(--accent))" strokeWidth="1" strokeOpacity="0.3" fill="none" />
                            <circle cx="110" cy="250" r="4" fill="hsl(var(--accent))" fillOpacity="0.6" />
                            <g transform="translate(100, 80)">
                                <path d="M 0 -11 Q 0 0 11 0 Q 0 0 0 11 Q 0 0 -11 0 Q 0 0 0 -11 Z" fill="hsl(var(--accent))" fillOpacity="0.6" />
                            </g>
                            <g transform="translate(320, 280)">
                                <path d="M 0 -9 Q 0 0 9 0 Q 0 0 0 9 Q 0 0 -9 0 Q 0 0 0 -9 Z" fill="hsl(var(--primary))" fillOpacity="0.4" />
                            </g>
                        </g>
                    </svg>
                </div>

                <div className="relative w-full max-w-[30%] mx-auto px-6 z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                        className="w-full"
                    >
                        {/* Header Branding */}
                        <motion.div variants={fadeUp} className="text-center mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-primary tracking-tight mb-2">
                                Welcome Back
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Log in to access your dashboard and project hubs
                            </p>
                        </motion.div>

                        {/* Glassmorphic Login Card */}
                        <motion.div
                            variants={fadeUp}
                            className="group relative bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl overflow-hidden p-8"
                        >
                            {/* Animated top accent bar on hover */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />

                            {status === 'success' ? (
                                <div className="text-center py-8">
                                    <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-primary mb-2">Authenticated Successfully</h3>
                                    <p className="text-sm text-muted-foreground mb-6">Redirecting to your dashboard...</p>
                                    <Link
                                        to="/dashboard"
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
                                    >
                                        Go to Dashboard <ArrowRight size={16} />
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Role Preset Quick Selector */}
                                    <div className="flex items-center gap-2 p-1 bg-muted/40 rounded-xl border border-border/60">
                                        <button
                                            type="button"
                                            onClick={() => { setEmail('superadmin@gmail.com'); setPassword('Admin@123'); }}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                email.toLowerCase().includes('super')
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-primary'
                                            }`}
                                        >
                                            Super Admin
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setEmail('admin@gmail.com'); setPassword('Admin@123'); }}
                                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                                !email.toLowerCase().includes('super')
                                                    ? 'bg-accent text-accent-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-primary'
                                            }`}
                                        >
                                            Tenant Admin
                                        </button>
                                    </div>

                                    {/* Email Address */}
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                                            Email Address
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="email"
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="admin@gmail.com"
                                                className="w-full px-4 py-3 pl-11 bg-background border border-input rounded-xl text-sm font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200"
                                            />
                                            <Mail className="absolute left-3.5 top-3.5 text-muted-foreground" size={18} />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label htmlFor="password" className="block text-xs font-semibold text-primary uppercase tracking-wider">
                                                Password
                                            </label>
                                            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset instructions have been sent to your email.'); }} className="text-xs text-accent font-medium hover:underline">
                                                Forgot password?
                                            </a>
                                        </div>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Admin@123"
                                                className="w-full px-4 py-3 pl-11 pr-11 bg-background border border-input rounded-xl text-sm font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200"
                                            />
                                            <Lock className="absolute left-3.5 top-3.5 text-muted-foreground" size={18} />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-primary transition-colors"
                                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remember Me */}
                                    <div className="flex items-center justify-between pt-1">
                                        <label className="flex items-center gap-2.5 text-xs text-muted-foreground cursor-pointer select-none">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-input text-accent focus:ring-accent cursor-pointer"
                                            />
                                            <span>Remember me for 30 days</span>
                                        </label>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full py-3.5 bg-primary text-primary-foreground font-semibold text-sm tracking-wide rounded-xl shadow-lg transition-all duration-200 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {status === 'loading' ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Authenticating...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Sign In to Dashboard</span>
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </button>

                                    {/* Back Button */}
                                    <button
                                        type="button"
                                        onClick={() => navigate(-1)}
                                        className="w-full py-3 border border-input rounded-xl text-sm font-semibold text-muted-foreground hover:text-primary-foreground hover:bg-primary transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft size={14} />
                                        <span>Go Back</span>
                                    </button>

                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                </div>
            </main>
        </>
    );
}
