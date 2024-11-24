import { NextResponse } from "next/server";

export async function GET() {
  try {
    const waitingData = [
      { frameNumber: 1, waitingNumber: 2 },
      { frameNumber: 1, waitingNumber: 2 },
      { frameNumber: 1, waitingNumber: 2 },
      { frameNumber: 1, waitingNumber: 2 },
    ];

    return NextResponse.json(waitingData);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch waiting data" },
      { status: 500 }
    );
  }
}
