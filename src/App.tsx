import {
  useState,
} from "react";

import {
  doc,
  writeBatch,
} from "firebase/firestore";

import { db } from "./firebase";

import Navbar from "./components/Navbar";
import ReadyPage from "./pages/ReadyPage";
import PostedPage from "./pages/PostedPage";

import "./App.css";

type Page =
  | "ready"
  | "posted";

export default function App() {
  const [page, setPage] =
    useState<Page>("ready");

  const [
    postedIds,
    setPostedIds,
  ] = useState<string[]>([]);

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<string[]>([]);

  function handleSelectAll() {
    if (
      selectedIds.length ===
      postedIds.length
    ) {
      setSelectedIds([]);
    } else {
      setSelectedIds(
        postedIds
      );
    }
  }

  async function handleDeleteSelected() {
    if (
      selectedIds.length === 0
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `선택한 ${selectedIds.length}개의 콘텐츠를 삭제하시겠습니까?`
      );

    if (!confirmed) {
      return;
    }

    try {
      const batch =
        writeBatch(db);

      selectedIds.forEach(
        (id) => {
          batch.delete(
            doc(
              db,
              "posts",
              id
            )
          );
        }
      );

      await batch.commit();

      setPostedIds((prev) =>
        prev.filter(
          (id) =>
            !selectedIds.includes(
              id
            )
        )
      );

      setSelectedIds([]);
    } catch (error) {
      console.error(
        "일괄 삭제 실패:",
        error
      );

      alert(
        "삭제에 실패했습니다."
      );
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>
          컨텐츠 목록
        </h1>

        <Navbar
          currentPage={page}
          onPageChange={
            setPage
          }

          postedIds={
            postedIds
          }
          selectedIds={
            selectedIds
          }

          onSelectAll={
            handleSelectAll
          }

          onDeleteSelected={
            handleDeleteSelected
          }
        />
      </header>

      {page === "ready" && (
        <ReadyPage />
      )}

      {page === "posted" && (
        <PostedPage
          selectedIds={
            selectedIds
          }
          setSelectedIds={
            setSelectedIds
          }
          setPostedIds={
            setPostedIds
          }
        />
      )}
    </div>
  );
}