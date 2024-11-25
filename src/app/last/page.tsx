"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import PollerComponent from "../_components/PollerComponent";

import { ImageData, FrameData } from "@/types/frames";

export default function LastScreen() {
  // 프레임 데이터 상태 관리
  const [frames, setFrames] = useState<FrameData[]>([
    {
      key: 5,
      Image: "/images/mock1.png",
      Description: "",
      timestamp: Date.now(),
    },
    {
      key: 0,
      Image: "/images/mock1.png",
      Description: "",
      timestamp: Date.now(),
    },
    {
      key: 6,
      Image: "/images/mock3.png",
      Description: "",
      timestamp: Date.now(),
    },
    {
      key: 7,
      Image: "/images/mock4.png",
      Description: "",
      timestamp: Date.now(),
    },
  ]);

  // 고정 frame
  const [gridImages] = useState<string[]>([
    "/images/frame1.png",
    "/images/frame2.png",
    "/images/frame3.png",
    "/images/frame4.png",
  ]);

  const [explainBox] = useState<string[]>([
    "/images/1st.png",
    "/images/2nd.png",
    "/images/3rd.png",
    "/images/4th.png",
  ]);

  // 인물 사진
  const [portraitImage, setPortraitImage] = useState<string[]>([
    "/images/mock1.png",
    "/images/mock2.png",
    "/images/mock3.png",
    "/images/mock4.png",
  ]);

  // 서버에 프레임 키 등록
  const registerFrameKey = async (key: number): Promise<void> => {
    try {
      await axios.post("/api/return-key", { key });
      console.log(`Registered frame key: ${key}`);
    } catch (error) {
      console.error("Error registering frame key:", error);
    }
  };

  // 초기 프레임 키 등록
  useEffect(() => {
    const registerAllFrames = async () => {
      for (const frame of frames) {
        await registerFrameKey(frame.key);
      }
    };
    registerAllFrames();
  }, []);

  // 각 프레임별 타이머 관리
  useEffect(() => {
    const intervals = frames.map((frame) => {
      return setInterval(() => {
        const now = Date.now();
        const elapsed = now - frame.timestamp;

        // 1분(60000ms)이 지났는지 확인
        if (elapsed >= 60000) {
          // 새로운 프레임 키 등록
          registerFrameKey(frame.key);

          // 프레임 타임스탬프 업데이트
          setFrames((prev) =>
            prev.map((f) =>
              f.key === frame.key ? { ...f, timestamp: now } : f
            )
          );
        }
      }, 1000); // 1초마다 체크
    });

    return () => intervals.forEach(clearInterval);
  }, [frames]);

  // 서버로부터 새 데이터 수신
  useEffect(() => {
    const eventSource = new EventSource("/api/get-images");

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data) as {
        frameKey: number;
        data: ImageData;
      };

      setFrames((prev) =>
        prev.map((frame) =>
          frame.key === data.frameKey
            ? {
                ...frame,
                Image: data.data.Image,
                Description: data.data.Description,
                timestamp: Date.now(),
              }
            : frame
        )
      );
    };

    return () => eventSource.close();
  }, []);

  return (
    <main
      className="relative flex items-center justify-start h-screen w-full bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.png')" }}
    >
      <PollerComponent />

      {/* 전체화면 그리드 */}
      <div
        className="relative flex flex-row items-center "
        style={{
          height: "100%",

          aspectRatio: "2790 / 1080", // 2790 x 1080 비율 고정
          paddingRight: "5%",
        }}
      >
        {frames.map((frame, index) =>
          frame.key === 0 ? (
            <div className="w-[40%]" style={{ visibility: "hidden" }}>
              {" "}
            </div>
          ) : (
            <div
              key={frame.key}
              className="relative flex flex-col justify-center items-center"
              style={{
                height: "90%", // 동적으로 높이 조정
                width: "100%", // 비율 유지
              }}
            >
              {/* 프레임과 인물 이미지 영역 (3/4 높이) */}
              <div
                className="relative"
                style={{
                  height: "70%", // 전체 높이의 3/4
                  width: "100%", // 너비는 100%
                }}
              >
                {/* 프레임 이미지 */}
                <img
                  key={index}
                  src={gridImages[index]}
                  alt={`Frame ${index}`}
                  className="relative w-full h-full object-contain z-30"
                />

                {/* 인물 이미지 */}
                <img
                  src={frame.Image}
                  alt={`Portrait ${index}`}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[52%] z-10"
                  style={{
                    height: "70%",
                    width: "auto",
                    // width: "60%", // 프레임의 60% 크기
                    // height: "auto",
                    clipPath: "ellipse(50% 50% at 50% 50%)", // 타원형 클리핑
                  }}
                />
              </div>

              {/* 하단 설명 영역 */}
              <div
                className="relative flex items-center justify-center "
                style={{
                  height: "16%", // 전체 높이의 1/4
                  width: "auto",
                  // background: "pink",
                }}
              >
                {/* 설명 이미지 */}
                <img
                  src={explainBox[index]}
                  alt="Explain Box"
                  className="relative w-full h-full object-contain"
                />

                {/* 설명 텍스트 */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] flex items-center justify-center text-white text-center "
                  style={{
                    // overflow: "hidden", // 텍스트가 부모 요소를 넘어가지 않도록 설정
                    textOverflow: "ellipsis", // 넘어가는 텍스트를 ...으로 표시
                    fontWeight: 300,
                    fontSize: "clamp(10px, 2vw, 20px)", // 반응형 폰트 크기
                  }}
                >
                  <p className="w-full break-keep leading-tight">
                    당신은 미래 소방관으로 선발되어 화재 현장에서 빛나는 활약을
                    펼쳤으며, 뛰어난 공로로 세계적인 신뢰와 안전성을 갖춘
                    소방관입니다.
                  </p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </main>
  );
}
