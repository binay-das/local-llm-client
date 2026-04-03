import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
    content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <div className="markdown-content">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    code(props: any) {
                        const { inline, className, children, ...rest } = props;
                        const match = /language-([\w-]+)/.exec(className || '');
                        const codeContent = String(children).replace(/\n$/, '');

                        if (inline) {
                            return (
                                <code className={className} {...rest}>
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <pre>
                                {match ? <span className="code-language">{match[1]}</span> : null}
                                <code className={className} {...rest}>
                                    {codeContent}
                                </code>
                            </pre>
                        );
                    },
                    a({ href, children, ...props }) {
                        return (
                            <a href={href} target="_blank" rel="noreferrer" {...props}>
                                {children}
                            </a>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
