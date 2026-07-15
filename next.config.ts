import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    pageExtensions: ["ts", "tsx", "md", "mdx"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.scdn.co",
                port: "",
                pathname: "/image/**",
                search: "",
            },
        ],
    },
};

const withMDX = createMDX({
    extension: /\.(md|mdx)$/,
    options: {
        remarkPlugins: ["remark-frontmatter"],
    },
});

export default withMDX(nextConfig);
