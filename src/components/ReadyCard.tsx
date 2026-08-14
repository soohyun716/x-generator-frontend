import type { Post } from "../types";
import "../styles/card.css";

interface ReadyCardProps {
  post: Post;

  onUpload: (
    id: string
  ) => void;

  onDelete: (
    id: string
  ) => void;
}

export default function ReadyCard({
  post,
  onUpload,
  onDelete,
}: ReadyCardProps) {
  const copyText = async (
    text: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        text
      );
    } catch (error) {
      console.error(
        "복사 실패:",
        error
      );
    }
  };

  return (
    <article className="post-card">
      <div className="post-info">
        <div className="text-section">
          <div className="section-header">
            <span className="label">
              제목
            </span>

            <button
              className="copy-button"
              onClick={() =>
                copyText(post.title)
              }
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
          alt={post.title}
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
                copyText(
                  post.threadText
                )
              }
            >
              복사
            </button>
          </div>

          <p className="thread">
            {post.threadText}
          </p>
        </div>

        <div className="actions">
          <button
            className="upload-button"
            onClick={() =>
              onUpload(post.id)
            }
          >
            업로드
          </button>

          <button
            className="delete-button"
            onClick={() =>
              onDelete(post.id)
            }
          >
            삭제
          </button>
        </div>
      </div>
    </article>
  );
}