import fs from "node:fs/promises";
import PostItemsList from "@/components/PostItemsList";
import type { PostItemData } from "@/components/PostItem";
import BackButton from "@/components/BackButton";
import matter from "gray-matter";
import path from "node:path";

const postsDir = path.join(process.cwd(), "content");
const dateFormatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
});

type BlogPost = PostItemData & {
    timestamp: number;
};

function requireString(value: unknown, field: string, file: string) {
    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(
            `${file} is missing a valid "${field}" frontmatter field.`,
        );
    }

    return value;
}

function parseDate(value: unknown, file: string) {
    const rawDate =
        value instanceof Date
            ? value.toISOString()
            : requireString(value, "date", file);
    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
        throw new Error(`${file} has an invalid "date" frontmatter field.`);
    }

    return {
        date: date.toISOString().slice(0, 10),
        formattedDate: dateFormatter.format(date),
        timestamp: date.getTime(),
    };
}

async function getPosts() {
    const files = await fs.readdir(postsDir, { withFileTypes: true });

    const posts = await Promise.all(
        files
            .filter(
                (file) =>
                    file.isFile() &&
                    file.name.endsWith(".mdx") &&
                    !file.name.startsWith("_"),
            )
            .map(async (file) => {
                const slug = file.name.replace(/\.mdx$/, "");
                const source = await fs.readFile(
                    path.join(postsDir, file.name),
                    "utf-8",
                );
                const { data } = matter(source);
                const parsedDate = parseDate(data.date, file.name);

                return {
                    slug,
                    title: requireString(data.title, "title", file.name),
                    description: requireString(
                        data.description,
                        "description",
                        file.name,
                    ),
                    ...parsedDate,
                } satisfies BlogPost;
            }),
    );

    return posts.sort((a, b) => b.timestamp - a.timestamp);
}

export default async function BlogPage() {
    const posts = await getPosts();

    return (
        <main className="pb-10">
            <div className="mb-6 sm:mb-8">
                <BackButton href="/" label="back" />
            </div>
            <header className="mb-8 sm:mb-10">
                <h1 className="text-2xl sm:text-3xl font-semibold">Blog</h1>
                <p className="mt-3 sm:mt-4 max-w-xl leading-7 opacity-80">
                    Just something that I want to talk about.
                </p>
            </header>

            <div>
                <PostItemsList posts={posts} />
            </div>
        </main>
    );
}
