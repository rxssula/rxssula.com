import Link from "next/link";

interface BackButtonProps {
    href?: string;
    label?: string;
}

export default function BackButton({
    href = "/",
    label = "back",
}: BackButtonProps) {
    return (
        <Link
            href={href}
            className="group inline-flex items-center gap-2 text-sm text-[#f54703] opacity-80 transition-all duration-200 hover:opacity-100"
        >
            <span className="inline-block transition-transform duration-200 group-hover:-translate-x-1">
                ←
            </span>
            <span className="font-mono">{label}</span>
        </Link>
    );
}
