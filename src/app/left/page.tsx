"use client";

import { useState, useEffect } from "react";

interface WaitingData {
  frameNumber: number;
  waitingNumber: number;
}

export default function LeftScreen() {
  const explainBox = "/images/textbox2.png";
  const [waitingList, setWaitingList] = useState<WaitingData[]>([
    { frameNumber: 1, waitingNumber: 2 },
    { frameNumber: 1, waitingNumber: 2 },
    { frameNumber: 1, waitingNumber: 2 },
    { frameNumber: 1, waitingNumber: 2 },
  ]);

  // // 서버에서 대기 데이터를 가져오는 함수
  // const fetchWaitingData = async () => {
  //   try {
  //     const response = await fetch("/api/waiting-number"); // API 엔드포인트 주소
  //     const data = await response.json();
  //     setWaitingList(data);
  //   } catch (error) {
  //     console.error("Failed to fetch waiting data:", error);
  //     // 에러 시 기본 데이터 설정
  //     setWaitingList([
  //       { frameNumber: 1, waitingNumber: 2 },
  //       { frameNumber: 1, waitingNumber: 2 },
  //       { frameNumber: 1, waitingNumber: 2 },
  //       { frameNumber: 1, waitingNumber: 2 },
  //     ]);
  //   }
  // };

  // // 실시간 데이터 업데이트를 위한 폴링 설정
  // useEffect(() => {
  //   fetchWaitingData(); // 초기 데이터 로드

  //   const intervalId = setInterval(() => {
  //     fetchWaitingData();
  //   }, 5000); // 5초마다 데이터 업데이트

  //   return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 정리
  // }, []);

  return (
    <div
      className="flex w-full h-full text-white justify-center items-center"
      style={{
        width: "1920px",
        height: "1080px",
        background: "#152431",
      }}
    >
      <div className="flex flex-col justify-start items-center w-full h-full gap-20">
        {/* Bottom section with buttons */}
        <div
          className="relative flex items-center justify-center gap-8 mb-1 "
          style={{
            width: "60%",
            marginTop: "5%",
          }}
        >
          {waitingList.map((item, index) => (
            <div key={index} className="w-full relative">
              {/* 설명 이미지 */}
              <img
                src={explainBox}
                alt="Explain Box"
                className="w-full h-full object-contain"
              />
              {/* 설명 텍스트 */}
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] flex flex-col items-center justify-center text-white text-center"
                style={{
                  overflow: "hidden",
                  fontWeight: 300,
                  fontSize: "clamp(10px, 2vw, 20px)",
                }}
              >
                <p>{`${item.frameNumber}번 액자로 가주세요`}</p>
                <p>{`대기번호 : ${item.waitingNumber}번`}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Top section with image */}
        <div
          className="justify-center"
          style={{ marginTop: "5%", width: "83%" }}
        >
          <img
            src="/images/architecture.png"
            alt="Architecture diagram"
            className="object-contain "
          />
        </div>
      </div>
    </div>
  );
}
