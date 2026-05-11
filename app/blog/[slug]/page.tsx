import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import BackButton from "@/components/BackButton";

const postsDir = path.join(process.cwd(), "content");
const dateFormatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const { default: Post } = await import(`@/content/${slug}.mdx`);

    const source = await fs.readFile(
        path.join(postsDir, `${slug}.mdx`),
        "utf-8",
    );
    const { data } = matter(source);

    const title = typeof data.title === "string" ? data.title : "";
    const description =
        typeof data.description === "string" ? data.description : "";
    const rawDate =
        data.date instanceof Date
            ? data.date.toISOString()
            : typeof data.date === "string"
              ? data.date
              : "";
    const date = rawDate ? new Date(rawDate) : null;
    const formattedDate =
        date && !Number.isNaN(date.getTime()) ? dateFormatter.format(date) : "";

    return (
        <article className="pb-10">
            <div className="mb-6 sm:mb-8">
                <BackButton href="/blog" label="back to blog" />
            </div>
            <header className="mb-8 sm:mb-10">
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    {title}
                </h1>
                {formattedDate && (
                    <time
                        dateTime={rawDate}
                        className="mt-3 block text-sm opacity-60"
                    >
                        {formattedDate}
                    </time>
                )}
                {description && (
                    <p className="mt-3 sm:mt-4 max-w-xl leading-7 opacity-80">
                        {description}
                    </p>
                )}
            </header>

            <Post />
        </article>
    );
}

export async function generateStaticParams() {
    const files = await fs.readdir(postsDir);

    return files
        .filter((file) => file.endsWith(".mdx") && !file.startsWith("_"))
        .map((file) => ({
            slug: file.replace(/\.mdx$/, ""),
        }));
}

export const dynamicParams = false;
