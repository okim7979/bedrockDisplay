// /api/pending-status/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { pendingImages } from '@/utils/state';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ pendingImages });
}
