import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import React from "react";

function MDXLink({
    href,
    children,
    ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    const isExternal = href?.startsWith("http");
    const className =
        "text-[#f54703] underline decoration-[#f54703]/40 underline-offset-4 transition-colors duration-200 hover:decoration-[#f54703]";

    if (isExternal) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
                {...props}
            >
                {children}
            </a>
        );
    }

    return (
        <Link href={href ?? ""} className={className} {...props}>
            {children}
        </Link>
    );
}

const components: MDXComponents = {
    h1: (props) => (
        <h1
            className="mt-10 mb-4 text-2xl font-semibold tracking-tight"
            {...props}
        />
    ),
    h2: (props) => (
        <h2
            className="mt-8 mb-3 text-xl font-semibold tracking-tight"
            {...props}
        />
    ),
    h3: (props) => (
        <h3
            className="mt-6 mb-2 text-lg font-semibold tracking-tight"
            {...props}
        />
    ),
    p: (props) => <p className="my-4 leading-7 opacity-90" {...props} />,
    a: MDXLink,
    strong: (props) => <strong className="font-semibold opacity-100" {...props} />,
    em: (props) => <em className="italic opacity-90" {...props} />,
    ul: (props) => (
        <ul
            className="my-4 list-disc pl-6 leading-7 opacity-90"
            {...props}
        />
    ),
    ol: (props) => (
        <ol
            className="my-4 list-decimal pl-6 leading-7 opacity-90"
            {...props}
        />
    ),
    li: (props) => <li className="my-1" {...props} />,
    blockquote: (props) => (
        <blockquote
            className="my-4 border-l-2 border-[#f54703]/60 pl-4 italic opacity-80"
            {...props}
        />
    ),
    hr: (props) => (
        <hr className="my-8 border-foreground/10" {...props} />
    ),
    code: (props) => {
        const { className, children } = props as {
            className?: string;
            children?: React.ReactNode;
        };
        const isBlock = className?.startsWith("language-");

        if (isBlock) {
            return (
                <code
                    className="text-sm leading-relaxed"
                    {...(props as React.HTMLAttributes<HTMLElement>)}
                />
            );
        }

        return (
            <code
                className="rounded bg-foreground/10 px-1.5 py-0.5 text-[0.875em] font-mono box-decoration-clone"
                {...(props as React.HTMLAttributes<HTMLElement>)}
            />
        );
    },
    pre: (props) => (
        <pre
            className="my-6 overflow-x-auto rounded-lg bg-foreground/5 p-4 text-sm leading-relaxed"
            {...props}
        />
    ),
};

export function useMDXComponents(): MDXComponents {
    return components;
}
