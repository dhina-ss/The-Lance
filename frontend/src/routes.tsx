import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';
import HomePage from './pages/index';
import ServicesPage from './pages/services';
import AboutPage from './pages/about';
import WorkPage from './pages/work';
import ContactPage from './pages/contact';
import LoginPage from './pages/login';
import DashboardPage from './pages/dashboard';
import TenantDashboardPage from './pages/tenant-dashboard';
import ProductConsolePage from './pages/dashboard/products';
import TenantListPage from './pages/dashboard/tenants';
import TenantDetailsPage from './pages/dashboard/tenant-details';
import EndpointManagementPage from './pages/products/endpoint-management';
import EmsPricingPage from './pages/products/ems-pricing';
// Eager import so renderToString doesn't hit a Suspense boundary on 404 routes
// and abort to client rendering. The prod 404 page is tiny; the dev-tools
// variant stays lazy because it pulls in dev-only code we don't want in
// production bundles.
import ProdNotFoundPage from './pages/_404';

const NotFoundPage = import.meta.env.DEV
    ? lazy(() => import('../dev-tools/src/PageNotFound'))
    : ProdNotFoundPage;

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/services',
        element: <ServicesPage />,
    },
    {
        path: '/about',
        element: <AboutPage />,
    },
    {
        path: '/work',
        element: <WorkPage />,
    },
    {
        path: '/contact',
        element: <ContactPage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/dashboard',
        element: <DashboardPage />,
    },
    {
        path: '/tenant-dashboard',
        element: <TenantDashboardPage />,
    },
    {
        path: '/dashboard/products',
        element: <ProductConsolePage />,
    },
    {
        path: '/dashboard/products/:productId',
        element: <TenantListPage />,
    },
    {
        path: '/dashboard/tenants',
        element: <TenantListPage />,
    },
    {
        path: '/dashboard/tenants/:productId',
        element: <TenantListPage />,
    },
    {
        path: '/dashboard/tenant/:productId/:tenantId',
        element: <TenantDetailsPage />,
    },
    {
        path: '/dashboard/tenant/:tenantId',
        element: <TenantDetailsPage />,
    },
    {
        path: '/products/endpoint-management',
        element: <EndpointManagementPage />,
    },
    {
        path: '/products/ems-pricing',
        element: <EmsPricingPage />,
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
];

// Types for type-safe navigation
export type Path = '/' | '/services' | '/about' | '/work' | '/contact' | '/login' | '/dashboard' | '/products/endpoint-management' | '/products/ems-pricing';

export type Params = Record<string, string | undefined>;
