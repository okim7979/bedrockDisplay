import { NextResponse } from "next/server";

// let pendingImages = 0; // 받을 이미지 개수 저장 변수
import { incrementPendingImages } from "@/utils/state";

// POST 요청 처리
export async function POST(request: Request) {
  incrementPendingImages();
  console.log("request를 받았습니다.", request);
  return NextResponse.json(
    { message: "Signal received" },
    {
      headers: {
        "Access-Control-Allow-Origin": "*", // 모든 도메인 허용
      },
    }
  );
}

// OPTIONS 요청 처리 (CORS 문제 해결)
export async function OPTIONS() {
  return NextResponse.json(null, {
    headers: {
      "Access-Control-Allow-Origin": "*", // 모든 도메인 허용
      "Access-Control-Allow-Methods": "POST, OPTIONS", // 허용 메서드
      "Access-Control-Allow-Headers": "Content-Type", // 허용 헤더
    },
  });
}
