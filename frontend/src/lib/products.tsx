import { Server, TicketCheck, Globe, Zap, Shield, Clock, Users, Layers, Activity, Building2, Cpu, Cloud } from 'lucide-react';

export interface ProductStat {
    label: string;
    value: string;
    iconName: string; // store icon name as string (can't serialize JSX)
}

export interface ProductConfig {
    id: string;
    name: string;
    tagline: string;
    description: string;
    iconName: string;
    accentColor: string;
    bgColor: string;
    borderColor: string;
    dotColor: string;
    badge: string;
    features: string[];
    stats: ProductStat[];
    href: string;
}

export const PRODUCTS: ProductConfig[] = [
    {
        id: 'ems',
        name: 'Endpoint Management System',
        tagline: 'Unified device & policy control at scale',
        description:
            "Centralize control over all your organization's endpoints — desktops, servers, and mobile devices — with real-time monitoring, policy enforcement, automated patching, and compliance reporting from a single pane of glass.",
        iconName: 'Server',
        accentColor: 'text-accent',
        bgColor: 'bg-accent/10',
        borderColor: 'border-accent/20',
        dotColor: 'bg-accent',
        badge: 'Enterprise',
        features: [
            'Real-time device monitoring',
            'Automated patch management',
            'Policy enforcement & compliance',
            'Threat detection & response',
        ],
        stats: [
            { label: 'Endpoints', value: '2,400+', iconName: 'Globe' },
            { label: 'Uptime', value: '99.98%', iconName: 'Zap' },
            { label: 'Policies Active', value: '84', iconName: 'Shield' },
        ],
        href: '#',
    },
    {
        id: 'tickets',
        name: 'Ticket Management',
        tagline: 'Streamlined support & issue resolution',
        description:
            'A powerful helpdesk platform built for modern teams. Manage support tickets, track SLA compliance, collaborate across departments, and deliver faster resolutions through smart routing, automation, and rich analytics.',
        iconName: 'TicketCheck',
        accentColor: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        dotColor: 'bg-emerald-500',
        badge: 'Pro',
        features: [
            'Intelligent ticket routing',
            'SLA tracking & alerts',
            'Multi-channel support (email, chat)',
            'Detailed analytics & reporting',
        ],
        stats: [
            { label: 'Open Tickets', value: '138', iconName: 'TicketCheck' },
            { label: 'Avg. Resolution', value: '4.2h', iconName: 'Clock' },
            { label: 'Agents', value: '32', iconName: 'Users' },
        ],
        href: '#',
    },
];

export function getProduct(id: string): ProductConfig | undefined {
    return PRODUCTS.find((p) => p.id === id);
}

/** Resolve a lucide icon component by name string */
export function resolveIcon(name: string, size = 14) {
    switch (name) {
        case 'Server': return <Server size={size} />;
        case 'TicketCheck': return <TicketCheck size={size} />;
        case 'Globe': return <Globe size={size} />;
        case 'Zap': return <Zap size={size} />;
        case 'Shield': return <Shield size={size} />;
        case 'Clock': return <Clock size={size} />;
        case 'Users': return <Users size={size} />;
        case 'Layers': return <Layers size={size} />;
        case 'Activity': return <Activity size={size} />;
        case 'Building2': return <Building2 size={size} />;
        case 'Cpu': return <Cpu size={size} />;
        case 'Cloud': return <Cloud size={size} />;
        default: return <Server size={size} />;
    }
}
