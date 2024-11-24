import { NextResponse } from "next/server";
import { incrementPendingImages, decrementPendingImages } from "@/utils/state";

export async function POST(req: Request) {
  try {
    const body = await req.json(); // 요청 본문 파싱
    const { action, count } = body;

    if (!action || typeof count !== "number") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (action === "increment") {
      incrementPendingImages(count);
    } else if (action === "decrement") {
      decrementPendingImages(count);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ message: "Pending images updated" });
  } catch (error) {
    console.error("Error handling update request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
