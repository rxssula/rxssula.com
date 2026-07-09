import Link from "next/link";
import React from "react";

interface CustomLinkProps {
    href: string;
    children: React.ReactNode;
}

export default function CustomLink({ href, children }: CustomLinkProps) {
    return (
        <Link href={href} className="motion-link group relative inline-block">
            <span className="text-[#f54703]">[{children}]</span>
            <span
                className="motion-link-underline absolute -bottom-1 left-0 h-[6px] w-full bg-current text-[#464545]"
                style={{
                    maskImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 8'%3E%3Cpath fill='none' stroke='black' stroke-width='1.5' d='M0 4 Q2.5 1 5 4 T10 4 T15 4 T20 4'/%3E%3C/svg%3E\")",
                    maskRepeat: "repeat-x",
                    maskSize: "16px 6px",
                    WebkitMaskImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 8'%3E%3Cpath fill='none' stroke='black' stroke-width='1.5' d='M0 4 Q2.5 1 5 4 T10 4 T15 4 T20 4'/%3E%3C/svg%3E\")",
                    WebkitMaskRepeat: "repeat-x",
                    WebkitMaskSize: "16px 6px",
                }}
            />
        </Link>
    );
}
