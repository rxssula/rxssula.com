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
            className="motion-back-link group inline-flex items-center gap-2 text-sm text-[#f54703] opacity-80 transition-[opacity,transform] duration-150 ease-out active:scale-[0.97]"
        >
            <span className="motion-back-arrow inline-block transition-transform duration-150 ease-out">
                ←
            </span>
            <span className="font-mono">{label}</span>
        </Link>
    );
}
