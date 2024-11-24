import { NextResponse } from "next/server";
import { availableKeys } from "@/utils/state";

// POST: 클라이언트에서 가능한 프레임 키를 추가
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // 키가 유효한 범위인지 확인 (1-7)
    if (key < 1 || key > 7) {
      return NextResponse.json(
        { error: "Invalid key range (must be 1-7)" },
        { status: 400 }
      );
    }

    if (!availableKeys.includes(key)) {
      availableKeys.push(key); // 새로운 키를 큐에 추가
    }

    return NextResponse.json({ message: "Key received", availableKeys });
  } catch (error) {
    console.error("Error processing POST request:", error);
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
}

// // GET: 현재 가능한 프레임 키 조회
// export async function GET() {
//   try {
//     return NextResponse.json({ availableKeys });
//   } catch (error) {
//     console.error("Error fetching keys:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch keys" },
//       { status: 500 }
//     );
//   }
// }
