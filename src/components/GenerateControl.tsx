const API_URL =
  "http://211.188.62.164:3000";

export interface GenerateStatus {
  isGenerating: boolean;
  current: number;
  total: number;
  successCount: number;
  failCount: number;
}

export interface GenerateResult {
  requested: number;
  successCount: number;
  failCount: number;
}

interface GenerateResponse {
  success: boolean;
  message: string;
  result: GenerateResult;
}

export async function getGenerateStatus() {
  const response = await fetch(
    `${API_URL}/api/generate/status`
  );

  if (!response.ok) {
    throw new Error(
      "생성 상태 조회 실패"
    );
  }

  const status: GenerateStatus =
    await response.json();

  return status;
}

export async function generateContents(
  count: number
) {
  const response = await fetch(
    `${API_URL}/api/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        count,
      }),
    }
  );

  const data: GenerateResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "컨텐츠 생성 실패"
    );
  }

  return data;
}