import PostItem, { type PostItemData } from "@/components/PostItem";

type PostItemsListProps = {
    posts: PostItemData[];
};

export default function PostItemsList({ posts }: PostItemsListProps) {
    if (posts.length === 0) {
        return (
            <p className="opacity-70">
                I don&apos;t have any posts right now :)
            </p>
        );
    }

    return (
        <ol className="space-y-7">
            {posts.map((post) => (
                <PostItem key={post.slug} post={post} />
            ))}
        </ol>
    );
}
