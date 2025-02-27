"use client";

import { useEffect, useRef } from "react";
import axios from "axios";

//주요 업무 = middle, last의 setPendingImages를 이용하여 pendingImages 개수를 실시간 업데이트 시켜주기

// 데이터 polling 하는 api를 호출하는 컴포넌트
export default function PollerComponent({
  // pendingImages,
  setPendingImages,
}: {
  // pendingImages: number;
  setPendingImages: React.Dispatch<React.SetStateAction<number>>;
}) {
  // const isPollingRef = useRef(false); // polling 상태 관리
  let pendingImages = 0;

  // // pendingImages 변수값 업데이트
  // const updatePendingImages = async (
  //   action: "increment" | "decrement",
  //   count: number
  // ) => {
  //   try {
  //     const response = await axios.post("/api/update-pending-images", {
  //       action,
  //       count,
  //     });
  //     if (response.status === 200) {
  //       console.log(`Server-side pendingImages updated: ${action} by ${count}`);
  //     }
  //   } catch (error) {
  //     console.error("Error updating server-side pendingImages:", error);
  //   }
  // };

  // pendingImages 변수값 가져오기
  const fetchPendingImages = async () => {
    try {
      const response = await axios.get("/api/pending-status");
      if (response.status === 200 && response.data?.pendingImages >= 0) {
        setPendingImages(response.data.pendingImages); // 서버 상태 동기화
      }
    } catch (error) {
      console.error("Error fetching pendingImages status:", error);
    }
  };

  // aws에서 데이터 받아오는 api호출
  const fetchImages = async () => {
    // try {
    const response = await axios.get("/api/get-images", {
      params: { pendingImages }, // pendingImages를 쿼리 파라미터로 전달하여 api 내부에서도 다시 pendingImages 를 가져와야하지 않도록 함
    });

    console.log("/api/get-images 호출 return값 :  ", response.data);
    //   if (
    //     response.status === 200 &&
    //     response.data &&
    //     Array.isArray(response.data.images)
    //   ) {
    //     console.log("/api/get-images 호출 return값 :  ", response.data);

    //     // const imageCount = response.data.images.length;
    //     // console.log("AWS 요청 성공, 받은 이미지 개수:", imageCount);
    //     // 상태 업데이트 (서버 및 로컬)
    //     // updatePendingImages("increment", imageCount);
    //   } else if (response.status === 204) {
    //     console.log("No more images to process.");
    //     isPollingRef.current = false; // 롱폴링 중단
    //   }
    // } catch (error) {
    //   console.error("Error fetching images:", error);
    //   isPollingRef.current = false; // 오류 시 중단
    // }
  };

  // 서버 상태를 주기적으로 가져옴
  useEffect(() => {
    const interval = setInterval(() => {
      //pendingImages 업데이트 확인
      fetchPendingImages();
    }, 1000); // 1초마다 상태 확인

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 인터벌 제거
  }, []);

  // // `pendingImages` 변화에 따른 롱폴링
  useEffect(() => {
    if (pendingImages > 0) {
      // && !isPollingRef.current -> 조건

      // isPollingRef.current = true; // polling 시작

      // console.log(
      //   "pendingImages 변화에 따른 /api/get-images 호출 시작. & pendingImages =",
      //   pendingImages
      // );
      // const interval = setInterval(() => {
      //   if (isPollingRef.current) {
      fetchImages();
      //   } else {
      //     clearInterval(interval); // polling 중단
      //     console.log("Polling 중단: pendingImages =", pendingImages);
      //   }
      // }, 15000);

      // return () => {
      //   clearInterval(interval);
      //   isPollingRef.current = false; // 중단 상태 업데이트
      // };
    }
  }, [pendingImages]);

  return null;
}
