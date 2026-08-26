import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Work', href: '/work' },
    { label: 'Contact', href: '/contact' },
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const isLoggedIn = location.pathname.startsWith('/dashboard') || location.pathname === '/login';

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 bg-background transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 min-w-0 shrink">
                        <img
                            src="/assets/images/logo/logo-logo.webp"
                            alt="TL Logo Mark"
                            className="block h-12 md:h-12 w-auto object-contain shrink-0"
                        />
                    </Link>

                    {/* Desktop Nav */}
                    <nav aria-label="Main navigation" className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={`relative text-sm font-medium tracking-wide transition-colors duration-200 group
                  ${location.pathname === link.href
                                        ? 'text-primary'
                                        : 'text-muted-foreground hover:text-primary'
                                    }`}
                            >
                                {link.label}
                                <span
                                    className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300
                    ${location.pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`}
                                />
                            </Link>
                        ))}
                        <Link
                            to="/contact"
                            className="ml-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold tracking-wide rounded transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
                        >
                            Start a Project
                        </Link>
                        {!isLoggedIn && (
                            <Link
                                to="/login"
                                className="px-5 py-2.5 border border-primary text-primary text-sm font-semibold tracking-wide rounded transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
                            >
                                Login
                            </Link>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-primary"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-background border-t border-border px-6 py-4 shadow-lg">
                    <nav aria-label="Mobile navigation" className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={`text-sm font-medium tracking-wide py-1 border-b border-border
                  ${location.pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            to="/contact"
                            className="mt-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold tracking-wide rounded text-center hover:bg-accent hover:text-accent-foreground transition-colors duration-200"
                        >
                            Start a Project
                        </Link>
                        {!isLoggedIn && (
                            <Link
                                to="/login"
                                className="px-5 py-2.5 border border-primary text-primary text-sm font-semibold tracking-wide rounded text-center hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
                            >
                                Login
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
