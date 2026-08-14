import {
  useEffect,
  useState,
} from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import { db } from "../firebase";

import "../styles/navbar.css";

type Page = "ready" | "posted";

interface NavbarProps {
  currentPage: Page;

  onPageChange: (
    page: Page
  ) => void;

  postedIds: string[];
  selectedIds: string[];

  onSelectAll: () => void;
  onDeleteSelected: () => void;
}

export default function Navbar({
  currentPage,
  onPageChange,

  postedIds,
  selectedIds,

  onSelectAll,
  onDeleteSelected,
}: NavbarProps) {
  const [readyCount, setReadyCount] =
    useState(0);

  const [postedCount, setPostedCount] =
    useState(0);

  useEffect(() => {
    loadCounts();
  }, [currentPage]);

  async function loadCounts() {
    try {
      const snapshot = await getDocs(
        collection(db, "posts")
      );

      let ready = 0;
      let posted = 0;

      snapshot.docs.forEach(
        (document) => {
          const data =
            document.data();

          if (
            data.status === "ready"
          ) {
            ready++;
          }

          if (
            data.status === "posted"
          ) {
            posted++;
          }
        }
      );

      setReadyCount(ready);
      setPostedCount(posted);
    } catch (error) {
      console.error(
        "게시물 개수 조회 실패:",
        error
      );
    }
  }

  const allSelected =
    postedIds.length > 0 &&
    selectedIds.length ===
    postedIds.length;

  return (
    <nav className="navbar">
      <div className="nav-tabs">
        <button
          className={
            currentPage === "ready"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            onPageChange("ready")
          }
        >
          업로드 대기

          <span className="nav-count">
            {readyCount}
          </span>
        </button>

        <button
          className={
            currentPage === "posted"
              ? "nav-button active"
              : "nav-button"
          }
          onClick={() =>
            onPageChange("posted")
          }
        >
          업로드 완료

          <span className="nav-count">
            {postedCount}
          </span>
        </button>
      </div>

      {currentPage === "posted" && (
        <div className="nav-actions">
          <label className="nav-select-all">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onSelectAll}
            />

            전체 선택
          </label>

          <button
            className="nav-delete-button"
            onClick={onDeleteSelected}
            disabled={
              selectedIds.length === 0
            }
          >
            선택 삭제
            {selectedIds.length > 0 &&
              ` (${selectedIds.length})`}
          </button>
        </div>
      )}
    </nav>
  );
}