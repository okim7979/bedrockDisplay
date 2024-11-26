import { NextResponse } from "next/server";
import { imageQueue, resetPendingImages } from "@/utils/state";
import { ImageData } from "@/types/frames";
import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  let pendingImages = { count: Number(searchParams.get("pendingImages")) };

  console.log("get-images 함수 실행됨. pendingImages : ", pendingImages);

  if (pendingImages.count <= 0) {
    console.log("No pending images. Returning 204 status.");
    return new NextResponse(null, { status: 204 });
  }

  const apiUrl = process.env.NEXT_PUBLIC_IMAGE_GET_API_URL;
  if (!apiUrl) {
    console.error("NEXT_PUBLIC_IMAGE_GET_API_URL is not defined");
    return new NextResponse("API URL is not defined", { status: 500 });
  }

  let frameKeyQueue = [1, 2, 3, 4, 5, 6, 7];

  return new Response(
    new ReadableStream({
      async start(controller) {
        let intervalId: NodeJS.Timeout | null = null;
        let isStreamClosed = false;

        const sendKeepAlive = () => {
          if (!isStreamClosed) {
            controller.enqueue(`data: "keep-alive"\n\n`);
            console.log("Sent keep-alive message to client.");
          } else {
            console.warn("Attempted to send keep-alive on closed stream.");
          }
        };

        const fetchAndProcessData = async () => {
          try {
            while (pendingImages.count > 0 && !isStreamClosed) {
              console.log("Fetching data from AWS API Gateway...");
              const response = await axios.get(apiUrl, { timeout: 3000 });

              let dataReceived = false;
              if (Array.isArray(response.data) && response.data.length > 0) {
                console.log("Data fetched from AWS:", response.data);
                dataReceived = true;

                response.data.forEach((obj: ImageData) => {
                  imageQueue.push(obj);
                  pendingImages.count -= 1;
                });
              } else {
                console.warn("No data received or data format invalid.");
              }

              while (imageQueue.length > 0 && !isStreamClosed) {
                const nextData = imageQueue.shift();
                if (!nextData) break;

                const frameKey = frameKeyQueue.shift();
                if (!frameKey) break;

                frameKeyQueue.push(frameKey);

                if (!isStreamClosed) {
                  try {
                    const eventData = JSON.stringify({
                      frameKey,
                      data: nextData,
                    });
                    controller.enqueue(`data: ${eventData}\n\n`);
                    console.log("Sent data to client:", eventData);
                  } catch (error) {
                    console.error("Error sending data:", error);
                    imageQueue.push(nextData);
                  }
                }
              }
              // 데이터를 받지 못했다면 1초 후에 재시도
              if (!dataReceived) {
                console.log("No data received, retrying in 1 seconds...");
                await new Promise((resolve) => setTimeout(resolve, 1));
                continue;
              }
            }

            if (pendingImages.count <= 0) {
              resetPendingImages();
              console.log("No more pending images. Closing stream.");
              clearInterval(intervalId!); // Keep-alive 중지
              controller.close();
            }
          } catch (error: any) {
            console.error("Error fetching data:", error);
          }
        };

        // 3초마다 keep-alive 메시지 전송 시작
        intervalId = setInterval(sendKeepAlive, 3000); // 3초마다 Keep-alive 메시지 전송

        // 초기 데이터 가져오기 시작
        fetchAndProcessData();
      },
    }),
    {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
      },
    }
  );
}

// import { NextResponse } from "next/server";
// import { imageQueue, resetPendingImages } from "@/utils/state";
// import { ImageData } from "@/types/frames";
// import axios from "axios";

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url);

//   //참조로 전달
//   let pendingImages = { count: Number(searchParams.get("pendingImages")) };

//   console.log("get-images 함수 실행됨. pendingImages : ", pendingImages);

//   if (pendingImages.count <= 0) {
//     console.log("No pending images. Returning 204 status.");
//     return new NextResponse(null, { status: 204 });
//   }

//   // 목데이터 생성
//   // const mockData = [
//   //   {
//   //     Image: "/images/change1.jpg",
//   //     Description: "This is a placeholder description for Frame 1.",
//   //   },
//   //   {
//   //     Image: "/images/change2.jpg",
//   //     Description: "This is a placeholder description for Frame 2.",
//   //   },
//   //   {
//   //     Image: "/images/change3.jpg",
//   //     Description: "This is a placeholder description for Frame 3.",
//   //   },
//   //   {
//   //     Image: "/images/change4.jpg",
//   //     Description: "This is a placeholder description for Frame 4.",
//   //   },
//   // ];

