import { NextResponse } from "next/server";
import axios from "axios";
import {
  imageQueue,
  pendingImages,
  decrementPendingImages,
  availableKeys,
} from "@/utils/state";

import { ImageData } from "@/types/frames";

export async function GET(req: Request) {
  console.log("get-images 함수 실행");

  if (pendingImages <= 0) {
    console.log("No pending images. Returning 204 status.");
    return new NextResponse(null, { status: 204 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_IMAGE_GET_API_URL;
  if (!apiUrl) {
    console.error("NEXT_PUBLIC_IMAGE_GET_API_URL is not defined");
    return new NextResponse("API URL is not defined", { status: 500 });
  }

  return new Response(
    new ReadableStream({
      async start(controller) {
        // 롱 폴링 함수
        const fetchAndProcessData = async () => {
          while (pendingImages > 0) {
            console.log("Pending images remaining:", pendingImages);

            try {
              console.log("Fetching data from AWS API Gateway...");
              const response = await axios.get(apiUrl, { timeout: 60000 });

              if (Array.isArray(response.data) && response.data.length > 0) {
                console.log("Data fetched from AWS:", response.data);

                // 데이터 큐에 추가
                response.data.forEach((obj: ImageData) => {
                  imageQueue.push(obj);
                });

                console.log("Current imageQueue:", imageQueue);
                decrementPendingImages(response.data.length); // 처리된 데이터 개수만큼 pendingImages 감소
              } else {
                console.warn(
                  "No data fetched or invalid format:",
                  response.data
                );
              }

              // 큐에서 데이터를 처리 및 전송
              while (imageQueue.length > 0 && availableKeys.length > 0) {
                const nextData = imageQueue.shift();
                if (!nextData) break;

                const frameKey = availableKeys.shift();
                if (!frameKey) break;

                try {
                  const endpoint =
                    frameKey >= 1 && frameKey <= 4
                      ? `${process.env.NEXT_PUBLIC_SERVICE_URL}/middle`
                      : `${process.env.NEXT_PUBLIC_SERVICE_URL}/last`;

                  await axios.post(endpoint, { frameKey, data: nextData });

                  // 데이터를 클라이언트로 전송
                  const eventData = JSON.stringify({
                    frameKey,
                    data: nextData,
                  });
                  controller.enqueue(`data: ${eventData}\n\n`);
                  console.log("Sent data to client:", eventData);
                } catch (error) {
                  console.error("Error routing data:", error);
                  imageQueue.push(nextData); // 실패한 데이터 다시 삽입
                }
              }
            } catch (error) {
              console.error("Error fetching data from AWS API Gateway:", error);
              await new Promise((resolve) => setTimeout(resolve, 5000)); // 5초 대기 후 재시도
            }

            // pendingImages가 0이 되면 스트림 종료
            if (pendingImages <= 0) {
              console.log("No more pending images. Closing stream.");
              controller.close();
              break;
            }
          }
        };

        fetchAndProcessData();
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
