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

  const copyImage = async (
    imageUrl: string
  ) => {
    try {
      const API_URL =
        "https://heading-festivals-winners-phi.trycloudflare.com";

      const response = await fetch(
        `${API_URL}/api/image-proxy?url=${encodeURIComponent(
          imageUrl
        )}`
      );

      if (!response.ok) {
        throw new Error(
          `이미지 가져오기 실패: ${response.status}`
        );
      }

      const blob = await response.blob();

      const bitmap =
        await createImageBitmap(blob);

      const canvas =
        document.createElement("canvas");

      canvas.width = bitmap.width;
      canvas.height = bitmap.height;

      const ctx =
        canvas.getContext("2d");

      if (!ctx) {
        throw new Error(
          "Canvas 생성 실패"
        );
      }

      ctx.drawImage(
        bitmap,
        0,
        0
      );

      const pngBlob =
        await new Promise<Blob>(
          (resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob);
                } else {
                  reject(
                    new Error(
                      "PNG 변환 실패"
                    )
                  );
                }
              },
              "image/png"
            );
          }
        );

      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": pngBlob,
        }),
      ]);

      alert("이미지가 복사되었습니다!");
    } catch (error) {
      console.error(
        "이미지 복사 실패:",
        error
      );

      alert(
        "이미지 복사에 실패했습니다."
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

        <div className="image-section">
          <div className="section-header">
            <span className="label">
              이미지
            </span>

            <button
              className="copy-image-button"
              onClick={() => copyImage(post.imageUrl)}
            >
              이미지 복사
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