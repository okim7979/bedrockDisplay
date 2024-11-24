import { NextResponse } from "next/server";
import axios from "axios";
import {
  imageQueue,
  pendingImages,
  decrementPendingImages,
  availableKeys,
} from "@/utils/state";

// AWS로부터 데이터를 받아와 적절한 엔드포인트로 전송하는 함수
async function processAndRouteData(data: { src: string; text: string }) {
  // availableKeys에서 가장 오래된 키를 가져옴
  const frameKey = availableKeys[0];

  if (!frameKey) {
    return null; // 사용 가능한 프레임 키가 없으면 처리하지 않음
  }

  // 프레임 번호에 따라 엔드포인트 결정
  const endpoint =
    frameKey >= 1 && frameKey <= 4
      ? `${process.env.NEXT_PUBLIC_SERVICE_URL}/middle`
      : `${process.env.NEXT_PUBLIC_SERVICE_URL}/right`;

  try {
    // 데이터 전송
    await axios.post(endpoint, {
      frameKey, // 클라이언트에서 사용할 프레임 번호
      data, // 이미지와 텍스트 데이터
    });

    // 사용된 키 제거
    availableKeys.shift(); // 가장 오래된 키를 제거
    decrementPendingImages(); // 처리된 이미지 수 감소

    return true; // 성공적으로 처리된 경우
  } catch (error) {
    console.error("Error routing data:", error);
    return false; // 처리 실패 시 false 반환
  }
}

// GET 메서드 처리 (롱폴링 구현)
export async function GET() {
  try {
    // `pendingImages`가 0 이하이면 더 이상 처리하지 않음
    if (pendingImages <= 0) {
      return NextResponse.json(
        { message: "No pending images" },
        { status: 204 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_IMAGE_GET_API_URL;

    // API URL이 정의되지 않은 경우
    if (!apiUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_IMAGE_GET_API_URL is not defined" },
        { status: 500 }
      );
    }

    // AWS API Gateway에서 데이터를 가져옴
    const response = await axios.get(apiUrl);

    let receivedDataCount = 0; // 현재 요청에서 받은 데이터 개수 추적

    // 가져온 데이터를 이미지 큐에 추가
    if (response.data && response.data.images) {
      imageQueue.push(...response.data.images); // 가져온 데이터를 큐에 추가
      receivedDataCount = response.data.images.length;
    }

    // 큐에서 데이터를 처리하고, 사용 가능한 키와 매칭
    while (imageQueue.length > 0 && availableKeys.length > 0) {
      const nextImage = imageQueue.shift(); // 큐에서 첫 번째 이미지를 가져옴
      if (nextImage) {
        const processed = await processAndRouteData(nextImage);
        if (processed) {
          receivedDataCount--; // 성공적으로 처리된 데이터 감소
        }
      }
    }

    // `pendingImages` 값 업데이트
    for (let i = 0; i < receivedDataCount; i++) {
      decrementPendingImages();
    }

    // 여전히 처리해야 할 `pendingImages`가 남아있으면 계속 롱폴링
    if (pendingImages > 0) {
      return NextResponse.json(
        {
          message: "Continue polling",
          pendingImages,
          processedCount: receivedDataCount,
        },
        { status: 200 }
      );
    }

    // 모든 데이터가 처리된 경우
    return NextResponse.json(
      { message: "All pending images processed" },
      { status: 204 }
    );
  } catch (error) {
    console.error("Error fetching images:", error);

    // 오류 발생 시 클라이언트에 알림
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
