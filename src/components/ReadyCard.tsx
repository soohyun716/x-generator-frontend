import type { Post } from "../types";
import "../styles/card.css";

interface ReadyCardProps {
  post: Post;

  onApprove: (
    id: string
  ) => void;

  onDelete: (
    id: string
  ) => void;
}

export default function ReadyCard({
  post,
  onApprove,
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

  const API_URL =
    "https://peak-cbs-portal-guru.trycloudflare.com";
  // "http://localhost:3000";

  const downloadImage = async (
    imageUrl: string,
    title: string
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/api/image-proxy?url=${encodeURIComponent(
          imageUrl
        )}`
      );

      if (!response.ok) {
        throw new Error(
          "이미지를 불러오지 못했습니다."
        );
      }

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = `${title}.png`;

      document.body.appendChild(
        link
      );

      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "이미지 저장 실패:",
        error
      );

      alert(
        "이미지 저장에 실패했습니다."
      );
    }
  };

  return (
    <article className="post-card">
      <div className="post-info">
        {/* 제목 */}
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

        {/* 이미지 */}
        <div className="image-section">
          <div className="section-header">
            <span className="label">
              이미지
            </span>

            <button
              className="copy-image-button"
              onClick={() =>
                downloadImage(
                  post.imageUrl,
                  post.title
                )
              }
            >
              이미지 저장
            </button>
          </div>

          <img
            className="post-image"
            src={post.imageUrl}
            alt={post.title}
            loading="lazy"
          />
        </div>

        <div className="divider" />

        {/* 댓글 타래 */}
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

        {/* 액션 버튼 */}
        <div className="actions">
          <button
            className="upload-button"
            onClick={() =>
              onApprove(post.id)
            }
          >
            업로드 확정
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