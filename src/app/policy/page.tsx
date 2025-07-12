"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import Section from '@/components/Section';
import { privacyPolicy, practicePolicies } from '@/data/policyData'; // Import the new data file

// Reusable component to render policy content
const PolicyContent = ({ title, effectiveDate, welcome, content }) => (
    <>
        <h1 className="text-4xl font-extrabold mb-4">{title}</h1>
        {effectiveDate && <p className="font-bold mb-6">Effective Date: {effectiveDate}</p>}
        {welcome && <h2 className="text-2xl font-bold mb-6">{welcome}</h2>}
        <div className="prose prose-lg max-w-none space-y-4">
            {content.map(section => (
                <div key={section.heading}>
                    <h3 className="text-xl font-bold">{section.heading}</h3>
                    <p dangerouslySetInnerHTML={{ __html: section.body }} />
                </div>
            ))}
        </div>
    </>
);

const PolicyPage = () => {
    const [activeTab, setActiveTab] = useState('privacy');

    const tabs = [
        { id: 'privacy', label: 'Privacy Policy' },
        { id: 'practice', label: 'Practice Policies' },
    ];

    return (
        <Section>
            <div className="max-w-4xl mx-auto">
                {/* Tab Navigation */}
                <div className="flex justify-center border-b-2 border-black mb-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "py-3 px-6 text-lg font-bold transition-colors duration-200 ease-in-out",
                                "border-2 border-b-0 border-transparent",
                                activeTab === tab.id
                                    ? "bg-tst-cream border-black"
                                    : "bg-transparent text-gray-600 hover:bg-gray-100"
                            )}
                            style={{ marginBottom: '-2px' }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="p-4 md:p-8 bg-tst-cream border-2 border-black rounded-lg">
                     <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'privacy' ? (
                                <PolicyContent {...privacyPolicy} />
                            ) : (
                                <PolicyContent {...practicePolicies} />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </Section>
    );
};

export default PolicyPage;
