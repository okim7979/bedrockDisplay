// src/utils/state.ts
export let imageQueue: { src: string; text: string }[] = [];
export let availableKeys: number[] = [];

export let pendingImages = 0;

export function incrementPendingImages() {
  pendingImages += 1;
  console.log(`Pending images incremented: ${pendingImages}`);
}

export function decrementPendingImages() {
  if (pendingImages > 0) {
    pendingImages -= 1;
    console.log(`Pending images decremented: ${pendingImages}`);
  }
}

export function resetPendingImages() {
  pendingImages = 0;
  console.log("Pending images reset to 0");
}
