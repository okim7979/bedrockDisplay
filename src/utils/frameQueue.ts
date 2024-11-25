export class FrameQueueManager {
  private static instance: FrameQueueManager;
  private availableKeys: Set<number> = new Set();

  private constructor() {}

  public static getInstance(): FrameQueueManager {
    if (!this.instance) {
      this.instance = new FrameQueueManager();
    }
    return this.instance;
  }

  initializeKeys(keys: number[]) {
    this.availableKeys = new Set(keys);
    console.log("Initialized keys:", Array.from(this.availableKeys));
  }

  getNextKey(): number | undefined {
    if (this.availableKeys.size === 0) {
      console.warn("No available keys");
      return undefined;
    }

    const key = Array.from(this.availableKeys)[0];
    this.availableKeys.delete(key);

    console.log("Key retrieved:", key);
    console.log("Remaining availableKeys:", Array.from(this.availableKeys));
    return key;
  }

  addKey(key: number) {
    if (!this.availableKeys.has(key)) {
      this.availableKeys.add(key);
      console.log("Key added back:", key);
      console.log("Updated availableKeys:", Array.from(this.availableKeys));
    }
  }

  getAvailableKeys(): number[] {
    return Array.from(this.availableKeys);
  }
}
// export class FrameQueueManager {
//   private static instance: FrameQueueManager;
//   public availableKeys: number[] = [];

//   private constructor() {}

//   public static getInstance(): FrameQueueManager {
//     if (!FrameQueueManager.instance) {
//       FrameQueueManager.instance = new FrameQueueManager();
//     }
//     return FrameQueueManager.instance;
//   }

//   initializeKeys(keys: number[]) {
//     this.availableKeys = [...keys];
//     console.log("Initialized keys:", this.availableKeys);
//   }

//   addKey(key: number) {
//     // Add the key back to the available keys if it's not already present
//     if (!this.availableKeys.includes(key)) {
//       this.availableKeys.push(key);
//       console.log("Key added back:", key);
//       console.log("Updated availableKeys:", this.availableKeys);
//     }
//   }

//   getNextKey(): number | undefined {
//     if (this.availableKeys.length === 0) {
//       console.warn("No available keys");
//       return undefined;
//     }

//     // Remove and return the first available key
//     const key = this.availableKeys.shift();
//     console.log("Key retrieved:", key);
//     console.log("Remaining availableKeys:", this.availableKeys);
//     return key;
//   }

//   getAvailableKeys(): number[] {
//     return [...this.availableKeys]; // 큐 복사본 반환
//   }
// }
