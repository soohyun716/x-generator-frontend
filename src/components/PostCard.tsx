import type { Post } from "../types";

interface PostCardProps {
  post: Post;
  onStatusChange: (
    id: string,
    status: Post["status"]
  ) => void;
}

export default function PostCard({
  post,
  onStatusChange,
}: PostCardProps) {
  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  return (
    <article className="post-card">
      <div className="post-info">

        <div className="text-section">
          <div className="section-header">
            <span className="label">제목</span>

            <button
              className="copy-button"
              onClick={() => copyText(post.title)}
            >
              복사
            </button>
          </div>

          <p className="title">
            {post.title}
          </p>
        </div>
        <img
          className="post-image"
          src={post.imageUrl}
          alt=""
        />

        <div className="divider" />

        <div className="text-section">
          <div className="section-header">
            <span className="label">
              댓글 타래
            </span>

            <button
              className="copy-button"
              onClick={() =>
                copyText(post.threadText)
              }
            >
              복사
            </button>
          </div>

          <p className="thread">
            {post.threadText}
          </p>
        </div>

        <button
          className={`upload-button ${post.status === "posted" ? "completed" : ""
            }`}
          onClick={() => {
            if (post.status === "posted") return;

            onStatusChange(post.id, "posted");
          }}
          disabled={post.status === "posted"}
        >
          {post.status === "posted"
            ? "업로드 완료"
            : "업로드"}
        </button>      </div>
    </article>
  );
}