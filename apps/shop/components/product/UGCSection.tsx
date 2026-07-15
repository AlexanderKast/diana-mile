import type { LandingUGCPost } from "@diana-mile/shared/types";

export function UGCSection({
  heading,
  subheading,
  posts,
}: {
  heading: string;
  subheading: string;
  posts: LandingUGCPost[];
}) {
  if (posts.length === 0) return null;

  return (
    <div>
      <h2 className="font-display text-2xl text-carbon text-center">
        {heading}
      </h2>
      <p className="font-sans text-[13px] text-ceniza text-center mt-1">
        {subheading}
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {posts.map((post, index) => (
          <div
            key={post.title}
            className={`p-5 rounded-2xl ${index % 2 === 0 ? "bg-lila-suave" : "bg-crema"}`}
          >
            <span className="text-3xl">{post.emoji}</span>
            <p className="font-sans text-[13px] font-semibold text-carbon mt-2">
              {post.title}
            </p>
            <p className="font-sans text-xs text-carbon-suave leading-relaxed mt-1">
              {post.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
