import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

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

/* -----------------------------
   Firebase Admin
----------------------------- */

const firebaseApp =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId:
            process.env.FIREBASE_PROJECT_ID,

          clientEmail:
            process.env.FIREBASE_CLIENT_EMAIL,

          privateKey:
            process.env.FIREBASE_PRIVATE_KEY?.replace(
              /\\n/g,
              "\n"
            ),
        }),
      })
    : getApps()[0];

const db = getFirestore(firebaseApp);

/* -----------------------------
   Cloudinary
----------------------------- */

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,
});

/* -----------------------------
   DELETE POST
----------------------------- */

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
    const { id } = req.body ?? {};

    /* -----------------------------
       id 검증
    ----------------------------- */

    if (
      !id ||
      typeof id !== "string"
    ) {
      return res.status(400).json({
        message:
          "올바른 post id가 필요합니다.",
      });
    }

    /* -----------------------------
       Firestore 게시물 조회
    ----------------------------- */

    const docRef = db
      .collection("posts")
      .doc(id);

    const snapshot =
      await docRef.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        message:
          "게시물을 찾을 수 없습니다.",
      });
    }

    const post = snapshot.data();

    /* -----------------------------
       Cloudinary 이미지 삭제
    ----------------------------- */

    if (post?.imagePublicId) {
      const cloudinaryResult =
        await cloudinary.uploader.destroy(
          post.imagePublicId,
          {
            resource_type: "image",
            invalidate: true,
          }
        );

      console.log(
        "Cloudinary 삭제 결과:",
        cloudinaryResult
      );

      // 이미 삭제된 이미지(not found)는
      // 정상적으로 계속 Firestore 삭제 진행
      if (
        cloudinaryResult.result !== "ok" &&
        cloudinaryResult.result !==
          "not found"
      ) {
        throw new Error(
          `Cloudinary 이미지 삭제 실패: ${cloudinaryResult.result}`
        );
      }
    } else {
      console.warn(
        `게시물 ${id}에 imagePublicId가 없습니다.`
      );
    }

    /* -----------------------------
       Firestore 문서 삭제
    ----------------------------- */

    await docRef.delete();

    console.log(
      `게시물 삭제 완료: ${id}`
    );

    return res.status(200).json({
      success: true,
      id,
    });
  } catch (error) {
    console.error(
      "게시물 삭제 오류:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "게시물 삭제 중 오류가 발생했습니다.",
    });
  }
}