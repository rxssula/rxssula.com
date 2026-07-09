import Link from "next/link";

export type PostItemData = {
    slug: string;
    title: string;
    description: string;
    date: string;
    formattedDate: string;
};

type PostItemProps = {
    post: PostItemData;
};

export default function PostItem({ post }: PostItemProps) {
    return (
        <li>
            <Link
                href={`/blog/${post.slug}`}
                className="motion-post-link group block border-l border-[#f54703]/60 pl-4 transition-[border-color,transform] duration-200 ease-out active:translate-x-0 active:scale-[0.99]"
            >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <h2 className="text-xl font-semibold text-[#f54703]">
                        {post.title}
                    </h2>
                    <time dateTime={post.date} className="text-sm opacity-60">
                        {post.formattedDate}
                    </time>
                </div>
                <p className="mt-2 leading-7 opacity-80">{post.description}</p>
            </Link>
        </li>
    );
}
