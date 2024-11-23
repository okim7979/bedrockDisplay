import { NextResponse } from "next/server";

let availableKeys: number[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json(); // 요청에서 JSON 데이터 파싱
    const { key } = body;

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    availableKeys.push(key); // 전송된 key값 큐에 저장
    return NextResponse.json({ message: "Key received", availableKeys });
  } catch (error) {
    console.error("Error processing POST request:", error);
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
}
