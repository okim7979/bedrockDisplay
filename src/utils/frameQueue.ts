class FrameQueueManager {
  private static instance: FrameQueueManager;
  private availableKeys: number[] = [];
  private activeFrames: Map<number, number> = new Map(); // key: frameKey, value: timestamp

  private constructor() {}

  static getInstance(): FrameQueueManager {
    if (!this.instance) {
      this.instance = new FrameQueueManager();
    }
    return this.instance;
  }

  // 키가 사용 가능한지 확인
  isKeyAvailable(key: number): boolean {
    return this.availableKeys.includes(key);
  }

  // 사용 가능한 키 가져오기
  getNextAvailableKey(): number | undefined {
    return this.availableKeys.shift();
  }

  // 키를 사용 가능한 상태로 반환
  returnKey(key: number) {
    if (!this.availableKeys.includes(key)) {
      this.availableKeys.push(key);
      this.activeFrames.delete(key);
    }
  }

  // 프레임 활성화 (타임스탬프 업데이트)
  activateFrame(key: number) {
    this.activeFrames.set(key, Date.now());
  }

  // 1분 이상 지난 프레임 확인
  checkExpiredFrames(): number[] {
    const now = Date.now();
    const expiredKeys: number[] = [];

    this.activeFrames.forEach((timestamp, key) => {
      if (now - timestamp >= 60000) {
        // 1분 = 60000ms
        expiredKeys.push(key);
      }
    });

    return expiredKeys;
  }
}
