import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../firebase";

import PostedCard from "../components/PostedCard";

import type { Post } from "../types";

interface PostedPageProps {
  selectedIds: string[];

  setSelectedIds: React.Dispatch<
    React.SetStateAction<
      string[]
    >
  >;

  setPostedIds: React.Dispatch<
    React.SetStateAction<
      string[]
    >
  >;
}

export default function PostedPage({
  selectedIds,
  setSelectedIds,
  setPostedIds,
}: PostedPageProps) {
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
        orderBy(
          "createdAt",
          "desc"
        )
      );

      const snapshot =
        await getDocs(
          postsQuery
        );

      const allPosts: Post[] =
        snapshot.docs.map(
          (document) =>
          ({
            id: document.id,
            ...document.data(),
          } as Post)
        );

      const postedPosts =
        allPosts.filter(
          (post) =>
            post.status ===
            "posted"
        );

      setPosts(
        postedPosts
      );

      setPostedIds(
        postedPosts.map(
          (post) => post.id
        )
      );
    } catch (error) {
      console.error(
        "업로드 완료 게시물 조회 실패:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(
    id: string
  ) {
    setSelectedIds(
      (prev) =>
        prev.includes(id) ? prev.filter(
            (selectedId) => selectedId !== id
          )
          : [...prev, id,]
    );
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
          업로드 완료된 콘텐츠가 없습니다.
        </div>
      ) : (
        posts.map(
          (post) => (
            <PostedCard
              key={post.id}
              post={post}
              selected={
                selectedIds.includes(
                  post.id
                )
              }
              onSelect={handleSelect}
            />
          )
        )
      )}
    </main>
  );
}