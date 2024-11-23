"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function MiddleScreen() {
  //실제 인물사진 저장할 곳
  const [portraitImages, setPortraitImages] = useState([]);
  const [currentKeys, setCurrentKeys] = useState([1, 2, 3, 4]); // 현재 보여지는 프레임 키
  const [timer, setTimer] = useState(60); // 각 프레임 전환 타이머 (1분)

  const [gridImages, setGridImages] = useState<string[]>([
    "/images/frame1.png",
    "/images/frame2.png",
    "/images/frame3.png",
    "/images/frame4.png",
  ]); // 그리드 이미지 리스트
  // const [portraitImage, setPortraitImage] = useState<string | null>(null); // 인물 사진
  const [portraitImage, setPortraitImage] = useState<string[]>([
    "/images/mock1.png",
    "/images/mock2.png",
    "/images/mock3.png",
    "/images/mock4.png",
  ]); // 인물 사진

  const [explainBox, setExplainBox] = useState<string[]>([
    "/images/1st.png",
    "/images/2nd.png",
    "/images/3rd.png",
    "/images/4th.png",
  ]); // 설명 박스

  // 서버에서 이미지 및 텍스트 데이터 가져오기
  const fetchImages = async () => {
    try {
      const response = await axios.get("/api/get-images");
      if (response.data?.images) {
        setPortraitImages(response.data.images); // 받아온 이미지 배열 설정
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // 타이머가 1분이 지나면 서버로 현재 key값 전송
  const sendKeyToServer = async (key: number) => {
    try {
      await axios.post("/api/return-key", { key });
    } catch (error) {
      console.error("Error sending key:", error);
    }
  };

  // 타이머 관리 및 key값 전송
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          currentKeys.forEach((key) => sendKeyToServer(key)); // 1분 후 key값 전송
          fetchImages(); // 새로운 이미지를 가져옴
          return 60; // 타이머 리셋
        }
        return prev - 1;
      });
    }, 1000); // 1초 간격으로 타이머 업데이트

    return () => clearInterval(interval);
  }, [currentKeys]);

  return (
    <main
      className="relative flex items-center justify-center h-screen bg-contain bg-center"
      style={{ backgroundImage: "url('/images/background.png')" }}
    >
      {/* 전체화면 그리드 */}
      <div
        className="relative grid grid-cols-4 gap-4 items-center "
        style={{
          width: "100%", // 화면 크기에 비례
          aspectRatio: "2790 / 1080", // 2790 x 1080 비율 고정
        }}
      >
        {gridImages.map((frame, index) => (
          <div
            key={portraitImage[index]}
            className="relative flex flex-col justify-center items-center"
            style={{
              height: "90%", // 동적으로 높이 조정
              width: "100%", // 비율 유지
              // background: "blue",
            }}
          >
            {/* 프레임과 인물 이미지 영역 (3/4 높이) */}
            <div
              className="relative"
              style={{
                height: "70%", // 전체 높이의 3/4
                width: "100%", // 너비는 100%
                // background: "red",
              }}
            >
              {/* 프레임 이미지 */}
              <img
                key={index}
                src={frame}
                alt={`Frame ${index}`}
                className="relative w-full h-full object-contain z-30"
              />

              {/* 인물 이미지 */}
              <img
                src={portraitImage[index]}
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
        ))}
      </div>
    </main>
  );
}
