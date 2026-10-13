import { useEffect, useState } from "react"

/** Whether touch is the main way in. The server and first render say no. */
export function useTouchPrimary() {
  const [touch, setTouch] = useState(false)

  useEffect(() => {
    const coarse = matchMedia("(pointer: coarse)")
    const update = () => setTouch(coarse.matches)
    update()
    coarse.addEventListener("change", update)
    return () => coarse.removeEventListener("change", update)
  }, [])

  return touch
}
