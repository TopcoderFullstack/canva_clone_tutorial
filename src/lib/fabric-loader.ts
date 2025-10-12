import type { fabric } from "fabric"
export type { fabric as FabricNS } from "fabric"
export type FabricType = typeof fabric

let fabricPromise: Promise<FabricType> | null = null
let fabricInstance: FabricType | null = null

// provider use once
export async function loadFabric() {
  if (fabricInstance) {
    return fabricInstance
  }

  if (!fabricPromise) {
    fabricPromise = import("fabric")
      .then((m) => m.fabric)
      .then((f) => {
        fabricInstance = f
        return f
      })
  }

  return fabricPromise
}

// components use times
export function getFabric() {
  return fabricInstance
}
