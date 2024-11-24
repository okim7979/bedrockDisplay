import { NextResponse } from "next/server";
import { pendingImages } from "@/utils/state";

export async function GET() {
  return NextResponse.json({ pendingImages });
}
