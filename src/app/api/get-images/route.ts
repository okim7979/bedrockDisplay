// /api/get-images/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { imageQueue, resetPendingImages } from '@/utils/state';
import { ImageData } from '@/types/frames';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pendingImagesParam = req.query.pendingImages as string;
  let pendingImages = { count: Number(pendingImagesParam) };

  console.log('get-images 함수 실행됨. pendingImages:', pendingImages);

  if (pendingImages.count <= 0) {
    console.log('대기 중인 이미지가 없습니다. 204 상태 반환.');
    return res.status(204).end();
  }

  const apiUrl = process.env.NEXT_PUBLIC_IMAGE_GET_API_URL;
  if (!apiUrl) {
    console.error('NEXT_PUBLIC_IMAGE_GET_API_URL이 정의되지 않았습니다.');
    return res.status(500).send('API URL이 정의되지 않았습니다.');
  }

  let frameKeyQueue = [1, 2, 3, 4, 5, 6, 7];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendKeepAlive = () => {
    res.write(`data: "keep-alive"\n\n`);
    console.log('클라이언트에게 keep-alive 메시지를 보냈습니다.');
  };

  const intervalId = setInterval(sendKeepAlive, 3000);

  try {
    while (pendingImages.count > 0) {
      console.log('AWS API Gateway에서 데이터 가져오는 중...');
      let response;
      try {
        response = await axios.get(apiUrl, { timeout: 3000 });
      } catch (error) {
        console.error('데이터 가져오기 오류:', error);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      let dataReceived = false;
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('AWS에서 가져온 데이터:', response.data);
        dataReceived = true;

        response.data.forEach((obj: ImageData) => {
          imageQueue.push(obj);
          pendingImages.count -= 1;
        });
      } else {
        console.warn('데이터를 받지 못했거나 데이터 형식이 유효하지 않습니다.');
      }

      while (imageQueue.length > 0) {
        const nextData = imageQueue.shift();
        if (!nextData) break;

        const frameKey = frameKeyQueue.shift();
        if (!frameKey) break;

        frameKeyQueue.push(frameKey);

        try {
          const eventData = JSON.stringify({
            frameKey,
            data: nextData,
          });
          res.write(`data: ${eventData}\n\n`);
          console.log('클라이언트에게 데이터 전송:', eventData);
        } catch (error) {
          console.error('데이터 전송 오류:', error);
          imageQueue.push(nextData);
        }
      }

      if (!dataReceived) {
        console.log('데이터를 받지 못했습니다. 1초 후에 다시 시도합니다...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }
    }

    if (pendingImages.count <= 0) {
      resetPendingImages();
      console.log('더 이상 대기 중인 이미지가 없습니다. 스트림을 종료합니다.');
      clearInterval(intervalId);
      res.end();
    }
  } catch (error) {
    console.error('처리 중 오류 발생:', error);
    res.status(500).end();
  }
}
