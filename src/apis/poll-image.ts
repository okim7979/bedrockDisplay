import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

// let pendingImages = 0; // '받을 이미지 개수' 관리
// let imageQueue: string[] = []; // 이미지 큐

// 목데이터 생성 함수 (비동기 API 호출 시뮬레이션)
const fetchMockImages = (): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        "/images/mock1.png",
        "/images/mock2.png",
        "/images/mock3.png",
        "/images/mock4.png",
      ]); // 4개의 목데이터 반환
    }, 1000); // 1초 지연 시뮬레이션
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    // if (pendingImages > 0) {
    // try {
    // 실제 이미지 전달 코드
    // // API Gateway 또는 S3에서 이미지 가져오기
    // const response = await axios.get(
    //   "https://cyjzamjs70.execute-api.ap-northeast-2.amazonaws.com/uploadOmega"
    // );
    // if (response.data && response.data.length > 0) {
    //   imageQueue.push(...response.data.map((item: any) => item.Image)); // 큐에 이미지 추가
    //   pendingImages -= response.data.length; // 처리된 이미지만큼 개수 감소
    //   res.status(200).json({ images: imageQueue });
    // } else {
    //   res.status(204).end(); // 데이터 없음
    // }
    // 큐에 이미지가 남아 있다면 반환
    // if (imageQueue.length > 0) {
    //   const imagesToReturn = imageQueue.splice(0, 4); // 최대 4개 이미지를 반환
    //   return res.status(200).json({ images: imagesToReturn });
    // }
    // // 큐가 비었을 경우, pendingImages가 0보다 크면 목데이터 가져오기
    // if (pendingImages > 0) {
    //   const newImages = await fetchMockImages(); // 목데이터 가져오기
    //   imageQueue.push(...newImages); // 큐에 추가
    //   //   pendingImages -= newImages.length; // 처리된 만큼 감소
    //   const imagesToReturn = imageQueue.splice(0, 4); // 최대 4개 반환
    //   return res.status(200).json({ images: imagesToReturn });
    // }
    // } catch (error) {
    //       console.error("Error fetching images:", error);
    //       res.status(500).json({ error: "Failed to fetch images" });
    //     }
    //   } else {
    //     res.status(204).end(); // 대기 중인 이미지가 없을 경우
    //   }
    // } else {
    //   res.setHeader("Allow", ["GET"]);
    //   res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
