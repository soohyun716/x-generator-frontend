import type { Timestamp } from "firebase/firestore";

export interface Post {
  id: string;

  title: string;
  body: string;
  threadText: string;

  imageUrl: string;
  imagePublicId: string;

  status:
  | "ready"
  | "posted";

  createdAt?: Timestamp;
}