import { useEffect } from "react";
import axios from "axios";
import { ImageData } from "@/types/frames";

export function useDataHandler(
  isMiddleScreen: boolean,
  updateFrames: (frameKey: number, data: ImageData) => void
) {
  useEffect(() => {
    console.log("useDataHandler 함수 실행 됨");
    const eventSource = new EventSource("/api/get-images?pendingImages=4");

    // 연결 상태 확인
    eventSource.onopen = (event) => {
      console.log("EventSource connection opened:", event);
    };

    eventSource.onmessage = async (event) => {
      const { frameKey, data } = JSON.parse(event.data);

      const endpoint =
        isMiddleScreen && frameKey >= 1 && frameKey <= 4
          ? `${process.env.NEXT_PUBLIC_SERVICE_URL}/middle`
          : !isMiddleScreen && frameKey >= 5 && frameKey <= 7
          ? `${process.env.NEXT_PUBLIC_SERVICE_URL}/last`
          : null;

      if (endpoint) {
        try {
          console.log(`Sending data to ${endpoint}`, { frameKey, data });
          await axios.post(endpoint, { frameKey, ...data });

          // 상태 업데이트 호출
          updateFrames(frameKey, data);
          console.log("updateFrames endpoint : ", endpoint);
          console.log("updateFrames frameKey : ", frameKey);
          console.log("updateFrames data : ", data);
        } catch (error) {
          console.error(`Error sending data to ${endpoint}:`, error);
        }
      }
    };

    eventSource.onerror = (error) => {
      console.error(
        "EventSource error during handling key frame index :",
        error
      );
      eventSource.close();
    };

    // return () => eventSource.close();
    return () => {
      console.log("EventSource closed");
      eventSource.close();
    };
  }, []);
}
