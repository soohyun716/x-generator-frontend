import type { Post } from "../types";
import "../styles/card.css";

interface PostedCardProps {
  post: Post;

  selected: boolean;

  onSelect: (
    id: string
  ) => void;
}

export default function PostedCard({
  post,
  selected,
  onSelect,
}: PostedCardProps) {
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
    <article
      className={`post-card posted-card ${
        selected
          ? "selected"
          : ""
      }`}
    >
      <div className="post-select">
        <label>
          <input
            type="checkbox"
            checked={selected}
            onChange={() =>
              onSelect(post.id)
            }
          />

          <span>
            선택
          </span>
        </label>
      </div>

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
      </div>
    </article>
  );
}