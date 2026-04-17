"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <div className="text-[0.99rem] leading-[1.72] overflow-wrap-anywhere">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code(props: any) {
                        const { inline, className, children, ...rest } = props;
                        const match = /language-([\w-]+)/.exec(className || '');
                        const codeContent = String(children).replace(/\n$/, '');

                        if (inline) {
                            return (
                                <code className={`inline-block px-[0.45rem] py-[0.08rem] rounded-[0.5rem] bg-[#fff8ee] dark:bg-[#ffffff0a] border border-[#ddd1be] dark:border-[#56545d] text-[0.92em] font-mono ${className || ''}`} {...rest}>
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <pre className="relative overflow-x-auto p-4 rounded-[1rem] bg-[#1b1f24] text-[#f4e6e2] border border-[#4a4e54] shadow-lg dark:bg-[#101115] dark:text-[#ede7df] dark:border-[#464441]">
                                {match ? <span className="inline-flex mb-3 px-2 py-[0.18rem] rounded-[999px] bg-[#ffffff0d] text-[#ceced5] text-[0.72rem] font-semibold tracking-[0.08em] uppercase dark:bg-[#ffffff08] dark:text-[#c2c1bd]">{match[1]}</span> : null}
                                <code className={`block whitespace-pre leading-[1.6] font-mono text-sm ${className || ''}`} {...rest}>
                                    {codeContent}
                                </code>
                            </pre>
                        );
                    },
                    a({ href, children, ...props }) {
                        return (
                            <a href={href} target="_blank" rel="noreferrer" className="text-[#345484] dark:text-[#8db8f5] underline underline-offset-[0.16em]" {...props}>
                                {children}
                            </a>
                        );
                    },
                    blockquote({ children, ...props }) {
                        return (
                            <blockquote className="py-2 pl-4 border-l-4 border-[#a88f59] dark:border-[#997c58] text-[#4f4c47] dark:text-[#b6b0a8]" {...props}>
                                {children}
                            </blockquote>
                        );
                    },
                    hr({ ...props }) {
                        return (
                            <hr className="border-0 border-t border-[#cec2b1] dark:border-[#494844] my-4" {...props} />
                        );
                    },
                    p({ children, ...props }) {
                        return (
                            <p className="mb-[0.95rem] mt-0 first:mt-0 last:mb-0" {...props}>
                                {children}
                            </p>
                        );
                    },
                    ul({ children, ...props }) {
                        return (
                            <ul className="pl-[1.35rem] mb-[0.95rem] mt-0 first:mt-0 last:mb-0" {...props}>
                                {children}
                            </ul>
                        );
                    },
                    ol({ children, ...props }) {
                        return (
                            <ol className="pl-[1.35rem] mb-[0.95rem] mt-0 first:mt-0 last:mb-0" {...props}>
                                {children}
                            </ol>
                        );
                    },
                    li({ children, ...props }) {
                        return (
                            <li className="mb-[0.35rem]" {...props}>
                                {children}
                            </li>
                        );
                    },
                    h1({ children, ...props }) {
                        return (
                            <h1 className="mt-[1.15rem] mb-[0.7rem] text-[1.45rem] font-bold leading-[1.25] tracking-[-0.03em]" {...props}>
                                {children}
                            </h1>
                        );
                    },
                    h2({ children, ...props }) {
                        return (
                            <h2 className="mt-[1.15rem] mb-[0.7rem] text-[1.28rem] font-bold leading-[1.25] tracking-[-0.03em]" {...props}>
                                {children}
                            </h2>
                        );
                    },
                    h3({ children, ...props }) {
                        return (
                            <h3 className="mt-[1.15rem] mb-[0.7rem] text-[1.14rem] font-bold leading-[1.25] tracking-[-0.03em]" {...props}>
                                {children}
                            </h3>
                        );
                    },
                    h4({ children, ...props }) {
                        return (
                            <h4 className="mt-[1.15rem] mb-[0.7rem] font-bold leading-[1.25] tracking-[-0.03em]" {...props}>
                                {children}
                            </h4>
                        );
                    },
                    h5({ children, ...props }) {
                        return (
                            <h5 className="mt-[1.15rem] mb-[0.7rem] font-bold leading-[1.25] tracking-[-0.03em]" {...props}>
                                {children}
                            </h5>
                        );
                    },
                    h6({ children, ...props }) {
                        return (
                            <h6 className="mt-[1.15rem] mb-[0.7rem] font-bold leading-[1.25] tracking-[-0.03em]" {...props}>
                                {children}
                            </h6>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};