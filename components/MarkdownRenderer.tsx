"use client";

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
    content: string;
}

function CodeBlock({ className, children }: { className?: string; children: React.ReactNode }) {
    const [copied, setCopied] = useState(false);
    const match = /language-([\w-]+)/.exec(className || '');
    const lang = match ? match[1] : null;
    const codeContent = String(children).replace(/\n$/, '');

    const handleCopy = () => {
        navigator.clipboard.writeText(codeContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative my-3 rounded-xl overflow-hidden border border-[#2e3238] bg-[#161b22]">
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#1c2128] border-b border-[#2e3238]">
                <span className="text-[11px] text-[#6b7280] font-mono">
                    {lang || 'code'}
                </span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-[11px] text-[#6b7280] hover:text-[#d1d5db] transition-colors"
                >
                    {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                </button>
            </div>
            {/* Code */}
            <pre className="overflow-x-auto p-4 text-sm text-[#e6edf3] font-mono leading-relaxed">
                <code className={className}>{codeContent}</code>
            </pre>
        </div>
    );
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <div className="text-sm leading-[1.75] overflow-wrap-anywhere text-[#d1d5db]">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code(props: any) {
                        const { inline, className, children } = props;
                        if (inline) {
                            return (
                                <code className="px-1.5 py-0.5 rounded bg-[#1f2327] border border-[#2e3238] text-[#a5b4fc] text-[0.88em] font-mono">
                                    {children}
                                </code>
                            );
                        }
                        return <CodeBlock className={className}>{children}</CodeBlock>;
                    },
                    a({ href, children, ...props }) {
                        return (
                            <a href={href} target="_blank" rel="noreferrer"
                                className="text-[#818cf8] underline underline-offset-2 hover:text-[#a5b4fc]" {...props}>
                                {children}
                            </a>
                        );
                    },
                    blockquote({ children, ...props }) {
                        return (
                            <blockquote className="pl-4 border-l-2 border-[#6366f1] text-[#9ca3af] my-3" {...props}>
                                {children}
                            </blockquote>
                        );
                    },
                    hr({ ...props }) {
                        return <hr className="border-0 border-t border-[#2e3238] my-4" {...props} />;
                    },
                    p({ children, ...props }) {
                        return <p className="mb-3 mt-0 last:mb-0" {...props}>{children}</p>;
                    },
                    ul({ children, ...props }) {
                        return <ul className="pl-5 mb-3 space-y-1 list-disc" {...props}>{children}</ul>;
                    },
                    ol({ children, ...props }) {
                        return <ol className="pl-5 mb-3 space-y-1 list-decimal" {...props}>{children}</ol>;
                    },
                    li({ children, ...props }) {
                        return <li className="leading-relaxed" {...props}>{children}</li>;
                    },
                    h1({ children, ...props }) {
                        return <h1 className="mt-4 mb-2 text-2xl font-bold text-white" {...props}>{children}</h1>;
                    },
                    h2({ children, ...props }) {
                        return <h2 className="mt-4 mb-2 text-xl font-bold text-white" {...props}>{children}</h2>;
                    },
                    h3({ children, ...props }) {
                        return <h3 className="mt-3 mb-1.5 text-lg font-semibold text-white" {...props}>{children}</h3>;
                    },
                    h4({ children, ...props }) {
                        return <h4 className="mt-3 mb-1.5 font-semibold text-[#e5e7eb]" {...props}>{children}</h4>;
                    },
                    strong({ children, ...props }) {
                        return <strong className="font-semibold text-[#f9fafb]" {...props}>{children}</strong>;
                    },
                    table({ children, ...props }) {
                        return (
                            <div className="overflow-x-auto my-3">
                                <table className="w-full text-sm border-collapse border border-[#2e3238]" {...props}>{children}</table>
                            </div>
                        );
                    },
                    th({ children, ...props }) {
                        return <th className="px-3 py-2 bg-[#1f2327] text-left font-semibold text-[#e5e7eb] border border-[#2e3238]" {...props}>{children}</th>;
                    },
                    td({ children, ...props }) {
                        return <td className="px-3 py-2 text-[#d1d5db] border border-[#2e3238]" {...props}>{children}</td>;
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};