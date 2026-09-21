import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";

import { db } from "../firebase";

import type { Post } from "../types";

import "../styles/card.css";

interface ApprovedPageProps {
  refreshKey: number;
}

export default function ApprovedPage({
  refreshKey,
}: ApprovedPageProps) {
  const [posts, setPosts] =
    useState<Post[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [scheduling, setScheduling] =
    useState(false);

  useEffect(() => {
    loadPosts();
  }, [refreshKey]);

  async function loadPosts() {
    try {
      setLoading(true);

      const postsQuery = query(
        collection(db, "posts"),
        orderBy("createdAt", "desc")
      );

      const snapshot =
        await getDocs(postsQuery);

      const allPosts: Post[] =
        snapshot.docs.map(
          (document) => ({
            id: document.id,
            ...document.data(),
          } as Post)
        );

      const approvedPosts =
        allPosts.filter(
          (post) =>
            post.status === "approved"
        );

      setPosts(approvedPosts);
    } catch (error) {
      console.error(
        "업로드 확정 게시물 조회 실패:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelApprove(
    id: string
  ) {
    try {
      await updateDoc(
        doc(db, "posts", id),
        {
          status: "ready",
        }
      );

      setPosts((prev) =>
        prev.filter(
          (post) => post.id !== id
        )
      );
    } catch (error) {
      console.error(
        "승인 취소 실패:",
        error
      );

      alert(
        "승인 취소에 실패했습니다."
      );
    }
  }

  function createScheduleSlots(
    count: number
  ) {
    const totalSlots = 72;

    if (count > totalSlots) {
      throw new Error(
        "하루에 예약할 수 있는 게시물은 최대 72개입니다."
      );
    }

    if (count === 0) {
      return [];
    }

    /*
      06:00 ~ 23:45
      총 72개의 15분 슬롯.

      게시물이 72개보다 적으면
      하루 전체에 최대한 골고루 배치한다.
    */

    const selectedSlotIndexes: number[] =
      [];

    if (count === 1) {
      selectedSlotIndexes.push(0);
    } else {
      for (
        let i = 0;
        i < count;
        i++
      ) {
        const index = Math.round(
          (i * (totalSlots - 1)) /
            (count - 1)
        );

        selectedSlotIndexes.push(
          index
        );
      }
    }

    return selectedSlotIndexes.map(
      (slotIndex) => {
        const totalMinutes =
          6 * 60 +
          slotIndex * 15;

        const hour = Math.floor(
          totalMinutes / 60
        );

        const minute =
          totalMinutes % 60;

        return {
          hour,
          minute,
        };
      }
    );
  }

  async function handleSchedule() {
    if (posts.length === 0) {
      alert(
        "예약할 게시물이 없습니다."
      );
      return;
    }

    if (posts.length > 72) {
      alert(
        `현재 ${posts.length}개가 승인되어 있습니다.\n하루 최대 72개까지 예약할 수 있습니다.`
      );
      return;
    }

    const confirmed =
      window.confirm(
        `${posts.length}개의 게시물에 오늘 예약 시간을 배정하시겠습니까?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setScheduling(true);

      const slots =
        createScheduleSlots(
          posts.length
        );

      /*
        현재 posts는 createdAt desc로
        불러왔기 때문에 최신 게시물이 먼저 있음.

        예약은 오래된 승인 게시물부터
        먼저 올라가도록 순서를 뒤집는다.
      */
      const postsToSchedule = [
        ...posts,
      ].reverse();

      const batch =
        writeBatch(db);

      postsToSchedule.forEach(
        (post, index) => {
          const slot =
            slots[index];

          const scheduledDate =
            new Date();

          scheduledDate.setHours(
            slot.hour,
            slot.minute,
            0,
            0
          );

          batch.update(
            doc(
              db,
              "posts",
              post.id
            ),
            {
              status: "scheduled",
              scheduledAt:
                Timestamp.fromDate(
                  scheduledDate
                ),
              schedulingError: null,
            }
          );
        }
      );

      await batch.commit();

      setPosts([]);

      alert(
        `${postsToSchedule.length}개의 게시물에 예약 시간이 배정되었습니다.`
      );
    } catch (error) {
      console.error(
        "예약 시간 배정 실패:",
        error
      );

      if (
        error instanceof Error
      ) {
        alert(error.message);
      } else {
        alert(
          "예약 시간 배정에 실패했습니다."
        );
      }
    } finally {
      setScheduling(false);
    }
  }

  function formatScheduledPreview() {
    if (
      posts.length === 0 ||
      posts.length > 72
    ) {
      return "";
    }

    const slots =
      createScheduleSlots(
        posts.length
      );

    const first = slots[0];
    const last =
      slots[slots.length - 1];

    const format = (
      hour: number,
      minute: number
    ) =>
      `${String(hour).padStart(
        2,
        "0"
      )}:${String(minute).padStart(
        2,
        "0"
      )}`;

    return `${format(
      first.hour,
      first.minute
    )} ~ ${format(
      last.hour,
      last.minute
    )}`;
  }

  if (loading) {
    return (
      <div className="loading">
        불러오는 중...
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          marginBottom: "20px",
        }}
      >
        <div>
          <strong>
            업로드 확정{" "}
            {posts.length}개
          </strong>

          {posts.length > 0 &&
            posts.length <= 72 && (
              <span
                style={{
                  marginLeft: "12px",
                  fontSize: "13px",
                }}
              >
                예약 범위:{" "}
                {formatScheduledPreview()}
              </span>
            )}
        </div>

        <button
          className="upload-button"
          onClick={
            handleSchedule
          }
          disabled={
            scheduling ||
            posts.length === 0
          }
        >
          {scheduling
            ? "배정 중..."
            : "예약시간 배정"}
        </button>
      </div>

      <main className="feed">
        {posts.length === 0 ? (
          <div className="empty">
            업로드 확정된 콘텐츠가
            없습니다.
          </div>
        ) : (
          posts.map((post) => (
            <article
              className="post-card"
              key={post.id}
            >
              <div className="post-info">
                <div className="text-section">
                  <div className="section-header">
                    <span className="label">
                      제목
                    </span>
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
                  </div>

                  <img
                    className="post-image"
                    src={
                      post.imageUrl
                    }
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
                  </div>

                  <p className="thread">
                    {
                      post.threadText
                    }
                  </p>
                </div>

                <div className="actions">
                  <button
                    className="delete-button"
                    onClick={() =>
                      handleCancelApprove(
                        post.id
                      )
                    }
                  >
                    승인 취소
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </main>
    </>
  );
}