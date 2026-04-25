import fs from "node:fs/promises";
import path from "node:path";

const postsDir = path.join(process.cwd(), "content");

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const { default: Post } = await import(`@/content/${slug}.mdx`);

    return <Post />;
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
