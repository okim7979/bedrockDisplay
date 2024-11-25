import { useEffect, useCallback } from "react";
import { FrameData, ImageData } from "@/types/frames";
import { FrameQueueManager } from "@/utils/frameQueue";

export function useFrameManager(
  frames: FrameData[],
  setFrames: React.Dispatch<React.SetStateAction<FrameData[]>>,
  isMiddleScreen: boolean
) {
  const frameManager = FrameQueueManager.getInstance();

  useEffect(() => {
    frameManager.initializeKeys([1, 2, 3, 4, 5, 6, 7]); // 초기화
    console.log(
      "Frame Manager initialized with keys:",
      frameManager.getAvailableKeys()
    );
  }, []);

  // // 프레임 키 초기화
  // useEffect(() => {
  //   const initialKeys = [1, 2, 3, 4, 5, 6, 7];
  //   frameManager.initializeKeys(initialKeys);
  //   console.log(
  //     "Frame Manager initialized with keys:",
  //     frameManager.getAvailableKeys()
  //   );

  //   // console.log("Frame Manager initialized with keys:", initialKeys);
  // }, []);

  // 프레임 만료 체크
  const checkExpiredFrames = useCallback(() => {
    const now = Date.now();
    frames.forEach((frame) => {
      const elapsed = now - frame.timestamp;
      if (elapsed >= 60000) {
        console.log(`Frame expired: ${frame.key}`);

        frameManager.addKey(frame.key); // 만료된 프레임을 큐에 추가
        console.log(
          "Updated availableKeys after expiration:",
          frameManager.getAvailableKeys()
        );
      }
    });
  }, [frames, frameManager]);

  // 프레임 업데이트
  const updateFrame = useCallback(
    (frameKey: number, data: ImageData) => {
      setFrames((prevFrames) =>
        prevFrames.map((frame) =>
          frame.key === frameKey
            ? {
                ...frame,
                Image: data.Image,
                Description: data.Description,
                timestamp: Date.now(),
              }
            : frame
        )
      );
    },
    [setFrames]
  );

  // SSE 이벤트 리스너 설정
  useEffect(() => {
    const eventSource = new EventSource("/api/get-images");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as {
        frameKey: number;
        data: ImageData;
      };

      const isValidFrame = isMiddleScreen
        ? data.frameKey >= 1 && data.frameKey <= 4
        : data.frameKey >= 5 && data.frameKey <= 7;

      if (isValidFrame) {
        updateFrame(data.frameKey, data.data);
      }
    };

    return () => eventSource.close();
  }, [updateFrame, isMiddleScreen]);

  // 만료된 프레임 주기적 체크
  useEffect(() => {
    const interval = setInterval(checkExpiredFrames, 1000);
    return () => clearInterval(interval);
  }, [checkExpiredFrames]);

  return { updateFrame };
}
