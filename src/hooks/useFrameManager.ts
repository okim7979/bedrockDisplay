import { useEffect, useCallback } from "react";
import { ImageData, FrameData } from "../types/frames";

export function useFrameManager(
  frames: FrameData[],
  setFrames: React.Dispatch<React.SetStateAction<FrameData[]>>,
  isMiddleScreen: boolean
) {
  const frameManager = FrameQueueManager.getInstance();

  // 프레임 만료 체크
  const checkExpiredFrames = useCallback(() => {
    const expiredKeys = frameManager.checkExpiredFrames();
    expiredKeys.forEach((key) => {
      frameManager.returnKey(key);
    });
  }, []);

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
      frameManager.activateFrame(frameKey);
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

      // 프레임 키가 현재 화면에 속하는지 확인
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
