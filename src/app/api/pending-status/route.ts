// src/app/api/pending-status/route.ts
import { NextResponse } from "next/server";
import { pendingImages } from "@/utils/state";

export async function GET() {
  return NextResponse.json({ pendingImages });
}