//   const apiUrl = process.env.NEXT_PUBLIC_IMAGE_GET_API_URL;
//   if (!apiUrl) {
//     console.error("NEXT_PUBLIC_IMAGE_GET_API_URL is not defined");
//     return new NextResponse("API URL is not defined", { status: 500 });
//   }

//   // 프레임 키 큐 생성 및 초기화
//   let frameKeyQueue = [1, 2, 3, 4, 5, 6, 7];
//   console.log("Initialized frameKeyQueue:", frameKeyQueue);

//   return new Response(
//     new ReadableStream({
//       async start(controller) {
//         // 롱 폴링 함수
//         const fetchAndProcessData = async () => {
//           while (pendingImages.count > 0) {
//             console.log("Pending images remaining:", pendingImages.count);

//             // let mockDataAdded = false; // 플래그 추가
//             try {
//               // if (!mockDataAdded) {
//               //   mockData.forEach((obj) => {
//               //     imageQueue.push(obj);
//               //     pendingImages.count -= 1;
//               //   });
//               //   mockDataAdded = true; // 데이터가 추가되었음을 기록
//               //   console.log("Current imageQueue (mock data):", imageQueue);
//               // }

//               console.log("Fetching data from AWS API Gateway...");
//               const response = await axios.get(apiUrl, { timeout: 14000 });

//               const now = new Date();
//               console.log("현재 시간 (서버):", now.toLocaleString());

//               if (Array.isArray(response.data) && response.data.length > 0) {
//                 console.log("Data fetched from AWS:", response.data);
//                 // 데이터 큐에 추가
//                 response.data.forEach((obj: ImageData) => {
//                   imageQueue.push(obj);
//                   // pendingImages = pendingImages - 1;
//                   pendingImages.count -= 1;
//                   console.log(pendingImages.count);
//                 });
//               } else {
//                 console.warn("No data received or data format invalid.");
//               }

//               // 큐에서 데이터를 처리 및 전송
//               while (imageQueue.length > 0) {
//                 const nextData = imageQueue.shift();
//                 if (!nextData) break;
//                 console.log("imageQueue 에서 뽑은 데이터 : ", nextData);

//                 // 프레임 키 큐에서 다음 키 가져오기
//                 const frameKey = frameKeyQueue.shift();
//                 if (!frameKey) break;
//                 console.log("Using frameKey:", frameKey);

//                 // 프레임 키를 다시 큐 끝에 추가 (순환 구조)
//                 frameKeyQueue.push(frameKey); // undefined가 아닌 경우만 push
//                 console.log("Updated frameKeyQueue:", frameKeyQueue);

//                 // if (frameKey !== undefined) {
//                 //   frameKeyQueue.push(frameKey); // undefined가 아닌 경우만 push
//                 //   console.log("Updated frameKeyQueue:", frameKeyQueue);
//                 // } else {
//                 //   console.warn("Frame key is undefined. Skipping...");
//                 // }

//                 try {
//                   const eventData = JSON.stringify({
//                     frameKey,
//                     data: nextData,
//                   });
//                   controller.enqueue(`data: ${eventData}\n\n`);
//                   console.log("Sent data to client:", eventData);
//                 } catch (error) {
//                   console.error("Error routing data:", error);
//                   imageQueue.push(nextData); // 실패한 데이터 다시 삽입
//                 }
//               }
//             } catch (error: any) {
//               if (error.response) {
//                 console.error("API Gateway responded with an error:", {
//                   // response: error.response,
//                   status: error.response.status,
//                   data: error.response.data,
//                   headers: error.response.headers,
//                   eventDetails: error.response.eventDetails,
//                 });
//               } else if (error.request) {
//                 console.error(
//                   "No response received from API Gateway:",
//                   error.request
//                 );
//               } else {
//                 console.error(
//                   "Error setting up API Gateway request:",
//                   error.message
//                 );
//               }
//               // 15초 대기 후 다시 요청
//               if (pendingImages.count > 0) {
//                 console.log("Waiting for 15 seconds before next fetch...");
//                 await new Promise((resolve) => setTimeout(resolve, 15000));
//               }
//             }

//             // pendingImages.count가 0이 되면 스트림 종료
//             if (pendingImages.count <= 0) {
//               resetPendingImages(); // 전역변수 pendingImages 0으로 초기화
//               console.log("No more pending images. Closing stream.");
//               controller.close();
//               break;
//             }
//           }
//         };

//         fetchAndProcessData();
//       },
//     }),
//     {
//       headers: {
//         "Content-Type": "text/event-stream",
//         "Cache-Control": "no-cache",
//         Connection: "keep-alive",
//         "Access-Control-Allow-Origin": "*", // 클라이언트 도메인
//         "Access-Control-Allow-Credentials": "true", // 인증 정보 허용
//       },
//     }
//   );
// }
