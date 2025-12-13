'use client';

import { useState, ReactNode } from 'react';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: string;
    children: ReactNode;
    isExpanded?: boolean;
}

export function FeatureCard({ title, description, icon, children, isExpanded = false }: FeatureCardProps) {
    const [expanded, setExpanded] = useState(isExpanded);

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-primary transition-all">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="text-3xl">{icon}</div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-600">{description}</p>
                    </div>
                </div>
                <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Expandable Content */}
            {expanded && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    {children}
                </div>
            )}
        </div>
    );
}
