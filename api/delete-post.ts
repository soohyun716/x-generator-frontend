import type { VercelRequest, VercelResponse } from "@vercel/node";

import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import {
  getFirestore,
} from "firebase-admin/firestore";

import {
  v2 as cloudinary,
} from "cloudinary";

const firebaseApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey:
            process.env.FIREBASE_PRIVATE_KEY?.replace(
              /\\n/g,
              "\n"
            ),
        }),
      })
    : getApps()[0];

const db = getFirestore(firebaseApp);

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,
  api_key:
    process.env.CLOUDINARY_API_KEY,
  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({
      message: "Method not allowed",
    });
  }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        message: "post id가 필요합니다.",
      });
    }

    const docRef =
      db.collection("posts").doc(id);

    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        message: "게시물이 없습니다.",
      });
    }

    const post = snapshot.data();

    // Cloudinary 이미지 삭제
    if (post?.imagePublicId) {
      await cloudinary.uploader.destroy(
        post.imagePublicId
      );
    }

    // Firestore 문서 삭제
    await docRef.delete();

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "삭제 중 오류 발생",
    });
  }
}