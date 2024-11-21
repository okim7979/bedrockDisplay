'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ImageDisplay() {
  const [images, setImages] = useState<string[]>([]); // 로드된 이미지 리스트

  const fetchImages = async () => {
    try {
      const response = await axios.get("/api/poll-image");
      if (response.data?.images) {
        setImages(response.data.images); // 이미지 업데이트
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchImages, 5000); // 5초마다 롱폴링
    return () => clearInterval(interval); // 컴포넌트 언마운트 시 클린업
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      {images.map((image, index) => (
        <div key={index} className="w-64 h-64 border">
          <img src={image} alt={`Image ${index}`} className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}
