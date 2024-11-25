import { NextResponse } from "next/server";
import { imageQueue, resetPendingImages } from "@/utils/state";
import { ImageData } from "@/types/frames";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  let pendingImages = Number(searchParams.get("pendingImages")); // 클라이언트로부터 전달된 pendingImages 값
  console.log("get-images 함수 실행됨. pendingImages : ", pendingImages);

  if (pendingImages <= 0) {
    console.log("No pending images. Returning 204 status.");
    return new NextResponse(null, { status: 204 });
  }

  // 목데이터 생성
  const mockData = [
    {
      Image: "https://via.placeholder.com/150",
      Description: "This is a placeholder description for Frame 1.",
    },
    {
      Image: "https://via.placeholder.com/150",
      Description: "This is a placeholder description for Frame 2.",
    },
    {
      Image: "https://via.placeholder.com/150",
      Description: "This is a placeholder description for Frame 3.",
    },
    {
      Image: "https://via.placeholder.com/150",
      Description: "This is a placeholder description for Frame 4.",
    },
  ];

  // 프레임 키 큐 생성 및 초기화
  let frameKeyQueue = [1, 2, 3, 4, 5, 6, 7];
  console.log("Initialized frameKeyQueue:", frameKeyQueue);

  return new Response(
    new ReadableStream({
      async start(controller) {
        // 롱 폴링 함수
        const fetchAndProcessData = async () => {
          while (pendingImages > 0) {
            console.log("Pending images remaining:", pendingImages);
            let mockDataAdded = false; // 플래그 추가

            try {
              if (!mockDataAdded) {
                mockData.forEach((obj) => {
                  imageQueue.push(obj);
                  pendingImages = pendingImages - 1;
                });
                mockDataAdded = true; // 데이터가 추가되었음을 기록
                console.log("Current imageQueue (mock data):", imageQueue);
              }

              // 큐에서 데이터를 처리 및 전송
              while (imageQueue.length > 0) {
                const nextData = imageQueue.shift();
                if (!nextData) break;
                console.log("imageQueue 에서 뽑은 데이터 : ", nextData);

                // 프레임 키 큐에서 다음 키 가져오기
                const frameKey = frameKeyQueue.shift();
                // if (!frameKey) {
                //   console.warn(
                //     "No available frame key. Waiting for 1 minute..."
                //   );
                //   await new Promise((resolve) => setTimeout(resolve, 60000));
                //   continue;
                // }

                console.log("Using frameKey:", frameKey);

                // 프레임 키를 다시 큐 끝에 추가 (순환 구조)
                if (frameKey !== undefined) {
                  frameKeyQueue.push(frameKey); // undefined가 아닌 경우만 push
                  console.log("Updated frameKeyQueue:", frameKeyQueue);
                } else {
                  console.warn("Frame key is undefined. Skipping...");
                }

                try {
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
            } catch (error: any) {
              if (error.response) {
                console.error("API Gateway responded with an error:", {
                  status: error.response.status,
                  data: error.response.data,
                  headers: error.response.headers,
                });
              } else if (error.request) {
                console.error(
                  "No response received from API Gateway:",
                  error.request
                );
              } else {
                console.error(
                  "Error setting up API Gateway request:",
                  error.message
                );
              }
            }

            // pendingImages가 0이 되면 스트림 종료
            if (pendingImages <= 0) {
              resetPendingImages();
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
        "Access-Control-Allow-Origin": "*", // 클라이언트 도메인
        "Access-Control-Allow-Credentials": "true", // 인증 정보 허용

        // "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
