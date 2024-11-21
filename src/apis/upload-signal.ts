// /pages/api/upload-signal.ts
import type { NextApiRequest, NextApiResponse } from "next";

let pendingImages = 0; // '받을 이미지 개수' 관리

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "Image URL is required." });
    }

    pendingImages += 1; // '받을 이미지 개수' 증가
    console.log(`New image signal received. Pending images: ${pendingImages}`);

    res.status(200).json({ message: "Signal received", pendingImages });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
