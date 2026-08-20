import { Link } from 'react-router-dom';

const footerLinks = {
    Services: [
        { label: 'Web Development', href: '/services' },
        { label: 'Mobile Apps', href: '/services' },
        { label: 'Cloud & DevOps', href: '/services' },
        { label: 'Custom Software', href: '/services' },
    ],
    Company: [
        { label: 'About', href: '/about' },
        { label: 'Work', href: '/work' },
        { label: 'Contact', href: '/contact' },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-primary text-primary-foreground">
            {/* Teal accent line */}
            <div className="h-[2px] w-full bg-accent" />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand column */}
                    <div className="md:col-span-2">
                        <Link to="/" className="inline-block mb-6">
                            <div className="bg-white rounded px-3 py-2 flex items-center gap-2 inline-flex">
                                <img
                                    src="/assets/images/logo/logo-logo.webp"
                                    alt="TL Logo Mark"
                                    className="block h-12 md:h-12 w-auto object-contain shrink-0"
                                />
                            </div>
                        </Link>
                        <p className="text-sm leading-relaxed opacity-70 max-w-xs">
                            We build software that scales — from early-stage products to enterprise platforms.
                        </p>
                        {/* Geometric accent */}
                        <div className="mt-8 flex items-center gap-2">
                            <div className="h-px w-8 bg-accent" />
                            <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                            <div className="h-px w-4 bg-accent opacity-50" />
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(footerLinks).map(([group, links]) => (
                        <div key={group}>
                            <h3 className="text-xs font-semibold tracking-widest uppercase opacity-50 mb-4">
                                {group}
                            </h3>
                            <ul className="flex flex-col gap-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.href}
                                            className="text-sm opacity-70 hover:opacity-100 hover:text-accent transition-all duration-200"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom bar */}
                <div className="mt-16 pt-10 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs opacity-40 tracking-wide">
                        © {new Date().getFullYear()} The Lance. All rights reserved.
                    </p>
                    <p className="text-xs opacity-40 tracking-widest uppercase">
                        Software Development Studio
                    </p>
                </div>
            </div>
        </footer>
    );
}
