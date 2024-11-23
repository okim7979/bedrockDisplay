import { NextResponse } from "next/server";
import axios from "axios";

let pendingImages = 0;
let imageQueue: { src: string; text: string }[] = []; // 이미지와 텍스트 큐

// GET 메서드 처리
export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_IMAGE_GET_API_URL;

    if (!apiUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_IMAGE_GET_API_URL is not defined" },
        { status: 500 }
      );
    }

    if (imageQueue.length === 0 && pendingImages > 0) {
      const response = await axios.get(apiUrl);
      if (response.data && response.data.images) {
        imageQueue.push(...response.data.images); // 가져온 데이터를 큐에 추가
        pendingImages -= response.data.images.length; // 처리된 만큼 감소
      }
    }

    if (imageQueue.length > 0) {
      const imagesToSend = imageQueue.splice(0, 4); // 최대 4개의 이미지 반환
      return NextResponse.json({ images: imagesToSend });
    }

    return NextResponse.json(
      { message: "No images available" },
      { status: 204 }
    ); // 데이터 없음
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}

// POST 메서드 처리
export async function POST(req: Request) {
  try {
    pendingImages += 1; // 받을 이미지 개수 증가
    return NextResponse.json({ message: "Signal received", pendingImages });
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
}

// import type { NextApiRequest, NextApiResponse } from "next";
// import axios from "axios";

// let imageQueue: { src: string; text: string }[] = []; // 이미지와 텍스트 큐

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method === "GET") {
//     // API Gateway 호출
//     try {
//       if (imageQueue.length === 0) {
//         // const response = await axios.get(process.env.NEXT_PUBLIC_API_URL);
//         const response = await axios.get(
//           "https://49y0g7b24k.execute-api.ap-northeast-1.amazonaws.com/dbToClient"
//         );
//         if (response.data) {
//           imageQueue.push(...response.data.images); // 가져온 데이터를 큐에 추가
//         }
//       }

//       if (imageQueue.length > 0) {
//         const imagesToSend = imageQueue.splice(0, 4); // 최대 4개의 이미지 반환
//         return res.status(200).json({ images: imagesToSend });
//       }

//       return res.status(204).end(); // 큐가 비어있으면 데이터 없음
//     } catch (error) {
//       console.error("Error fetching images:", error);
//       return res.status(500).json({ error: "Failed to fetch images" });
//     }
//   }
//   res.setHeader("Allow", ["GET"]);
//   res.status(405).end(`Method ${req.method} Not Allowed`);
// }
