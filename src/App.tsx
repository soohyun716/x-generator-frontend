import { useEffect, useState } from "react";

import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";
import PostCard from "./components/PostCard";
import type { Post } from "./types";

import "./App.css";

export default function App() {
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

      const data = snapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      ) as Post[];

      setPosts(data);
    } catch (error) {
      console.error(
        "게시물 불러오기 실패:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    id: string,
    status: Post["status"]
  ) {
    try {
      await updateDoc(
        doc(db, "posts", id),
        {
          status,
        }
      );

      setPosts((prev) =>
        prev.map((post) =>
          post.id === id
            ? {
                ...post,
                status,
              }
            : post
        )
      );
    } catch (error) {
      console.error(
        "상태 변경 실패:",
        error
      );

      alert("상태 변경에 실패했습니다.");
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
    <div className="app">
      <header className="header">
        <h1>컨텐츠 목록</h1>

        <p>
          전체 {posts.length}개 ·
          업로드 대기{" "}
          {
            posts.filter(
              (post) =>
                post.status === "ready"
            ).length
          }{" "}
          · 업로드 완료{" "}
          {
            posts.filter(
              (post) =>
                post.status === "posted"
            ).length
          }
        </p>
      </header>

      <main className="feed">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onStatusChange={
              handleStatusChange
            }
          />
        ))}
      </main>
    </div>
  );
}