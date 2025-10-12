"use client"
import { useState, useEffect } from "react"
import { loadFabric } from "@/lib/fabric-loader"

export function FabricProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let active = true

    ;(async () => {
      await loadFabric()

      if (active) {
        setReady(true)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  if (!ready) {
    return null
  }

  return <>{children}</>
}
