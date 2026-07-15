interface SpotifyMarkProps {
    className?: string;
}

export default function SpotifyMark({ className }: SpotifyMarkProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={className}
            fill="currentColor"
        >
            <path d="M12 1.5A10.5 10.5 0 1 0 12 22.5 10.5 10.5 0 0 0 12 1.5Zm4.82 15.14a.65.65 0 0 1-.9.22c-2.46-1.5-5.55-1.84-9.2-1.01a.65.65 0 1 1-.29-1.27c3.99-.91 7.41-.52 10.17 1.17.31.18.4.59.22.89Zm1.28-2.84a.81.81 0 0 1-1.12.27c-2.81-1.73-7.1-2.23-10.43-1.22a.81.81 0 1 1-.47-1.55c3.81-1.16 8.54-.6 11.75 1.37.38.23.5.74.27 1.13Zm.11-2.96C14.84 8.84 9.27 8.65 6.05 9.63a.98.98 0 0 1-.57-1.87c3.7-1.12 9.85-.9 13.73 1.4a.98.98 0 0 1-1 1.68Z" />
        </svg>
    );
}
