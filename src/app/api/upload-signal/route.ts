import { NextResponse } from "next/server";
import { incrementPendingImages } from "@/utils/state";

// POST 요청 처리
export async function POST(request: Request) {
  incrementPendingImages();
  const now = new Date();
  console.log("현재 시간 (서버):", now.toLocaleString());

  const body = await request.json();
  console.log("POST request received with body:", body);
  console.log();
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
