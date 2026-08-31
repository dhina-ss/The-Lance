import React from 'react';
import { motion } from 'motion/react';

interface Heading3DProps {
    as?: 'h1' | 'h2' | 'h3';
    className?: string;
    children: React.ReactNode;
    delay?: number;
}

const heading3DVariant = {
    hidden: {
        opacity: 0,
        y: 40,
        rotateX: 35,
        scale: 0.94,
    },
    visible: (delay: number = 0) => ({
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        transition: {
            duration: 0.85,
            delay: delay,
            ease: [0.16, 1, 0.3, 1] as const,
        },
    }),
};

export function Heading3D({ as = 'h2', className = '', children, delay = 0 }: Heading3DProps) {
    const Component = motion[as];

    return (
        <div style={{ perspective: '1200px', transformStyle: 'preserve-3d' }} className="w-full">
            <Component
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                custom={delay}
                variants={heading3DVariant}
                className={`transform-gpu ${className}`}
            >
                {children}
            </Component>
        </div>
    );
}
