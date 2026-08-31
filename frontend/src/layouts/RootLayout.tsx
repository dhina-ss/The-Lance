import { Helmet } from '@dr.pogodin/react-helmet';
import { type ReactElement } from 'react';
import { ScrollRestoration, useLocation } from 'react-router-dom';

import Footer from '@/layouts/parts/Footer';
import Header from '@/layouts/parts/Header';
import Website from '@/layouts/Website';

/**
 * Root layout component that wraps all pages with consistent header and footer.
 *
 * To customize the header or footer, directly edit the Header.tsx and Footer.tsx
 * files in the layouts/parts directory.
 *
 * Site-wide <title> and <meta> live in the <Helmet> below. Individual pages can
 * override them by rendering their own <Helmet> — last-mounted wins.
 */
interface RootLayoutProps {
    children: ReactElement;
}

export default function RootLayout({ children }: RootLayoutProps) {
    const location = useLocation();
    const isDashboard = location.pathname.includes('dashboard');
    const hideFooter = location.pathname === '/login' || isDashboard;
    const hideHeader = location.pathname === '/login' || isDashboard;

    return (
        <Website>
            <Helmet>
                <title>The Lance</title>
                <meta name="description" content="App Template" />
            </Helmet>
            <ScrollRestoration />
            {!hideHeader && <Header />}
            <div className={isDashboard ? 'dashboard-page flex-1 min-h-screen' : ''}>
                {children}
            </div>
            {!hideFooter && <Footer />}
        </Website>
    );
}
