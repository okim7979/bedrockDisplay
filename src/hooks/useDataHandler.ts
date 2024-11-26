import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ImageData } from "@/types/frames";

export function useDataHandler( //업데이트 받는 pendingImages를 사용하여 get-images로부터 SSE 연결 받아오기
  pendingImages: number,
  isMiddleScreen: boolean,
  updateFrames: (frameKey: number, data: ImageData) => void
) {
  useEffect(() => {
    console.log("useDataHandler initialized with:", { pendingImages });
    // EventSource 또는 데이터 로직 추가
  }, [pendingImages]);
  // const [pendingImages, setPendingImages] = useState<number>(0);
  // const [isConnected, setIsConnected] = useState(false);

  // 이벤트 핸들러 설정
  const setupEventSource = useCallback(() => {
    // const currentPendingImages = await fetchPendingImages();

    if (pendingImages <= 0) {
      console.log("No pending images to process");
      return null;
    }

    console.log("Setting up EventSource with pendingImages:", pendingImages);
    const eventSource = new EventSource(
      `/api/get-images?pendingImages=${pendingImages}`
    );

    eventSource.onopen = () => {
      console.log("EventSource connection opened:");
      // setIsConnected(true);
    };

    eventSource.onmessage = async (event) => {
      try {
        if (event.data === '"keep-alive"') {
          // Keep-alive 메시지 무시
          console.log("Received keep-alive message. Ignoring.");
          return;
        }

        console.log("Received SSE message:", event.data);
        const { frameKey, data } = JSON.parse(event.data);

        const endpoint =
          isMiddleScreen && frameKey >= 1 && frameKey <= 4
            ? `${process.env.NEXT_PUBLIC_SERVICE_URL}/middle`
            : !isMiddleScreen && frameKey >= 5 && frameKey <= 7
            ? `${process.env.NEXT_PUBLIC_SERVICE_URL}/last`
            : null;

        if (endpoint) {
          console.log("Updating frames with:", { frameKey, data });

          updateFrames(frameKey, data);

          // try {
          //   // console.log(`Sending data to ${endpoint}`, { frameKey, data });
          //   // await axios.post(endpoint, { frameKey, ...data });

          //   // UI 업데이트
          //   updateFrames(frameKey, data);
          //   console.log("Frame updated successfully:", { frameKey, data });
          // } catch (error) {
          //   console.error(`Error sending data to ${endpoint}:`, error);
          // }
        }
      } catch (error) {
        console.error("Error processing SSE message:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      // setIsConnected(false);
      eventSource.close();
    };

    return eventSource;
  }, [pendingImages, isMiddleScreen, updateFrames]);

  // 초기 설정 및 정리
  useEffect(() => {
    let eventSource = setupEventSource();

    // const initializeEventSource = async () => {
    //   eventSource = await setupEventSource();
    // };

    // initializeEventSource();

    return () => {
      if (eventSource) {
        console.log("Cleaning up EventSource connection");
        eventSource.close();
        // setIsConnected(false);
      }
    };
  }, [setupEventSource]); //setupEventSource

  // // 연결 상태 모니터링
  // useEffect(() => {
  //   console.log("SSE Connection status:", isConnected);
  // }, [isConnected]);

  // return { isConnected, pendingImages };
  // return null;
}
