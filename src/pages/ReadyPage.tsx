import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";

import ReadyCard from "../components/ReadyCard";

import type { Post } from "../types";

import "../styles/card.css";

export default function ReadyPage() {
  const [posts, setPosts] =
    useState<Post[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
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

      const readyPosts =
        allPosts.filter(
          (post) =>
            post.status === "ready"
        );

      setPosts(readyPosts);
    } catch (error) {
      console.error(
        "업로드 대기 게시물 조회 실패:",
        error
      );
    } finally {
      setLoading(false);
    }
  }
  
  async function handleUpload(
    id: string
  ) {
    try {
      await updateDoc(
        doc(db, "posts", id),
        {
          status: "posted",
        }
      );

      // ready 페이지에서는 바로 제거
      setPosts((prev) =>
        prev.filter(
          (post) =>
            post.id !== id
        )
      );
    } catch (error) {
      console.error(
        "상태 변경 실패:",
        error
      );

      alert(
        "업로드 상태 변경에 실패했습니다."
      );
    }
  }

  async function handleDelete(
    id: string
  ) {
    const confirmed =
      window.confirm(
        "정말 삭제하시겠습니까?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteDoc(
        doc(db, "posts", id)
      );

      setPosts((prev) =>
        prev.filter(
          (post) =>
            post.id !== id
        )
      );
    } catch (error) {
      console.error(
        "게시물 삭제 실패:",
        error
      );

      alert(
        "게시물 삭제에 실패했습니다."
      );
    }
  }

  if (loading) {
    return (
      <div className="loading">
        불러오는 중...
      </div>
    );
  }

  return (
    <main className="feed">
      {posts.length === 0 ? (
        <div className="empty">
          업로드 대기 중인 콘텐츠가 없습니다.
        </div>
      ) : (
        posts.map((post) => (
          <ReadyCard
            key={post.id}
            post={post}
            onUpload={
              handleUpload
            }
            onDelete={
              handleDelete
            }
          />
        ))
      )}
    </main>
  );
}