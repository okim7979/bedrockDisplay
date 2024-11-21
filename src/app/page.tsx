"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function HomePage() {
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

  // 이미지 데이터를 API로부터 가져오는 함수
  const fetchImages = async () => {
    try {
      const response = await axios.get("../apis/poll-image"); // API 호출
      if (response.data?.gridImages && response.data?.portraitImage) {
        // setGridImages(response.data.gridImages); // 그리드 이미지 업데이트
        setPortraitImage(response.data.portraitImage); // 인물 사진 업데이트
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  // 주기적으로 이미지를 업데이트 (롱폴링)
  // useEffect(() => {
  //   const interval = setInterval(fetchImages, 5000); // 5초마다 실행
  //   fetchImages(); // 초기 데이터 로드
  //   return () => clearInterval(interval); // 컴포넌트 언마운트 시 클린업
  // }, []);

  return (
    <main
      className="relative flex items-center justify-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      {/* 전체화면 그리드 */}
      <div
        className="relative grid grid-cols-4 gap-4 "
        style={{
          width: "87%", // 화면 크기에 비례
          aspectRatio: "3560 / 992", // 3560x992 비율 고정
        }}
      >
        {gridImages.map((frame, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center"
            style={{
              width: "100%", // 비율 유지
              height: "100%", // 동적으로 높이 조정
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
                src={frame}
                alt={`Frame ${index}`}
                className="w-full h-full object-contain z-30"
              />

              {/* 인물 이미지 */}
              <img
                src={portraitImage[index]}
                alt={`Portrait ${index}`}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[53%] z-10"
                style={{
                  width: "60%", // 프레임의 60% 크기
                  height: "auto",
                  clipPath: "ellipse(50% 50% at 50% 50%)", // 타원형 클리핑
                }}
              />
            </div>

            {/* 하단 설명 영역 */}
            <div
              className="relative flex items-center justify-center "
              style={{
                // marginLeft: "2%",
                height: "16%", // 전체 높이의 1/4
                // width: "50%",
              }}
            >
              {/* 설명 이미지 */}
              <img
                src={explainBox[index]}
                alt="Explain Box"
                className="w-full h-full object-contain"
              />

              {/* 설명 텍스트 */}
              <div
                className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white text-center text-sm leading-tight"
                style={{
                  padding: "7%", // 텍스트가 이미지의 경계에 닿지 않도록 여백 추가
                  overflow: "hidden", // 텍스트가 부모 요소를 넘어가지 않도록 설정
                  // whiteSpace: "normal", // 텍스트 줄바꿈 허용
                  // wordWrap: "break-word", // 긴 텍스트 줄바꿈
                  fontWeight: 300,
                }}
              >
                <p className="w-full break-keep">
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
