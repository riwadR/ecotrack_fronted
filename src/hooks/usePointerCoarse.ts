"use client";

import { useEffect, useState } from "react";

/** True when the primary input is coarse (touch): show tap-oriented copy instead of click/drag desktop hints. */
export function usePointerCoarse(): boolean {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return coarse;
}
